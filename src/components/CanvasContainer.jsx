/**
 * CANVAS CONTAINER
 * 
 * Contenedor del canvas con renderizado y eventos
 */

export default function CanvasContainer({ 
  canvasRef, 
  currentRatio,
  onMouseDown, 
  onMouseMove, 
  onMouseUp, 
  onMouseLeave, 
  onContextMenu, 
  onDoubleClick 
}) {
  return (
    <canvas
      ref={canvasRef}
      width={currentRatio.width}
      height={currentRatio.height}
      className="max-w-full h-auto border border-border rounded cursor-move"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
    />
  )
}
