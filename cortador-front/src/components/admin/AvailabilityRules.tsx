import { useState } from "react";
import { createAvailabilityRule, deleteAvailabilityRule, updateAvailabilityRule } from "../../api/availability";
import { ApiError } from "../../api/client";
import { formatEventDate } from "../../format";
import { DAY_OF_WEEK_LABELS, SLOT_COVERAGE_LABELS } from "../../labels";
import type { AvailabilityRule, AvailabilityRuleRequest } from "../../types";
import AvailabilityRuleForm from "./AvailabilityRuleForm";

interface AvailabilityRulesProps {
  initialRules: AvailabilityRule[];
  // Se llama cuando cambia alguna regla, para repintar el calendario.
  onChanged: () => void;
}

// "Lunes, Martes · Día completo ocupado · del 1 de noviembre... al ..."
function describe(rule: AvailabilityRule): string {
  const days = rule.daysOfWeek.map((day) => DAY_OF_WEEK_LABELS[day]).join(", ");
  let period = "siempre";
  if (rule.startDate && rule.endDate) {
    period = `del ${formatEventDate(rule.startDate).toLowerCase()} al ${formatEventDate(rule.endDate).toLowerCase()}`;
  } else if (rule.startDate) {
    period = `desde el ${formatEventDate(rule.startDate).toLowerCase()}`;
  } else if (rule.endDate) {
    period = `hasta el ${formatEventDate(rule.endDate).toLowerCase()}`;
  }
  return `${days} · ${SLOT_COVERAGE_LABELS[rule.coverage]} · ${period}`;
}

// Reglas habituales del cortador ("de lunes a viernes, día completo"):
// añadir, editar y borrar. Cada cambio se ve enseguida en el calendario.
export default function AvailabilityRules({ initialRules, onChanged }: AvailabilityRulesProps) {
  const [rules, setRules] = useState(initialRules);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function upsert(saved: AvailabilityRule) {
    setRules((prev) => [...prev.filter((rule) => rule.id !== saved.id), saved].sort((a, b) => a.id - b.id));
    onChanged();
  }

  async function handleCreate(data: AvailabilityRuleRequest) {
    upsert(await createAvailabilityRule(data));
    setCreating(false);
  }

  async function handleUpdate(id: number, data: AvailabilityRuleRequest) {
    upsert(await updateAvailabilityRule(id, data));
    setEditingId(null);
  }

  async function handleDelete(rule: AvailabilityRule) {
    if (!window.confirm("¿Borrar esta regla? Los días que ocupaba quedarán libres.")) {
      return;
    }
    setError(null);
    try {
      await deleteAvailabilityRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido borrar la regla.");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {rules.length === 0 && !creating && (
        <p className="rounded-2xl border border-dashed border-border px-6 py-8 text-center text-ink-muted">
          No tienes reglas. Si hay días de la semana que nunca puedes trabajar, añade una y se marcarán solos.
        </p>
      )}

      {rules.map((rule) =>
        editingId === rule.id ? (
          <AvailabilityRuleForm
            key={rule.id}
            initial={rule}
            submitLabel="Guardar cambios"
            onSubmit={(data) => handleUpdate(rule.id, data)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <article
            key={rule.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-3"
          >
            <p className="text-sm text-ink">{describe(rule)}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingId(rule.id)}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:border-brand-400"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(rule)}
                className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                Borrar
              </button>
            </div>
          </article>
        ),
      )}

      {creating ? (
        <AvailabilityRuleForm submitLabel="Añadir regla" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-surface transition-colors hover:bg-brand-700"
        >
          Añadir regla
        </button>
      )}
    </div>
  );
}
