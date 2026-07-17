/**
 * SAVE TO HISTORY
 * 
 * Guarda un estado en el historial
 * Esta función guarda un nuevo estado en el historial si es diferente al último estado guardado.
 * Esto evita guardar estados duplicados que no han cambiado.
 * 
 * @param {Array} newLayers - Array de capas a guardar en el historial
 * @param {Function} saveHistory - Función para guardar el historial en la base de datos
 */

import { historyManager } from '../../historyManager.js'

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
