/**
 * TEXT EDIT PANEL
 * 
 * Panel para editar capas de texto
 */

export default function TextEditPanel({ layer, selectedLayerId, layers, setLayers, currentRatio }) {
  if (!layer || layer.type !== 'text') return null

  return (
    <div className="bg-card rounded-lg border border-border p-4 mt-4">
      <h3 className="text-sm font-semibold mb-3">Editar Texto</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Texto</label>
          <input
            type="text"
            value={layer.text}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, text: e.target.value }
                  : l
              ))
            }}
            className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Tamaño: {layer.fontSize}px</label>
          <input
            type="range"
            min="12"
            max="120"
            value={layer.fontSize}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, fontSize: parseInt(e.target.value) }
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
        <div>
          <label className="block text-xs mb-1">Posición X: {layer.x}</label>
          <input
            type="range"
            min="0"
            max={currentRatio.width}
            value={layer.x}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, x: parseInt(e.target.value) }
                  : l
              ))
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Posición Y: {layer.y}</label>
          <input
            type="range"
            min="0"
            max={currentRatio.height}
            value={layer.y}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, y: parseInt(e.target.value) }
                  : l
              ))
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
