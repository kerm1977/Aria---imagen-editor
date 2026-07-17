/**
 * MOUSE HANDLERS
 * 
 * Manejo de eventos de mouse para el editor de fotos
 * - handleMouseDown: Iniciar arrastre, selección, redimensionamiento
 * - handleMouseMove: Mover capas, redimensionar, rotar
 * - handleMouseUp: Finalizar acciones
 * - handleDoubleClick: Activar modo de rotación
 */

export const handleMouseDown = (e, canvasRef, layers, selectedLayerId, setSelectedLayerId, setMouseDownPosition, setDraggedLayerId, setDragStart, setDragDirection, setTransformPanel, autoShowTransform, setIsDragging, setIsResizing, setIsRotating, setResizeHandle, setResizeStart, setRotationStart, rotationMode, setIsPanning, setPanStart, isSpacePressed, getCanvasCoordinates, getLayerBounds, getResizeHandleAtPosition, pointToLineDistance, panOffset, zoomLevel) => {
  const canvas = canvasRef.current
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const coords = getCanvasCoordinates(e, rect, canvas, panOffset, zoomLevel)
  
  // Check if clicking on resize handles of selected layer
  if (selectedLayerId) {
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    if (selectedLayer) {
      const bounds = getLayerBounds(selectedLayer, canvasRef)
      const handle = getResizeHandleAtPosition(coords, bounds)
      
      if (handle) {
        // If in rotation mode, allow rotation with handles
        if (rotationMode) {
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
  
  // If not clicking on any layer, deselect
  setSelectedLayerId(null)
  setTransformPanel({ visible: false, layerId: null })
  
  // If Shift or Space is pressed, start panning the canvas
  if (e.shiftKey || isSpacePressed) {
    setIsPanning(true)
    setPanStart({ x: e.clientX, y: e.clientY })
  }
}

export const handleMouseMove = (e, canvasRef, isDragging, draggedLayerId, dragStart, layers, setLayers, isResizing, resizeHandle, resizeStart, selectedLayerId, isRotating, rotationStart, isPanning, panStart, setPanOffset, zoomLevel, getCanvasCoordinates, getLayerBounds, panOffset) => {
  const canvas = canvasRef.current
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const coords = getCanvasCoordinates(e, rect, canvas, panOffset, zoomLevel)
  
  if (isDragging && draggedLayerId) {
    const dx = coords.x - dragStart.x
    const dy = coords.y - dragStart.y
    
    setLayers(layers.map(layer => {
      if (layer.id === draggedLayerId) {
        if (layer.type === 'line') {
          return {
            ...layer,
            x1: layer.x1 + dx,
            y1: layer.y1 + dy,
            x2: layer.x2 + dx,
            y2: layer.y2 + dy
          }
        }
        return {
          ...layer,
          x: layer.x + dx,
          y: layer.y + dy
        }
      }
      return layer
    }))
    
    setDragStart(coords)
  }
  
  if (isResizing && resizeHandle && selectedLayerId) {
    const layer = layers.find(l => l.id === selectedLayerId)
    if (!layer) return
    
    const bounds = getLayerBounds(layer, canvasRef)
    const dx = coords.x - resizeStart.x
    const dy = coords.y - resizeStart.y
    
    let scaleX = 1
    let scaleY = 1
    
    // Calculate scale based on handle position
    if (resizeHandle.includes('right')) {
      scaleX = (bounds.width + dx) / bounds.width
    }
    if (resizeHandle.includes('left')) {
      scaleX = (bounds.width - dx) / bounds.width
    }
    if (resizeHandle.includes('bottom')) {
      scaleY = (bounds.height + dy) / bounds.height
    }
    if (resizeHandle.includes('top')) {
      scaleY = (bounds.height - dy) / bounds.height
    }
    
    // For corner handles, maintain aspect ratio if Shift is pressed
    if (resizeHandle.includes('corner') && e.shiftKey) {
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
      const newScale = Math.max(0.1, baseScale * scaleX)
      setLayers(layers.map(l => {
        if (l.id === selectedLayerId) {
          return { ...l, scale: newScale }
        }
        return l
      }))
    } else if (layer.type === 'circle') {
      const newRadius = Math.max(10, (resizeStart.width / 2) * scaleX)
      setLayers(layers.map(l => {
        if (l.id === selectedLayerId) {
          return { ...l, radius: newRadius }
        }
        return l
      }))
    } else if (layer.type === 'square') {
      const newSize = Math.max(20, newWidth)
      setLayers(layers.map(l => {
        if (l.id === selectedLayerId) {
          return { ...l, size: newSize }
        }
        return l
      }))
    } else if (layer.type === 'text' || layer.type === 'emoji') {
      const newFontSize = Math.max(12, (resizeStart.width / 2) * scaleX)
      setLayers(layers.map(l => {
        if (l.id === selectedLayerId) {
          return { ...l, fontSize: newFontSize }
        }
        return l
      }))
    } else if (layer.type === 'line') {
      setLayers(layers.map(l => {
        if (l.id === selectedLayerId) {
          return { ...l, x2: l.x1 + newWidth, y2: l.y1 + newHeight }
        }
        return l
      }))
    }
  }
  
  if (isRotating && rotationStart) {
    const angle = Math.atan2(
      coords.y - rotationStart.centerY,
      coords.x - rotationStart.centerX
    ) * 180 / Math.PI
    
    setLayers(layers.map(layer => {
      if (layer.id === selectedLayerId) {
        return { ...layer, rotation: angle }
      }
      return layer
    }))
  }
  
  if (isPanning) {
    const dx = e.clientX - panStart.x
    const dy = e.clientY - panStart.y
    setPanOffset(prev => ({
      x: prev.x + dx / zoomLevel,
      y: prev.y + dy / zoomLevel
    }))
    setPanStart({ x: e.clientX, y: e.clientY })
  }
}

export const handleMouseUp = (setIsDragging, setDraggedLayerId, setIsResizing, setResizeHandle, setIsRotating, setIsPanning, layers, saveToHistory) => {
  setIsDragging(false)
  setDraggedLayerId(null)
  setIsResizing(false)
  setResizeHandle(null)
  setIsRotating(false)
  setIsPanning(false)
  
  // Save to history after any modification
  if (layers.length > 0) {
    saveToHistory(layers)
  }
}

export const handleDoubleClick = (selectedLayerId, setRotationMode) => {
  if (selectedLayerId) {
    setRotationMode(true)
  }
}
