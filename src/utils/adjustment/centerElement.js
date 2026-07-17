/**
 * CENTER ELEMENT
 * 
 * Centra el elemento en el canvas
 */

export const centerElement = (layerId, layers, setLayers, currentRatio) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
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
