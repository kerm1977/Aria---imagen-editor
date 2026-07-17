/**
 * LINE EDIT PANEL
 * 
 * Panel para editar capas de línea
 */

export default function LineEditPanel({ layer, selectedLayerId, layers, setLayers, currentRatio }) {
  if (!layer || layer.type !== 'line') return null

  return (
    <div className="bg-card rounded-lg border border-border p-4 mt-4">
      <h3 className="text-sm font-semibold mb-3">Editar Línea</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Grosor: {layer.strokeWidth}px</label>
          <input
            type="range"
            min="1"
            max="20"
            value={layer.strokeWidth}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, strokeWidth: parseInt(e.target.value) }
                  : l
              ))
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">X1: {layer.x1}</label>
          <input
            type="range"
            min="0"
            max={currentRatio.width}
            value={layer.x1}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, x1: parseInt(e.target.value) }
                  : l
              ))
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Y1: {layer.y1}</label>
          <input
            type="range"
            min="0"
            max={currentRatio.height}
            value={layer.y1}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, y1: parseInt(e.target.value) }
                  : l
              ))
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">X2: {layer.x2}</label>
          <input
            type="range"
            min="0"
            max={currentRatio.width}
            value={layer.x2}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, x2: parseInt(e.target.value) }
                  : l
              ))
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Y2: {layer.y2}</label>
          <input
            type="range"
            min="0"
            max={currentRatio.height}
            value={layer.y2}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, y2: parseInt(e.target.value) }
                  : l
              ))
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Color</label>
          <input
            type="color"
            value={layer.color}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, color: e.target.value }
                  : l
              ))
            }}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
