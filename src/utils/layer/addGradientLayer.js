/**
 * ADD GRADIENT LAYER
 * 
 * Agrega una capa de gradiente
 */

export const addGradientLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions) => {
  const newLayer = {
    id: Date.now(),
    type: 'gradient',
    direction: 'horizontal',
    color1: '#ffffff',
    color2: '#000000',
    rotation: 0,
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setShowMoreOptions(false)
}
