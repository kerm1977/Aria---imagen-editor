/**
 * GET CURRENT RATIO
 * 
 * Obtiene el ratio de aspecto actual
 */

import { aspectRatios } from './aspectRatios.js'

export const getCurrentRatio = (aspectRatio) => {
  return aspectRatios.find(r => r.value === aspectRatio) || aspectRatios[0]
}
