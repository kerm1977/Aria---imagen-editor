/**
 * FIT ELEMENT TO CANVAS
 * 
 * Ajusta el elemento al canvas sin deformar (fit)
 */

export const fitElementToCanvas = (layerId, layers, setLayers, currentRatio) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        const scale = Math.min(
          currentRatio.width / layer.width,
          currentRatio.height / layer.height
        ) * 0.8
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
