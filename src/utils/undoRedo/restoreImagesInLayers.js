/**
 * RESTORE IMAGES IN LAYERS
 * 
 * Reconstruye objetos Image a partir de data URLs
 * Esta función es necesaria porque los objetos Image de HTML5 no se pueden serializar
 * con JSON.stringify/JSON.parse. Cuando guardamos el historial, guardamos el data URL
 * de la imagen en la propiedad 'imageData'. Al restaurar un estado, reconstruimos los
 * objetos Image a partir de estos data URLs.
 * 
 * @param {Array} layers - Array de capas a restaurar
 * @returns {Promise<Array>} - Promise que resuelve con las capas restauradas
 */

export const restoreImagesInLayers = async (layers) => {
  console.log('=== restoreImagesInLayers ===')
  console.log('Capas a restaurar:', layers.length)
  console.log('Capas:', layers.map(l => ({ id: l.id, type: l.type, hasImageData: !!l.imageData, hasImage: !!l.image })))
  
  const restoredLayers = await Promise.all(layers.map(async (layer) => {
    if (layer.type === 'image') {
      if (layer.imageData) {
        console.log('Restaurando imagen para capa:', layer.id, 'desde imageData')
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('Imagen cargada para capa:', layer.id, 'image.complete:', img.complete)
            resolve()
          }
          img.onerror = () => {
            console.error('Error cargando imagen para capa:', layer.id)
            resolve() // Continue even if image fails to load
          }
          img.src = layer.imageData
        })
        console.log('Imagen restaurada para capa:', layer.id, 'image.complete:', img.complete)
        return { ...layer, image: img }
      } else if (layer.image && layer.image.complete) {
        console.log('Imagen ya válida para capa:', layer.id)
        return layer
      } else {
        console.log('ADVERTENCIA: Capa de imagen sin imageData ni image válido:', layer.id)
        return layer
      }
    }
    return layer
  }))
  
  console.log('Capas restauradas:', restoredLayers.map(l => ({ id: l.id, type: l.type, hasImage: !!l.image, imageComplete: l.image ? l.image.complete : false })))
  console.log('============================')
  return restoredLayers
}
