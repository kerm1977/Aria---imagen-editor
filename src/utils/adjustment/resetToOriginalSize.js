/**
 * RESET TO ORIGINAL SIZE
 * 
 * Restablece la imagen a su tamaño original
 */

export const resetToOriginalSize = (layerId, layers, setLayers) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        return {
          ...layer,
          scale: 1,
          rotation: 0,
          x: layer.x,
          y: layer.y
        }
      }
      return layer
    }
    return layer
  })
  setLayers(newLayers)
}
