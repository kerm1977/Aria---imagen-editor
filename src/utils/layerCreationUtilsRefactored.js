/**
 * LAYER CREATION UTILITIES REFACTORED
 * 
 * Funciones de utilidad para creación de capas
 */

export const addTextLayer = (currentRatio, layers, setLayers, setSelectedLayerId, saveToHistory) => {
  const newLayer = {
    id: Date.now(),
    type: 'text',
    name: 'Texto',
    text: 'Nuevo texto',
    fontSize: 48,
    color: '#ffffff',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    width: 200,
    height: 60,
    rotation: 0,
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  saveToHistory(newLayers)
}

export const addCircleLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions, saveToHistory) => {
  const newLayer = {
    id: Date.now(),
    type: 'circle',
    name: 'Círculo',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    radius: 100,
    width: 200,
    height: 200,
    rotation: 0,
    color: '#3b82f6',
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setShowMoreOptions(false)
  saveToHistory(newLayers)
}

export const addSquareLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions, saveToHistory) => {
  const newLayer = {
    id: Date.now(),
    type: 'square',
    name: 'Cuadrado',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    size: 100,
    width: 100,
    height: 100,
    rotation: 0,
    color: '#10b981',
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setShowMoreOptions(false)
  saveToHistory(newLayers)
}

export const addLineLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions, saveToHistory) => {
  const newLayer = {
    id: Date.now(),
    type: 'line',
    name: 'Línea',
    x1: currentRatio.width / 2 - 100,
    y1: currentRatio.height / 2,
    x2: currentRatio.width / 2 + 100,
    y2: currentRatio.height / 2,
    strokeWidth: 2,
    color: '#f59e0b',
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setShowMoreOptions(false)
  saveToHistory(newLayers)
}

export const addGradientLayer = (currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions, saveToHistory) => {
  const newLayer = {
    id: Date.now(),
    type: 'gradient',
    name: 'Gradiente',
    color1: '#667eea',
    color2: '#764ba2',
    direction: 'horizontal',
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setShowMoreOptions(false)
  saveToHistory(newLayers)
}

export const addEmojiLayer = (emoji, currentRatio, layers, setLayers, setSelectedLayerId, setEmojiPicker, saveToHistory) => {
  const newLayer = {
    id: Date.now(),
    type: 'emoji',
    name: 'Emoji',
    emoji: emoji,
    fontSize: 80,
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    width: 160,
    height: 160,
    rotation: 0,
    opacity: 1,
    visible: true
  }
  const newLayers = [...layers, newLayer]
  setLayers(newLayers)
  setSelectedLayerId(newLayer.id)
  setEmojiPicker({ visible: false, x: 0, y: 0 })
  saveToHistory(newLayers)
}
