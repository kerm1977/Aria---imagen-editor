/**
 * ADD TEXT LAYER
 * 
 * Agrega una capa de texto
 */

export const addTextLayer = (currentRatio, layers, setLayers, setSelectedLayerId) => {
  const newLayer = {
    id: Date.now(),
    type: 'text',
    text: 'Texto',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    fontSize: 48,
    color: '#ffffff',
    rotation: 0,
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
}
