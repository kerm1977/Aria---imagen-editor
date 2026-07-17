/**
 * CANVAS AREA
 * 
 * Componente para el área principal del canvas
 */

import CanvasContainer from './CanvasContainer.jsx'

export default function CanvasArea({
  canvasRef,
  currentRatio,
  zoomLevel,
  panOffset,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleContextMenu,
  handleDoubleClick
}) {
  return (
    <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden relative">
      <CanvasContainer
        canvasRef={canvasRef}
        currentRatio={currentRatio}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  )
}
