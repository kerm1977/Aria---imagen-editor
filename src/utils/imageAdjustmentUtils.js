/**
 * IMAGE ADJUSTMENT UTILITIES
 * 
 * Funciones de ajuste de imagen (Fit, Stretch, Cover, Center, Reset, Info)
 * Archivo independiente para evitar modificaciones en otras funcionalidades
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

export const resetElementToDefault = (layerId, layers, setLayers, currentRatio, saveToHistory) => {
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

export const showLayerInfo = (layerId, layers) => {
  const layer = layers.find(l => l.id === layerId)
  if (layer && layer.type === 'image') {
    const info = `
Información de la imagen:
Nombre: ${layer.name}
Tipo: ${layer.type}
Tamaño original: ${layer.width ? Math.round(layer.width) : 'N/A'} x ${layer.height ? Math.round(layer.height) : 'N/A'} px
Escala: ${layer.scale ? (layer.scale * 100).toFixed(1) : 'N/A'}%
Rotación: ${layer.rotation ? layer.rotation : 0}°
Opacidad: ${layer.opacity ? (layer.opacity * 100).toFixed(0) : 100}%
Posición: X: ${Math.round(layer.x)}, Y: ${Math.round(layer.y)}
    `
    alert(info)
  }
}

export const resetToOriginalSize = (layerId, layers, setLayers, saveToHistory) => {
  const newLayers = layers.map(layer => {
    if (layer.id === layerId) {
      if (layer.type === 'image') {
        return {
          ...layer,
          scale: 1,
          rotation: 0,
          x: layer.x,
          y: layer.y
        }
      }
      return layer
    }
    return layer
  })
  setLayers(newLayers)
  saveToHistory(newLayers)
}
