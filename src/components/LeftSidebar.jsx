/**
 * LEFT SIDEBAR
 * 
 * Componente para el sidebar izquierdo que contiene el Toolbar y el AspectRatioSelector
 */

import Toolbar from './Toolbar.jsx'
import AspectRatioSelector from './AspectRatioSelector.jsx'

export default function LeftSidebar({
  fileInputRef,
  handleImageUploadWrapper,
  addTextLayerWrapper,
  addCircleLayerWrapper,
  addSquareLayerWrapper,
  addLineLayerWrapper,
  addGradientLayerWrapper,
  setShowMoreOptions,
  setAspectRatioMenu,
  setFileMenu,
  setEmojiPicker,
  zoomLevel,
  setZoomLevel,
  setPanOffset,
  panOffset,
  showMoreOptions,
  aspectRatio,
  aspectRatios,
  aspectRatioMenu,
  setAspectRatio,
  currentRatio
}) {
  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-4">
      <Toolbar
        fileInputRef={fileInputRef}
        onImageUpload={handleImageUploadWrapper}
        onAddText={() => {
          setShowMoreOptions(false)
          setAspectRatioMenu(false)
          setFileMenu({ visible: false, x: 0, y: 0 })
          setEmojiPicker({ visible: false, x: 0, y: 0 })
          addTextLayerWrapper()
        }}
        onAddCircle={addCircleLayerWrapper}
        onAddSquare={addSquareLayerWrapper}
        onAddLine={addLineLayerWrapper}
        onAddGradient={addGradientLayerWrapper}
        onShowEmojiPicker={(e) => {
          e.stopPropagation()
          setEmojiPicker({ visible: true, x: e.clientX, y: e.clientY + 30 })
        }}
        onShowFileMenu={(e) => {
          e.stopPropagation()
          setShowMoreOptions(false)
          setAspectRatioMenu(false)
          setEmojiPicker({ visible: false, x: 0, y: 0 })
          setFileMenu({ visible: true, x: e.clientX, y: e.clientY + 30 })
        }}
        onResetZoom={() => {
          setZoomLevel(1)
          setPanOffset({ x: 0, y: 0 })
        }}
        onZoomIn={() => {
          const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel * 1.2))
          // Ajustar panOffset para mantener el centro
          const centerX = currentRatio.width / 2
          const centerY = currentRatio.height / 2
          const zoomFactor = newZoomLevel / zoomLevel
          setPanOffset({
            x: centerX - (centerX - panOffset.x) * zoomFactor,
            y: centerY - (centerY - panOffset.y) * zoomFactor
          })
          setZoomLevel(newZoomLevel)
        }}
        onZoomOut={() => {
          const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel * 0.8))
          // Ajustar panOffset para mantener el centro
          const centerX = currentRatio.width / 2
          const centerY = currentRatio.height / 2
          const zoomFactor = newZoomLevel / zoomLevel
          setPanOffset({
            x: centerX - (centerX - panOffset.x) * zoomFactor,
            y: centerY - (centerY - panOffset.y) * zoomFactor
          })
          setZoomLevel(newZoomLevel)
        }}
        onRotateCanvas={() => {
          // Implementar rotación de canvas si es necesario
        }}
        showMoreOptions={showMoreOptions}
        onToggleMoreOptions={(value) => {
          setShowMoreOptions(value)
          setAspectRatioMenu(false)
          setFileMenu({ visible: false, x: 0, y: 0 })
          setEmojiPicker({ visible: false, x: 0, y: 0 })
        }}
      />

      <AspectRatioSelector
        aspectRatio={aspectRatio}
        aspectRatios={aspectRatios}
        visible={aspectRatioMenu}
        onToggle={() => {
          setShowMoreOptions(false)
          setFileMenu({ visible: false, x: 0, y: 0 })
          setEmojiPicker({ visible: false, x: 0, y: 0 })
          setAspectRatioMenu(!aspectRatioMenu)
        }}
        onSelect={(value) => {
          setAspectRatio(value)
          setAspectRatioMenu(false)
        }}
      />
    </div>
  )
}
