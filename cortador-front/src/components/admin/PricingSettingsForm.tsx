import { useState } from "react";
import { ApiError } from "../../api/client";
import { updatePricingSettings } from "../../api/pricing";
import type { PricingSettings } from "../../types";
import { Field, inputClass } from "../FormField";

interface PricingSettingsFormProps {
  initial: PricingSettings;
  onSaved: (settings: PricingSettings) => void;
}

// Formulario con las tarifas del cortador: precio por hora de corte,
// precio por km y su localidad (donde no cobra desplazamiento).
export default function PricingSettingsForm({ initial, onSaved }: PricingSettingsFormProps) {
  // Los números van como texto en el estado (igual que en el formulario
  // de reserva) para poder dejar el campo vacío mientras se escribe.
  const [hourlyRate, setHourlyRate] = useState(initial.hourlyRate?.toString() ?? "");
  const [pricePerKm, setPricePerKm] = useState(initial.pricePerKm?.toString() ?? "");
  const [homeLocality, setHomeLocality] = useState(initial.homeLocality ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaved(false);
    setSaving(true);

    try {
      const result = await updatePricingSettings({
        hourlyRate: Number(hourlyRate),
        pricePerKm: Number(pricePerKm),
        homeLocality,
      });
      onSaved(result);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof ApiError ? err.message : "No se han podido guardar las tarifas.");
      }
    } finally {
      setSaving(false);
    }
  }

  // Cualquier cambio en un campo quita el aviso de "guardado".
  function edit(setter: (value: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setSaved(false);
    };
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Precio por hora de corte (€)" error={fieldErrors.hourlyRate}>
          <input required type="number" min={0} step={0.01} value={hourlyRate} onChange={edit(setHourlyRate)} className={inputClass} />
        </Field>
        <Field label="Precio por km (€)" error={fieldErrors.pricePerKm}>
          <input required type="number" min={0} step={0.01} value={pricePerKm} onChange={edit(setPricePerKm)} className={inputClass} />
        </Field>
        <Field label="Tu localidad" error={fieldErrors.homeLocality}>
          <input required type="text" maxLength={100} value={homeLocality} onChange={edit(setHomeLocality)} className={inputClass} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-surface transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar tarifas"}
        </button>
        {/* role="status": los lectores de pantalla anuncian el mensaje. */}
        {saved && (
          <span role="status" className="text-sm font-medium text-emerald-700">
            Tarifas guardadas.
          </span>
        )}
      </div>
    </form>
  );
}
