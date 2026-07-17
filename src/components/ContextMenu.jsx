/**
 * CONTEXT MENU
 * 
 * Menú contextual para operaciones sobre capas
 */

import { Maximize2, AlignCenter, RotateCcw, Layout, Trash2, Info } from 'lucide-react'

export default function ContextMenu({ 
  visible, 
  x, 
  y, 
  layerId, 
  layers, 
  onFitToCanvas, 
  onStretchToCanvas, 
  onCoverToCanvas, 
  onCenterElement, 
  onResetToDefault, 
  onResetToOriginalSize,
  onToggleTransformPanel, 
  autoShowTransform, 
  onToggleAdjustmentPanel,
  autoShowAdjustment,
  onShowInfo,
  onDelete, 
  onClose 
}) {
  if (!visible) return null

  const layer = layers.find(l => l.id === layerId)
  if (!layer) return null

  return (
    <div
      className="fixed bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 min-w-[200px]"
      style={{
        left: x,
        top: y
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onFitToCanvas(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <Maximize2 size={16} />
        Ajustar a vista
      </button>
      <button
        onClick={() => onStretchToCanvas(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <Maximize2 size={16} />
        Ajustar a ventana (ancho/alto)
      </button>
      <button
        onClick={() => onCoverToCanvas(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <Maximize2 size={16} />
        Rellenar todo
      </button>
      <button
        onClick={() => onCenterElement(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <AlignCenter size={16} />
        Enviar al centro
      </button>
      <button
        onClick={() => onResetToDefault(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <RotateCcw size={16} />
        Restablecer imagen predeterminada
      </button>
      <button
        onClick={() => onResetToOriginalSize(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <RotateCcw size={16} />
        Restablecer imagen a tamaño original
      </button>
      <button
        onClick={() => onToggleTransformPanel(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <Layout size={16} />
        {autoShowTransform ? 'Ocultar opciones de transformación' : 'Mostrar opciones de transformación'}
      </button>
      <button
        onClick={() => onToggleAdjustmentPanel(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <Layout size={16} />
        {autoShowAdjustment ? 'Ocultar opciones de ajuste' : 'Mostrar opciones de ajuste'}
      </button>
      <button
        onClick={() => onShowInfo(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
      >
        <Info size={16} />
        Información
      </button>
      <div className="border-t border-border my-1"></div>
      <button
        onClick={() => onDelete(layerId)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-destructive/20 text-destructive transition text-left"
      >
        <Trash2 size={16} />
        Eliminar
      </button>
    </div>
  )
}
