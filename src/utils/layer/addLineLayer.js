/**
 * ADD LINE LAYER
 * 
 * Agrega una capa de línea
 */

export const addLineLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions) => {
  const newLayer = {
    id: Date.now(),
    type: 'line',
    x1: currentRatio.width / 2 - 50,
    y1: currentRatio.height / 2,
    x2: currentRatio.width / 2 + 50,
    y2: currentRatio.height / 2,
    color: '#ffffff',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setShowMoreOptions(false)
}
