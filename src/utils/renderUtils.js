/**
 * RENDER UTILS
 * 
 * Utilidades para renderizado en el canvas
 * - renderCanvas: Renderizar todas las capas en el canvas
 */

export const renderCanvas = (canvasRef, layers, zoomLevel, panOffset, aspectRatio) => {
  const canvas = canvasRef.current
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const currentRatio = aspectRatio
  
  // Clear canvas
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Save context for zoom and pan
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
      } else if (layer.type === 'emoji') {
        ctx.font = `${layer.fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(layer.emoji, layer.x, layer.y)
      } else if (layer.type === 'circle') {
        ctx.beginPath()
        ctx.arc(layer.x, layer.y, layer.radius, 0, Math.PI * 2)
        ctx.fillStyle = layer.color
        ctx.fill()
      } else if (layer.type === 'square') {
        ctx.fillStyle = layer.color
        ctx.fillRect(layer.x - layer.size / 2, layer.y - layer.size / 2, layer.size, layer.size)
      } else if (layer.type === 'line') {
        ctx.beginPath()
        ctx.moveTo(layer.x1, layer.y1)
        ctx.lineTo(layer.x2, layer.y2)
        ctx.strokeStyle = layer.color
        ctx.lineWidth = layer.strokeWidth
        ctx.stroke()
      } else if (layer.type === 'gradient') {
        const gradient = ctx.createLinearGradient(
          layer.x - layer.width / 2,
          layer.y - layer.height / 2,
          layer.x + layer.width / 2,
          layer.y + layer.height / 2
        )
        gradient.addColorStop(0, layer.color1)
        gradient.addColorStop(1, layer.color2)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      ctx.restore()
    }
  })

  ctx.globalAlpha = 1

  // Restore zoom and pan transformations
  ctx.restore()
}
