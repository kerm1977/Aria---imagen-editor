/**
 * SAVE PROJECT
 * 
 * Guarda el proyecto actual
 */

import { saveLayers, saveHistory, saveSetting } from '../../db.js'

export const saveProject = async (layers, currentRatio, aspectRatio) => {
  await saveLayers(layers)
  await saveHistory(layers)
  await saveSetting('aspectRatio', aspectRatio)
  console.log('Proyecto guardado')
}
