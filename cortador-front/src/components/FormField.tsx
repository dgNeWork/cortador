// Estilo común para todos los inputs, select y textarea de los
// formularios de la web (reserva, login del admin...).
export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-brand-500";

// Envuelve un input con su etiqueta encima y el mensaje de error debajo
// (si lo hay), para no repetir ese bloque en cada campo del formulario.
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-muted">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
