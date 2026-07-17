/**
 * GET RESIZE HANDLE AT POSITION
 * 
 * Obtiene el handle de redimensionamiento en una posición específica
 */

export const getResizeHandleAtPosition = (coords, bounds) => {
  const handleSize = 10
  const handles = {
    'top-left': { x: bounds.x, y: bounds.y },
    'top-right': { x: bounds.x + bounds.width, y: bounds.y },
    'bottom-left': { x: bounds.x, y: bounds.y + bounds.height },
    'bottom-right': { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    'top-center': { x: bounds.x + bounds.width / 2, y: bounds.y },
    'bottom-center': { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    'left-center': { x: bounds.x, y: bounds.y + bounds.height / 2 },
    'right-center': { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }
  }
  
  for (const [handle, pos] of Object.entries(handles)) {
    if (Math.abs(coords.x - pos.x) < handleSize && Math.abs(coords.y - pos.y) < handleSize) {
      return handle
    }
  }
  return null
}
