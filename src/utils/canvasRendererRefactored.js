/**
 * CANVAS RENDERER REFACTORED
 * 
 * Funciones de renderizado del canvas
 */

import { getLayerBounds } from './canvas/getLayerBounds.js'

export const renderCanvas = (canvasRef, layers, currentRatio, zoomLevel, panOffset, selectedLayerId) => {
  const canvas = canvasRef.current
  if (!canvas) {
    console.log('=== renderCanvas: Canvas no disponible ===')
    return
  }

  console.log('=== renderCanvas ===')
  console.log('Canvas disponible:', canvas)
  console.log('Capas:', layers)
  console.log('currentRatio:', currentRatio)
  console.log('zoomLevel:', zoomLevel)
  console.log('panOffset:', panOffset)
  console.log('selectedLayerId:', selectedLayerId)

  const ctx = canvas.getContext('2d')
  
  // Set canvas dimensions
  canvas.width = currentRatio.width
  canvas.height = currentRatio.height

  // Clear canvas with background color
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  console.log('Canvas dimensions:', canvas.width, 'x', canvas.height, 'zoomLevel:', zoomLevel)

  // Apply zoom and pan transformations
  ctx.save()
  ctx.translate(panOffset.x, panOffset.y)
  ctx.scale(zoomLevel, zoomLevel)

  // Render layers in order
  layers.forEach(layer => {
    if (!layer.visible) return

    ctx.save()

    // Apply transformations
    if (layer.rotation) {
      ctx.translate(layer.x, layer.y)
      ctx.rotate((layer.rotation * Math.PI) / 180)
      ctx.translate(-layer.x, -layer.y)
    }

    if (layer.flipX || layer.flipY) {
      ctx.translate(layer.x, layer.y)
      ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1)
      ctx.translate(-layer.x, -layer.y)
    }

    // Apply filters
    if (layer.brightness || layer.contrast || layer.blur || layer.opacity) {
      ctx.filter = `brightness(${layer.brightness || 100}%) contrast(${layer.contrast || 100}%) blur(${layer.blur || 0}px) opacity(${layer.opacity || 1})`
    }

    // Apply RGBA color adjustments
    if (layer.red !== undefined || layer.green !== undefined || layer.blue !== undefined) {
      ctx.globalCompositeOperation = 'source-over'
    }

    // Render based on layer type
    if (layer.type === 'image' && layer.image) {
      const scale = layer.scale || 1
      const width = layer.width * scale
      const height = layer.height * scale
      
      console.log('=== DIBUJANDO IMAGEN ===')
      console.log('Layer:', layer)
      console.log('Image type:', layer.image.constructor.name)
      console.log('Image valid:', layer.image instanceof HTMLImageElement || layer.image instanceof HTMLCanvasElement || layer.image instanceof ImageBitmap)
      console.log('Coordinates:', layer.x, layer.y)
      console.log('Dimensions:', width, height)
      
      // Use layer.image (HTMLImageElement) instead of layer.imageData (Data URL string)
      if (layer.image instanceof HTMLImageElement || layer.image instanceof HTMLCanvasElement || layer.image instanceof ImageBitmap) {
        ctx.drawImage(layer.image, layer.x - width / 2, layer.y - height / 2, width, height)
        console.log('Imagen dibujada exitosamente')
      } else {
        console.log('ERROR: Image no es un elemento válido')
      }
    } else if (layer.type === 'text') {
      const fontSize = layer.fontSize || 48
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(layer.text, layer.x, layer.y)
    } else if (layer.type === 'circle') {
      ctx.beginPath()
      ctx.arc(layer.x, layer.y, layer.radius || 50, 0, Math.PI * 2)
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.fill()
    } else if (layer.type === 'square') {
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.fillRect(layer.x - layer.size / 2, layer.y - layer.size / 2, layer.size, layer.size)
    } else if (layer.type === 'line') {
      ctx.beginPath()
      ctx.moveTo(layer.x1, layer.y1)
      ctx.lineTo(layer.x2, layer.y2)
      ctx.strokeStyle = layer.color || '#ffffff'
      ctx.lineWidth = layer.strokeWidth || 2
      ctx.stroke()
    } else if (layer.type === 'gradient') {
      const gradient = ctx.createLinearGradient(
        layer.direction === 'horizontal' ? 0 : 0,
        layer.direction === 'horizontal' ? 0 : 0,
        layer.direction === 'horizontal' ? canvas.width : 0,
        layer.direction === 'horizontal' ? 0 : canvas.height
      )
      gradient.addColorStop(0, layer.color1 || '#ffffff')
      gradient.addColorStop(1, layer.color2 || '#000000')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (layer.type === 'emoji') {
      const fontSize = layer.fontSize || 80
      ctx.font = `${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(layer.emoji, layer.x, layer.y)
    }

    ctx.restore()
  })

  ctx.restore()

  // Draw resize handles for selected layer
  if (selectedLayerId) {
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    if (selectedLayer && selectedLayer.type !== 'gradient') {
      const bounds = getLayerBounds(selectedLayer, canvasRef)
      if (bounds) {
        const handleSize = 8
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2

        const handles = [
          { x: bounds.x, y: bounds.y, cursor: 'nw-resize' }, // top-left
          { x: bounds.x + bounds.width, y: bounds.y, cursor: 'ne-resize' }, // top-right
          { x: bounds.x, y: bounds.y + bounds.height, cursor: 'sw-resize' }, // bottom-left
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: 'se-resize' }, // bottom-right
          { x: bounds.x + bounds.width / 2, y: bounds.y, cursor: 'n-resize' }, // top-center
          { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, cursor: 's-resize' }, // bottom-center
          { x: bounds.x, y: bounds.y + bounds.height / 2, cursor: 'w-resize' }, // left-center
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, cursor: 'e-resize' } // right-center
        ]

        handles.forEach(handle => {
          ctx.beginPath()
          ctx.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
          ctx.fill()
          ctx.stroke()
        })

        // Draw selection border
        ctx.strokeStyle = '#00a8ff'
        ctx.lineWidth = 2
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
      }
    }
  }
}
