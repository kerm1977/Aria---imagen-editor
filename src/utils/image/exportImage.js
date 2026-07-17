/**
 * EXPORT IMAGE
 * 
 * Exporta la imagen en diferentes formatos
 */

export const exportImage = (canvasRef, format, setFileMenu) => {
  const canvas = canvasRef.current
  const link = document.createElement('a')
  link.download = `aria-photo.${format}`
  link.href = canvas.toDataURL(`image/${format}`, 0.9)
  link.click()
  setFileMenu({ visible: false, x: 0, y: 0 })
}
