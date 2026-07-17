/**
 * CREATE SAVE TO HISTORY
 * 
 * Crea una función para guardar en el historial
 */

export const createSaveToHistory = (saveToHistoryManager, saveHistory) => {
  return (layers) => {
    saveToHistoryManager(layers, saveHistory)
  }
}
