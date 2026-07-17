/**
 * SETUP UNDO REDO HANDLERS
 * 
 * Configura los event listeners de teclado para Ctrl Z y Ctrl Shift Z
 * Esta función adjunta los event listeners de teclado a la ventana para detectar:
 * - Ctrl Z: Deshacer (Undo)
 * - Ctrl Shift Z: Rehacer (Redo)
 * 
 * @param {Function} setLayers - Función para actualizar el estado de las capas
 * @returns {Function} - Función de limpieza para remover los event listeners
 */

import { historyManager } from '../../historyManager.js'
import { restoreImagesInLayers } from './restoreImagesInLayers.js'

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
