/**
 * STRETCH ELEMENT TO CANVAS
 * 
 * Ajusta el elemento al canvas estirando (stretch)
 */

export const stretchElementToCanvas = (layerId, layers, setLayers, currentRatio) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        const scaleX = currentRatio.width / layer.width
        const scaleY = currentRatio.height / layer.height
        return {
          ...layer,
          scale: Math.min(scaleX, scaleY),
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
