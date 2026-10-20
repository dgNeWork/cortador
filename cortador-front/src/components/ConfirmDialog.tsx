import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  // Mientras se envía: los botones se desactivan para evitar dobles clics.
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

// Ventana que se abre encima de la página para que el usuario revise algo
// antes de hacerlo (por ejemplo, los datos de su solicitud antes de
// enviarla). Se cierra con "Cancelar", con la tecla Escape o pulsando
// fuera de la ventana.
export default function ConfirmDialog({
  open,
  title,
  confirmLabel,
  cancelLabel,
  busy = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  // Id único para enlazar la ventana con su título (lo leen los lectores
  // de pantalla al abrirse).
  const titleId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Al abrirse, el foco pasa al botón de confirmar (así se puede usar con
  // el teclado), y Escape cierra la ventana.
  useEffect(() => {
    if (!open) return;
    confirmButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-4 sm:items-center"
          onClick={() => {
            if (!busy) onCancel();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            exit={{ y: 24 }}
            transition={{ duration: 0.2 }}
            // Los clics dentro de la ventana no deben cerrarla.
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-surface shadow-xl"
          >
            <h2 id={titleId} className="px-6 pt-6 font-display text-2xl font-semibold text-ink">
              {title}
            </h2>
            {/* El contenido puede ser largo en el móvil: solo él hace scroll,
                los botones quedan siempre a la vista. */}
            <div className="mt-4 overflow-y-auto px-6">{children}</div>
            <div className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand-400 disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? "Enviando..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
