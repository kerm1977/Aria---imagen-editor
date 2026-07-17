/**
 * UPDATE LAYER OPACITY
 * 
 * Actualiza la opacidad de una capa
 */

export const updateLayerOpacity = (layerId, opacity, layers, setLayers) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      return { ...layer, opacity }
    }
    return layer
  })
  setLayers(newLayers)
}
