/**
 * GRADIENT EDIT PANEL
 * 
 * Panel para editar capas de gradiente
 */

export default function GradientEditPanel({ layer, selectedLayerId, layers, setLayers }) {
  if (!layer || layer.type !== 'gradient') return null

  return (
    <div className="bg-card rounded-lg border border-border p-4 mt-4">
      <h3 className="text-sm font-semibold mb-3">Editar Gradiente</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Color 1</label>
          <input
            type="color"
            value={layer.color1}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, color1: e.target.value }
                  : l
              ))
            }}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Color 2</label>
          <input
            type="color"
            value={layer.color2}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, color2: e.target.value }
                  : l
              ))
            }}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Dirección</label>
          <select
            value={layer.direction}
            onChange={(e) => {
              setLayers(layers.map(l =>
                l.id === selectedLayerId
                  ? { ...l, direction: e.target.value }
                  : l
              ))
            }}
            className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
      </div>
    </div>
  )
}
