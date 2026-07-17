/**
 * LAYER UTILITIES REFACTORED
 * 
 * Funciones de utilidad para manejo de capas
 */

export const fitElementToCanvas = (layerId, layers, setLayers, currentRatio, saveToHistory) => {
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
  saveToHistory(newLayers)
}

export const stretchElementToCanvas = (layerId, layers, setLayers, currentRatio, saveToHistory) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        const scaleX = currentRatio.width / layer.width
        const scaleY = currentRatio.height / layer.height
        return {
          ...layer,
          scale: Math.min(scaleX, scaleY),
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
  saveToHistory(newLayers)
}

export const coverElementToCanvas = (layerId, layers, setLayers, currentRatio, saveToHistory) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        const scale = Math.max(
          currentRatio.width / layer.width,
          currentRatio.height / layer.height
        )
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
  saveToHistory(newLayers)
}

export const centerElement = (layerId, layers, setLayers, currentRatio, saveToHistory) => {
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
  saveToHistory(newLayers)
}

export const resetElementToDefault = (layerId, layers, setLayers, saveToHistory) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        return {
          ...layer,
          scale: 1,
          rotation: 0,
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
  saveToHistory(newLayers)
}

export const resetLayerTransformations = (layerId, layers, setLayers, saveToHistory) => {
  const newLayers = layers.map(l => {
    if (l.id === layerId) {
      return {
        ...l,
        scale: 1,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        brightness: 100,
        contrast: 100,
        red: 255,
        green: 255,
        blue: 255,
        sharpness: 0,
        opacity: 1,
        blur: 0,
        flipX: false,
        flipY: false
      }
    }
    return l
  })
  setLayers(newLayers)
  saveToHistory(newLayers)
}
