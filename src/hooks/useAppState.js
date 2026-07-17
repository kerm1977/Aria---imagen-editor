/**
 * APP STATE
 * 
 * Hook personalizado para el estado de la aplicación
 */

import { useState, useRef } from 'react'

export const useAppState = () => {
  const [layers, setLayers] = useState([])
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isRPressed, setIsRPressed] = useState(false)
  const [isSPressed, setIsSPressed] = useState(false)
  const [isGPressed, setIsGPressed] = useState(false)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, layerId: null })
  const [fileMenu, setFileMenu] = useState({ visible: false, x: 0, y: 0 })
  const [emojiPicker, setEmojiPicker] = useState({ visible: false, x: 0, y: 0 })
  const [aspectRatioMenu, setAspectRatioMenu] = useState(false)
  const [transformPanel, setTransformPanel] = useState({ visible: false, layerId: null })
  const [layersCollapsed, setLayersCollapsed] = useState(false)
  const [transformCollapsed, setTransformCollapsed] = useState(false)
  const [adjustmentPanel, setAdjustmentPanel] = useState({ visible: false, layerId: null })
  const [adjustmentCollapsed, setAdjustmentCollapsed] = useState(false)
  const [resetConfirmModal, setResetConfirmModal] = useState(false)
  const [autoShowTransform, setAutoShowTransform] = useState(true)
  const [autoShowAdjustment, setAutoShowAdjustment] = useState(true)
  const projectInputRef = useRef(null)
  const [debugConsoleVisible, setDebugConsoleVisible] = useState(false)
  const titleClickCountRef = useRef(0)
  const titleClickTimerRef = useRef(null)

  return {
    layers,
    setLayers,
    selectedLayerId,
    setSelectedLayerId,
    aspectRatio,
    setAspectRatio,
    canvasRef,
    fileInputRef,
    showMoreOptions,
    setShowMoreOptions,
    zoomLevel,
    setZoomLevel,
    panOffset,
    setPanOffset,
    isRPressed,
    setIsRPressed,
    isSPressed,
    setIsSPressed,
    isGPressed,
    setIsGPressed,
    contextMenu,
    setContextMenu,
    fileMenu,
    setFileMenu,
    emojiPicker,
    setEmojiPicker,
    aspectRatioMenu,
    setAspectRatioMenu,
    transformPanel,
    setTransformPanel,
    layersCollapsed,
    setLayersCollapsed,
    transformCollapsed,
    setTransformCollapsed,
    adjustmentPanel,
    setAdjustmentPanel,
    adjustmentCollapsed,
    setAdjustmentCollapsed,
    resetConfirmModal,
    setResetConfirmModal,
    autoShowTransform,
    setAutoShowTransform,
    autoShowAdjustment,
    setAutoShowAdjustment,
    projectInputRef,
    debugConsoleVisible,
    setDebugConsoleVisible,
    titleClickCountRef,
    titleClickTimerRef
  }
}
