import { useState } from "react";
import { ApiError } from "../../api/client";
import type { Locality, LocalityRequest } from "../../types";
import { Field, inputClass } from "../FormField";

interface LocalityFormProps {
  // Con localidad = modo edición (sale rellena); sin ella = modo "añadir".
  initial?: Locality;
  submitLabel: string;
  onSubmit: (data: LocalityRequest) => Promise<void>;
  onCancel: () => void;
}

// Formulario de una localidad (nombre + km). Mismo patrón que HamTypeForm:
// uno solo para crear y editar.
export default function LocalityForm({ initial, submitLabel, onSubmit, onCancel }: LocalityFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [distanceKm, setDistanceKm] = useState(initial ? String(initial.distanceKm) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);

    try {
      await onSubmit({ name, distanceKm: Number(distanceKm) });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        // Por ejemplo "Ya tienes Cádiz en la lista".
        setError(err instanceof ApiError ? err.message : "No se ha podido guardar la localidad.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-brand-400 bg-surface p-4">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <Field label="Localidad" error={fieldErrors.name}>
          <input
            required
            type="text"
            maxLength={100}
            placeholder="Ej.: Cádiz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Km ida y vuelta" error={fieldErrors.distanceKm}>
          <input
            required
            type="number"
            min={1}
            max={2000}
            step={1}
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-surface transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-brand-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
