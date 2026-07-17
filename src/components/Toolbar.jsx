/**
 * TOOLBAR
 * 
 * Barra de herramientas principal con botones de acción
 */

import { ImageIcon, Type, Square, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export default function Toolbar({ 
  fileInputRef, 
  onImageUpload, 
  onAddText, 
  onAddCircle, 
  onAddSquare, 
  onAddLine, 
  onAddGradient, 
  onShowEmojiPicker, 
  onShowFileMenu, 
  onResetZoom, 
  onZoomIn, 
  onZoomOut, 
  onRotateCanvas, 
  showMoreOptions, 
  onToggleMoreOptions 
}) {
  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
      <button
        onClick={() => {
          onToggleMoreOptions(false)
          fileInputRef.current?.click()
        }}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition tooltip-container"
        title="Subir Imagen"
      >
        <ImageIcon size={20} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
      
      <button
        onClick={() => {
          onToggleMoreOptions(false)
          onAddText()
        }}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
        title="Texto"
      >
        <Type size={20} />
      </button>
      
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleMoreOptions(!showMoreOptions)
          }}
          className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
          title="Formas"
        >
          <Square size={20} />
        </button>
        {showMoreOptions && (
          <div 
            className="fixed left-16 top-16 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 min-w-[150px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onAddCircle}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
            >
              <Square size={16} />
              Círculo
            </button>
            <button
              onClick={onAddSquare}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
            >
              <Square size={16} />
              Cuadrado
            </button>
            <button
              onClick={onAddLine}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
            >
              <Square size={16} />
              Línea
            </button>
            <button
              onClick={onAddGradient}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
            >
              <Square size={16} />
              Gradiente
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShowEmojiPicker(e)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-primary/20 transition text-left"
            >
              <Square size={16} />
              Emoji
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleMoreOptions(false)
          onShowFileMenu(e)
        }}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
        title="Archivo"
      >
        <Download size={20} />
      </button>
      
      <button
        onClick={onResetZoom}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
        title="Resetear Zoom"
      >
        <ZoomIn size={20} />
      </button>
      
      <button
        onClick={onZoomIn}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      
      <button
        onClick={onZoomOut}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      
      <button
        onClick={onRotateCanvas}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary/20 transition"
        title="Rotar Canvas"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  )
}
