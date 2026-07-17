/**
 * HANDLE IMAGE UPLOAD
 * 
 * Maneja la carga de imágenes
 */

export const handleImageUpload = (e, currentRatio, layers, setLayers, setSelectedLayerId) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      console.log('=== IMAGEN CARGADA ===')
      console.log('Data URL length:', event.target.result.length)
      const scale = Math.min(
        currentRatio.width / img.width,
        currentRatio.height / img.height
      ) * 0.5
      const newLayer = {
        id: Date.now(),
        type: 'image',
        name: file.name,
        image: img,
        imageData: event.target.result,
        x: currentRatio.width / 2,
        y: currentRatio.height / 2,
        width: img.width * scale,
        height: img.height * scale,
        scale: scale,
        rotation: 0,
        opacity: 1,
        visible: true
      }
      const newLayers = [...layers, newLayer]
      setLayers(newLayers)
      setSelectedLayerId(newLayer.id)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}
