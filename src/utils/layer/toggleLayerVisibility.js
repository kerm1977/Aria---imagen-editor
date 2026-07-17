/**
 * TOGGLE LAYER VISIBILITY
 * 
 * Alterna la visibilidad de una capa
 */

export const toggleLayerVisibility = (layerId, layers, setLayers) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      return { ...layer, visible: !layer.visible }
    }
    return layer
  })
  setLayers(newLayers)
}
