/**
 * GET CANVAS COORDINATES
 * 
 * Convierte coordenadas del mouse a coordenadas del canvas
 */

export const getCanvasCoordinates = (e, canvasRef, panOffset, zoomLevel) => {
  const canvas = canvasRef.current
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  
  // Get mouse position relative to canvas
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  // Convert to canvas coordinates (canvas is already scaled by zoomLevel)
  const canvasX = (mouseX * scaleX - panOffset.x) / zoomLevel
  const canvasY = (mouseY * scaleY - panOffset.y) / zoomLevel
  
  return {
    x: canvasX,
    y: canvasY
  }
}
