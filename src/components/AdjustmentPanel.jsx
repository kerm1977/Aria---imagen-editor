/**
 * ADJUSTMENT PANEL
 * 
 * Panel de opciones de ajuste para capas
 */

import { Settings, ChevronDown, ChevronUp, Plus, Maximize2, AlignCenter, RotateCcw, Info, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdjustmentPanel({ 
  visible, 
  layerId, 
  layers, 
  setLayers, 
  currentRatio, 
  collapsed, 
  onToggleCollapse, 
  onClose,
  onFitToCanvas,
  onStretchToCanvas,
  onCoverToCanvas,
  onCenterElement,
  onResetToDefault,
  onResetToOriginalSize,
  onShowInfo,
  onDelete,
  onToggleVisibility
}) {
  if (!visible) return null

  const layer = layers.find(l => l.id === layerId)
  if (!layer) return null

  return (
    <div className="bg-card rounded-lg border border-border p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">Opciones de ajuste</h2>
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
        <div className="space-y-2">
          <button
            onClick={() => onFitToCanvas && onFitToCanvas(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            <Maximize2 size={14} />
            Ajustar a vista
          </button>
          
          <button
            onClick={() => onStretchToCanvas && onStretchToCanvas(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            <Maximize2 size={14} />
            Ajustar a ventana (ancho/alto)
          </button>
          
          <button
            onClick={() => onCoverToCanvas && onCoverToCanvas(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            <Maximize2 size={14} />
            Rellenar todo
          </button>
          
          <button
            onClick={() => onCenterElement && onCenterElement(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            <AlignCenter size={14} />
            Enviar al centro
          </button>
          
          <button
            onClick={() => onResetToDefault && onResetToDefault(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            <RotateCcw size={14} />
            Restablecer imagen predeterminada
          </button>
          
          <button
            onClick={() => onResetToOriginalSize && onResetToOriginalSize(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            <RotateCcw size={14} />
            Restablecer imagen a tamaño original
          </button>
          
          <button
            onClick={() => onToggleVisibility && onToggleVisibility(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            {layer.visible ? <EyeOff size={14} /> : <Eye size={14} />}
            {layer.visible ? 'Ocultar' : 'Mostrar'}
          </button>
          
          <button
            onClick={() => onShowInfo && onShowInfo(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition text-left text-sm"
          >
            <Info size={14} />
            Información
          </button>
          
          <button
            onClick={() => onDelete && onDelete(layerId)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/20 text-destructive rounded transition text-left text-sm"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
