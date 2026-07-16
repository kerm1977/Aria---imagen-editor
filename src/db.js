const DB_NAME = 'aria-editor-db'
const DB_VERSION = 1

let db = null

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Error opening database:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      
      // Create settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' })
      }
      
      // Create layers store
      if (!database.objectStoreNames.contains('layers')) {
        database.createObjectStore('layers', { keyPath: 'id' })
      }
      
      // Create history store
      if (!database.objectStoreNames.contains('history')) {
        database.createObjectStore('history', { keyPath: 'id', autoIncrement: true })
      }
      
      // Create projects store
      if (!database.objectStoreNames.contains('projects')) {
        database.createObjectStore('projects', { keyPath: 'id' })
      }
    }
  })
}

export const saveSetting = (key, value) => {
  if (!db) return
  const transaction = db.transaction(['settings'], 'readwrite')
  const store = transaction.objectStore('settings')
  store.put({ key, value: JSON.stringify(value) })
}

export const getSetting = (key) => {
  return new Promise((resolve) => {
    if (!db) {
      resolve(null)
      return
    }
    const transaction = db.transaction(['settings'], 'readonly')
    const store = transaction.objectStore('settings')
    const request = store.get(key)
    
    request.onsuccess = () => {
      if (request.result) {
        try {
          resolve(JSON.parse(request.result.value))
        } catch (error) {
          console.error('Error parsing setting:', error)
          resolve(null)
        }
      } else {
        resolve(null)
      }
    }
    
    request.onerror = () => {
      console.error('Error getting setting:', request.error)
      resolve(null)
    }
  })
}

export const saveLayers = (layers) => {
  if (!db) return
  const transaction = db.transaction(['layers'], 'readwrite')
  const store = transaction.objectStore('layers')
  
  // Clear existing layers
  store.clear()
  
  // Add new layers
  layers.forEach(layer => {
    // Convert Image objects to data URLs before saving
    const layerToSave = { ...layer }
    if (layerToSave.image && layerToSave.image.src) {
      layerToSave.imageData = layerToSave.image.src
      delete layerToSave.image
    }
    store.put(layerToSave)
  })
}

export const getLayers = () => {
  return new Promise((resolve) => {
    if (!db) {
      resolve([])
      return
    }
    const transaction = db.transaction(['layers'], 'readonly')
    const store = transaction.objectStore('layers')
    const request = store.getAll()
    
    request.onsuccess = () => {
      try {
        const layers = request.result.map(item => {
          // Restore Image objects from data URLs
          const layerToRestore = { ...item }
          if (layerToRestore.imageData) {
            const img = new Image()
            img.src = layerToRestore.imageData
            layerToRestore.image = img
            delete layerToRestore.imageData
          }
          return layerToRestore
        })
        resolve(layers)
      } catch (error) {
        console.error('Error parsing layers:', error)
        resolve([])
      }
    }
    
    request.onerror = () => {
      console.error('Error getting layers:', request.error)
      resolve([])
    }
  })
}

export const saveHistory = (history) => {
  if (!db) return
  const transaction = db.transaction(['history'], 'readwrite')
  const store = transaction.objectStore('history')
  
  // Clear existing history
  store.clear()
  
  // Add new history
  history.forEach((state, index) => {
    store.put({ id: index, data: JSON.stringify(state) })
  })
}

export const getHistory = () => {
  return new Promise((resolve) => {
    if (!db) {
      resolve([])
      return
    }
    const transaction = db.transaction(['history'], 'readonly')
    const store = transaction.objectStore('history')
    const request = store.getAll()
    
    request.onsuccess = () => {
      try {
        const history = request.result
          .sort((a, b) => a.id - b.id)
          .map(item => JSON.parse(item.data))
        resolve(history)
      } catch (error) {
        console.error('Error parsing history:', error)
        resolve([])
      }
    }
    
    request.onerror = () => {
      console.error('Error getting history:', request.error)
      resolve([])
    }
  })
}

export const saveProject = (id, name, data) => {
  if (!db) return
  const transaction = db.transaction(['projects'], 'readwrite')
  const store = transaction.objectStore('projects')
  store.put({
    id,
    name,
    data: JSON.stringify(data),
    updated_at: new Date().toISOString()
  })
}

export const getProject = (id) => {
  return new Promise((resolve) => {
    if (!db) {
      resolve(null)
      return
    }
    const transaction = db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    const request = store.get(id)
    
    request.onsuccess = () => {
      if (request.result) {
        try {
          resolve(JSON.parse(request.result.data))
        } catch (error) {
          console.error('Error parsing project:', error)
          resolve(null)
        }
      } else {
        resolve(null)
      }
    }
    
    request.onerror = () => {
      console.error('Error getting project:', request.error)
      resolve(null)
    }
  })
}

export const getAllProjects = () => {
  return new Promise((resolve) => {
    if (!db) {
      resolve([])
      return
    }
    const transaction = db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    const request = store.getAll()
    
    request.onsuccess = () => {
      const projects = request.result
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .map(item => ({
          id: item.id,
          name: item.name,
          created_at: item.created_at,
          updated_at: item.updated_at
        }))
      resolve(projects)
    }
    
    request.onerror = () => {
      console.error('Error getting all projects:', request.error)
      resolve([])
    }
  })
}

export const deleteProject = (id) => {
  if (!db) return
  const transaction = db.transaction(['projects'], 'readwrite')
  const store = transaction.objectStore('projects')
  store.delete(id)
}

export const clearAllData = () => {
  if (!db) return
  const transaction = db.transaction(['layers', 'history', 'settings'], 'readwrite')
  transaction.objectStore('layers').clear()
  transaction.objectStore('history').clear()
  transaction.objectStore('settings').clear()
}
