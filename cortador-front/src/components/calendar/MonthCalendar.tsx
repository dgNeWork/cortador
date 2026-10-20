import { formatEventDate } from "../../format";
import { SLOT_COVERAGE_LABELS } from "../../labels";
import type { SlotCoverage } from "../../types";
import { addMonths, formatMonth, monthWeeks, todayIso, type CalendarMonth } from "./dates";

// Color de cada día según lo que tenga ocupado (los colores están en
// index.css, para que cada cortador pueda cambiarlos).
const COVERAGE_CLASSES: Record<SlotCoverage, string> = {
  NONE: "bg-surface text-ink border border-border",
  MIDDAY: "bg-slot-midday text-ink",
  EVENING: "bg-slot-evening text-surface",
  FULL_DAY: "bg-slot-full text-surface",
};

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

interface MonthCalendarProps {
  month: CalendarMonth;
  onMonthChange: (month: CalendarMonth) => void;
  // Ocupación de cada día ("yyyy-MM-dd"); los que no están, libres.
  occupancy: Record<string, SlotCoverage>;
  selectedDate: string | null;
  onSelectDate: (isoDate: string) => void;
  // Días que no se pueden pulsar (en el formulario: pasados o completos).
  isDayDisabled?: (isoDate: string, coverage: SlotCoverage) => boolean;
  // false para no dejar ir a meses anteriores al actual (formulario).
  allowPastMonths?: boolean;
}

/**
 * Calendario de un mes, de lunes a domingo, con cada día pintado según su
 * ocupación. Lo usan el formulario de reserva (modo cliente) y el panel
 * del cortador: solo cambia qué días se pueden pulsar y qué pasa al
 * pulsarlos, que lo decide quien lo usa.
 */
export default function MonthCalendar({
  month,
  onMonthChange,
  occupancy,
  selectedDate,
  onSelectDate,
  isDayDisabled = () => false,
  allowPastMonths = true,
}: MonthCalendarProps) {
  const today = todayIso();
  const current = new Date();
  const isCurrentMonth = month.year === current.getFullYear() && month.month === current.getMonth();
  const canGoBack = allowPastMonths || !isCurrentMonth;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          disabled={!canGoBack}
          aria-label="Mes anterior"
          className="rounded-full px-3 py-1 text-lg text-ink transition-colors hover:bg-surface-alt disabled:opacity-30"
        >
          ‹
        </button>
        <p className="font-display text-lg font-semibold text-ink" aria-live="polite">
          {formatMonth(month)}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Mes siguiente"
          className="rounded-full px-3 py-1 text-lg text-ink transition-colors hover:bg-surface-alt"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-muted" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="mt-1 space-y-1">
        {monthWeeks(month).map((week) => (
          <div key={week[0].key} className="grid grid-cols-7 gap-1">
            {week.map(({ key, isoDate }) => {
              if (!isoDate) return <span key={key} />;
              const coverage = occupancy[isoDate] ?? "NONE";
              const disabled = isDayDisabled(isoDate, coverage);
              const selected = isoDate === selectedDate;
              return (
                <button
                  key={isoDate}
                  type="button"
                  onClick={() => onSelectDate(isoDate)}
                  disabled={disabled}
                  aria-pressed={selected}
                  // Para los lectores de pantalla: "Sábado, 13 de marzo de 2027: libre".
                  aria-label={`${formatEventDate(isoDate)}: ${SLOT_COVERAGE_LABELS[coverage].toLowerCase()}`}
                  // Un día completo conserva su color aunque no se pueda pulsar,
                  // para que coincida con la leyenda; el resto se atenúa.
                  className={`aspect-square rounded-lg text-sm transition-shadow disabled:cursor-not-allowed ${
                    coverage === "FULL_DAY" ? "" : "disabled:opacity-35"
                  } ${COVERAGE_CLASSES[coverage]} ${selected ? "ring-2 ring-ink ring-offset-1" : ""} ${
                    isoDate === today ? "font-bold" : ""
                  }`}
                >
                  {Number(isoDate.slice(8))}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
