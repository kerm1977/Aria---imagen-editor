/**
 * CREATE RESET HISTORY
 * 
 * Crea una función para resetear el historial
 */

import { historyManager } from '../../historyManager.js'

export const createResetHistory = (layers, saveHistory) => {
  return () => {
    historyManager.clear()
    saveHistory(layers)
  }
}
