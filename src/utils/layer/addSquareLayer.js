/**
 * ADD SQUARE LAYER
 * 
 * Agrega una capa de cuadrado
 */

export const addSquareLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions) => {
  const newLayer = {
    id: Date.now(),
    type: 'square',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    size: 100,
    color: '#ffffff',
    rotation: 0,
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setShowMoreOptions(false)
}
