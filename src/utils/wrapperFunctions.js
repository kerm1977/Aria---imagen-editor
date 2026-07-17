/**
 * WRAPPER FUNCTIONS
 * 
 * Funciones wrapper para adaptar las funciones importadas al estado del componente
 */

import { handleImageUpload } from './image/handleImageUpload.js'
import { exportImage } from './image/exportImage.js'
import { saveProject } from './project/saveProject.js'
import { loadProject } from './project/loadProject.js'
import { addTextLayer } from './layer/addTextLayer.js'
import { addCircleLayer } from './layer/addCircleLayer.js'
import { addSquareLayer } from './layer/addSquareLayer.js'
import { addLineLayer } from './layer/addLineLayer.js'
import { addGradientLayer } from './layer/addGradientLayer.js'
import { addEmojiLayer } from './layer/addEmojiLayer.js'
import { resetLayerTransformations } from './layer/resetLayerTransformations.js'
import { deleteLayer } from './layer/deleteLayer.js'
import { moveLayer } from './layer/moveLayer.js'
import { updateLayerOpacity } from './layer/updateLayerOpacity.js'
import { toggleLayerVisibility } from './layer/toggleLayerVisibility.js'

export const createWrapperFunctions = (currentRatio, layers, setLayers, selectedLayerId, setSelectedLayerId, setShowMoreOptions, setEmojiPicker, setFileMenu, setAspectRatio, saveToHistory, canvasRef, setResetConfirmModal) => {
  const handleImageUploadWrapper = (e) => {
    handleImageUpload(e, currentRatio, layers, setLayers, setSelectedLayerId)
  }

  const addTextLayerWrapper = () => {
    addTextLayer(currentRatio, layers, setLayers, setSelectedLayerId)
  }

  const addCircleLayerWrapper = () => {
    addCircleLayer(currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions)
  }

  const addSquareLayerWrapper = () => {
    addSquareLayer(currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions)
  }

  const addLineLayerWrapper = () => {
    addLineLayer(currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions)
  }

  const addGradientLayerWrapper = () => {
    addGradientLayer(currentRatio, layers, setLayers, setSelectedLayerId, setShowMoreOptions)
  }

  const addEmojiLayerWrapper = (emoji) => {
    addEmojiLayer(emoji, currentRatio, layers, setLayers, setSelectedLayerId, setEmojiPicker)
  }

  const resetLayerTransformationsWrapper = (layerId) => {
    resetLayerTransformations(layerId, layers, setLayers)
    setResetConfirmModal(false)
  }

  const deleteLayerWrapper = (id) => {
    deleteLayer(id, layers, setLayers, selectedLayerId, setSelectedLayerId)
  }

  const moveLayerWrapper = (index, direction) => {
    moveLayer(index, direction, layers, setLayers)
  }

  const updateLayerOpacityWrapper = (id, opacity) => {
    updateLayerOpacity(id, opacity, layers, setLayers)
  }

  const toggleLayerVisibilityWrapper = (id) => {
    toggleLayerVisibility(id, layers, setLayers)
  }

  const exportImageWrapper = (format) => {
    exportImage(canvasRef, format, setFileMenu)
  }

  const saveProjectWrapper = () => {
    saveProject(aspectRatio, layers, setFileMenu)
  }

  const loadProjectWrapper = (file) => {
    loadProject(setLayers, setAspectRatio)
  }

  return {
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
