import { useEffect, useState } from "react";
import { monthRange, type CalendarMonth } from "../components/calendar/dates";
import type { SlotCoverage } from "../types";

interface DayWithOccupancy {
  date: string;
  occupied: SlotCoverage;
}

interface Result<T> {
  key: string;
  days: T[];
  error: string | null;
}

/**
 * Pide al backend la disponibilidad del mes que se está viendo y la
 * vuelve a pedir al cambiar de mes (o cuando cambia "reloadKey", por
 * ejemplo después de que el cortador marque un día).
 *
 * "fetcher" es la función de la API: la pública en el formulario y la del
 * panel en el calendario del cortador. Igual que en useQuote, cada
 * respuesta se guarda con la clave del mes que la pidió, para no enseñar
 * nunca los datos de un mes anterior si las respuestas llegan desordenadas.
 */
export function useMonthAvailability<T extends DayWithOccupancy>(
  fetcher: (from: string, to: string) => Promise<T[]>,
  month: CalendarMonth,
  reloadKey = 0,
) {
  const { from, to } = monthRange(month);
  const key = `${from}|${reloadKey}`;
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher(from, to)
      .then((days) => {
        if (!cancelled) setResult({ key, days, error: null });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, days: [], error: "No se ha podido cargar el calendario." });
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, from, to, key]);

  const current = result?.key === key ? result : null;
  const days = current?.days ?? [];
  // Ocupación por fecha, que es lo que necesita MonthCalendar.
  const occupancy: Record<string, SlotCoverage> = {};
  days.forEach((day) => {
    occupancy[day.date] = day.occupied;
  });

  return { days, occupancy, loading: current === null, error: current?.error ?? null };
}
