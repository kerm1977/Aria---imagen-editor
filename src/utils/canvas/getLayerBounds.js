/**
 * GET LAYER BOUNDS
 * 
 * Obtiene los límites de una capa
 */

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
