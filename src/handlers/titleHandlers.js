/**
 * TITLE HANDLERS
 * 
 * Manejo de eventos del título
 * - handleTitleClick: Detectar triple clic en el título para alternar consola de debug
 */

export const handleTitleClick = (titleClickCountRef, titleClickTimerRef, setDebugConsoleVisible) => {
  console.log('=== TITLE CLICK === count:', titleClickCountRef.current + 1)
  titleClickCountRef.current += 1
  
  if (titleClickCountRef.current === 1) {
    titleClickTimerRef.current = setTimeout(() => {
      console.log('Triple clic timeout - reset count')
      titleClickCountRef.current = 0
    }, 500)
  } else if (titleClickCountRef.current === 3) {
    console.log('TRIPLE CLIC DETECTADO - toggle console')
    clearTimeout(titleClickTimerRef.current)
    titleClickCountRef.current = 0
    setDebugConsoleVisible(!setDebugConsoleVisible)
  }
}
