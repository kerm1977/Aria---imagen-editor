/**
 * LAYERS PANEL
 * 
 * Panel de capas para gestionar las capas del editor
 */

import { Layers, ChevronDown, ChevronUp, ImageIcon, Type, Circle, Square, Minus, Palette, Sparkles, Plus, Sun, Trash2 } from 'lucide-react'

export default function LayersPanel({ 
  layers, 
  selectedLayerId, 
  collapsed, 
  onToggleCollapse, 
  onSelectLayer, 
  onMoveLayer, 
  onToggleVisibility, 
  onDeleteLayer, 
  onUpdateOpacity 
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">Capas</h2>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-primary/20 rounded"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-96 overflow-y-auto">
          {layers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No hay capas. Sube una imagen o agrega texto.
            </p>
          ) : (
            <div className="space-y-2">
              {[...layers].reverse().map((layer, reverseIndex) => {
                const index = layers.length - 1 - reverseIndex
                return (
                  <div
                    key={layer.id}
                    className={`p-3 rounded border transition cursor-pointer ${
                      selectedLayerId === layer.id
                        ? 'bg-primary/20 border-primary'
                        : 'bg-secondary border-border hover:border-primary'
                    }`}
                    onClick={() => onSelectLayer(layer.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {layer.type === 'image' ? (
                          <ImageIcon size={16} />
                        ) : layer.type === 'text' ? (
                          <Type size={16} />
                        ) : layer.type === 'circle' ? (
                          <Circle size={16} />
                        ) : layer.type === 'square' ? (
                          <Square size={16} />
                        ) : layer.type === 'line' ? (
                          <Minus size={16} />
                        ) : layer.type === 'gradient' ? (
                          <Palette size={16} />
                        ) : layer.type === 'emoji' ? (
                          <Sparkles size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                        <span className="text-sm font-medium truncate max-w-[120px]">
                          {layer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMoveLayer(index, 1)
                          }}
                          disabled={index === layers.length - 1}
                          className="p-1 hover:bg-primary/20 rounded disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMoveLayer(index, -1)
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-primary/20 rounded disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleVisibility(layer.id)
                          }}
                          className="p-1 hover:bg-primary/20 rounded"
                        >
                          <Sun size={14} className={layer.visible ? '' : 'opacity-30'} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteLayer(layer.id)
                          }}
                          className="p-1 hover:bg-destructive/20 rounded text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Opacidad:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={layer.opacity}
                        onChange={(e) => {
                          e.stopPropagation()
                          onUpdateOpacity(layer.id, parseFloat(e.target.value))
                        }}
                        className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs w-8">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
