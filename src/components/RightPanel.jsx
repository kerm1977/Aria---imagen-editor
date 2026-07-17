/**
 * RIGHT PANEL
 * 
 * Componente para el panel derecho que contiene todos los paneles de edición
 */

import TransformPanel from './TransformPanel.jsx'
import AdjustmentPanel from './AdjustmentPanel.jsx'
import LayersPanel from './LayersPanel.jsx'
import TextEditPanel from './TextEditPanel.jsx'
import EmojiEditPanel from './EmojiEditPanel.jsx'
import GradientEditPanel from './GradientEditPanel.jsx'
import LineEditPanel from './LineEditPanel.jsx'
import CircleEditPanel from './CircleEditPanel.jsx'
import SquareEditPanel from './SquareEditPanel.jsx'
import ContextMenu from './ContextMenu.jsx'
import { fitElementToCanvas } from '../utils/adjustment/fitElementToCanvas.js'
import { stretchElementToCanvas } from '../utils/adjustment/stretchElementToCanvas.js'
import { coverElementToCanvas } from '../utils/adjustment/coverElementToCanvas.js'
import { centerElement } from '../utils/adjustment/centerElement.js'
import { resetElementToDefault } from '../utils/adjustment/resetElementToDefault.js'
import { showLayerInfo } from '../utils/adjustment/showLayerInfo.js'
import { resetToOriginalSize } from '../utils/adjustment/resetToOriginalSize.js'

