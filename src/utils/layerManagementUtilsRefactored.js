/**
 * LAYER MANAGEMENT UTILITIES REFACTORED
 * 
 * Funciones de utilidad para manejo de capas
 */

export const deleteLayer = (id, layers, setLayers, selectedLayerId, setSelectedLayerId, saveToHistory) => {
  const newLayers = layers.filter(layer => layer.id !== id)
  setLayers(newLayers)
  if (selectedLayerId === id) {
    setSelectedLayerId(null)
  }
  saveToHistory(newLayers)
}

export const moveLayer = (index, direction, layers, setLayers, saveToHistory) => {
  const newLayers = [...layers]
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= newLayers.length) return
  
  const temp = newLayers[index]
  newLayers[index] = newLayers[newIndex]
  newLayers[newIndex] = temp
  setLayers(newLayers)
  saveToHistory(newLayers)
}

export const updateLayerOpacity = (id, opacity, layers, setLayers, saveToHistory) => {
  const newLayers = layers.map(layer => 
    layer.id === id ? { ...layer, opacity } : layer
  )
  setLayers(newLayers)
  saveToHistory(newLayers)
}

export const toggleLayerVisibility = (id, layers, setLayers, saveToHistory) => {
  const newLayers = layers.map(layer => 
    layer.id === id ? { ...layer, visible: !layer.visible } : layer
  )
  setLayers(newLayers)
  saveToHistory(newLayers)
}
