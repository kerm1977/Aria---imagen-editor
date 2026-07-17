/**
 * TRANSFORM CONTROLS
 * 
 * Controles de transformación para editar propiedades de capas
 */

export default function TransformControls({ layer, layers, setLayers, currentRatio, onResetClick }) {
  const updateLayer = (property, value) => {
    setLayers(layers.map(l => 
      l.id === layer.id ? { ...l, [property]: value } : l
    ))
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-4">
      {/* Reset Button */}
      <button
        onClick={onResetClick}
        className="w-full py-2 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm font-medium transition"
      >
        Restablecer Transformaciones
      </button>

      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Escala:</span>
          <span className="text-xs w-12">{Math.round((layer.scale || 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.01"
          value={layer.scale || 1}
          onChange={(e) => updateLayer('scale', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Rotation */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Rotación:</span>
          <span className="text-xs w-12">{Math.round(layer.rotation || 0)}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          step="1"
          value={layer.rotation || 0}
          onChange={(e) => updateLayer('rotation', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
        {/* Preset rotation buttons */}
        <div className="flex gap-1 mt-2">
          {[-180, -90, -45, 0, 45, 90, 180].map(angle => (
            <button
              key={angle}
              onClick={() => updateLayer('rotation', angle)}
              className="px-2 py-1 text-xs bg-secondary hover:bg-primary/20 rounded"
            >
              {angle}°
            </button>
          ))}
        </div>
      </div>

      {/* Mirror effects */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Espejo:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateLayer('flipX', !(layer.flipX || false))}
            className={`flex-1 px-2 py-1 text-xs rounded ${layer.flipX ? 'bg-primary/20' : 'bg-secondary hover:bg-primary/20'}`}
          >
            Horizontal
          </button>
          <button
            onClick={() => updateLayer('flipY', !(layer.flipY || false))}
            className={`flex-1 px-2 py-1 text-xs rounded ${layer.flipY ? 'bg-primary/20' : 'bg-secondary hover:bg-primary/20'}`}
          >
            Vertical
          </button>
        </div>
      </div>

      {/* Position X */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Posición X:</span>
          <span className="text-xs w-12">{Math.round(layer.x)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={currentRatio.width}
          step="1"
          value={layer.x}
          onChange={(e) => updateLayer('x', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Position Y */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Posición Y:</span>
          <span className="text-xs w-12">{Math.round(layer.y)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={currentRatio.height}
          step="1"
          value={layer.y}
          onChange={(e) => updateLayer('y', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Brightness */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Brillo:</span>
          <span className="text-xs w-12">{Math.round((layer.brightness || 100))}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="1"
          value={layer.brightness || 100}
          onChange={(e) => updateLayer('brightness', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Contrast */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Contraste:</span>
          <span className="text-xs w-12">{Math.round((layer.contrast || 100))}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="1"
          value={layer.contrast || 100}
          onChange={(e) => updateLayer('contrast', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Blur */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Blur:</span>
          <span className="text-xs w-12">{Math.round((layer.blur || 0))}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="0.5"
          value={layer.blur || 0}
          onChange={(e) => updateLayer('blur', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Opacidad:</span>
          <span className="text-xs w-12">{Math.round((layer.opacity || 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={layer.opacity || 1}
          onChange={(e) => updateLayer('opacity', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* RGBA - Red */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Rojo (R):</span>
          <span className="text-xs w-12">{Math.round((layer.red || 255))}</span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          step="1"
          value={layer.red || 255}
          onChange={(e) => updateLayer('red', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* RGBA - Green */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Verde (G):</span>
          <span className="text-xs w-12">{Math.round((layer.green || 255))}</span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          step="1"
          value={layer.green || 255}
          onChange={(e) => updateLayer('green', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* RGBA - Blue */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Azul (B):</span>
          <span className="text-xs w-12">{Math.round((layer.blue || 255))}</span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          step="1"
          value={layer.blue || 255}
          onChange={(e) => updateLayer('blue', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Sharpness */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Nitidez:</span>
          <span className="text-xs w-12">{Math.round((layer.sharpness || 0))}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={layer.sharpness || 0}
          onChange={(e) => updateLayer('sharpness', parseFloat(e.target.value))}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}
