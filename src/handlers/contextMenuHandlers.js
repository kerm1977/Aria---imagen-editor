/**
 * CONTEXT MENU HANDLERS
 * 
 * Manejo del menú contextual (clic derecho)
 * - handleContextMenu: Mostrar menú contextual al hacer clic derecho
 */

export const handleContextMenu = (e, canvasRef, layers, setSelectedLayerId, setContextMenu, getCanvasCoordinates, pointToLineDistance, panOffset, zoomLevel) => {
  e.preventDefault()
  const canvas = canvasRef.current
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const coords = getCanvasCoordinates(e, rect, canvas, panOffset, zoomLevel)
  
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
      const dist = pointToLineDistance(coords.x, coords.y, layer.x1, layer.y1, layer.x2, layer.y2)
      isHit = dist < 10
    }
    
    if (isHit) {
      setSelectedLayerId(layer.id)
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
