/**
 * CREATE HANDLE TITLE CLICK
 * 
 * Crea una función para manejar el clic en el título
 */

export const createHandleTitleClick = (titleClickCountRef, titleClickTimerRef, setDebugConsoleVisible) => {
  return () => {
    titleClickCountRef.current += 1
    
    if (titleClickCountRef.current === 5) {
      setDebugConsoleVisible(prev => !prev)
      titleClickCountRef.current = 0
    }
    
    if (titleClickTimerRef.current) {
      clearTimeout(titleClickTimerRef.current)
    }
    
    titleClickTimerRef.current = setTimeout(() => {
      titleClickCountRef.current = 0
    }, 2000)
  }
}
