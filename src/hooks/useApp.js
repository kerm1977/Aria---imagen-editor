/**
 * APP MASTER HOOK
 * 
 * Hook maestro que combina todos los hooks de la aplicación
 */

import { useAppState } from './useAppState.js'
import { useMouseHandlers } from './useMouseHandlers.js'
import { useKeyboardHandlers } from './hooks/useKeyboardHandlers.js'
import { useAppEffects } from './hooks/useAppEffects.js'
import { useAppLogic } from './hooks/useAppLogic.js'
import { useAppProps } from './hooks/useAppProps.js'

export const useApp = () => {
  // Use app state hook
  const appState = useAppState()

  // Use mouse handlers hook
  const mouseHandlers = useMouseHandlers(
    appState.canvasRef,
    appState.layers,
    appState.setLayers,
    appState.selectedLayerId,
    appState.setSelectedLayerId,
    appState.setContextMenu,
    appState.setTransformPanel,
    appState.setAutoShowTransform,
    null, // currentRatio will be set later
    appState.setZoomLevel,
    appState.setPanOffset,
    null // saveToHistory will be set later
  )

  // Use keyboard handlers hook
  useKeyboardHandlers(
    appState.selectedLayerId,
    appState.layers,
    appState.setLayers,
    appState.fileInputRef,
    mouseHandlers.setIsShiftPressed,
    mouseHandlers.setIsCtrlPressed,
    appState.setIsRPressed,
    appState.setIsSPressed,
    appState.setIsGPressed,
    mouseHandlers.setIsSpacePressed
  )

  return {
    ...appState,
    ...mouseHandlers
  }
}
