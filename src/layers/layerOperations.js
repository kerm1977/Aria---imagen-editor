/**
 * LAYER OPERATIONS
 * 
 * Operaciones sobre capas
 * - deleteLayer: Eliminar una capa
 * - fitElementToCanvas: Ajustar elemento al canvas
 * - coverElementToCanvas: Cubrir canvas con elemento
 * - resetLayerTransformations: Restablecer transformaciones de capa
 */

export const deleteLayer = (id, setLayers, saveToHistory) => {
  setLayers(prev => {
    const newLayers = prev.filter(layer => layer.id !== id)
    saveToHistory(newLayers)
    return newLayers
  })
}

export const fitElementToCanvas = (layerId, layers, setLayers, currentRatio, saveToHistory) => {
  const layer = layers.find(l => l.id === layerId)
  if (!layer) return
  
  let scale = 1
  let baseWidth, baseHeight
  
  if (layer.type === 'image' && layer.image) {
    baseWidth = layer.image.width
    baseHeight = layer.image.height
    scale = Math.min(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'text' || layer.type === 'emoji') {
    const fontSize = layer.fontSize || (layer.type === 'emoji' ? 80 : 48)
    baseWidth = fontSize * 2
    baseHeight = fontSize
    scale = Math.min(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'circle') {
    baseWidth = layer.radius * 2
    baseHeight = layer.radius * 2
    scale = Math.min(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'square') {
    baseWidth = layer.size
    baseHeight = layer.size
    scale = Math.min(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'gradient') {
    baseWidth = layer.width
    baseHeight = layer.height
    scale = Math.min(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  }
  
  scale *= 0.8 // 80% of canvas size
  
  setLayers(layers.map(l => {
    if (l.id === layerId) {
      if (l.type === 'image') {
        return { ...l, scale: scale }
      } else if (l.type === 'text' || l.type === 'emoji') {
        return { ...l, fontSize: Math.max(12, (l.fontSize || 48) * scale) }
      } else if (l.type === 'circle') {
        return { ...l, radius: Math.max(10, l.radius * scale) }
      } else if (l.type === 'square') {
        return { ...l, size: Math.max(20, l.size * scale) }
      } else if (l.type === 'gradient') {
        return { ...l, width: l.width * scale, height: l.height * scale }
      }
    }
    return l
  }))
  
  saveToHistory(layers)
}

export const coverElementToCanvas = (layerId, layers, setLayers, currentRatio, saveToHistory) => {
  const layer = layers.find(l => l.id === layerId)
  if (!layer) return
  
  let scale = 1
  let baseWidth, baseHeight
  
  if (layer.type === 'image' && layer.image) {
    baseWidth = layer.image.width
    baseHeight = layer.image.height
    scale = Math.max(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'text' || layer.type === 'emoji') {
    const fontSize = layer.fontSize || (layer.type === 'emoji' ? 80 : 48)
    baseWidth = fontSize * 2
    baseHeight = fontSize
    scale = Math.max(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'circle') {
    baseWidth = layer.radius * 2
    baseHeight = layer.radius * 2
    scale = Math.max(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'square') {
    baseWidth = layer.size
    baseHeight = layer.size
    scale = Math.max(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  } else if (layer.type === 'gradient') {
    baseWidth = layer.width
    baseHeight = layer.height
    scale = Math.max(
      currentRatio.width / baseWidth,
      currentRatio.height / baseHeight
    )
  }
  
  setLayers(layers.map(l => {
    if (l.id === layerId) {
      if (l.type === 'image') {
        return { ...l, scale: scale }
      } else if (l.type === 'text' || l.type === 'emoji') {
        return { ...l, fontSize: Math.max(12, (l.fontSize || 48) * scale) }
      } else if (l.type === 'circle') {
        return { ...l, radius: Math.max(10, l.radius * scale) }
      } else if (l.type === 'square') {
        return { ...l, size: Math.max(20, l.size * scale) }
      } else if (l.type === 'gradient') {
        return { ...l, width: l.width * scale, height: l.height * scale }
      }
    }
    return l
  }))
  
  saveToHistory(layers)
}

export const resetLayerTransformations = (layerId, layers, setLayers, saveToHistory) => {
  setLayers(layers.map(l => {
    if (l.id === layerId) {
      return {
        ...l,
        rotation: 0,
        scale: l.type === 'image' ? 1 : l.scale,
        flipX: false,
        flipY: false,
        brightness: 100,
        contrast: 100,
        blur: 0,
        sharpness: 0,
        red: 255,
        green: 255,
        blue: 255
      }
    }
    return l
  }))
  
  saveToHistory(layers)
}
