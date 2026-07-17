/**
 * RESET ELEMENT TO DEFAULT
 * 
 * Restablece el elemento a su estado predeterminado
 */

export const resetElementToDefault = (layerId, layers, setLayers, currentRatio) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        return {
          ...layer,
          scale: 1,
          rotation: 0,
          x: currentRatio.width / 2,
          y: currentRatio.height / 2
        }
      }
      return {
        ...layer,
        x: currentRatio.width / 2,
        y: currentRatio.height / 2
      }
    }
    return layer
  })
  setLayers(newLayers)
}
