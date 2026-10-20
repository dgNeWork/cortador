import { useState } from "react";
import { ApiError } from "../../api/client";
import { DAY_OF_WEEK_LABELS } from "../../labels";
import type { AvailabilityRule, AvailabilityRuleRequest, DayOfWeek, SlotCoverage } from "../../types";
import { Field, inputClass } from "../FormField";

const DAYS = Object.keys(DAY_OF_WEEK_LABELS) as DayOfWeek[];

const COVERAGE_OPTIONS: { value: SlotCoverage; label: string }[] = [
  { value: "FULL_DAY", label: "Día completo" },
  { value: "MIDDAY", label: "Mañana/tarde" },
  { value: "EVENING", label: "Tarde/noche" },
];

interface AvailabilityRuleFormProps {
  initial?: AvailabilityRule;
  submitLabel: string;
  onSubmit: (data: AvailabilityRuleRequest) => Promise<void>;
  onCancel: () => void;
}

// Formulario de una regla habitual: casillas de los días, qué parte del
// día ocupa y, si quiere, desde y hasta qué fecha. Muy simple a propósito:
// los cortadores que lo usan no se manejan mucho con la tecnología.
export default function AvailabilityRuleForm({ initial, submitLabel, onSubmit, onCancel }: AvailabilityRuleFormProps) {
  const [days, setDays] = useState<DayOfWeek[]>(initial?.daysOfWeek ?? []);
  const [coverage, setCoverage] = useState<SlotCoverage>(initial?.coverage ?? "FULL_DAY");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: DayOfWeek) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (days.length === 0) {
      setError("Elige al menos un día de la semana");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        daysOfWeek: days,
        coverage,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido guardar la regla.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-brand-400 bg-surface p-5">
      <fieldset>
        <legend className="text-sm font-medium text-ink-muted">Días de la semana</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <label key={day} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-ink">
              <input type="checkbox" checked={days.includes(day)} onChange={() => toggleDay(day)} />
              {DAY_OF_WEEK_LABELS[day]}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Qué tienes ocupado esos días">
        <select value={coverage} onChange={(e) => setCoverage(e.target.value as SlotCoverage)} className={inputClass}>
          {COVERAGE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Desde (opcional)">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Hasta (opcional)">
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <p className="text-xs text-ink-muted">Sin fechas, la regla vale para siempre.</p>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-surface transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-brand-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
