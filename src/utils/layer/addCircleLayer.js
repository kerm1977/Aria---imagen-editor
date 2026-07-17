/**
 * ADD CIRCLE LAYER
 * 
 * Agrega una capa de círculo
 */

export const addCircleLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions) => {
  const newLayer = {
    id: Date.now(),
    type: 'circle',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    radius: 50,
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
