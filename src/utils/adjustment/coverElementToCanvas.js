/**
 * COVER ELEMENT TO CANVAS
 * 
 * Rellena todo el canvas (cover)
 */

export const coverElementToCanvas = (layerId, layers, setLayers, currentRatio) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        const scale = Math.max(
          currentRatio.width / layer.width,
          currentRatio.height / layer.height
        )
        return {
          ...layer,
          scale: scale,
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
