import React, { useState, useRef, useEffect } from 'react'
import { Layers, Download, Upload, Trash2, Plus, ChevronUp, ChevronDown, Image as ImageIcon, Sun, Type, Circle, Square, Minus, Palette, Sparkles, MoreVertical, Maximize2, AlignCenter, Layout, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { initDatabase, saveLayers, getLayers, saveHistory, getHistory, saveSetting, getSetting, saveProject, getProject, getAllProjects, deleteProject } from './db.js'
import { historyManager } from './historyManager.js'
import DebugConsole from './DebugConsole.jsx'
import { setupUndoRedoHandlers } from './utils/undoRedo/setupUndoRedoHandlers.js'
import { saveToHistory as saveToHistoryManager } from './utils/undoRedo/saveToHistory.js'
import { restoreImagesInLayers } from './utils/undoRedo/restoreImagesInLayers.js'
import ResetConfirmationModal from './components/ResetConfirmationModal.jsx'
import MainContent from './components/MainContent.jsx'
import LeftSidebar from './components/LeftSidebar.jsx'
import EmojiPicker from './components/EmojiPicker.jsx'
import { renderCanvas } from './utils/canvasRendererRefactored.js'
import { getCanvasCoordinates, getLayerBounds, getResizeHandleAtPosition, pointToLineDistance } from './utils/canvasUtilsRefactored.js'
import { fitElementToCanvas, stretchElementToCanvas, coverElementToCanvas, centerElement, resetElementToDefault, resetLayerTransformations } from './utils/layerUtilsRefactored.js'
import { useAppState } from './hooks/useAppState.js'
import { useMouseHandlers } from './hooks/useMouseHandlers.js'
import { useKeyboardHandlers } from './hooks/useKeyboardHandlers.js'
import { useAppEffects } from './hooks/useAppEffects.js'
import { useAppLogic } from './hooks/useAppLogic.js'
import { useAppProps } from './hooks/useAppProps.js'

function App() {
  const { layers, setLayers, selectedLayerId, setSelectedLayerId, aspectRatio, setAspectRatio, canvasRef, fileInputRef, showMoreOptions, setShowMoreOptions, zoomLevel, setZoomLevel, panOffset, setPanOffset, isRPressed, setIsRPressed, isSPressed, setIsSPressed, isGPressed, setIsGPressed, contextMenu, setContextMenu, fileMenu, setFileMenu, emojiPicker, setEmojiPicker, aspectRatioMenu, setAspectRatioMenu, transformPanel, setTransformPanel, layersCollapsed, setLayersCollapsed, transformCollapsed, setTransformCollapsed, adjustmentPanel, setAdjustmentPanel, adjustmentCollapsed, setAdjustmentCollapsed, resetConfirmModal, setResetConfirmModal, autoShowTransform, setAutoShowTransform, autoShowAdjustment, setAutoShowAdjustment, projectInputRef, debugConsoleVisible, setDebugConsoleVisible, titleClickCountRef, titleClickTimerRef } = useAppState()
  const { aspectRatios, handleTitleClick, saveToHistory, resetHistory, handleImageUploadWrapper, addTextLayerWrapper, addCircleLayerWrapper, addSquareLayerWrapper, addLineLayerWrapper, addGradientLayerWrapper, addEmojiLayerWrapper, resetLayerTransformationsWrapper, deleteLayerWrapper, moveLayerWrapper, updateLayerOpacityWrapper, toggleLayerVisibilityWrapper, exportImageWrapper, saveProjectWrapper, loadProjectWrapper } = useAppLogic(titleClickCountRef, titleClickTimerRef, setDebugConsoleVisible, aspectRatio, layers, setLayers, selectedLayerId, setSelectedLayerId, setShowMoreOptions, setEmojiPicker, setFileMenu, setAspectRatio, canvasRef, setResetConfirmModal, saveToHistoryManager, saveHistory)
  const currentRatio = aspectRatios.find(r => r.value === aspectRatio)
  const { isDragging, isPanning, isResizing, isRotating, rotationMode, hoveredHandle, isShiftPressed, isCtrlPressed, isSpacePressed, setIsShiftPressed, setIsCtrlPressed, setIsSpacePressed, setRotationMode, handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu, handleDoubleClick } = useMouseHandlers(canvasRef, layers, setLayers, selectedLayerId, setSelectedLayerId, setContextMenu, setTransformPanel, setAutoShowTransform, currentRatio, setZoomLevel, setPanOffset, saveToHistory, zoomLevel, panOffset)
  useKeyboardHandlers(selectedLayerId, layers, setLayers, fileInputRef, setIsShiftPressed, setIsCtrlPressed, setIsRPressed, setIsSPressed, setIsGPressed, setIsSpacePressed)
  useAppEffects(setAspectRatio, setLayers, canvasRef, layers, aspectRatio, currentRatio, zoomLevel, panOffset, saveToHistory, selectedLayerId)
  
  // Setup undo/redo handlers for Ctrl Z and Ctrl Shift Z
  useEffect(() => {
    const cleanup = setupUndoRedoHandlers(setLayers)
    return cleanup
  }, [setLayers])
  const selectedLayer = layers.find(l => l.id === selectedLayerId)
  const { leftSidebarProps, mainContentProps } = useAppProps({ fileInputRef, handleImageUploadWrapper, addTextLayerWrapper, addCircleLayerWrapper, addSquareLayerWrapper, addLineLayerWrapper, addGradientLayerWrapper, setShowMoreOptions, setAspectRatioMenu, setFileMenu, setEmojiPicker, zoomLevel, setZoomLevel, setPanOffset, showMoreOptions, aspectRatio, aspectRatios, aspectRatioMenu, setAspectRatio, handleTitleClick, canvasRef, currentRatio, panOffset, handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu, handleDoubleClick, selectedLayer, selectedLayerId, layers, setLayers, transformPanel, setTransformPanel, layersCollapsed, setLayersCollapsed, transformCollapsed, setTransformCollapsed, adjustmentPanel, setAdjustmentPanel, adjustmentCollapsed, setAdjustmentCollapsed, resetConfirmModal, setResetConfirmModal, autoShowTransform, setAutoShowTransform, autoShowAdjustment, setAutoShowAdjustment, contextMenu, setContextMenu, resetLayerTransformations, deleteLayerWrapper, moveLayerWrapper, toggleLayerVisibilityWrapper, updateLayerOpacityWrapper, setSelectedLayerId })
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        <LeftSidebar {...leftSidebarProps} />
        <MainContent {...mainContentProps} />
      </div>
      <ResetConfirmationModal visible={resetConfirmModal} onConfirm={() => resetLayerTransformations(transformPanel.layerId)} onCancel={() => setResetConfirmModal(false)} />
      {debugConsoleVisible && <DebugConsole />}
    </div>
  )
}
export default App
