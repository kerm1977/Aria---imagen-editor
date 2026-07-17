// Sistema de historial independiente para undo/redo
class HistoryManager {
  constructor() {
    this.history = []
    this.currentIndex = -1
    this.listeners = []
  }

  // Agregar un estado al historial
  pushState(layers) {
    console.log('=== historyManager.pushState ===')
    console.log('Capas:', layers.length)
    console.log('Contenido de capas:', layers.map(l => ({ id: l.id, type: l.type, x: l.x, y: l.y, visible: l.visible })))
    // Eliminar estados futuros si estamos en medio del historial
    this.history = this.history.slice(0, this.currentIndex + 1)
    // Agregar nuevo estado
    this.history.push(JSON.parse(JSON.stringify(layers)))
    this.currentIndex = this.history.length - 1
    console.log('Nuevo currentIndex:', this.currentIndex, 'history.length:', this.history.length)
    // Notificar a los listeners
    this.notifyListeners()
    console.log('============================')
  }

  // Deshacer (Ctrl Z)
  undo() {
    console.log('=== historyManager.undo ===')
    console.log('currentIndex:', this.currentIndex, 'history.length:', this.history.length)
    if (this.currentIndex >= 0) {
      this.currentIndex--
      const state = JSON.parse(JSON.stringify(this.history[this.currentIndex]))
      console.log('Undo exitoso - nuevo currentIndex:', this.currentIndex)
      console.log('Estado devuelto:', state.map(l => ({ 
        id: l.id, 
        type: l.type, 
        x: l.x, 
        y: l.y, 
        visible: l.visible,
        hasImageData: !!l.imageData,
        hasImage: !!l.image,
        imageDataLength: l.imageData ? l.imageData.length : 0
      })))
      this.notifyListeners()
      return state
    }
    console.log('Undo falló - currentIndex < 0')
    return null
  }

  // Rehacer (Ctrl Alt Z)
  redo() {
    console.log('=== historyManager.redo ===')
    console.log('currentIndex:', this.currentIndex, 'history.length:', this.history.length)
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      const state = JSON.parse(JSON.stringify(this.history[this.currentIndex]))
      console.log('Redo exitoso - nuevo currentIndex:', this.currentIndex)
      this.notifyListeners()
      return state
    }
    console.log('Redo falló - currentIndex >= history.length - 1')
    return null
  }

  // Obtener estado actual
  getCurrentState() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
    }
    return null
  }

  // Verificar si se puede deshacer
  canUndo() {
    return this.currentIndex > 0
  }

  // Verificar si se puede rehacer
  canRedo() {
    return this.currentIndex < this.history.length - 1
  }

  // Agregar listener para cambios en el historial
  addListener(callback) {
    this.listeners.push(callback)
  }

  // Remover listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback)
  }

  // Notificar a los listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        history: this.history,
        currentIndex: this.currentIndex,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      })
    })
  }

  // Limpiar historial
  clear() {
    this.history = []
    this.currentIndex = -1
    this.notifyListeners()
  }

  // Cargar historial desde datos externos
  loadFromData(historyData, index) {
    this.history = historyData
    this.currentIndex = index
    this.notifyListeners()
  }

  // Obtener datos para guardar
  getData() {
    return {
      history: this.history,
      currentIndex: this.currentIndex
    }
  }
}

// Exportar una instancia única
export const historyManager = new HistoryManager()
