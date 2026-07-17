/**
 * MAIN CONTENT
 * 
 * Componente para el contenido principal de la aplicación
 */

import AppHeader from './AppHeader.jsx'
import CanvasArea from './CanvasArea.jsx'
import RightPanel from './RightPanel.jsx'

export default function MainContent({
  handleTitleClick,
  canvasRef,
  currentRatio,
  zoomLevel,
  panOffset,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleContextMenu,
  handleDoubleClick,
  selectedLayer,
  selectedLayerId,
  layers,
  setLayers,
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
  contextMenu,
  setContextMenu,
  resetLayerTransformations,
  deleteLayer,
  moveLayer,
  toggleLayerVisibility,
  updateLayerOpacity,
  setSelectedLayerId
}) {
  return (
    <div className="flex-1 flex flex-col p-4">
      <AppHeader handleTitleClick={handleTitleClick} />

      <div className="flex gap-4 flex-1">
        <CanvasArea
          canvasRef={canvasRef}
          currentRatio={currentRatio}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleContextMenu={handleContextMenu}
          handleDoubleClick={handleDoubleClick}
        />

        <RightPanel
          selectedLayer={selectedLayer}
          selectedLayerId={selectedLayerId}
          layers={layers}
          setLayers={setLayers}
          currentRatio={currentRatio}
          transformPanel={transformPanel}
          setTransformPanel={setTransformPanel}
          layersCollapsed={layersCollapsed}
          setLayersCollapsed={setLayersCollapsed}
          transformCollapsed={transformCollapsed}
          setTransformCollapsed={setTransformCollapsed}
          adjustmentPanel={adjustmentPanel}
          setAdjustmentPanel={setAdjustmentPanel}
          adjustmentCollapsed={adjustmentCollapsed}
          setAdjustmentCollapsed={setAdjustmentCollapsed}
          resetConfirmModal={resetConfirmModal}
          setResetConfirmModal={setResetConfirmModal}
          autoShowTransform={autoShowTransform}
          setAutoShowTransform={setAutoShowTransform}
          autoShowAdjustment={autoShowAdjustment}
          setAutoShowAdjustment={setAutoShowAdjustment}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          resetLayerTransformations={resetLayerTransformations}
          deleteLayer={deleteLayer}
          moveLayer={moveLayer}
          toggleLayerVisibility={toggleLayerVisibility}
          updateLayerOpacity={updateLayerOpacity}
          setSelectedLayerId={setSelectedLayerId}
        />
      </div>
    </div>
  )
}
