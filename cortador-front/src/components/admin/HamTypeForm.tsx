import { useState } from "react";
import { ApiError } from "../../api/client";
import type { HamType, HamTypeRequest } from "../../types";
import { Field, inputClass } from "../FormField";

interface HamTypeFormProps {
  // Si llega un jamón, el formulario sale relleno (modo edición);
  // si no, sale vacío (modo "añadir").
  initial?: HamType;
  submitLabel: string;
  onSubmit: (data: HamTypeRequest) => Promise<void>;
  onCancel: () => void;
}

// Formulario de un jamón del catálogo. Se usa igual para crear y para
// editar: solo cambia con qué datos empieza y qué hace al guardar.
export default function HamTypeForm({ initial, submitLabel, onSubmit, onCancel }: HamTypeFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);

    try {
      await onSubmit({
        name,
        description: description || undefined,
        price: Number(price),
        active: initial?.active,
      });
    } catch (err) {
      // Si el backend rechaza algún campo, lo marcamos debajo de ese campo.
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof ApiError ? err.message : "No se ha podido guardar el jamón.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-brand-400 bg-surface p-5">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field label="Nombre" error={fieldErrors.name}>
          <input
            required
            type="text"
            maxLength={100}
            placeholder="Ej.: Jamón de bellota ibérico"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Precio (€)" error={fieldErrors.price}>
          <input
            required
            type="number"
            min={0.01}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Descripción (opcional)" error={fieldErrors.description}>
        <input
          type="text"
          maxLength={255}
          placeholder="Ej.: Pieza de 7-8 kg, curación mínima de 36 meses"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

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
