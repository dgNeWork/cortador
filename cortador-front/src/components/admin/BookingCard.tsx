import { BOOKING_STATUS_LABELS, EVENT_TYPE_LABELS, SERVICE_TYPE_LABELS } from "../../labels";
import type { BookingResponse, BookingStatus, PriceAdjustmentRequest } from "../../types";
import BookingPrice from "./BookingPrice";
import { BOOKING_ACTIONS, type BookingAction } from "./bookingActions";

// Color de la etiqueta de estado, para distinguir las reservas de un
// vistazo en la lista.
const STATUS_BADGE_CLASSES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const ACTION_BUTTON_CLASSES: Record<BookingAction["variant"], string> = {
  primary: "bg-brand-600 text-surface hover:bg-brand-700",
  secondary: "border border-border bg-surface text-ink hover:border-brand-400",
  danger: "border border-red-200 bg-surface text-red-700 hover:bg-red-50",
};

// El backend manda la fecha como "2026-10-12". La convertimos en algo
// más legible ("sábado, 12 de octubre de 2026"). Se construye la fecha
// con año/mes/día por separado para que no se desplace un día por la
// zona horaria.
function formatEventDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface BookingCardProps {
  booking: BookingResponse;
  updating: boolean;
  onAction: (booking: BookingResponse, action: BookingAction) => void;
  onAdjustPrice: (booking: BookingResponse, data: PriceAdjustmentRequest) => Promise<void>;
}

// Tarjeta con toda la información de una reserva y los botones para
// cambiar su estado. Solo muestra datos: la llamada al backend la hace
// el panel (AdminDashboard), que es quien recibe onAction.
export default function BookingCard({ booking, updating, onAction, onAdjustPrice }: BookingCardProps) {
  const actions = BOOKING_ACTIONS[booking.status];

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold capitalize text-ink">
            {formatEventDate(booking.eventDate)}
          </p>
          <p className="text-sm text-ink-muted">
            {booking.eventTime.slice(0, 5)} h · {booking.estimatedDurationHours} h de servicio ·{" "}
            {EVENT_TYPE_LABELS[booking.eventType]}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[booking.status]}`}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </header>

      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <Detail label="Cliente">{booking.customerName}</Detail>
        <Detail label="Contacto">
          {/* Enlaces directos: en el móvil, pulsar el teléfono llama y
              pulsar el email abre el correo. */}
          <a href={`tel:${booking.customerPhone}`} className="block text-brand-700 hover:underline">
            {booking.customerPhone}
          </a>
          <a href={`mailto:${booking.customerEmail}`} className="block break-all text-brand-700 hover:underline">
            {booking.customerEmail}
          </a>
        </Detail>
        <Detail label="Lugar">
          {booking.location}
          {booking.localityName && <span className="block text-ink-muted">{booking.localityName}</span>}
        </Detail>
        <Detail label="Invitados">{booking.guestCount}</Detail>
        <Detail label="Servicio">
          {SERVICE_TYPE_LABELS[booking.serviceType]}
          {booking.hamTypeName && ` · ${booking.hamTypeName}`}
        </Detail>
        {booking.notes && (
          <div className="sm:col-span-2">
            <Detail label="Notas">{booking.notes}</Detail>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <BookingPrice booking={booking} onAdjust={onAdjustPrice} />
      </div>

      {actions.length > 0 && (
        <footer className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {actions.map((action) => (
            <button
              key={action.targetStatus}
              type="button"
              disabled={updating}
              onClick={() => onAction(booking, action)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${ACTION_BUTTON_CLASSES[action.variant]}`}
            >
              {action.label}
            </button>
          ))}
        </footer>
      )}
    </article>
  );
}

// Un par "etiqueta: valor" de la ficha de la reserva.
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}
