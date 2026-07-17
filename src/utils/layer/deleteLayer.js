/**
 * DELETE LAYER
 * 
 * Elimina una capa
 */

export const deleteLayer = (layerId, layers, setLayers, selectedLayerId, setSelectedLayerId) => {
  const newLayers = layers.filter(l => l.id !== layerId)
  setLayers(newLayers)
  if (selectedLayerId === layerId) {
    setSelectedLayerId(null)
  }
}
