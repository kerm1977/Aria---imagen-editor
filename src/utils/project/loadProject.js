/**
 * LOAD PROJECT
 * 
 * Carga un proyecto guardado
 */

import { getLayers, getHistory, getSetting } from '../../db.js'
import { restoreImagesInLayers } from '../undoRedo/restoreImagesInLayers.js'

export const loadProject = async (setLayers, setAspectRatio) => {
  const savedLayers = await getLayers()
  const savedHistory = await getHistory()
  const savedAspectRatio = await getSetting('aspectRatio')
  
  if (savedLayers && savedLayers.length > 0) {
    const restoredLayers = await restoreImagesInLayers(savedLayers)
    setLayers(restoredLayers)
  }
  
  if (savedAspectRatio) {
    setAspectRatio(savedAspectRatio)
  }
  
  console.log('Proyecto cargado')
}
