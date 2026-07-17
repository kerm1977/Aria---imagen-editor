/**
 * APP HEADER
 * 
 * Componente para el header de la aplicación
 */

export default function AppHeader({ handleTitleClick }) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border">
      <h1 
        className="text-2xl font-bold text-primary cursor-pointer select-none"
        onClick={handleTitleClick}
        title="Haz clic 3 veces para mostrar/ocultar consola de depuración"
      >
        Aria Photo Editor
      </h1>
    </header>
  )
}
