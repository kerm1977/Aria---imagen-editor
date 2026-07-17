/**
 * RESET LAYER TRANSFORMATIONS
 * 
 * Restablece todas las transformaciones de una capa
 */

export const resetLayerTransformations = (layerId, layers, setLayers) => {
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
}
