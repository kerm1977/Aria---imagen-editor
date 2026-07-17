/**
 * TRANSFORM PANEL
 * 
 * Panel de transformación para editar propiedades de capas
 */

import { Layout, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import TransformControls from './TransformControls.jsx'

export default function TransformPanel({ 
  visible, 
  layerId, 
  layers, 
  setLayers, 
  currentRatio, 
  collapsed, 
  onToggleCollapse, 
  onClose,
  onResetClick 
}) {
  if (!visible) return null

  const layer = layers.find(l => l.id === layerId)
  if (!layer) return null

  return (
    <div className="bg-card rounded-lg border border-border p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layout size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">Transformación</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-primary/20 rounded"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary/20 rounded"
          >
            <Plus size={16} className="rotate-45" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <TransformControls
          layer={layer}
          layers={layers}
          setLayers={setLayers}
          currentRatio={currentRatio}
          onResetClick={onResetClick}
        />
      )}
    </div>
  )
}
