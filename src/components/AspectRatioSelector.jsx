/**
 * ASPECT RATIO SELECTOR
 * 
 * Selector de relación de aspecto para el canvas
 */

import { Layout } from 'lucide-react'

export default function AspectRatioSelector({ 
  aspectRatio, 
  aspectRatios, 
  visible, 
  onToggle, 
  onSelect 
}) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
        title="Relación de Aspecto"
      >
        <Layout size={20} />
      </button>
      {visible && (
        <div 
          className="fixed left-16 top-32 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-[9999] min-w-[150px]"
          onClick={(e) => e.stopPropagation()}
        >
          {aspectRatios.map(ratio => (
            <button
              key={ratio.value}
              onClick={() => {
                onSelect(ratio.value)
                onToggle()
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left text-white ${aspectRatio === ratio.value ? 'bg-primary/20' : ''}`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
