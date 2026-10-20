import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminAvailability, getAvailabilityRules } from "../../api/availability";
import { getBookings } from "../../api/bookings";
import AvailabilityRules from "../../components/admin/AvailabilityRules";
import DayDetail from "../../components/admin/DayDetail";
import CalendarLegend from "../../components/calendar/CalendarLegend";
import { monthOf, todayIso } from "../../components/calendar/dates";
import MonthCalendar from "../../components/calendar/MonthCalendar";
import { Field, inputClass } from "../../components/FormField";
import { useMonthAvailability } from "../../hooks/useMonthAvailability";
import type { AvailabilityRule, BookingResponse } from "../../types";

// Pantalla "Calendario" del panel: el mismo calendario que ve el cliente,
// pero el cortador puede pulsar cualquier día para ver sus reservas y
// marcarlo, buscar una fecha concreta y gestionar sus reglas habituales.
export default function AdminCalendar() {
  const [month, setMonth] = useState(() => monthOf(todayIso()));
  const [selectedDate, setSelectedDate] = useState<string>(() => todayIso());
  // Cambia cada vez que se guarda algo, para volver a pedir el mes.
  const [reloadKey, setReloadKey] = useState(0);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [rules, setRules] = useState<AvailabilityRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { days, occupancy, error: calendarError } = useMonthAvailability(getAdminAvailability, month, reloadKey);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Reservas (para ver las de cada día) y reglas, una vez al entrar.
  useEffect(() => {
    Promise.all([getBookings(), getAvailabilityRules()])
      .then(([loadedBookings, loadedRules]) => {
        setBookings(loadedBookings);
        setRules(loadedRules);
      })
      .catch(() => setError("No se ha podido cargar el calendario. Inténtalo de nuevo."));
  }, []);

  const dayBookings = useMemo(
    () => bookings.filter((booking) => booking.eventDate === selectedDate && booking.status !== "CANCELLED"),
    [bookings, selectedDate],
  );

  // Buscador de fecha: salta al mes de ese día y lo abre.
  function goToDate(isoDate: string) {
    if (!isoDate) return;
    setMonth(monthOf(isoDate));
    setSelectedDate(isoDate);
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Calendario</h1>
      <p className="mt-1 max-w-xl text-ink-muted">
        Pulsa un día para ver sus reservas o marcarlo como ocupado. Tus clientes solo ven qué está ocupado, nunca
        por qué.
      </p>

      {(error || calendarError) && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? calendarError}
        </div>
      )}

      <div className="mt-8 max-w-xs">
        <Field label="Buscar un día">
          <input type="date" value={selectedDate} onChange={(e) => goToDate(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            occupancy={occupancy}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <CalendarLegend />
        </div>
        <DayDetail
          date={selectedDate}
          day={days.find((day) => day.date === selectedDate)}
          bookings={dayBookings}
          onChanged={reload}
        />
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-ink">Reglas habituales</h2>
      <p className="mt-1 max-w-xl text-sm text-ink-muted">
        Días de la semana que nunca puedes trabajar (por ejemplo, porque trabajas en otra cosa). Se marcan solos en el
        calendario. Si un día concreto sí puedes, márcalo como libre arriba.
      </p>
      <div className="mt-4">
        {rules && <AvailabilityRules initialRules={rules} onChanged={reload} />}
      </div>
    </section>
  );
}
