/**
 * KEYBOARD HANDLERS
 * 
 * Event handlers del teclado
 */

import { useEffect, useRef } from 'react'
import { deleteLayer } from '../utils/layerManagementUtilsRefactored.js'

export const useKeyboardHandlers = (selectedLayerId, layers, setLayers, fileInputRef, setIsShiftPressed, setIsCtrlPressed, setIsRPressed, setIsSPressed, setIsGPressed, setIsSpacePressed) => {
  const selectedLayerIdRef = useRef(selectedLayerId)
  const layersRef = useRef(layers)
  const isRPressedRef = useRef(false)
  const isSPressedRef = useRef(false)
  const isGPressedRef = useRef(false)
  
  // Update refs when values change
  useEffect(() => {
    selectedLayerIdRef.current = selectedLayerId
    layersRef.current = layers
  }, [selectedLayerId, layers])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
      if (e.key === 'Control') {
        setIsCtrlPressed(true)
      }
      if (e.key === 'r' || e.key === 'R') {
        setIsRPressed(true)
        isRPressedRef.current = true
      }
      if (e.key === 's' || e.key === 'S') {
        setIsSPressed(true)
        isSPressedRef.current = true
      }
      if (e.key === 'g' || e.key === 'G') {
        setIsGPressed(true)
        isGPressedRef.current = true
      }
      if (e.key === ' ') {
        setIsSpacePressed(true)
        e.preventDefault()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerIdRef.current) {
          deleteLayer(selectedLayerIdRef.current, layersRef.current, setLayers, selectedLayerIdRef.current, null, () => {})
        }
      }
      
      // Shift + A to open image upload dialog
      if (e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        fileInputRef.current?.click()
      }
      
      // Rotate with R + Arrow keys
      if (isRPressedRef.current && selectedLayerIdRef.current) {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              return {
                ...layer,
                rotation: (layer.rotation || 0) + 5
              }
            }
            return layer
          }))
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              return {
                ...layer,
                rotation: (layer.rotation || 0) - 5
              }
            }
            return layer
          }))
        }
      }
      
      // Scale with S + Arrow keys
      if (isSPressedRef.current && selectedLayerIdRef.current) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'image') {
                return {
                  ...layer,
                  scale: Math.max(0.1, (layer.scale || 1) + 0.05)
                }
              } else if (layer.type === 'circle') {
                return {
                  ...layer,
                  radius: Math.max(10, layer.radius + 2)
                }
              } else if (layer.type === 'square') {
                return {
                  ...layer,
                  size: Math.max(20, layer.size + 4)
                }
              } else if (layer.type === 'text' || layer.type === 'emoji') {
                return {
                  ...layer,
                  fontSize: Math.max(12, (layer.fontSize || 48) + 2)
                }
              }
            }
            return layer
          }))
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setLayers(layersRef.current.map(layer => {
            if (layer.id === selectedLayerIdRef.current) {
              if (layer.type === 'image') {
                return {
                  ...layer,
                  scale: Math.max(0.1, (layer.scale || 1) - 0.05)
                }
              } else if (layer.type === 'circle') {
                return {
                  ...layer,
                  radius: Math.max(10, layer.radius - 2)
                }
              } else if (layer.type === 'square') {
                return {
                  ...layer,
                  size: Math.max(20, layer.size - 4)
                }
              } else if (layer.type === 'text' || layer.type === 'emoji') {
                return {
                  ...layer,
                  fontSize: Math.max(12, (layer.fontSize || 48) - 2)
                }
              }
            }
            return layer
          }))
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
      if (e.key === 'Control') {
        setIsCtrlPressed(false)
      }
      if (e.key === 'r' || e.key === 'R') {
        setIsRPressed(false)
        isRPressedRef.current = false
      }
      if (e.key === 's' || e.key === 'S') {
        setIsSPressed(false)
        isSPressedRef.current = false
      }
      if (e.key === 'g' || e.key === 'G') {
        setIsGPressed(false)
        isGPressedRef.current = false
      }
      if (e.key === ' ') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setIsShiftPressed, setIsCtrlPressed, setIsRPressed, setIsSPressed, setIsGPressed, setIsSpacePressed, fileInputRef, setLayers])
}
