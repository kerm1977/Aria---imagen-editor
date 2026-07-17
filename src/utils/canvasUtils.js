/**
 * CANVAS UTILS
 * 
 * Utilidades para trabajar con el canvas
 * - getCanvasCoordinates: Convertir coordenadas de mouse a coordenadas del canvas
 * - getLayerBounds: Obtener límites de una capa
 * - getResizeHandleAtPosition: Obtener handle de redimensionamiento en posición
 * - pointToLineDistance: Calcular distancia de punto a línea
 */

export const getCanvasCoordinates = (e, rect, canvas, panOffset, zoomLevel) => {
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
      y: layer.y - fontSize / 2,
      width: textWidth,
      height: fontSize
    }
  } else if (layer.type === 'emoji') {
    const fontSize = layer.fontSize || 80
    return {
      x: layer.x - fontSize,
      y: layer.y - fontSize / 2,
      width: fontSize * 2,
      height: fontSize
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
  } else if (layer.type === 'gradient') {
    return {
      x: layer.x - layer.width / 2,
      y: layer.y - layer.height / 2,
      width: layer.width,
      height: layer.height
    }
  } else if (layer.type === 'line') {
    const minX = Math.min(layer.x1, layer.x2)
    const minY = Math.min(layer.y1, layer.y2)
    const maxX = Math.max(layer.x1, layer.x2)
    const maxY = Math.max(layer.y1, layer.y2)
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
  return null
}

export const getResizeHandleAtPosition = (coords, bounds) => {
  const handleSize = 10
  const handles = [
    { name: 'top-left', x: bounds.x, y: bounds.y },
    { name: 'top-center', x: bounds.x + bounds.width / 2, y: bounds.y },
    { name: 'top-right', x: bounds.x + bounds.width, y: bounds.y },
    { name: 'right-center', x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { name: 'bottom-right', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { name: 'bottom-center', x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    { name: 'bottom-left', x: bounds.x, y: bounds.y + bounds.height },
    { name: 'left-center', x: bounds.x, y: bounds.y + bounds.height / 2 }
  ]
  
  for (const handle of handles) {
    if (Math.abs(coords.x - handle.x) < handleSize && Math.abs(coords.y - handle.y) < handleSize) {
      return handle.name
    }
  }
  
  return null
}

export const pointToLineDistance = (x, y, x1, y1, x2, y2) => {
  const A = x - x1
  const B = y - y1
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
  
  const dx = x - xx
  const dy = y - yy
  
  return Math.sqrt(dx * dx + dy * dy)
}
