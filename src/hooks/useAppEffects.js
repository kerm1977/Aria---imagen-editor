/**
 * APP EFFECTS
 * 
 * Hooks useEffect para la aplicación
 */

import { useEffect } from 'react'
import { initDatabase, getLayers, getSetting, saveLayers, saveSetting, getHistory, saveHistory } from '../db.js'
import { historyManager } from '../historyManager.js'
import { restoreImagesInLayers } from '../utils/undoRedo/restoreImagesInLayers.js'
import { renderCanvas } from '../utils/canvasRendererRefactored.js'

export const useAppEffects = (setAspectRatio, setLayers, canvasRef, layers, aspectRatio, currentRatio, zoomLevel, panOffset, saveToHistory, selectedLayerId) => {
  // Initialize database and load saved data
  useEffect(() => {
    const initApp = async () => {
      await initDatabase()
      
      // Load saved aspect ratio
      const savedAspectRatio = await getSetting('aspectRatio')
      if (savedAspectRatio) {
        setAspectRatio(savedAspectRatio)
      }
      
      // Load saved layers
      const savedLayers = await getLayers()
      if (savedLayers.length > 0) {
        const restoredLayers = await restoreImagesInLayers(savedLayers)
        setLayers(restoredLayers)
      }
      
      // Load saved history
      const savedHistory = await getHistory()
      // LIMPIEZA TOTAL: Siempre limpiar historial al inicio para evitar estados corruptos
      console.log('Limpiando historial completamente al inicio')
      historyManager.clear()
      const currentLayers = savedLayers.length > 0 ? savedLayers : []
      historyManager.pushState(currentLayers)
      // Limpiar también la base de datos para evitar estados corruptos
      saveHistory([])
    }
    
    initApp()
  }, [setAspectRatio, setLayers])

  // Auto-save layers to database when they change (debounced)
  useEffect(() => {
    if (layers.length === 0) return
    
    const timeoutId = setTimeout(() => {
      saveLayers(layers)
    }, 500) // Save after 500ms of no changes
    
    return () => clearTimeout(timeoutId)
  }, [layers])

  // Auto-save aspect ratio to database when it changes
  useEffect(() => {
    saveSetting('aspectRatio', aspectRatio)
  }, [aspectRatio])

  useEffect(() => {
    renderCanvas(canvasRef, layers, currentRatio, zoomLevel, panOffset, selectedLayerId)
  }, [layers, aspectRatio, zoomLevel, panOffset, canvasRef, currentRatio, selectedLayerId])
}
