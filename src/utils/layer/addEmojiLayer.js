/**
 * ADD EMOJI LAYER
 * 
 * Agrega una capa de emoji
 */

export const addEmojiLayer = (emoji, currentRatio, layers, setLayers, setSelectedLayerId, setEmojiPicker) => {
  const newLayer = {
    id: Date.now(),
    type: 'emoji',
    emoji: emoji,
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    fontSize: 80,
    rotation: 0,
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setEmojiPicker({ visible: false, x: 0, y: 0 })
}
