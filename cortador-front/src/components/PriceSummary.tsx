import { formatEuros } from "../format";
import type { Quote } from "../types";

interface PriceSummaryProps {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
}

// Una línea del desglose: concepto a la izquierda, importe a la derecha.
function Line({ label, detail, amount }: { label: string; detail?: string; amount: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-ink">
        {label}
        {detail && <span className="block text-xs text-ink-muted">{detail}</span>}
      </dt>
      <dd className="shrink-0 font-medium text-ink">{amount}</dd>
    </div>
  );
}

// Texto del importe del desplazamiento: sin coste en la localidad del
// cortador, "a consultar" fuera de su lista, o los euros.
function travelAmount(quote: Quote): string {
  if (quote.travelCost === null) return "A consultar";
  if (quote.distanceKm === 0) return "Sin coste";
  return formatEuros(quote.travelCost);
}

// Caja con el precio desglosado que ve el cliente antes de enviar la
// reserva. Solo pinta lo que le llega: el cálculo lo hace el backend.
export default function PriceSummary({ quote, loading, error }: PriceSummaryProps) {
  if (error) {
    return <p className="rounded-xl bg-surface-alt px-5 py-4 text-sm text-ink-muted">{error}</p>;
  }
  if (!quote) {
    return (
      <p className="rounded-xl bg-surface-alt px-5 py-4 text-sm text-ink-muted">
        {loading ? "Calculando precio..." : "Completa la duración, el servicio y la localidad para ver el precio."}
      </p>
    );
  }

  return (
    // aria-live: los lectores de pantalla anuncian el precio cuando cambia.
    <div aria-live="polite" className={`rounded-xl bg-surface-alt px-5 py-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
      <dl className="divide-y divide-border text-sm">
        <Line
          label="Servicio de corte"
          detail={quote.hourlyRate !== null ? `${quote.hours} h × ${formatEuros(quote.hourlyRate)}` : undefined}
          amount={quote.serviceCost !== null ? formatEuros(quote.serviceCost) : "A consultar"}
        />
        {quote.hamCost !== null && (
          <Line label="Jamón" detail={quote.hamTypeName ?? undefined} amount={formatEuros(quote.hamCost)} />
        )}
        <Line
          label="Desplazamiento"
          detail={quote.distanceKm ? `${quote.localityName} · ${quote.distanceKm} km` : quote.localityName}
          amount={travelAmount(quote)}
        />
        <div className="flex items-baseline justify-between gap-4 pt-3">
          <dt className="font-display text-lg font-semibold text-ink">Total</dt>
          <dd className="font-display text-xl font-semibold text-ink">
            {quote.total !== null ? formatEuros(quote.total) : "A consultar"}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-ink-muted">
        {quote.onRequest
          ? "El cortador te dirá el precio final cuando se ponga en contacto contigo."
          : "Precio según las tarifas del cortador. Te lo confirmará cuando se ponga en contacto contigo."}
      </p>
    </div>
  );
}
