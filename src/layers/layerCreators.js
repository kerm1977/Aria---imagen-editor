/**
 * LAYER CREATORS
 * 
 * Funciones para crear diferentes tipos de capas
 * - addTextLayer: Crear capa de texto
 * - addCircleLayer: Crear capa de círculo
 * - addSquareLayer: Crear capa de cuadrado
 * - addLineLayer: Crear capa de línea
 * - addGradientLayer: Crear capa de gradiente
 * - addEmojiLayer: Crear capa de emoji
 */

export const addTextLayer = (setLayers, currentRatio) => {
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
  setLayers(prev => [...prev, newLayer])
}

export const addCircleLayer = (setLayers, currentRatio) => {
  const newLayer = {
    id: Date.now(),
    type: 'circle',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    radius: 50,
    color: '#ff0000',
    rotation: 0,
    opacity: 1,
    visible: true
  }
  setLayers(prev => [...prev, newLayer])
}

export const addSquareLayer = (setLayers, currentRatio) => {
  const newLayer = {
    id: Date.now(),
    type: 'square',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    size: 100,
    color: '#00ff00',
    rotation: 0,
    opacity: 1,
    visible: true
  }
  setLayers(prev => [...prev, newLayer])
}

export const addLineLayer = (setLayers, currentRatio) => {
  const newLayer = {
    id: Date.now(),
    type: 'line',
    x1: currentRatio.width / 2 - 50,
    y1: currentRatio.height / 2,
    x2: currentRatio.width / 2 + 50,
    y2: currentRatio.height / 2,
    color: '#0000ff',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    visible: true
  }
  setLayers(prev => [...prev, newLayer])
}

export const addGradientLayer = (setLayers, currentRatio) => {
  const newLayer = {
    id: Date.now(),
    type: 'gradient',
    x: currentRatio.width / 2,
    y: currentRatio.height / 2,
    width: 200,
    height: 200,
    color1: '#ff0000',
    color2: '#0000ff',
    rotation: 0,
    opacity: 1,
    visible: true
  }
  setLayers(prev => [...prev, newLayer])
}

export const addEmojiLayer = (setLayers, emoji, currentRatio) => {
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
  setLayers(prev => [...prev, newLayer])
}
