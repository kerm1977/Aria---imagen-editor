/**
 * RESET CONFIRMATION MODAL
 * 
 * Modal de confirmación para restablecer transformaciones de una capa
 */

export default function ResetConfirmationModal({ visible, onConfirm, onCancel }) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Restablecer Transformaciones</h3>
        <p className="text-sm text-muted-foreground mb-4">
          ¿Estás seguro de que deseas restablecer todas las transformaciones de esta capa a sus valores predeterminados? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-sm font-medium transition"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  )
}
