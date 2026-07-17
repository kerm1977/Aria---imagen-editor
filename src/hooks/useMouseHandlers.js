/**
 * MOUSE HANDLERS
 * 
 * Event handlers del mouse para el canvas
 */

import { useState } from 'react'
import { getCanvasCoordinates } from '../utils/canvas/getCanvasCoordinates.js'
import { getLayerBounds } from '../utils/canvas/getLayerBounds.js'
import { getResizeHandleAtPosition } from '../utils/canvas/getResizeHandleAtPosition.js'
import { pointToLineDistance } from '../utils/canvas/pointToLineDistance.js'

export const useMouseHandlers = (canvasRef, layers, setLayers, selectedLayerId, setSelectedLayerId, 
  setContextMenu, setTransformPanel, setAutoShowTransform, currentRatio, 
  setZoomLevel, setPanOffset, saveToHistory, zoomLevel, panOffset) => {
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedLayerId, setDraggedLayerId] = useState(null)
  const [draggedLayerStart, setDraggedLayerStart] = useState({ x: 0, y: 0 })
  const [mouseDownPosition, setMouseDownPosition] = useState(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isRotating, setIsRotating] = useState(false)
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, angle: 0, centerX: 0, centerY: 0 })
  const [dragDirection, setDragDirection] = useState(null)
  const [rotationMode, setRotationMode] = useState(false)
  const [hoveredHandle, setHoveredHandle] = useState(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e, canvasRef, panOffset, zoomLevel)
    
    // Check if clicking on a resize handle
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    if (selectedLayer && selectedLayer.type !== 'gradient') {
      const bounds = getLayerBounds(selectedLayer, canvasRef)
      if (bounds) {
        const handle = getResizeHandleAtPosition(coords, bounds)
        if (handle) {
          setIsResizing(true)
          setResizeHandle(handle)
          setResizeStart({ x: coords.x, y: coords.y, width: bounds.width, height: bounds.height })
          return
        }
      }
    }

    // Check if clicking on a layer
    let clickedLayer = null
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]
      if (!layer.visible) continue
      
      const bounds = getLayerBounds(layer, canvasRef)
      if (bounds) {
        const isHit = coords.x >= bounds.x && coords.x <= bounds.x + bounds.width &&
                      coords.y >= bounds.y && coords.y <= bounds.y + bounds.height
        
        if (layer.type === 'line') {
          const dist = pointToLineDistance(coords.x, coords.y, layer.x1, layer.y1, layer.x2, layer.y2)
          if (dist < 10) clickedLayer = layer
        } else if (isHit) {
          clickedLayer = layer
        }
      }
      
      if (clickedLayer) break
    }

    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id)
      setIsDragging(true)
      setDragStart(coords)
      setDraggedLayerId(clickedLayer.id)
      setDraggedLayerStart({
        x: clickedLayer.x,
        y: clickedLayer.y,
        x1: clickedLayer.x1,
        y1: clickedLayer.y1,
        x2: clickedLayer.x2,
        y2: clickedLayer.y2
      })
      setMouseDownPosition({ x: e.clientX, y: e.clientY })
      // Show transform panel when selecting a layer
      setTransformPanel({ visible: true, layerId: clickedLayer.id })
    } else {
      // Release drag if clicking outside
      if (isDragging) {
        setIsDragging(false)
        setDraggedLayerId(null)
      }
      
      // Start panning if Shift or Space is pressed
      if (isShiftPressed || isSpacePressed) {
        setIsPanning(true)
        setPanStart({ x: e.clientX, y: e.clientY })
      } else {
        setSelectedLayerId(null)
      }
    }
  }

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e, canvasRef, panOffset, zoomLevel)
    
    if (isDragging && draggedLayerId) {
      const dx = coords.x - dragStart.x
      const dy = coords.y - dragStart.y
      
      setLayers(layers.map(layer => {
        if (layer.id === draggedLayerId) {
          if (layer.type === 'line') {
            return {
              ...layer,
              x1: draggedLayerStart.x1 + dx,
              y1: draggedLayerStart.y1 + dy,
              x2: draggedLayerStart.x2 + dx,
              y2: draggedLayerStart.y2 + dy
            }
          }
          return {
            ...layer,
            x: draggedLayerStart.x + dx,
            y: draggedLayerStart.y + dy
          }
        }
        return layer
      }))
    } else if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setPanStart({ x: e.clientX, y: e.clientY })
    } else if (isResizing && resizeHandle) {
      const dx = coords.x - resizeStart.x
      const dy = coords.y - resizeStart.y
      
      setLayers(layers.map(layer => {
        if (layer.id === selectedLayerId) {
          const newLayer = { ...layer }
          const aspectRatio = resizeStart.width / resizeStart.height
          
          if (isShiftPressed) {
            // Proportional resizing (maintain aspect ratio)
            const maxDelta = Math.max(Math.abs(dx), Math.abs(dy))
            const signX = dx >= 0 ? 1 : -1
            const signY = dy >= 0 ? 1 : -1
            
            if (resizeHandle.includes('left') || resizeHandle.includes('right')) {
              const newWidth = Math.max(10, resizeStart.width + signX * maxDelta)
              const newHeight = newWidth / aspectRatio
              
              if (resizeHandle.includes('left')) {
                newLayer.x = layer.x + (resizeStart.width - newWidth) / 2
              }
              newLayer.width = newWidth
              newLayer.height = newHeight
            }
            if (resizeHandle.includes('top') || resizeHandle.includes('bottom')) {
              const newHeight = Math.max(10, resizeStart.height + signY * maxDelta)
              const newWidth = newHeight * aspectRatio
              
              if (resizeHandle.includes('top')) {
                newLayer.y = layer.y + (resizeStart.height - newHeight) / 2
              }
              newLayer.width = newWidth
              newLayer.height = newHeight
            }
          } else {
            // Free resizing
            if (resizeHandle.includes('left')) {
              newLayer.x = layer.x + dx
              newLayer.width = Math.max(10, resizeStart.width - dx)
            }
            if (resizeHandle.includes('right')) {
              newLayer.width = Math.max(10, resizeStart.width + dx)
            }
            if (resizeHandle.includes('top')) {
              newLayer.y = layer.y + dy
              newLayer.height = Math.max(10, resizeStart.height - dy)
            }
            if (resizeHandle.includes('bottom')) {
              newLayer.height = Math.max(10, resizeStart.height + dy)
            }
          }
          
          return newLayer
        }
        return layer
      }))
    } else if (isRotating) {
      const centerX = rotationStart.centerX
      const centerY = rotationStart.centerY
      const angle = Math.atan2(coords.y - centerY, coords.x - centerX)
      const angleDegrees = angle * 180 / Math.PI
      
      setLayers(layers.map(layer => {
        if (layer.id === selectedLayerId) {
          return { ...layer, rotation: angleDegrees }
        }
        return layer
      }))
    }
  }

  const handleMouseUp = () => {
    if ((isDragging || isResizing || isRotating) && saveToHistory) {
      saveToHistory(layers)
    }
    setIsDragging(false)
    setDraggedLayerId(null)
    setIsResizing(false)
    setResizeHandle(null)
    setIsRotating(false)
    setRotationStart({ x: 0, y: 0, angle: 0, centerX: 0, centerY: 0 })
    setDragDirection(null)
    setMouseDownPosition(null)
    setIsPanning(false)
    setPanStart({ x: 0, y: 0 })
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    const coords = getCanvasCoordinates(e, canvasRef, panOffset, zoomLevel)
    
    // Find clicked layer
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]
      if (!layer.visible) continue
      
      const bounds = getLayerBounds(layer, canvasRef)
      if (bounds) {
        let isHit = coords.x >= bounds.x && coords.x <= bounds.x + bounds.width &&
                    coords.y >= bounds.y && coords.y <= bounds.y + bounds.height
        
        if (layer.type === 'line') {
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
    }
  }

  const handleDoubleClick = (e) => {
    const coords = getCanvasCoordinates(e, canvasRef, panOffset, zoomLevel)
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    
    if (selectedLayer && selectedLayer.type !== 'gradient') {
      const bounds = getLayerBounds(selectedLayer, canvasRef)
      if (bounds) {
        const handle = getResizeHandleAtPosition(coords, bounds)
        if (handle && (handle.includes('left') || handle.includes('right'))) {
          // Toggle rotation mode
          setRotationMode(!rotationMode)
        }
      }
    }
  }

  return {
    isDragging,
    isPanning,
    isResizing,
    isRotating,
    rotationMode,
    hoveredHandle,
    isShiftPressed,
    isCtrlPressed,
    isSpacePressed,
    setIsShiftPressed,
    setIsCtrlPressed,
    setIsSpacePressed,
    setRotationMode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    handleDoubleClick
  }
}
