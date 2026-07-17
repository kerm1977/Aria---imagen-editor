/**
 * SHOW LAYER INFO
 * 
 * Muestra información de la capa
 */

export const showLayerInfo = (layerId, layers) => {
  const layer = layers.find(l => l.id === layerId)
  if (layer && layer.type === 'image') {
    const info = `
Información de la imagen:
Nombre: ${layer.name}
Tipo: ${layer.type}
Tamaño original: ${layer.width ? Math.round(layer.width) : 'N/A'} x ${layer.height ? Math.round(layer.height) : 'N/A'} px
Escala: ${layer.scale ? (layer.scale * 100).toFixed(1) : 'N/A'}%
Rotación: ${layer.rotation ? layer.rotation : 0}°
Opacidad: ${layer.opacity ? (layer.opacity * 100).toFixed(0) : 100}%
Posición: X: ${Math.round(layer.x)}, Y: ${Math.round(layer.y)}
    `
    alert(info)
  }
}
