/**
 * PROJECT UTILITIES REFACTORED
 * 
 * Funciones de utilidad para manejo de proyectos
 */

export const saveProject = (aspectRatio, layers, setFileMenu) => {
  const projectData = {
    aspectRatio,
    layers: layers.map(layer => {
      const { image, ...layerWithoutImage } = layer
      return layerWithoutImage
    })
  }
  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.download = 'aria-photo-project.json'
  link.href = URL.createObjectURL(blob)
  link.click()
  setFileMenu({ visible: false, x: 0, y: 0 })
}

export const loadProject = (file, setAspectRatio, setLayers, setSelectedLayerId, saveToHistory, setFileMenu) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const projectData = JSON.parse(event.target.result)
      setAspectRatio(projectData.aspectRatio || '1:1')
      setLayers(projectData.layers || [])
      setSelectedLayerId(null)
      saveToHistory(projectData.layers || [])
      setFileMenu({ visible: false, x: 0, y: 0 })
    } catch (error) {
      console.error('Error loading project:', error)
      alert('Error al cargar el proyecto')
    }
  }
  reader.readAsText(file)
}
