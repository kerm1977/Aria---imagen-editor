/**
 * APP LOGIC
 * 
 * Hook que combina todas las funciones de utilidad y wrapper
 */

import { aspectRatios } from '../utils/app/aspectRatios.js'
import { getCurrentRatio } from '../utils/app/getCurrentRatio.js'
import { createSaveToHistory } from '../utils/app/createSaveToHistory.js'
import { createResetHistory } from '../utils/app/createResetHistory.js'
import { createHandleTitleClick } from '../utils/app/createHandleTitleClick.js'
import { createWrapperFunctions } from '../utils/wrapperFunctions.js'

export const useAppLogic = (titleClickCountRef, titleClickTimerRef, setDebugConsoleVisible, aspectRatio, layers, setLayers, selectedLayerId, setSelectedLayerId, setShowMoreOptions, setEmojiPicker, setFileMenu, setAspectRatio, canvasRef, setResetConfirmModal, saveToHistoryManager, saveHistory) => {
  const handleTitleClick = createHandleTitleClick(titleClickCountRef, titleClickTimerRef, setDebugConsoleVisible)

  const saveToHistoryFunc = createSaveToHistory(saveToHistoryManager, saveHistory)

  const resetHistory = createResetHistory(layers, saveHistory)

  // Calculate currentRatio from aspectRatio
  const currentRatio = aspectRatios.find(r => r.value === aspectRatio) || aspectRatios[0]

  // Create wrapper functions
  const {
    handleImageUploadWrapper,
    addTextLayerWrapper,
    addCircleLayerWrapper,
    addSquareLayerWrapper,
    addLineLayerWrapper,
    addGradientLayerWrapper,
    addEmojiLayerWrapper,
    resetLayerTransformationsWrapper,
    deleteLayerWrapper,
    moveLayerWrapper,
    updateLayerOpacityWrapper,
    toggleLayerVisibilityWrapper,
    exportImageWrapper,
    saveProjectWrapper,
    loadProjectWrapper
  } = createWrapperFunctions(currentRatio, layers, setLayers, selectedLayerId, setSelectedLayerId, setShowMoreOptions, setEmojiPicker, setFileMenu, setAspectRatio, saveToHistoryFunc, canvasRef, setResetConfirmModal)

  return {
    aspectRatios,
    handleTitleClick,
    saveToHistory: saveToHistoryFunc,
    resetHistory,
    handleImageUploadWrapper,
    addTextLayerWrapper,
    addCircleLayerWrapper,
    addSquareLayerWrapper,
    addLineLayerWrapper,
    addGradientLayerWrapper,
    addEmojiLayerWrapper,
    resetLayerTransformationsWrapper,
    deleteLayerWrapper,
    moveLayerWrapper,
    updateLayerOpacityWrapper,
    toggleLayerVisibilityWrapper,
    exportImageWrapper,
    saveProjectWrapper,
    loadProjectWrapper
  }
}
