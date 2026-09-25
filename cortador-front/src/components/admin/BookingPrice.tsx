import { useState } from "react";
import { ApiError } from "../../api/client";
import { formatEuros } from "../../format";
import type { BookingResponse, PriceAdjustmentRequest } from "../../types";
import { Field, inputClass } from "../FormField";

interface BookingPriceProps {
  booking: BookingResponse;
  onAdjust: (booking: BookingResponse, data: PriceAdjustmentRequest) => Promise<void>;
}

// "A consultar" cuando un importe no se pudo calcular (null).
function amountOrOnRequest(amount: number | null): string {
  return amount !== null ? formatEuros(amount) : "a consultar";
}

// Bloque de precio de una reserva en el panel: el desglose que vio el
// cliente, el precio final si el cortador lo ha ajustado (con su motivo)
// y el formulario para ajustarlo.
export default function BookingPrice({ booking, onAdjust }: BookingPriceProps) {
  const [editing, setEditing] = useState(false);
  const [finalPrice, setFinalPrice] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const adjusted = booking.finalPrice !== null;
  const canAdjust = booking.status !== "CANCELLED";

  function startEditing() {
    // Se parte del precio vigente: el ajustado si lo hay, o el calculado.
    const current = booking.finalPrice ?? booking.estimatedPrice;
    setFinalPrice(current !== null ? String(current) : "");
    setNote(booking.priceNote ?? "");
    setError(null);
    setFieldErrors({});
    setEditing(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);
    try {
      await onAdjust(booking, { finalPrice: Number(finalPrice), note });
      setEditing(false);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof ApiError ? err.message : "No se ha podido cambiar el precio.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl bg-surface-alt px-4 py-3 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-ink">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Precio </span>
          <strong className="font-display text-lg">
            {adjusted ? formatEuros(booking.finalPrice!) : amountOrOnRequest(booking.estimatedPrice)}
          </strong>
          {/* Si se ajustó, se enseña también el calculado tachado. */}
          {adjusted && booking.estimatedPrice !== null && (
            <span className="ml-2 text-ink-muted line-through">{formatEuros(booking.estimatedPrice)}</span>
          )}
        </p>
        {canAdjust && !editing && (
          <button
            type="button"
            onClick={startEditing}
            className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            Ajustar precio
          </button>
        )}
      </div>

      {adjusted && booking.priceNote && <p className="mt-1 text-ink-muted">Motivo: {booking.priceNote}</p>}

      <p className="mt-1 text-xs text-ink-muted">
        Calculado: servicio {amountOrOnRequest(booking.serviceCost)}
        {booking.hamCost !== null && ` · jamón ${formatEuros(booking.hamCost)}`}
        {" · "}desplazamiento {booking.distanceKm === 0 ? "sin coste" : amountOrOnRequest(booking.travelCost)}
      </p>

      {editing && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-border pt-3">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
            <Field label="Precio final (€)" error={fieldErrors.finalPrice}>
              <input
                required
                type="number"
                min={0}
                step={0.01}
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Motivo" error={fieldErrors.note}>
              <input
                required
                type="text"
                maxLength={255}
                placeholder="Ej.: Descuento aplicado, según lo hablado por teléfono..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-600 px-4 py-1.5 font-medium text-surface transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar precio"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="rounded-full border border-border px-4 py-1.5 font-medium text-ink transition-colors hover:border-brand-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
