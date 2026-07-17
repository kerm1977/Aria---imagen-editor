/**
 * PROJECT UTILS
 * 
 * Utilidades para manejo de proyectos
 * - saveProject: Guardar proyecto
 * - loadProject: Cargar proyecto
 * - exportImage: Exportar imagen
 */

import { saveProject as dbSaveProject, getProject, getAllProjects, deleteProject } from '../db.js'

export const saveProject = (aspectRatio, layers, setFileMenu) => {
  const projectData = {
    aspectRatio,
    layers: layers.map(layer => {
      // Convert image objects to data URLs for saving
      if (layer.type === 'image' && layer.image) {
        return {
          ...layer,
          imageData: layer.image.src,
          image: null // Don't save the Image object
        }
      }
      return layer
    })
  }

  // Save to database
  const projectId = Date.now().toString()
  dbSaveProject(projectId, 'Untitled Project', projectData)

  // Also save as file for export
  const dataStr = JSON.stringify(projectData, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  const link = document.createElement('a')
  link.setAttribute('href', dataUri)
  link.setAttribute('download', 'aria-project.json')
  link.click()
  setFileMenu({ visible: false, x: 0, y: 0 })
}

export const loadProject = (e, setAspectRatio, setLayers, setSelectedLayerId, setHistory, restoreImagesInLayers) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const projectData = JSON.parse(event.target.result)
      
      // Restore images from data URLs
      const restoredLayers = projectData.layers.map(layer => {
        if (layer.type === 'image' && layer.imageData) {
          const img = new Image()
          img.src = layer.imageData
          return {
            ...layer,
            image: img,
            imageData: undefined
          }
        }
        return layer
      })

      setAspectRatio(projectData.aspectRatio)
      setLayers(restoredLayers)
      setSelectedLayerId(null)
      setHistory([])
    } catch (error) {
      console.error('Error loading project:', error)
      alert('Error al cargar el proyecto')
    }
  }
  reader.readAsText(file)
  e.target.value = '' // Reset input
}

export const exportImage = (format, canvasRef, setFileMenu) => {
  const canvas = canvasRef.current
  const link = document.createElement('a')
  link.download = `aria-photo.${format}`
  link.href = canvas.toDataURL(`image/${format}`, 0.9)
  link.click()
  setFileMenu({ visible: false, x: 0, y: 0 })
}

export const getAllProjectsList = async () => {
  return await getAllProjects()
}

export const deleteProjectById = async (projectId) => {
  return await deleteProject(projectId)
}

export const loadProjectById = async (projectId, setAspectRatio, setLayers, setSelectedLayerId, restoreImagesInLayers) => {
  const projectData = await getProject(projectId)
  if (!projectData) return
  
  // Restore images from data URLs
  const restoredLayers = projectData.data.layers.map(layer => {
    if (layer.type === 'image' && layer.imageData) {
      const img = new Image()
      img.src = layer.imageData
      return {
        ...layer,
        image: img,
        imageData: undefined
      }
    }
    return layer
  })

  setAspectRatio(projectData.data.aspectRatio)
  setLayers(restoredLayers)
  setSelectedLayerId(null)
}
