/**
 * UNDO/REDO MANAGER
 * 
 * Este archivo contiene toda la lógica para las funciones de Deshacer (Ctrl Z) y Rehacer (Ctrl Shift Z).
 * Está separado del código principal para evitar que otros cambios afecten esta funcionalidad crítica.
 * 
 * FUNCIONALIDADES:
 * - Ctrl Z: Deshacer el último cambio
 * - Ctrl Shift Z: Rehacer el último cambio deshecho
 * 
 * CLASES Y FUNCIONES:
 * - HistoryManager: Clase que gestiona el historial de estados
 * - restoreImagesInLayers: Función que reconstruye objetos Image a partir de data URLs
 * - setupUndoRedoHandlers: Función que configura los event listeners de teclado
 * 
 * DEPENDENCIAS:
 * - historyManager: Instancia de HistoryManager (importada de historyManager.js)
 * 
 * NOTAS IMPORTANTES:
 * - Los objetos Image de HTML5 no se pueden serializar con JSON.stringify/JSON.parse
 * - Por eso guardamos el data URL de la imagen en la propiedad 'imageData'
 * - Al restaurar un estado, reconstruimos los objetos Image a partir de los data URLs
 * - Esto asegura que Ctrl Z y Ctrl Shift Z funcionen correctamente con imágenes
 */

import { historyManager } from './historyManager.js'

/**
 * Reconstruye objetos Image a partir de data URLs
 * 
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

/**
 * Configura los event listeners de teclado para Ctrl Z y Ctrl Shift Z
 * 
 * Esta función adjunta los event listeners de teclado a la ventana para detectar:
 * - Ctrl Z: Deshacer (Undo)
 * - Ctrl Shift Z: Rehacer (Redo)
 * 
 * @param {Function} setLayers - Función para actualizar el estado de las capas
 * @returns {Function} - Función de limpieza para remover los event listeners
 */
export const setupUndoRedoHandlers = (setLayers) => {
  const handleKeyDown = (e) => {
    // Detectar Ctrl Z (Deshacer)
    if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
      console.log('CTRL Z DETECTADO')
      e.preventDefault()
      
      if (e.shiftKey) {
        // Redo (CTRL-SHIFT-Z)
        console.log('Intentando REDO')
        const redoState = historyManager.redo()
        if (redoState) {
          restoreImagesInLayers(redoState).then(restoredLayers => {
            setLayers(restoredLayers)
          })
        }
      } else {
        // Undo (CTRL-Z)
        console.log('Intentando UNDO')
        const undoState = historyManager.undo()
        if (undoState) {
          console.log('Llamando restoreImagesInLayers para undo')
          restoreImagesInLayers(undoState).then(restoredLayers => {
            console.log('Capas restauradas, llamando setLayers')
            setLayers(restoredLayers)
          })
        }
      }
    }
  }

  // Adjuntar event listeners
  window.addEventListener('keydown', handleKeyDown)
  console.log('=== ADJUNTANDO EVENT LISTENERS PARA UNDO/REDO ===')
  console.log('Event listeners adjuntados')

  // Retornar función de limpieza
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    console.log('Removiendo event listeners para undo/redo')
  }
}

/**
 * Guarda un estado en el historial
 * 
 * Esta función guarda un nuevo estado en el historial si es diferente al último estado guardado.
 * Esto evita guardar estados duplicados que no han cambiado.
 * 
 * @param {Array} newLayers - Array de capas a guardar en el historial
 * @param {Function} saveHistory - Función para guardar el historial en la base de datos
 */
export const saveToHistory = (newLayers, saveHistory) => {
  // Verificar si el estado es diferente al último guardado
  const historyData = historyManager.getData()
  const lastState = historyData.history[historyData.currentIndex]
  
  // Comparar con el último estado para evitar duplicados
  if (lastState) {
    const lastStateJSON = JSON.stringify(lastState)
    const newStateJSON = JSON.stringify(newLayers)
    if (lastStateJSON === newStateJSON) {
      console.log('Estado duplicado - no guardando en historial')
      return
    }
  }
  
  console.log('Guardando nuevo estado en historial')
  historyManager.pushState(newLayers)
  // Guardar en base de datos
  const newHistoryData = historyManager.getData()
  saveHistory(newHistoryData.history)
}
