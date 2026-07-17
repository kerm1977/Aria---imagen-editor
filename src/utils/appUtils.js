/**
 * APP UTILITIES
 * 
 * Funciones de utilidad para la aplicación
 */

import { historyManager } from '../historyManager.js'

export const aspectRatios = [
  { label: '1:1', value: '1:1', width: 800, height: 800 },
  { label: '16:9', value: '16:9', width: 960, height: 540 },
  { label: '9:16', value: '9:16', width: 540, height: 960 },
  { label: '4:3', value: '4:3', width: 800, height: 600 },
  { label: '3:4', value: '3:4', width: 600, height: 800 },
  { label: '2:3', value: '2:3', width: 533, height: 800 },
]

export const getCurrentRatio = (aspectRatio) => {
  return aspectRatios.find(r => r.value === aspectRatio)
}

export const createSaveToHistory = (saveToHistoryManager, saveHistory) => {
  return (newLayers) => {
    saveToHistoryManager(newLayers, saveHistory)
  }
}

export const createResetHistory = (layers, saveHistory) => {
  return () => {
    console.log('=== REINICIANDO HISTORIAL ===')
    historyManager.clear()
    historyManager.pushState(layers)
    const historyData = historyManager.getData()
    saveHistory(historyData.history)
    console.log('Historial reiniciado con estado actual')
  }
}

export const createHandleTitleClick = (titleClickCountRef, titleClickTimerRef, setDebugConsoleVisible) => {
  return () => {
    console.log('=== TITLE CLICK === count:', titleClickCountRef.current + 1)
    titleClickCountRef.current += 1
    
    if (titleClickCountRef.current === 1) {
      titleClickTimerRef.current = setTimeout(() => {
        console.log('Triple clic timeout - reset count')
        titleClickCountRef.current = 0
      }, 500)
    } else if (titleClickCountRef.current === 3) {
      console.log('TRIPLE CLIC DETECTADO - toggle console')
      clearTimeout(titleClickTimerRef.current)
      titleClickCountRef.current = 0
      setDebugConsoleVisible(!debugConsoleVisible)
    }
  }
}
