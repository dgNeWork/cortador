import { useCallback, useEffect, useMemo, useState } from "react";
import { getBookings, updateBookingStatus } from "../../api/bookings";
import { ApiError } from "../../api/client";
import BookingCard from "../../components/admin/BookingCard";
import type { BookingAction } from "../../components/admin/bookingActions";
import { BOOKING_STATUS_LABELS } from "../../labels";
import type { BookingResponse, BookingStatus } from "../../types";

// Pestañas del filtro. "ALL" no es un estado real, es "ver todas".
type StatusFilter = BookingStatus | "ALL";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "ALL", label: "Todas" },
];

// Ordena por fecha y hora del evento, la más cercana primero, que es lo
// que el cortador necesita ver antes. Las fechas "yyyy-MM-dd" y horas
// "HH:mm" se pueden comparar como texto porque van con ceros delante.
function byEventDate(a: BookingResponse, b: BookingResponse): number {
  return `${a.eventDate}T${a.eventTime}`.localeCompare(`${b.eventDate}T${b.eventTime}`);
}

// Panel principal del cortador: lista de reservas con filtro por estado
// y botones para ir moviéndolas de estado.
export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  // Id de la reserva que se está actualizando, para desactivar sus
  // botones mientras tanto y evitar dobles clics.
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Pide las reservas al backend. Los setState van dentro de .then/.catch
  // (cuando llega la respuesta), nunca directamente en el useEffect.
  const fetchBookings = useCallback(
    () =>
      getBookings()
        .then((data) => {
          setBookings(data);
          setError(null);
        })
        .catch(() => {
          // Si el fallo es un 401, apiFetch ya ha cerrado la sesión y el
          // ProtectedRoute nos lleva al login; este mensaje es para el resto.
          setError("No se han podido cargar las reservas. Inténtalo de nuevo.");
        })
        .finally(() => setLoading(false)),
    [],
  );

  // Primera carga al entrar en el panel ("loading" ya empieza en true).
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Botón "Actualizar": por si han entrado reservas nuevas mientras el
  // panel estaba abierto.
  function handleRefresh() {
    setLoading(true);
    fetchBookings();
  }

  // Cuántas reservas hay en cada estado, para mostrarlo en las pestañas.
  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      ALL: bookings.length,
    };
    bookings.forEach((booking) => result[booking.status]++);
    return result;
  }, [bookings]);

  const visibleBookings = useMemo(
    () => bookings.filter((b) => filter === "ALL" || b.status === filter).sort(byEventDate),
    [bookings, filter],
  );

  async function handleAction(booking: BookingResponse, action: BookingAction) {
    if (action.confirmMessage && !window.confirm(action.confirmMessage)) {
      return;
    }

    setError(null);
    setUpdatingId(booking.id);
    try {
      const updated = await updateBookingStatus(booking.id, action.targetStatus);
      // Sustituimos solo la reserva cambiada, sin volver a pedir la lista.
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido actualizar la reserva.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Reservas</h1>
          <p className="mt-1 text-ink-muted">Confirma, completa o cancela las solicitudes de tus clientes.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand-400 disabled:opacity-60"
        >
          Actualizar
        </button>
      </div>

      <nav aria-label="Filtrar por estado" className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === value ? "bg-ink text-surface" : "bg-surface-alt text-ink-muted hover:text-ink"
            }`}
          >
            {label} ({counts[value]})
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading && <p className="text-ink-muted">Cargando reservas...</p>}

        {!loading && visibleBookings.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-ink-muted">
            {filter === "ALL"
              ? "Todavía no hay ninguna reserva."
              : `No hay reservas en estado "${BOOKING_STATUS_LABELS[filter].toLowerCase()}".`}
          </p>
        )}

        {!loading &&
          visibleBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              updating={updatingId === booking.id}
              onAction={handleAction}
            />
          ))}
      </div>
    </section>
  );
}
