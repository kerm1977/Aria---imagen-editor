/**
 * CANVAS UTILITIES REFACTORED
 * 
 * Funciones de utilidad para el canvas
 */

export const getCanvasCoordinates = (e, canvasRef, panOffset, zoomLevel) => {
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

export const getLayerBounds = (layer, canvasRef) => {
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
  } else if (layer.type === 'line') {
    return {
      x: Math.min(layer.x1, layer.x2),
      y: Math.min(layer.y1, layer.y2),
      width: Math.abs(layer.x2 - layer.x1),
      height: Math.abs(layer.y2 - layer.y1)
    }
  } else if (layer.type === 'gradient') {
    return {
      x: 0,
      y: 0,
      width: canvasRef.current.width,
      height: canvasRef.current.height
    }
  }
  return null
}

export const getResizeHandleAtPosition = (coords, bounds) => {
  const handleSize = 10
  const handles = {
    'top-left': { x: bounds.x, y: bounds.y },
    'top-right': { x: bounds.x + bounds.width, y: bounds.y },
    'bottom-left': { x: bounds.x, y: bounds.y + bounds.height },
    'bottom-right': { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    'top-center': { x: bounds.x + bounds.width / 2, y: bounds.y },
    'bottom-center': { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    'left-center': { x: bounds.x, y: bounds.y + bounds.height / 2 },
    'right-center': { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }
  }
  
  for (const [handle, pos] of Object.entries(handles)) {
    if (Math.abs(coords.x - pos.x) < handleSize && Math.abs(coords.y - pos.y) < handleSize) {
      return handle
    }
  }
  return null
}

export const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
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
