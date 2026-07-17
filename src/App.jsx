import React, { useState, useRef, useEffect } from 'react'
import { 
  Layers, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  Image as ImageIcon,
  Sun,
  Type,
  Circle,
  Square,
  Minus,
  Palette,
  Sparkles,
  MoreVertical,
  Maximize2,
  AlignCenter,
  Layout,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import {
  initDatabase,
  saveLayers,
  getLayers,
  saveHistory,
  getHistory,
  saveSetting,
  getSetting,
  saveProject,
  getProject,
  getAllProjects,
  deleteProject
} from './db.js'
import { historyManager } from './historyManager.js'
import DebugConsole from './DebugConsole.jsx'
import { setupUndoRedoHandlers, saveToHistory as saveToHistoryManager, restoreImagesInLayers } from './undoRedoManager.js'

function App() {
  const [layers, setLayers] = useState([])
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedLayerId, setDraggedLayerId] = useState(null)
  const [mouseDownPosition, setMouseDownPosition] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isRotating, setIsRotating] = useState(false)
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, angle: 0 })
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [isRPressed, setIsRPressed] = useState(false)
  const [isSPressed, setIsSPressed] = useState(false)
  const [isGPressed, setIsGPressed] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [hoveredHandle, setHoveredHandle] = useState(null)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, layerId: null })
  const [fileMenu, setFileMenu] = useState({ visible: false, x: 0, y: 0 })
  const [emojiPicker, setEmojiPicker] = useState({ visible: false, x: 0, y: 0 })
  const [dragDirection, setDragDirection] = useState(null) // 'horizontal' or 'vertical' or null
  const [rotationMode, setRotationMode] = useState(false) // Rotation mode via double-click
  const [aspectRatioMenu, setAspectRatioMenu] = useState(false)
  const [transformPanel, setTransformPanel] = useState({ visible: false, layerId: null })
  const [layersCollapsed, setLayersCollapsed] = useState(false)
  const [transformCollapsed, setTransformCollapsed] = useState(false)
  const [resetConfirmModal, setResetConfirmModal] = useState(false)
  const [autoShowTransform, setAutoShowTransform] = useState(true)
  const projectInputRef = useRef(null)
  const [debugConsoleVisible, setDebugConsoleVisible] = useState(false)
  const titleClickCountRef = useRef(0)
  const titleClickTimerRef = useRef(null)
  
  // Refs for selectedLayerId and layers to avoid stale closures in event handlers
  const selectedLayerIdRef = useRef(selectedLayerId)
  const layersRef = useRef(layers)
  
  // Update refs when values change
  useEffect(() => {
    selectedLayerIdRef.current = selectedLayerId
    layersRef.current = layers
  }, [selectedLayerId, layers])

  // KEYBOARD EVENT LISTENERS - MOVIDO AL INICIO PARA ASEGURAR EJECUCIÓN
  useEffect(() => {
    console.log('=== ADJUNTANDO EVENT LISTENERS ===')
    
    // Configurar Ctrl Z y Ctrl Shift Z usando el módulo independiente
    const cleanupUndoRedo = setupUndoRedoHandlers(setLayers)
    
    const handleKeyDown = (e) => {
      console.log('=== KEYDOWN ===', e.key, 'ctrlKey:', e.ctrlKey, 'altKey:', e.altKey)
      
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
      if (e.key === 'Control') {
        setIsCtrlPressed(true)
      }
      if (e.key === 'r' || e.key === 'R') {
        setIsRPressed(true)
      }
      if (e.key === 's' || e.key === 'S') {
        setIsSPressed(true)
      }
      if (e.key === 'g' || e.key === 'G') {
        setIsGPressed(true)
      }
      if (e.key === ' ') {
        setIsSpacePressed(true)
        e.preventDefault() // Prevent page scroll
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerIdRef.current) {
          deleteLayer(selectedLayerIdRef.current)
        }
      }
      
      // Shift + A to open image upload dialog
      if (e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        fileInputRef.current?.click()
      }
      
      // Rotate with R + Arrow keys
      if (isRPressed && selectedLayerIdRef.current) {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              return {
                ...layer,
                rotation: (layer.rotation || 0) + 5
              }
            }
            return layer
          }))
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              return {
                ...layer,
                rotation: (layer.rotation || 0) - 5
              }
            }
            return layer
          }))
        }
      }
      
      // Scale with S + Arrow keys
      if (isSPressed && selectedLayerIdRef.current) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'image') {
                return {
                  ...layer,
                  scale: Math.max(0.1, (layer.scale || 1) + 0.05)
                }
              } else if (layer.type === 'circle') {
                return {
                  ...layer,
                  radius: Math.max(10, layer.radius + 2)
                }
              } else if (layer.type === 'square') {
                return {
                  ...layer,
                  size: Math.max(20, layer.size + 4)
                }
              } else if (layer.type === 'text' || layer.type === 'emoji') {
                return {
                  ...layer,
                  fontSize: Math.max(12, (layer.fontSize || 48) + 2)
                }
              }
            }
            return layer
          }))
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'image') {
                return {
                  ...layer,
                  scale: Math.max(0.1, (layer.scale || 1) - 0.05)
                }
              } else if (layer.type === 'circle') {
                return {
                  ...layer,
                  radius: Math.max(10, layer.radius - 2)
                }
              } else if (layer.type === 'square') {
                return {
                  ...layer,
                  size: Math.max(20, layer.size - 4)
                }
              } else if (layer.type === 'text' || layer.type === 'emoji') {
                return {
                  ...layer,
                  fontSize: Math.max(12, (layer.fontSize || 48) - 2)
                }
              }
            }
            return layer
          }))
        }
      }
      
      // Move with G + Arrow keys
      if (isGPressed && selectedLayerIdRef.current) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'line') {
                return {
                  ...layer,
                  y1: layer.y1 - 2,
                  y2: layer.y2 - 2
                }
              }
              return {
                ...layer,
                y: layer.y - 2
              }
            }
            return layer
          }))
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'line') {
                return {
                  ...layer,
                  y1: layer.y1 + 2,
                  y2: layer.y2 + 2
                }
              }
              return {
                ...layer,
                y: layer.y + 2
              }
            }
            return layer
          }))
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'line') {
                return {
                  ...layer,
                  x1: layer.x1 - 2,
                  x2: layer.x2 - 2
                }
              }
              return {
                ...layer,
                x: layer.x - 2
              }
            }
            return layer
          }))
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'line') {
                return {
                  ...layer,
                  x1: layer.x1 + 2,
                  x2: layer.x2 + 2
                }
              }
              return {
                ...layer,
                x: layer.x + 2
              }
            }
            return layer
          }))
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
      if (e.key === 'Control') {
        setIsCtrlPressed(false)
      }
      if (e.key === 'r' || e.key === 'R') {
        setIsRPressed(false)
      }
      if (e.key === 's' || e.key === 'S') {
        setIsSPressed(false)
      }
      if (e.key === 'g' || e.key === 'G') {
        setIsGPressed(false)
      }
      if (e.key === ' ') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    console.log('Event listeners adjuntados')
    return () => {
      cleanupUndoRedo()
      console.log('Removiendo event listeners')
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleTitleClick = () => {
    console.log('=== TITLE CLICK === count:', titleClickCountRef.current + 1)
    titleClickCountRef.current += 1
    
    if (titleClickCountRef.current === 1) {
      titleClickTimerRef.current = setTimeout(() => {
        console.log('Triple clic timeout - reset count')
        titleClickCountRef.current = 0
      }, 500)
    } else if (titleClickCountRef.current === 3) {
      console.log('TRIPLE CLIC DETECTADO - toggle console')
      clearTimeout(titleClickTimerRef.current)
      titleClickCountRef.current = 0
      setDebugConsoleVisible(!debugConsoleVisible)
    }
  }

  const aspectRatios = [
    { label: '1:1', value: '1:1', width: 800, height: 800 },
    { label: '16:9', value: '16:9', width: 960, height: 540 },
    { label: '9:16', value: '9:16', width: 540, height: 960 },
    { label: '4:3', value: '4:3', width: 800, height: 600 },
    { label: '3:4', value: '3:4', width: 600, height: 800 },
    { label: '2:3', value: '2:3', width: 533, height: 800 },
  ]

  const currentRatio = aspectRatios.find(r => r.value === aspectRatio)

  const saveToHistory = (newLayers) => {
    saveToHistoryManager(newLayers, saveHistory)
  }

  const resetHistory = () => {
    console.log('=== REINICIANDO HISTORIAL ===')
    historyManager.clear()
    historyManager.pushState(layers)
    const historyData = historyManager.getData()
    saveHistory(historyData.history)
    console.log('Historial reiniciado con estado actual')
  }

  // Initialize database and load saved data
  useEffect(() => {
    const initApp = async () => {
      await initDatabase()
      
      // Load saved aspect ratio
      const savedAspectRatio = await getSetting('aspectRatio')
      if (savedAspectRatio) {
        setAspectRatio(savedAspectRatio)
      }
      
      // Load saved layers
      const savedLayers = await getLayers()
      if (savedLayers.length > 0) {
        const restoredLayers = await restoreImagesInLayers(savedLayers)
        setLayers(restoredLayers)
      }
      
      // Load saved history
      const savedHistory = await getHistory()
      if (savedHistory.length > 0) {
        // LIMPIEZA AGRESIVA: Siempre limpiar historial al inicio para evitar estados corruptos
        console.log('Limpiando historial corrupto al inicio')
        historyManager.clear()
        const currentLayers = savedLayers.length > 0 ? savedLayers : []
        historyManager.pushState(currentLayers)
      } else {
        // Initialize history with current layers
        const currentLayers = savedLayers.length > 0 ? savedLayers : []
        historyManager.pushState(currentLayers)
      }
    }
    
    initApp()
  }, [])

  // Auto-save layers to database when they change (debounced)
  useEffect(() => {
    if (layers.length === 0) return
    
    const timeoutId = setTimeout(() => {
      saveLayers(layers)
    }, 500) // Save after 500ms of no changes
    
    return () => clearTimeout(timeoutId)
  }, [layers])

  // Auto-save aspect ratio to database when it changes
  useEffect(() => {
    saveSetting('aspectRatio', aspectRatio)
  }, [aspectRatio])

  useEffect(() => {
    renderCanvas()
  }, [layers, aspectRatio, zoomLevel, panOffset])

  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = currentRatio.width
    canvas.height = currentRatio.height

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan transformations
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoomLevel, zoomLevel)

    layers.forEach(layer => {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity
        const rotation = layer.rotation || 0
        
        ctx.save()
        
        if (rotation !== 0) {
          ctx.translate(layer.x, layer.y)
          ctx.rotate(rotation * Math.PI / 180)
          ctx.translate(-layer.x, -layer.y)
        }
        
        if (layer.type === 'image' && layer.image) {
          // Verificación de seguridad: asegurar que layer.image es un objeto Image válido
          if (!layer.image || typeof layer.image !== 'object' || !layer.image.complete) {
            console.log('Advertencia: layer.image no es válido, saltando renderizado de capa:', layer.id)
            ctx.restore()
            return
          }
          
          const img = layer.image
          const flipX = layer.flipX || false
          const flipY = layer.flipY || false
          const scale = layer.scale || 1
          const red = layer.red || 255
          const green = layer.green || 255
          const blue = layer.blue || 255
          
          // Apply transformation filters
          const brightness = layer.brightness || 100
          const contrast = layer.contrast || 100
          const blur = layer.blur || 0
          
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`
          
          // Calculate dimensions with scale
          const scaledWidth = layer.width * scale
          const scaledHeight = layer.height * scale
          const x = layer.x - scaledWidth / 2
          const y = layer.y - scaledHeight / 2
          
          // Apply mirror effects
          ctx.save()
          ctx.translate(layer.x, layer.y)
          if (flipX) ctx.scale(-1, 1)
          if (flipY) ctx.scale(1, -1)
          ctx.translate(-layer.x, -layer.y)
          
          // Apply RGB color adjustment using overlay
          if (red !== 255 || green !== 255 || blue !== 255) {
            // Draw image first
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
            
            // Apply color overlay with better blending
            ctx.globalCompositeOperation = 'color'
            ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.5)`
            ctx.fillRect(x, y, scaledWidth, scaledHeight)
            ctx.globalCompositeOperation = 'source-over'
          } else {
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
          }
          
          // Apply sharpness using contrast filter
          const sharpness = layer.sharpness || 0
          if (sharpness > 0) {
            ctx.filter = `contrast(${100 + sharpness / 2}%) saturate(${100 + sharpness / 3}%)`
            ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight, x, y, scaledWidth, scaledHeight)
            ctx.filter = 'none'
          }
          
          ctx.restore()
          ctx.filter = 'none'
        } else if (layer.type === 'text') {
          ctx.font = `${layer.fontSize}px Arial`
          ctx.fillStyle = layer.color
          ctx.textAlign = 'center'
          ctx.fillText(layer.text, layer.x, layer.y)
        } else if (layer.type === 'circle') {
          ctx.beginPath()
          ctx.arc(layer.x, layer.y, layer.radius, 0, Math.PI * 2)
          ctx.fillStyle = layer.color
          ctx.fill()
        } else if (layer.type === 'square') {
          const x = layer.x - layer.size / 2
          const y = layer.y - layer.size / 2
          ctx.fillStyle = layer.color
          ctx.fillRect(x, y, layer.size, layer.size)
        } else if (layer.type === 'line') {
          ctx.beginPath()
          ctx.moveTo(layer.x1, layer.y1)
          ctx.lineTo(layer.x2, layer.y2)
          ctx.strokeStyle = layer.color
          ctx.lineWidth = layer.strokeWidth
          ctx.stroke()
        } else if (layer.type === 'gradient') {
          let gradient
          if (layer.direction === 'horizontal') {
            gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
          } else {
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
          }
          gradient.addColorStop(0, layer.color1)
          gradient.addColorStop(1, layer.color2)
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (layer.type === 'emoji') {
          ctx.font = `${layer.fontSize}px Arial`
          ctx.textAlign = 'center'
          ctx.fillText(layer.emoji, layer.x, layer.y)
        }
        
        ctx.restore()
      }
    })

    ctx.globalAlpha = 1

    // Restore zoom and pan transformations
    ctx.restore()
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        console.log('=== IMAGEN CARGADA ===')
        console.log('Data URL length:', event.target.result.length)
        const scale = Math.min(
          currentRatio.width / img.width,
          currentRatio.height / img.height
        ) * 0.5
        const newLayer = {
          id: Date.now(),
          type: 'image',
          name: file.name,
          image: img,
          imageData: event.target.result, // Guardar data URL para serialización
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          width: img.width * scale,
          height: img.height * scale,
          scale: scale,
          rotation: 0,
          opacity: 1,
          visible: true
        }
        const newLayers = [...layers, newLayer]
        setLayers(newLayers)
        setSelectedLayerId(newLayer.id)
        saveToHistory(newLayers)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const addTextLayer = () => {
    const newLayer = {
      id: Date.now(),
      type: 'text',
      name: 'Texto',
      text: 'Nuevo texto',
      fontSize: 48,
      color: '#ffffff',
      x: currentRatio.width / 2,
      y: currentRatio.height / 2,
      width: 200,
      height: 60,
      rotation: 0,
      opacity: 1,
      visible: true
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    setSelectedLayerId(newLayer.id)
    saveToHistory(newLayers)
  }

  const addCircleLayer = () => {
    const newLayer = {
      id: Date.now(),
      type: 'circle',
      name: 'Círculo',
      x: currentRatio.width / 2,
      y: currentRatio.height / 2,
      radius: 100,
      width: 200,
      height: 200,
      rotation: 0,
      color: '#3b82f6',
      opacity: 1,
      visible: true
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    setSelectedLayerId(newLayer.id)
    setShowMoreOptions(false)
    saveToHistory(newLayers)
  }

  const resetLayerTransformations = (layerId) => {
    const newLayers = layers.map(l => {
      if (l.id === layerId) {
        return {
          ...l,
          scale: 1,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          brightness: 100,
          contrast: 100,
          red: 255,
          green: 255,
          blue: 255,
          sharpness: 0,
          opacity: 1,
          blur: 0,
          flipX: false,
          flipY: false
        }
      }
      return l
    })
    setLayers(newLayers)
    saveToHistory(newLayers)
    setResetConfirmModal(false)
  }

  const addSquareLayer = () => {
    const newLayer = {
      id: Date.now(),
      type: 'square',
      name: 'Cuadrado',
      x: currentRatio.width / 2,
      y: currentRatio.height / 2,
      size: 200,
      width: 200,
      height: 200,
      rotation: 0,
      color: '#10b981',
      opacity: 1,
      visible: true
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    setSelectedLayerId(newLayer.id)
    setShowMoreOptions(false)
    saveToHistory(newLayers)
  }

  const addLineLayer = () => {
    const newLayer = {
      id: Date.now(),
      type: 'line',
      name: 'Línea',
      x1: 200,
      y1: 400,
      x2: 600,
      y2: 400,
      strokeWidth: 5,
      color: '#f59e0b',
      opacity: 1,
      visible: true
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    setSelectedLayerId(newLayer.id)
    setShowMoreOptions(false)
    saveToHistory(newLayers)
  }

  const addGradientLayer = () => {
    const newLayer = {
      id: Date.now(),
      type: 'gradient',
      name: 'Gradiente',
      color1: '#667eea',
      color2: '#764ba2',
      direction: 'horizontal',
      opacity: 1,
      visible: true
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    setSelectedLayerId(newLayer.id)
    setShowMoreOptions(false)
    saveToHistory(newLayers)
  }

  const addEmojiLayer = (emoji) => {
    const newLayer = {
      id: Date.now(),
      type: 'emoji',
      name: 'Emoji',
      emoji: emoji,
      fontSize: 80,
      x: currentRatio.width / 2,
      y: currentRatio.height / 2,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    setSelectedLayerId(newLayer.id)
    setShowMoreOptions(false)
    setEmojiPicker({ visible: false, x: 0, y: 0 })
    saveToHistory(newLayers)
  }

  const emojiCategories = {
    'Emociones': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    'Corazones': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'],
    'Naturaleza': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🫕', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫'],
    'Animales': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦥', '🦨', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖'],
    'Actividades': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
    'Objetos': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪓', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌'],
    'Símbolos': ['🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '🗼', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🚲', '🛴', '🚲', '🛴', '🚲', '🛴', '🛢️', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '⛽', '🚏', '🚦', '🚥', '🚧', '🚨', '🚏', '🛑', '⛽', '🚏', '🛣️', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉'],
    'Festividades': ['🎄', '🎃', '🎆', '🎇', '🧨', '✨', '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧧', '🎀', '🎁', '🎗️', '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '⚾', '🥎', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳', '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🪀', '🎱', '🔮', '🪄', '🧿', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '♠️', '♥️', '♦️', '♣️', '♟️', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢', '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '👢', '🩰', '👑', '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '📿', '💄', '💍', '💎', '🔔', '🕰️', '⏳', '⌛', '⏱️', '⏲️', '🕰️', '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪓', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌']
  }

  const deleteLayer = (id) => {
    const newLayers = layers.filter(layer => layer.id !== id)
    setLayers(newLayers)
    if (selectedLayerId === id) {
      setSelectedLayerId(null)
    }
    saveToHistory(newLayers)
  }

  const moveLayer = (index, direction) => {
    const newLayers = [...layers]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= newLayers.length) return
    
    const temp = newLayers[index]
    newLayers[index] = newLayers[newIndex]
    newLayers[newIndex] = temp
    setLayers(newLayers)
    saveToHistory(newLayers)
  }

  const updateLayerOpacity = (id, opacity) => {
    const newLayers = layers.map(layer => 
      layer.id === id ? { ...layer, opacity } : layer
    )
    setLayers(newLayers)
    saveToHistory(newLayers)
  }

  const toggleLayerVisibility = (id) => {
    const newLayers = layers.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    )
    setLayers(newLayers)
    saveToHistory(newLayers)
  }

  const exportImage = (format) => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `aria-photo.${format}`
    link.href = canvas.toDataURL(`image/${format}`, 0.9)
    link.click()
    setFileMenu({ visible: false, x: 0, y: 0 })
  }

  const saveProject = () => {
    const projectData = {
      aspectRatio,
      layers: layers.map(layer => {
        // Convert image objects to data URLs for saving
        if (layer.type === 'image' && layer.image) {
          return {
            ...layer,
            imageData: layer.image.src,
            image: null // Don't save the Image object
          }
        }
        return layer
      })
    }

    // Save to database
    const projectId = Date.now().toString()
    saveProject(projectId, 'Untitled Project', projectData)

    // Also save as file for export
    const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'project.aria'
    link.href = URL.createObjectURL(blob)
    link.click()
    setFileMenu({ visible: false, x: 0, y: 0 })
  }

  const loadProject = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result)
        
        // Restore images from data URLs
        const restoredLayers = projectData.layers.map(layer => {
          if (layer.type === 'image' && layer.imageData) {
            const img = new Image()
            img.src = layer.imageData
            return {
              ...layer,
              image: img,
              imageData: undefined
            }
          }
          return layer
        })

        setAspectRatio(projectData.aspectRatio)
        setLayers(restoredLayers)
        setSelectedLayerId(null)
        setHistory([])
        setHistoryIndex(-1)
        
        // Save to database
        const projectId = Date.now().toString()
        saveProject(projectId, file.name.replace('.aria', ''), projectData)
        
        setFileMenu({ visible: false, x: 0, y: 0 })
      } catch (error) {
        console.error('Error loading project:', error)
        alert('Error al cargar el proyecto')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  const fitElementToCanvas = (layerId) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return

    let scale = 1
    let baseWidth, baseHeight

    if (layer.type === 'image' && layer.image) {
      baseWidth = layer.image.width
      baseHeight = layer.image.height
      scale = Math.min(
        currentRatio.width / baseWidth,
        currentRatio.height / baseHeight
      )
    } else if (layer.type === 'text' || layer.type === 'emoji') {
      const fontSize = layer.fontSize || (layer.type === 'emoji' ? 80 : 48)
      baseWidth = fontSize * 2
      baseHeight = fontSize
      scale = Math.min(
        currentRatio.width / baseWidth,
        currentRatio.height / baseHeight
      )
    } else if (layer.type === 'circle') {
      const diameter = layer.radius * 2
      scale = Math.min(
        currentRatio.width / diameter,
        currentRatio.height / diameter
      )
    } else if (layer.type === 'square') {
      scale = Math.min(
        currentRatio.width / layer.size,
        currentRatio.height / layer.size
      )
    } else if (layer.type === 'line') {
      const lineWidth = Math.abs(layer.x2 - layer.x1)
      const lineHeight = Math.abs(layer.y2 - layer.y1)
      scale = Math.min(
        currentRatio.width / lineWidth,
        currentRatio.height / lineHeight
      )
    }

    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l
      
      if (l.type === 'image') {
        return {
          ...l,
          width: baseWidth,
          height: baseHeight,
          scale: scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'text' || l.type === 'emoji') {
        return {
          ...l,
          fontSize: (l.fontSize || (l.type === 'emoji' ? 80 : 48)) * scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'circle') {
        return {
          ...l,
          radius: l.radius * scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'square') {
        return {
          ...l,
          size: l.size * scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'line') {
        const centerX = (l.x1 + l.x2) / 2
        const centerY = (l.y1 + l.y2) / 2
        const newWidth = (l.x2 - l.x1) * scale
        const newHeight = (l.y2 - l.y1) * scale
        return {
          ...l,
          x1: centerX - newWidth / 2,
          y1: centerY - newHeight / 2,
          x2: centerX + newWidth / 2,
          y2: centerY + newHeight / 2,
          rotation: 0
        }
      }
      return l
    })

    setLayers(newLayers)
    saveToHistory(newLayers)
    setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
  }

  const stretchElementToCanvas = (layerId) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return

    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l
      
      if (l.type === 'image') {
        const baseWidth = l.width
        const baseHeight = l.height
        const scale = Math.min(
          currentRatio.width / baseWidth,
          currentRatio.height / baseHeight
        )
        return {
          ...l,
          width: baseWidth,
          height: baseHeight,
          scale: scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'text' || l.type === 'emoji') {
        const fontSize = l.fontSize || (l.type === 'emoji' ? 80 : 48)
        const scale = Math.min(
          currentRatio.width / (fontSize * 2),
          currentRatio.height / fontSize
        )
        return {
          ...l,
          fontSize: fontSize * scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'circle') {
        const radius = Math.min(currentRatio.width, currentRatio.height) / 2
        return {
          ...l,
          radius: radius,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'square') {
        const size = Math.min(currentRatio.width, currentRatio.height)
        return {
          ...l,
          size: size,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'line') {
        return {
          ...l,
          x1: 50,
          y1: currentRatio.height / 2,
          x2: currentRatio.width - 50,
          y2: currentRatio.height / 2,
          rotation: 0
        }
      }
      return l
    })

    setLayers(newLayers)
    saveToHistory(newLayers)
    setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
  }

  const coverElementToCanvas = (layerId) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return

    let scale = 1
    let baseWidth, baseHeight

    if (layer.type === 'image' && layer.image) {
      baseWidth = layer.image.width
      baseHeight = layer.image.height
      scale = Math.max(
        currentRatio.width / baseWidth,
        currentRatio.height / baseHeight
      )
    } else if (layer.type === 'text' || layer.type === 'emoji') {
      const fontSize = layer.fontSize || (layer.type === 'emoji' ? 80 : 48)
      baseWidth = fontSize * 2
      baseHeight = fontSize
      scale = Math.max(
        currentRatio.width / baseWidth,
        currentRatio.height / baseHeight
      )
    } else if (layer.type === 'circle') {
      const diameter = layer.radius * 2
      scale = Math.max(
        currentRatio.width / diameter,
        currentRatio.height / diameter
      )
    } else if (layer.type === 'square') {
      scale = Math.max(
        currentRatio.width / layer.size,
        currentRatio.height / layer.size
      )
    } else if (layer.type === 'line') {
      const lineWidth = Math.abs(layer.x2 - layer.x1)
      const lineHeight = Math.abs(layer.y2 - layer.y1)
      scale = Math.max(
        currentRatio.width / lineWidth,
        currentRatio.height / lineHeight
      )
    }

    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l
      
      if (l.type === 'image') {
        return {
          ...l,
          width: baseWidth,
          height: baseHeight,
          scale: scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'text' || l.type === 'emoji') {
        return {
          ...l,
          fontSize: (l.fontSize || (l.type === 'emoji' ? 80 : 48)) * scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'circle') {
        return {
          ...l,
          radius: l.radius * scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'square') {
        return {
          ...l,
          size: l.size * scale,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'line') {
        const centerX = (l.x1 + l.x2) / 2
        const centerY = (l.y1 + l.y2) / 2
        const newWidth = (l.x2 - l.x1) * scale
        const newHeight = (l.y2 - l.y1) * scale
        return {
          ...l,
          x1: centerX - newWidth / 2,
          y1: centerY - newHeight / 2,
          x2: centerX + newWidth / 2,
          y2: centerY + newHeight / 2,
          rotation: 0
        }
      }
      return l
    })

    setLayers(newLayers)
    saveToHistory(newLayers)
    setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
  }

  const centerElement = (layerId) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return

    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l
      
      if (l.type === 'line') {
        const centerX = (l.x1 + l.x2) / 2
        const centerY = (l.y1 + l.y2) / 2
        const offsetX = currentRatio.width / 2 - centerX
        const offsetY = currentRatio.height / 2 - centerY
        return {
          ...l,
          x1: l.x1 + offsetX,
          y1: l.y1 + offsetY,
          x2: l.x2 + offsetX,
          y2: l.y2 + offsetY
        }
      }
      
      return {
        ...l,
        x: currentRatio.width / 2,
        y: currentRatio.height / 2
      }
    })

    setLayers(newLayers)
    saveToHistory(newLayers)
    setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
  }

  const resetElementToDefault = (layerId) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return

    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l
      
      if (l.type === 'image') {
        const originalWidth = l.originalWidth || l.width
        const originalHeight = l.originalHeight || l.height
        return {
          ...l,
          width: originalWidth,
          height: originalHeight,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'text' || l.type === 'emoji') {
        const originalFontSize = l.originalFontSize || (l.fontSize || (l.type === 'emoji' ? 80 : 48))
        return {
          ...l,
          fontSize: originalFontSize,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'circle') {
        const originalRadius = l.originalRadius || l.radius
        return {
          ...l,
          radius: originalRadius,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'square') {
        const originalSize = l.originalSize || l.size
        return {
          ...l,
          size: originalSize,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      } else if (l.type === 'line') {
        const originalX1 = l.originalX1 || l.x1
        const originalY1 = l.originalY1 || l.y1
        const originalX2 = l.originalX2 || l.x2
        const originalY2 = l.originalY2 || l.y2
        return {
          ...l,
          x1: originalX1,
          y1: originalY1,
          x2: originalX2,
          y2: originalY2,
          rotation: 0
        }
      } else if (l.type === 'gradient') {
        return {
          ...l,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2,
          rotation: 0
        }
      }
      return l
    })

    setLayers(newLayers)
    saveToHistory(newLayers)
    setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
  }

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Convert to canvas coordinates considering zoom and pan
    const canvasX = (mouseX * scaleX - panOffset.x) / zoomLevel
    const canvasY = (mouseY * scaleY - panOffset.y) / zoomLevel
    
    return {
      x: canvasX,
      y: canvasY
    }
  }

  const getLayerBounds = (layer) => {
    if (layer.type === 'image') {
      const scale = layer.scale || 1
      const scaledWidth = layer.width * scale
      const scaledHeight = layer.height * scale
      return {
        x: layer.x - scaledWidth / 2,
        y: layer.y - scaledHeight / 2,
        width: scaledWidth,
        height: scaledHeight
      }
    } else if (layer.type === 'text') {
      const fontSize = layer.fontSize || 48
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.font = `${fontSize}px Arial`
      const textWidth = ctx.measureText(layer.text).width
      return {
        x: layer.x - textWidth / 2,
        y: layer.y - fontSize,
        width: textWidth,
        height: fontSize * 1.2
      }
    } else if (layer.type === 'circle') {
      return {
        x: layer.x - layer.radius,
        y: layer.y - layer.radius,
        width: layer.radius * 2,
        height: layer.radius * 2
      }
    } else if (layer.type === 'square') {
      return {
        x: layer.x - layer.size / 2,
        y: layer.y - layer.size / 2,
        width: layer.size,
        height: layer.size
      }
    } else if (layer.type === 'emoji') {
      const fontSize = layer.fontSize || 80
      return {
        x: layer.x - fontSize,
        y: layer.y - fontSize,
        width: fontSize * 2,
        height: fontSize * 2
      }
    }
    return null
  }

  const getResizeHandleAtPosition = (coords, bounds) => {
    const handleSize = 12
    const handles = [
      { name: 'top-left', x: bounds.x, y: bounds.y },
      { name: 'top-center', x: bounds.x + bounds.width / 2, y: bounds.y },
      { name: 'top-right', x: bounds.x + bounds.width, y: bounds.y },
      { name: 'right-center', x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
      { name: 'bottom-right', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { name: 'bottom-center', x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      { name: 'bottom-left', x: bounds.x, y: bounds.y + bounds.height },
      { name: 'left-center', x: bounds.x, y: bounds.y + bounds.height / 2 },
    ]

    for (const handle of handles) {
      if (Math.abs(coords.x - handle.x) <= handleSize && Math.abs(coords.y - handle.y) <= handleSize) {
        return handle.name
      }
    }
    return null
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    const coords = getCanvasCoordinates(e)
    
    // Check if right-clicking on any layer
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]
      if (!layer.visible) continue
      
      let isHit = false
      
      if (layer.type === 'image' && layer.image) {
        const scale = layer.scale || 1
        const scaledWidth = layer.width * scale
        const scaledHeight = layer.height * scale
        const imgX = layer.x - scaledWidth / 2
        const imgY = layer.y - scaledHeight / 2
        isHit = coords.x >= imgX && coords.x <= imgX + scaledWidth &&
                coords.y >= imgY && coords.y <= imgY + scaledHeight
      } else if (layer.type === 'text' || layer.type === 'emoji') {
        const fontSize = layer.fontSize || (layer.type === 'emoji' ? 80 : 48)
        isHit = Math.abs(coords.x - layer.x) < fontSize * 2 &&
                Math.abs(coords.y - layer.y) < fontSize
      } else if (layer.type === 'circle') {
        const dx = coords.x - layer.x
        const dy = coords.y - layer.y
        isHit = Math.sqrt(dx * dx + dy * dy) <= layer.radius
      } else if (layer.type === 'square') {
        const x = layer.x - layer.size / 2
        const y = layer.y - layer.size / 2
        isHit = coords.x >= x && coords.x <= x + layer.size &&
                coords.y >= y && coords.y <= y + layer.size
      } else if (layer.type === 'line') {
        // Simple line hit detection
        const dist = pointToLineDistance(coords.x, coords.y, layer.x1, layer.y1, layer.x2, layer.y2)
        isHit = dist < 10
      }
      
      if (isHit) {
        setSelectedLayerId(layer.id)
        const rect = canvasRef.current.getBoundingClientRect()
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          layerId: layer.id
        })
        return
      }
    }
    
    // If not clicking on any layer, hide context menu
    setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
  }

  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    if (lenSq !== 0) param = dot / lenSq
    let xx, yy
    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }
    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e)
    
    // Hide context menu, file menu, and emoji picker on left click
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
    }
    if (fileMenu.visible) {
      setFileMenu({ visible: false, x: 0, y: 0 })
    }
    if (emojiPicker.visible) {
      setEmojiPicker({ visible: false, x: 0, y: 0 })
    }
    
    // If Shift or Space is pressed, start panning the canvas
    if (e.shiftKey || e.key === ' ' || isSpacePressed) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    
    // First check if clicking on resize handle of selected layer
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    if (selectedLayer && selectedLayer.type !== 'gradient') {
      const bounds = getLayerBounds(selectedLayer)
      if (bounds) {
        const handle = getResizeHandleAtPosition(coords, bounds)
        if (handle) {
          // Check if in rotation mode or CTRL-SHIFT keys are pressed for rotation
          const isCornerHandle = handle.includes('left') || handle.includes('right')
          if (rotationMode) {
            // Start rotation when in rotation mode (any handle)
            setIsRotating(true)
            setRotationStart({ 
              x: coords.x, 
              y: coords.y, 
              angle: selectedLayer.rotation || 0,
              centerX: selectedLayer.x,
              centerY: selectedLayer.y
            })
            return
          } else if (e.shiftKey && e.ctrlKey && isCornerHandle) {
            // Also allow CTRL-SHIFT for rotation
            setIsRotating(true)
            setRotationStart({ 
              x: coords.x, 
              y: coords.y, 
              angle: selectedLayer.rotation || 0,
              centerX: selectedLayer.x,
              centerY: selectedLayer.y
            })
            return
          }
          // Otherwise, start resizing
          setIsResizing(true)
          setResizeHandle(handle)
          // For images, store the current scale instead of width/height
          if (selectedLayer.type === 'image') {
            setResizeStart({ 
              x: coords.x, 
              y: coords.y, 
              width: bounds.width, 
              height: bounds.height,
              baseScale: selectedLayer.scale || 1,
              baseWidth: selectedLayer.width,
              baseHeight: selectedLayer.height
            })
          } else {
            setResizeStart({ x: coords.x, y: coords.y, width: bounds.width, height: bounds.height })
          }
          return
        }
      }
    }
    
    // Check layers in reverse order (top to bottom)
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]
      if (!layer.visible) continue
      
      let isHit = false
      
      if (layer.type === 'circle') {
        const dx = coords.x - layer.x
        const dy = coords.y - layer.y
        isHit = Math.sqrt(dx * dx + dy * dy) <= layer.radius
      } else if (layer.type === 'square') {
        const x = layer.x - layer.size / 2
        const y = layer.y - layer.size / 2
        isHit = coords.x >= x && coords.x <= x + layer.size &&
                coords.y >= y && coords.y <= y + layer.size
      } else if (layer.type === 'text' || layer.type === 'emoji') {
        const fontSize = layer.fontSize || 48
        isHit = Math.abs(coords.x - layer.x) < fontSize * 2 &&
                Math.abs(coords.y - layer.y) < fontSize
      } else if (layer.type === 'image' && layer.image) {
        const scale = layer.scale || 1
        const scaledWidth = layer.width * scale
        const scaledHeight = layer.height * scale
        const imgX = layer.x - scaledWidth / 2
        const imgY = layer.y - scaledHeight / 2
        isHit = coords.x >= imgX && coords.x <= imgX + scaledWidth &&
                coords.y >= imgY && coords.y <= imgY + scaledHeight
        console.log('Hit detection imagen:', { 
          layerId: layer.id, 
          coords, 
          imgX, imgY, 
          scaledWidth, scaledHeight, 
          scale,
          isHit 
        })
      } else if (layer.type === 'line') {
        const dist = pointToLineDistance(coords.x, coords.y, layer.x1, layer.y1, layer.x2, layer.y2)
        isHit = dist < 10
      }
      
      if (isHit) {
        setSelectedLayerId(layer.id)
        setMouseDownPosition(coords)
        setDraggedLayerId(layer.id)
        setDragStart(coords)
        setDragDirection(null) // Reset drag direction
        
        // Auto-show transform panel when selecting a layer
        if (autoShowTransform) {
          setTransformPanel({ visible: true, layerId: layer.id })
        }
        
        return
      }
    }
    
    // If clicked on empty canvas area, deselect all layers
    setSelectedLayerId(null)
    setTransformPanel({ visible: false, layerId: null })
    setDraggedLayerId(null)
    setMouseDownPosition(null)
  }

  const handleDoubleClick = (e) => {
    const coords = getCanvasCoordinates(e)
    
    // Check if double-clicking on a resize handle of selected layer
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    if (selectedLayer && selectedLayer.type !== 'gradient') {
      const bounds = getLayerBounds(selectedLayer)
      if (bounds) {
        const handle = getResizeHandleAtPosition(coords, bounds)
        if (handle) {
          // Toggle rotation mode on double-click (only change mode, don't start rotating)
          setRotationMode(!rotationMode)
          return
        }
      }
    }
  }

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e)
    const isShiftPressedNow = e.shiftKey // Use actual keyboard state from event
    
    // Handle panning when Shift is pressed
    if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      setPanOffset({
        x: panOffset.x + dx,
        y: panOffset.y + dy
      })
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    
    // Check if we should start dragging (only if mouse moved significantly from down position)
    if (mouseDownPosition && !isDragging && draggedLayerId) {
      const dx = coords.x - mouseDownPosition.x
      const dy = coords.y - mouseDownPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Only start dragging if moved more than 5 pixels
      if (distance > 5) {
        setIsDragging(true)
        setMouseDownPosition(null)
      }
    }
    
    // Update cursor when hovering over handles with CTRL-SHIFT key
    if (!isRotating && !isResizing && !isDragging && !isPanning) {
      // Show grab cursor when Shift or Space is pressed for panning
      if (isShiftPressedNow || isSpacePressed) {
        canvasRef.current.style.cursor = 'grab'
        return
      }
      
      const selectedLayer = layers.find(l => l.id === selectedLayerId)
      if (selectedLayer && selectedLayer.type !== 'gradient') {
        const bounds = getLayerBounds(selectedLayer)
        if (bounds) {
          const handle = getResizeHandleAtPosition(coords, bounds)
          const isCornerHandle = handle && (handle.includes('left') || handle.includes('right'))
          
          if (handle && isShiftPressed && isCtrlPressed && isCornerHandle) {
            setHoveredHandle(handle)
            canvasRef.current.style.cursor = 'grab'
          } else if (handle) {
            setHoveredHandle(handle)
            // Set appropriate cursor based on handle
            if (rotationMode) {
              canvasRef.current.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300a8ff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\'/><path d=\'M3 3v5h5\'/></svg>") 12 12, auto'
            } else {
              const cursorMap = {
                'top-left': 'nwse-resize',
                'top-right': 'nesw-resize',
                'bottom-left': 'nesw-resize',
                'bottom-right': 'nwse-resize',
                'top-center': 'ns-resize',
                'bottom-center': 'ns-resize',
                'left-center': 'ew-resize',
                'right-center': 'ew-resize'
              }
              canvasRef.current.style.cursor = cursorMap[handle] || 'default'
            }
          } else {
            setHoveredHandle(null)
            canvasRef.current.style.cursor = rotationMode ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300a8ff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\'/><path d=\'M3 3v5h5\'/></svg>") 12 12, auto' : 'move'
          }
        }
      }
    } else if (isPanning) {
      canvasRef.current.style.cursor = 'grabbing'
    }
    
    if (isRotating && selectedLayerId) {
      const centerX = rotationStart.centerX
      const centerY = rotationStart.centerY
      
      // Calculate angle from center to mouse position
      const angle = Math.atan2(coords.y - centerY, coords.x - centerX)
      const angleDegrees = angle * 180 / Math.PI
      
      // Calculate initial angle from center to starting mouse position
      const startAngle = Math.atan2(rotationStart.y - centerY, rotationStart.x - centerX)
      const startAngleDegrees = startAngle * 180 / Math.PI
      
      // Calculate the difference and add to the original rotation
      const deltaAngle = angleDegrees - startAngleDegrees
      const newAngle = rotationStart.angle + deltaAngle
      
      // Update rotation start to current position for continuous rotation
      setRotationStart({
        x: coords.x,
        y: coords.y,
        angle: newAngle,
        centerX: centerX,
        centerY: centerY
      })
      
      setLayers(layers.map(layer => {
        if (layer.id !== selectedLayerId) return layer
        return {
          ...layer,
          rotation: newAngle
        }
      }))
      
      return
    }
    
    if (isResizing && selectedLayerId) {
      const dx = coords.x - resizeStart.x
      const dy = coords.y - resizeStart.y
      
      setLayers(layers.map(layer => {
        if (layer.id !== selectedLayerId) return layer
        
        // Scale from center (pivot point)
        let scaleX = 1
        let scaleY = 1
        
        if (resizeHandle.includes('right')) {
          scaleX = (resizeStart.width + dx) / resizeStart.width
        } else if (resizeHandle.includes('left')) {
          scaleX = (resizeStart.width - dx) / resizeStart.width
        }
        
        if (resizeHandle.includes('bottom')) {
          scaleY = (resizeStart.height + dy) / resizeStart.height
        } else if (resizeHandle.includes('top')) {
          scaleY = (resizeStart.height - dy) / resizeStart.height
        }
        
        // For corner handles, use the same scale for both dimensions to maintain aspect ratio for shapes
        if (resizeHandle.includes('top') && resizeHandle.includes('left')) {
          const scale = Math.max(scaleX, scaleY)
          scaleX = scale
          scaleY = scale
        } else if (resizeHandle.includes('top') && resizeHandle.includes('right')) {
          const scale = Math.max(scaleX, scaleY)
          scaleX = scale
          scaleY = scale
        } else if (resizeHandle.includes('bottom') && resizeHandle.includes('left')) {
          const scale = Math.max(scaleX, scaleY)
          scaleX = scale
          scaleY = scale
        } else if (resizeHandle.includes('bottom') && resizeHandle.includes('right')) {
          const scale = Math.max(scaleX, scaleY)
          scaleX = scale
          scaleY = scale
        }
        
        // For edge center handles, only scale in one direction
        if (resizeHandle === 'top-center' || resizeHandle === 'bottom-center') {
          scaleX = 1
        }
        if (resizeHandle === 'left-center' || resizeHandle === 'right-center') {
          scaleY = 1
        }
        
        const newWidth = Math.max(20, resizeStart.width * scaleX)
        const newHeight = Math.max(20, resizeStart.height * scaleY)
        
        if (layer.type === 'image') {
          const baseScale = resizeStart.baseScale || 1
          const baseWidth = resizeStart.baseWidth
          const baseHeight = resizeStart.baseHeight
          const currentScaledWidth = baseWidth * baseScale
          const currentScaledHeight = baseHeight * baseScale
          const targetWidth = currentScaledWidth * scaleX
          const targetHeight = currentScaledHeight * scaleY
          const newScale = Math.max(0.1, (targetWidth / baseWidth + targetHeight / baseHeight) / 2)
          return {
            ...layer,
            scale: newScale
          }
        } else if (layer.type === 'square') {
          const newSize = Math.max(newWidth, newHeight)
          return {
            ...layer,
            size: newSize,
            width: newSize,
            height: newSize
          }
        } else if (layer.type === 'circle') {
          const newRadius = Math.max(newWidth, newHeight) / 2
          return {
            ...layer,
            radius: newRadius,
            width: newRadius * 2,
            height: newRadius * 2
          }
        } else if (layer.type === 'text') {
          const fontSize = Math.max(12, newHeight / 1.2)
          return {
            ...layer,
            fontSize: fontSize,
            width: newWidth,
            height: newHeight
          }
        } else if (layer.type === 'emoji') {
          const fontSize = Math.max(20, newWidth / 2)
          return {
            ...layer,
            fontSize: fontSize,
            width: newWidth,
            height: newHeight
          }
        }
        
        return layer
      }))
      
      return
    }
    
    if (!isDragging || !draggedLayerId) return
    
    const dx = coords.x - dragStart.x
    const dy = coords.y - dragStart.y
    
    // Constrain movement based on drag direction (only when Shift is pressed)
    let constrainedDx = dx
    let constrainedDy = dy
    
    if (e.shiftKey) {
      // Determine drag direction if not set
      if (!dragDirection) {
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        if (absDx > absDy) {
          setDragDirection('horizontal')
        } else if (absDy > absDx) {
          setDragDirection('vertical')
        }
      }
      
      // Apply constraint based on direction
      if (dragDirection === 'horizontal') {
        constrainedDy = 0
      } else if (dragDirection === 'vertical') {
        constrainedDx = 0
      }
    } else {
      // Reset drag direction when Shift is not pressed
      if (dragDirection) {
        setDragDirection(null)
      }
    }
    
    setLayers(layers.map(layer => {
      if (layer.id !== draggedLayerId) return layer
      
      if (layer.type === 'line') {
        return {
          ...layer,
          x1: layer.x1 + constrainedDx,
          y1: layer.y1 + constrainedDy,
          x2: layer.x2 + constrainedDx,
          y2: layer.y2 + constrainedDy
        }
      }
      
      return {
        ...layer,
        x: layer.x + constrainedDx,
        y: layer.y + constrainedDy
      }
    }))
    
    setDragStart(coords)
  }

  const handleMouseUp = () => {
    if (isDragging || isResizing || isRotating) {
      saveToHistory(layers)
    }
    setIsDragging(false)
    setDraggedLayerId(null)
    setIsResizing(false)
    setResizeHandle(null)
    setIsRotating(false)
    setRotationStart({ x: 0, y: 0, angle: 0, centerX: 0, centerY: 0 })
    setDragDirection(null) // Reset drag direction
    setMouseDownPosition(null) // Reset mouse down position
    setIsPanning(false) // Reset panning state
    setPanStart({ x: 0, y: 0 }) // Reset pan start
    // Don't exit rotation mode on mouse up - it persists until double-click
  }

  const selectedLayer = layers.find(l => l.id === selectedLayerId)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Left Toolbar - Photoshop Style */}
        <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => {
              setShowMoreOptions(false)
              setAspectRatioMenu(false)
              setFileMenu({ visible: false, x: 0, y: 0 })
              setEmojiPicker({ visible: false, x: 0, y: 0 })
              fileInputRef.current?.click()
            }}
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition tooltip-container"
            title="Subir Imagen"
          >
            <ImageIcon size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <button
            onClick={() => {
              setShowMoreOptions(false)
              setAspectRatioMenu(false)
              setFileMenu({ visible: false, x: 0, y: 0 })
              setEmojiPicker({ visible: false, x: 0, y: 0 })
              addTextLayer()
            }}
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
            title="Texto"
          >
            <Type size={20} />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAspectRatioMenu(false)
                setFileMenu({ visible: false, x: 0, y: 0 })
                setEmojiPicker({ visible: false, x: 0, y: 0 })
                setShowMoreOptions(!showMoreOptions)
              }}
              className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
              title="Formas"
            >
              <Square size={20} />
            </button>
            {showMoreOptions && (
              <div 
                className="fixed left-16 top-16 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 min-w-[150px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={addCircleLayer}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                >
                  <Circle size={16} />
                  Círculo
                </button>
                <button
                  onClick={addSquareLayer}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                >
                  <Square size={16} />
                  Cuadrado
                </button>
                <button
                  onClick={addLineLayer}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                >
                  <Minus size={16} />
                  Línea
                </button>
                <button
                  onClick={addGradientLayer}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                >
                  <Palette size={16} />
                  Gradiente
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEmojiPicker({ visible: true, x: e.clientX, y: e.clientY + 30 })
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                >
                  <Sparkles size={16} />
                  Emoji
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMoreOptions(false)
              setAspectRatioMenu(false)
              setEmojiPicker({ visible: false, x: 0, y: 0 })
              setFileMenu({ visible: true, x: e.clientX, y: e.clientY + 30 })
            }}
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
            title="Archivo"
          >
            <Download size={20} />
          </button>
          
          <button
            onClick={() => {
              setZoomLevel(1)
              setPanOffset({ x: 0, y: 0 })
            }}
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
            title="Resetear Zoom"
          >
            <ZoomIn size={20} />
          </button>
          
          <button
            onClick={() => {
              const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel * 1.2))
              setZoomLevel(newZoomLevel)
            }}
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
          
          <button
            onClick={() => {
              const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel * 0.8))
              setZoomLevel(newZoomLevel)
            }}
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMoreOptions(false)
                setFileMenu({ visible: false, x: 0, y: 0 })
                setEmojiPicker({ visible: false, x: 0, y: 0 })
                setAspectRatioMenu(!aspectRatioMenu)
              }}
              className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
              title="Relación de Aspecto"
            >
              <Layout size={20} />
            </button>
            {aspectRatioMenu && (
              <div 
                className="fixed left-16 top-32 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-[9999] min-w-[150px]"
                onClick={(e) => e.stopPropagation()}
              >
                {aspectRatios.map(ratio => (
                  <button
                    key={ratio.value}
                    onClick={() => {
                      setAspectRatio(ratio.value)
                      setAspectRatioMenu(false)
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left text-white ${aspectRatio === ratio.value ? 'bg-primary/20' : ''}`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4">
          <header className="mb-4">
            <h1 
              className="text-2xl font-bold text-primary cursor-pointer select-none"
              onClick={handleTitleClick}
              title="Haz clic 3 veces para mostrar/ocultar consola de depuración"
            >
              Aria Photo Editor
            </h1>
          </header>

          <div className="flex gap-4 flex-1">
            <div className="flex-1">
              <div className="bg-card rounded-lg border border-border p-4 h-full">
                <div className="flex justify-center bg-muted rounded-lg p-4 relative">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-border rounded cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onContextMenu={handleContextMenu}
                    onDoubleClick={handleDoubleClick}
                  />
                  
                  {contextMenu.visible && (
                    <div
                      className="fixed bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 min-w-[200px]"
                      style={{
                        left: contextMenu.x,
                        top: contextMenu.y
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(() => {
                        const layer = layers.find(l => l.id === contextMenu.layerId)
                        if (!layer) return null
                        
                        return (
                          <>
                            <button
                              onClick={() => fitElementToCanvas(contextMenu.layerId)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                            >
                              <Maximize2 size={16} />
                              Ajustar a vista
                            </button>
                            <button
                              onClick={() => stretchElementToCanvas(contextMenu.layerId)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                            >
                              <Maximize2 size={16} />
                              Ajustar a ventana (ancho/alto)
                            </button>
                            <button
                              onClick={() => coverElementToCanvas(contextMenu.layerId)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                            >
                              <Maximize2 size={16} />
                              Rellenar todo
                            </button>
                            <button
                              onClick={() => centerElement(contextMenu.layerId)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                            >
                              <AlignCenter size={16} />
                              Enviar al centro
                            </button>
                            <button
                              onClick={() => resetElementToDefault(contextMenu.layerId)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                            >
                              <RotateCcw size={16} />
                              Restablecer imagen predeterminada
                            </button>
                            <button
                              onClick={() => {
                                setAutoShowTransform(!autoShowTransform)
                                setTransformPanel({ visible: !autoShowTransform, layerId: contextMenu.layerId })
                                setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
                            >
                              <Layout size={16} />
                              {autoShowTransform ? 'Ocultar opciones de transformación' : 'Mostrar opciones de transformación'}
                            </button>
                            <div className="border-t border-border my-1"></div>
                          </>
                        )
                      })()}
                      <button
                        onClick={() => {
                          deleteLayer(contextMenu.layerId)
                          setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-destructive/20 text-destructive transition text-left"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-80">
              <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold">Capas</h2>
                </div>
                <button
                  onClick={() => setLayersCollapsed(!layersCollapsed)}
                  className="p-1 hover:bg-primary/20 rounded"
                >
                  {layersCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>

              {!layersCollapsed && (
                <div className="max-h-96 overflow-y-auto">
                  {layers.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No hay capas. Sube una imagen o agrega texto.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {[...layers].reverse().map((layer, reverseIndex) => {
                        const index = layers.length - 1 - reverseIndex
                        return (
                          <div
                            key={layer.id}
                            className={`p-3 rounded border transition cursor-pointer ${
                              selectedLayerId === layer.id
                                ? 'bg-primary/20 border-primary'
                                : 'bg-secondary border-border hover:border-primary'
                            }`}
                            onClick={() => setSelectedLayerId(layer.id)}
                          >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {layer.type === 'image' ? (
                              <ImageIcon size={16} />
                            ) : layer.type === 'text' ? (
                              <Type size={16} />
                            ) : layer.type === 'circle' ? (
                              <Circle size={16} />
                            ) : layer.type === 'square' ? (
                              <Square size={16} />
                            ) : layer.type === 'line' ? (
                              <Minus size={16} />
                            ) : layer.type === 'gradient' ? (
                              <Palette size={16} />
                            ) : layer.type === 'emoji' ? (
                              <Sparkles size={16} />
                            ) : (
                              <Plus size={16} />
                            )}
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {layer.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveLayer(index, 1)
                              }}
                              disabled={index === layers.length - 1}
                              className="p-1 hover:bg-primary/20 rounded disabled:opacity-30"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveLayer(index, -1)
                              }}
                              disabled={index === 0}
                              className="p-1 hover:bg-primary/20 rounded disabled:opacity-30"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLayerVisibility(layer.id)
                              }}
                              className="p-1 hover:bg-primary/20 rounded"
                            >
                              <Sun size={14} className={layer.visible ? '' : 'opacity-30'} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteLayer(layer.id)
                              }}
                              className="p-1 hover:bg-destructive/20 rounded text-destructive"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Opacidad:</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={layer.opacity}
                            onChange={(e) => {
                              e.stopPropagation()
                              updateLayerOpacity(layer.id, parseFloat(e.target.value))
                            }}
                            className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs w-8">{Math.round(layer.opacity * 100)}%</span>
                        </div>
                      </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {transformPanel.visible && (
              <div className="bg-card rounded-lg border border-border p-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layout size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Transformación</h2>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTransformCollapsed(!transformCollapsed)}
                      className="p-1 hover:bg-primary/20 rounded"
                    >
                      {transformCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <button
                      onClick={() => setTransformPanel({ visible: false, layerId: null })}
                      className="p-1 hover:bg-primary/20 rounded"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                  </div>
                </div>

                {!transformCollapsed && (() => {
                  const layer = layers.find(l => l.id === transformPanel.layerId)
                  if (!layer) return null

                  return (
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {/* Reset Button */}
                      <button
                        onClick={() => setResetConfirmModal(true)}
                        className="w-full py-2 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm font-medium transition"
                      >
                        Restablecer Transformaciones
                      </button>
                      {/* Scale */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Escala:</span>
                          <span className="text-xs w-12">{Math.round((layer.scale || 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.01"
                          value={layer.scale || 1}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, scale: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Rotation */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Rotación:</span>
                          <span className="text-xs w-12">{Math.round(layer.rotation || 0)}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="1"
                          value={layer.rotation || 0}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, rotation: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                        {/* Preset rotation buttons */}
                        <div className="flex gap-1 mt-2">
                          {[-180, -90, -45, 0, 45, 90, 180].map(angle => (
                            <button
                              key={angle}
                              onClick={() => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { ...l, rotation: angle } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="px-2 py-1 text-xs bg-secondary hover:bg-primary/20 rounded"
                            >
                              {angle}°
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mirror effects */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Espejo:</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newLayers = layers.map(l => 
                                l.id === layer.id ? { ...l, flipX: !(l.flipX || false) } : l
                              )
                              setLayers(newLayers)
                            }}
                            className={`flex-1 px-2 py-1 text-xs rounded ${layer.flipX ? 'bg-primary/20' : 'bg-secondary hover:bg-primary/20'}`}
                          >
                            Horizontal
                          </button>
                          <button
                            onClick={() => {
                              const newLayers = layers.map(l => 
                                l.id === layer.id ? { ...l, flipY: !(l.flipY || false) } : l
                              )
                              setLayers(newLayers)
                            }}
                            className={`flex-1 px-2 py-1 text-xs rounded ${layer.flipY ? 'bg-primary/20' : 'bg-secondary hover:bg-primary/20'}`}
                          >
                            Vertical
                          </button>
                        </div>
                      </div>

                      {/* Position X */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Posición X:</span>
                          <span className="text-xs w-12">{Math.round(layer.x)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={currentRatio.width}
                          step="1"
                          value={layer.x}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, x: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Position Y */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Posición Y:</span>
                          <span className="text-xs w-12">{Math.round(layer.y)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={currentRatio.height}
                          step="1"
                          value={layer.y}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, y: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Brillo:</span>
                          <span className="text-xs w-12">{Math.round((layer.brightness || 100))}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="1"
                          value={layer.brightness || 100}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, brightness: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Contraste:</span>
                          <span className="text-xs w-12">{Math.round((layer.contrast || 100))}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="1"
                          value={layer.contrast || 100}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, contrast: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Blur */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Blur:</span>
                          <span className="text-xs w-12">{Math.round((layer.blur || 0))}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={layer.blur || 0}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, blur: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Opacity */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Opacidad:</span>
                          <span className="text-xs w-12">{Math.round((layer.opacity || 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={layer.opacity || 1}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, opacity: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* RGBA - Red */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Rojo (R):</span>
                          <span className="text-xs w-12">{Math.round((layer.red || 255))}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          step="1"
                          value={layer.red || 255}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, red: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* RGBA - Green */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Verde (G):</span>
                          <span className="text-xs w-12">{Math.round((layer.green || 255))}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          step="1"
                          value={layer.green || 255}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, green: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* RGBA - Blue */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Azul (B):</span>
                          <span className="text-xs w-12">{Math.round((layer.blue || 255))}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          step="1"
                          value={layer.blue || 255}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, blue: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Sharpness */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Nitidez:</span>
                          <span className="text-xs w-12">{Math.round((layer.sharpness || 0))}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={layer.sharpness || 0}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, sharpness: parseFloat(e.target.value) } : l
                            )
                            setLayers(newLayers)
                          }}
                          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {selectedLayer && selectedLayer.type === 'text' && (
              <div className="bg-card rounded-lg border border-border p-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Editar Texto</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Texto</label>
                    <input
                      type="text"
                      value={selectedLayer.text}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, text: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Tamaño: {selectedLayer.fontSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={selectedLayer.fontSize}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, fontSize: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, color: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedLayer && selectedLayer.type === 'circle' && (
              <div className="bg-card rounded-lg border border-border p-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Editar Círculo</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Radio: {selectedLayer.radius}px</label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={selectedLayer.radius}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, radius: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Posición X: {selectedLayer.x}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.width}
                      value={selectedLayer.x}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, x: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Posición Y: {selectedLayer.y}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.height}
                      value={selectedLayer.y}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, y: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, color: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedLayer && selectedLayer.type === 'square' && (
              <div className="bg-card rounded-lg border border-border p-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Editar Cuadrado</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Tamaño: {selectedLayer.size}px</label>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={selectedLayer.size}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, size: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Posición X: {selectedLayer.x}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.width}
                      value={selectedLayer.x}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, x: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Posición Y: {selectedLayer.y}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.height}
                      value={selectedLayer.y}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, y: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, color: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedLayer && selectedLayer.type === 'line' && (
              <div className="bg-card rounded-lg border border-border p-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Editar Línea</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Grosor: {selectedLayer.strokeWidth}px</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={selectedLayer.strokeWidth}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, strokeWidth: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">X1: {selectedLayer.x1}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.width}
                      value={selectedLayer.x1}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, x1: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Y1: {selectedLayer.y1}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.height}
                      value={selectedLayer.y1}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, y1: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">X2: {selectedLayer.x2}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.width}
                      value={selectedLayer.x2}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, x2: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Y2: {selectedLayer.y2}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.height}
                      value={selectedLayer.y2}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, y2: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, color: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedLayer && selectedLayer.type === 'gradient' && (
              <div className="bg-card rounded-lg border border-border p-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Editar Gradiente</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Color 1</label>
                    <input
                      type="color"
                      value={selectedLayer.color1}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, color1: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Color 2</label>
                    <input
                      type="color"
                      value={selectedLayer.color2}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, color2: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Dirección</label>
                    <select
                      value={selectedLayer.direction}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, direction: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm"
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedLayer && selectedLayer.type === 'emoji' && (
              <div className="bg-card rounded-lg border border-border p-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Editar Emoji</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Emoji</label>
                    <input
                      type="text"
                      value={selectedLayer.emoji}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, emoji: e.target.value }
                            : layer
                        ))
                      }}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm text-center text-2xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Tamaño: {selectedLayer.fontSize}px</label>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={selectedLayer.fontSize}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, fontSize: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Posición X: {selectedLayer.x}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.width}
                      value={selectedLayer.x}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, x: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Posición Y: {selectedLayer.y}</label>
                    <input
                      type="range"
                      min="0"
                      max={currentRatio.height}
                      value={selectedLayer.y}
                      onChange={(e) => {
                        setLayers(layers.map(layer =>
                          layer.id === selectedLayerId
                            ? { ...layer, y: parseInt(e.target.value) }
                            : layer
                        ))
                      }}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Restablecer Transformaciones</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de que deseas restablecer todas las transformaciones de esta capa a sus valores predeterminados? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setResetConfirmModal(false)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => resetLayerTransformations(transformPanel.layerId)}
                className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-sm font-medium transition"
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {debugConsoleVisible && <DebugConsole />}
    </div>
  )
}

export default App
