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
  Layout
} from 'lucide-react'

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
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isRotating, setIsRotating] = useState(false)
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, angle: 0 })
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [hoveredHandle, setHoveredHandle] = useState(null)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, layerId: null })
  const [fileMenu, setFileMenu] = useState({ visible: false, x: 0, y: 0 })
  const [emojiPicker, setEmojiPicker] = useState({ visible: false, x: 0, y: 0 })
  const [dragDirection, setDragDirection] = useState(null) // 'horizontal' or 'vertical' or null
  const [rotationMode, setRotationMode] = useState(false) // Rotation mode via double-click
  const [aspectRatioMenu, setAspectRatioMenu] = useState(false)
  const projectInputRef = useRef(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newLayers)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  useEffect(() => {
    renderCanvas()
  }, [layers, aspectRatio])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
      if (e.key === 'Control') {
        setIsCtrlPressed(true)
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        if (e.altKey && historyIndex < history.length - 1) {
          // Redo (CTRL-ALT-Z)
          const newLayers = JSON.parse(JSON.stringify(history[historyIndex + 1]))
          setLayers(newLayers)
          setHistoryIndex(historyIndex + 1)
        } else if (!e.altKey && historyIndex > 0) {
          // Undo (CTRL-Z)
          const newLayers = JSON.parse(JSON.stringify(history[historyIndex - 1]))
          setLayers(newLayers)
          setHistoryIndex(historyIndex - 1)
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
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [history, historyIndex])

  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = currentRatio.width
    canvas.height = currentRatio.height

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

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
        
        if (layer.type === 'image' && layer.image && layer.image.complete) {
          const img = layer.image
          const x = layer.x - layer.width / 2
          const y = layer.y - layer.height / 2
          ctx.drawImage(img, x, y, layer.width, layer.height)
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

    // Draw selection box and handles for selected layer
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    if (selectedLayer && selectedLayer.type !== 'gradient') {
      let bounds = { x: 0, y: 0, width: 0, height: 0 }
      
      if (selectedLayer.type === 'image') {
        bounds = {
          x: selectedLayer.x - selectedLayer.width / 2,
          y: selectedLayer.y - selectedLayer.height / 2,
          width: selectedLayer.width,
          height: selectedLayer.height
        }
      } else if (selectedLayer.type === 'text') {
        const fontSize = selectedLayer.fontSize || 48
        const textWidth = ctx.measureText(selectedLayer.text).width
        bounds = {
          x: selectedLayer.x - textWidth / 2,
          y: selectedLayer.y - fontSize,
          width: textWidth,
          height: fontSize * 1.2
        }
      } else if (selectedLayer.type === 'circle') {
        bounds = {
          x: selectedLayer.x - selectedLayer.radius,
          y: selectedLayer.y - selectedLayer.radius,
          width: selectedLayer.radius * 2,
          height: selectedLayer.radius * 2
        }
      } else if (selectedLayer.type === 'square') {
        bounds = {
          x: selectedLayer.x - selectedLayer.size / 2,
          y: selectedLayer.y - selectedLayer.size / 2,
          width: selectedLayer.size,
          height: selectedLayer.size
        }
      } else if (selectedLayer.type === 'emoji') {
        const fontSize = selectedLayer.fontSize || 80
        bounds = {
          x: selectedLayer.x - fontSize,
          y: selectedLayer.y - fontSize,
          width: fontSize * 2,
          height: fontSize * 2
        }
      }

      // Save context and apply rotation for selection box
      ctx.save()
      const rotation = selectedLayer.rotation || 0
      const centerX = selectedLayer.x
      const centerY = selectedLayer.y
      
      // Move to center, rotate, then move back
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation * Math.PI / 180)
      ctx.translate(-centerX, -centerY)

      // Draw dotted selection box
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
      ctx.setLineDash([])

      // Draw resize handles
      const handleSize = 8
      const handles = [
        { x: bounds.x, y: bounds.y }, // top-left
        { x: bounds.x + bounds.width / 2, y: bounds.y }, // top-center
        { x: bounds.x + bounds.width, y: bounds.y }, // top-right
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }, // right-center
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // bottom-right
        { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, // bottom-center
        { x: bounds.x, y: bounds.y + bounds.height }, // bottom-left
        { x: bounds.x, y: bounds.y + bounds.height / 2 }, // left-center
      ]

      handles.forEach(handle => {
        ctx.fillStyle = '#00ffff'
        if (rotationMode) {
          // Draw circular handles in rotation mode
          ctx.beginPath()
          ctx.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Draw square handles in normal mode
          ctx.fillRect(
            handle.x - handleSize / 2,
            handle.y - handleSize / 2,
            handleSize,
            handleSize
          )
        }
      })

      // Restore context
      ctx.restore()
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(
          currentRatio.width / img.width,
          currentRatio.height / img.height
        ) * 0.5
        const newLayer = {
          id: Date.now(),
          type: 'image',
          name: file.name,
          image: img,
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
          width: baseWidth * scale,
          height: baseHeight * scale,
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
        return {
          ...l,
          width: currentRatio.width,
          height: currentRatio.height,
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
          width: baseWidth * scale,
          height: baseHeight * scale,
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

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const getLayerBounds = (layer) => {
    if (layer.type === 'image') {
      return {
        x: layer.x - layer.width / 2,
        y: layer.y - layer.height / 2,
        width: layer.width,
        height: layer.height
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
        const imgX = layer.x - layer.width / 2
        const imgY = layer.y - layer.height / 2
        isHit = coords.x >= imgX && coords.x <= imgX + layer.width &&
                coords.y >= imgY && coords.y <= imgY + layer.height
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
          setResizeStart({ x: coords.x, y: coords.y, width: bounds.width, height: bounds.height })
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
        const imgX = layer.x - layer.width / 2
        const imgY = layer.y - layer.height / 2
        isHit = coords.x >= imgX && coords.x <= imgX + layer.width &&
                coords.y >= imgY && coords.y <= imgY + layer.height
      }
      
      if (isHit) {
        setSelectedLayerId(layer.id)
        setIsDragging(true)
        setDraggedLayerId(layer.id)
        setDragStart(coords)
        setDragDirection(null) // Reset drag direction
        return
      }
    }
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
    
    // Update cursor when hovering over handles with CTRL-SHIFT key
    if (!isRotating && !isResizing && !isDragging) {
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
          return {
            ...layer,
            width: newWidth,
            height: newHeight
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
    
    // Determine drag direction if Shift is pressed and direction not set
    if (isShiftPressed && !dragDirection) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx > absDy) {
        setDragDirection('horizontal')
      } else if (absDy > absDx) {
        setDragDirection('vertical')
      }
    }
    
    // Constrain movement based on drag direction
    let constrainedDx = dx
    let constrainedDy = dy
    
    if (isShiftPressed && dragDirection === 'horizontal') {
      constrainedDy = 0
    } else if (isShiftPressed && dragDirection === 'vertical') {
      constrainedDx = 0
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
    // Don't exit rotation mode on mouse up - it persists until double-click
  }

  const selectedLayer = layers.find(l => l.id === selectedLayerId)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Left Toolbar - Photoshop Style */}
        <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
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
            onClick={addTextLayer}
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
            <h1 className="text-2xl font-bold text-primary">Aria Photo Editor</h1>
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
              <div className="flex items-center gap-2 mb-4">
                <Layers size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Capas</h2>
              </div>

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
    </div>
  )
}

export default App