export default function RightPanel({
  selectedLayer,
  selectedLayerId,
  layers,
  setLayers,
  currentRatio,
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
    <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        layerId={contextMenu.layerId}
        layers={layers}
        onFitToCanvas={(layerId) => fitElementToCanvas(layerId, layers, setLayers, currentRatio)}
        onStretchToCanvas={(layerId) => stretchElementToCanvas(layerId, layers, setLayers, currentRatio)}
        onCoverToCanvas={(layerId) => coverElementToCanvas(layerId, layers, setLayers, currentRatio)}
        onCenterElement={(layerId) => centerElement(layerId, layers, setLayers, currentRatio)}
        onResetToDefault={(layerId) => resetElementToDefault(layerId, layers, setLayers, currentRatio)}
        onResetToOriginalSize={(layerId) => {
          resetToOriginalSize(layerId, layers, setLayers)
          setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
        }}
        onToggleTransformPanel={(layerId) => {
          setAutoShowTransform(!autoShowTransform)
          setTransformPanel({ visible: !autoShowTransform, layerId })
          setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
        }}
        autoShowTransform={autoShowTransform}
        onToggleAdjustmentPanel={(layerId) => {
          setAutoShowAdjustment(!autoShowAdjustment)
          setAdjustmentPanel({ visible: !autoShowAdjustment, layerId })
          setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
        }}
        autoShowAdjustment={autoShowAdjustment}
        onShowInfo={(layerId) => {
          const layer = layers.find(l => l.id === layerId)
          if (layer && layer.type === 'image') {
            const info = `
Información de la imagen:
Nombre: ${layer.name}
Tipo: ${layer.type}
Tamaño original: ${layer.width ? Math.round(layer.width) : 'N/A'} x ${layer.height ? Math.round(layer.height) : 'N/A'} px
Escala: ${layer.scale ? (layer.scale * 100).toFixed(1) : 'N/A'}%
Rotación: ${layer.rotation ? layer.rotation : 0}°
Opacidad: ${layer.opacity ? (layer.opacity * 100).toFixed(0) : 100}%
Posición: X: ${Math.round(layer.x)}, Y: ${Math.round(layer.y)}
            `
            alert(info)
          }
          setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
        }}
        onDelete={(layerId) => {
          deleteLayer(layerId)
          setContextMenu({ visible: false, x: 0, y: 0, layerId: null })
        }}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0, layerId: null })}
      />

      <div className="w-80">
        <LayersPanel
          layers={layers}
          selectedLayerId={selectedLayerId}
          collapsed={layersCollapsed}
          onToggleCollapse={() => setLayersCollapsed(!layersCollapsed)}
          onSelectLayer={setSelectedLayerId}
          onMoveLayer={moveLayer}
          onToggleVisibility={toggleLayerVisibility}
          onDeleteLayer={deleteLayer}
          onUpdateOpacity={updateLayerOpacity}
        />
      </div>

      <TransformPanel
        visible={transformPanel.visible}
        layerId={transformPanel.layerId}
        layers={layers}
        setLayers={setLayers}
        currentRatio={currentRatio}
        collapsed={transformCollapsed}
        onToggleCollapse={() => setTransformCollapsed(!transformCollapsed)}
        onClose={() => setTransformPanel({ visible: false, layerId: null })}
        onResetClick={() => setResetConfirmModal(true)}
      />

      <AdjustmentPanel
        visible={adjustmentPanel.visible}
        layerId={adjustmentPanel.layerId}
        layers={layers}
        setLayers={setLayers}
        currentRatio={currentRatio}
        collapsed={adjustmentCollapsed}
        onToggleCollapse={() => setAdjustmentCollapsed(!adjustmentCollapsed)}
        onClose={() => setAdjustmentPanel({ visible: false, layerId: null })}
        onFitToCanvas={(layerId) => fitElementToCanvas(layerId, layers, setLayers, currentRatio)}
        onStretchToCanvas={(layerId) => stretchElementToCanvas(layerId, layers, setLayers, currentRatio)}
        onCoverToCanvas={(layerId) => coverElementToCanvas(layerId, layers, setLayers, currentRatio)}
        onCenterElement={(layerId) => centerElement(layerId, layers, setLayers, currentRatio)}
        onResetToDefault={(layerId) => resetElementToDefault(layerId, layers, setLayers, currentRatio)}
        onResetToOriginalSize={(layerId) => resetToOriginalSize(layerId, layers, setLayers)}
        onShowInfo={(layerId) => {
          const layer = layers.find(l => l.id === layerId)
          if (layer && layer.type === 'image') {
            const info = `
Información de la imagen:
Nombre: ${layer.name}
Tipo: ${layer.type}
Tamaño original: ${layer.width ? Math.round(layer.width) : 'N/A'} x ${layer.height ? Math.round(layer.height) : 'N/A'} px
Escala: ${layer.scale ? (layer.scale * 100).toFixed(1) : 'N/A'}%
Rotación: ${layer.rotation ? layer.rotation : 0}°
Opacidad: ${layer.opacity ? (layer.opacity * 100).toFixed(0) : 100}%
Posición: X: ${Math.round(layer.x)}, Y: ${Math.round(layer.y)}
            `
            alert(info)
          }
        }}
        onDelete={(layerId) => deleteLayer(layerId)}
        onToggleVisibility={(layerId) => toggleLayerVisibility(layerId)}
      />

      <TextEditPanel
        layer={selectedLayer}
        selectedLayerId={selectedLayerId}
        layers={layers}
        setLayers={setLayers}
        currentRatio={currentRatio}
      />

      <CircleEditPanel
        layer={selectedLayer}
        selectedLayerId={selectedLayerId}
        layers={layers}
        setLayers={setLayers}
        currentRatio={currentRatio}
      />

      <SquareEditPanel
        layer={selectedLayer}
        selectedLayerId={selectedLayerId}
        layers={layers}
        setLayers={setLayers}
        currentRatio={currentRatio}
      />

      <LineEditPanel
        layer={selectedLayer}
        selectedLayerId={selectedLayerId}
        layers={layers}
        setLayers={setLayers}
        currentRatio={currentRatio}
      />

      <GradientEditPanel
        layer={selectedLayer}
        selectedLayerId={selectedLayerId}
        layers={layers}
        setLayers={setLayers}
      />

      <EmojiEditPanel
        layer={selectedLayer}
        selectedLayerId={selectedLayerId}
        layers={layers}
        setLayers={setLayers}
        currentRatio={currentRatio}
      />
    </div>
  )
}
