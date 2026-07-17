/**
 * MOVE LAYER
 * 
 * Mueve una capa hacia arriba o abajo
 */

export const moveLayer = (layerId, direction, layers, setLayers) => {
  const index = layers.findIndex(l => l.id === layerId)
  if (index === -1) return
  
  const newLayers = [...layers]
  const [removed] = newLayers.splice(index, 1)
  
  if (direction === 'up' && index < newLayers.length) {
    newLayers.splice(index + 1, 0, removed)
  } else if (direction === 'down' && index > 0) {
    newLayers.splice(index - 1, 0, removed)
  } else {
    newLayers.splice(index, 0, removed)
  }
  
  setLayers(newLayers)
}
