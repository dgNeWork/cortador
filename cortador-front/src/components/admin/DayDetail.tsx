import { useState } from "react";
import { clearDayMark, setDayMark } from "../../api/availability";
import { ApiError } from "../../api/client";
import { formatEventDate } from "../../format";
import { BOOKING_STATUS_LABELS, SLOT_COVERAGE_LABELS, TIME_SLOT_LABELS } from "../../labels";
import type { AdminDayAvailability, BookingResponse, SlotCoverage, TimeSlot } from "../../types";
import { coversSlot } from "../calendar/coverage";
import ConfirmDialog from "../ConfirmDialog";

// Lo que el cortador puede elegir para un día: lo que digan sus reglas
// (sin marca) o una marca concreta.
type DayChoice = "RULES" | SlotCoverage;

const CHOICES: { value: DayChoice; label: string }[] = [
  { value: "RULES", label: "Según mis reglas" },
  { value: "NONE", label: "Libre" },
  { value: "MIDDAY", label: "Mañana/tarde ocupada" },
  { value: "EVENING", label: "Tarde/noche ocupada" },
  { value: "FULL_DAY", label: "Día completo ocupado" },
];

const SLOTS: TimeSlot[] = ["MIDDAY", "EVENING"];

interface DayDetailProps {
  date: string;
  // Estado del día según el backend (undefined = libre y sin marca).
  day: AdminDayAvailability | undefined;
  // Reservas de ese día (sin las canceladas).
  bookings: BookingResponse[];
  // Se llama después de guardar, para que el calendario se actualice.
  onChanged: () => void;
}

// Ficha de un día en el calendario del panel: sus reservas y cómo lo
// marca el cortador. Si quiere dejar libre una franja que tiene una
// reserva confirmada, se le avisa antes de guardar.
export default function DayDetail({ date, day, bookings, onChanged }: DayDetailProps) {
  const current: DayChoice = day?.mark ?? "RULES";
  const booked = day?.booked ?? "NONE";
  const [pendingChoice, setPendingChoice] = useState<DayChoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Franjas con reserva confirmada que la elección dejaría "libres".
  // "Según mis reglas" no se avisa: ahí manda lo que diga cada regla.
  function bookedSlotsLeftFree(choice: DayChoice): TimeSlot[] {
    if (choice === "RULES") return [];
    return SLOTS.filter((slot) => coversSlot(booked, slot) && !coversSlot(choice, slot));
  }

  async function save(choice: DayChoice) {
    setSaving(true);
    setError(null);
    try {
      if (choice === "RULES") {
        await clearDayMark(date);
      } else {
        await setDayMark(date, choice);
      }
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido guardar el día.");
    } finally {
      setSaving(false);
      setPendingChoice(null);
    }
  }

  function handleChoose(choice: DayChoice) {
    if (choice === current) return;
    if (bookedSlotsLeftFree(choice).length > 0) {
      setPendingChoice(choice); // primero se le avisa
    } else {
      void save(choice);
    }
  }

  const leftFree = pendingChoice ? bookedSlotsLeftFree(pendingChoice) : [];

  return (
    <section className="rounded-2xl border border-border bg-surface p-5" aria-label={`Día ${formatEventDate(date)}`}>
      <h2 className="font-display text-xl font-semibold text-ink">{formatEventDate(date)}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Estado: <strong className="text-ink">{SLOT_COVERAGE_LABELS[day?.occupied ?? "NONE"]}</strong>
        {current === "RULES" && day && day.blocked !== "NONE" && " (por tus reglas habituales)"}
      </p>

      <h3 className="mt-5 text-sm font-medium text-ink-muted">Reservas de este día</h3>
      {bookings.length === 0 ? (
        <p className="mt-1 text-sm text-ink">Ninguna.</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm text-ink">
          {bookings.map((booking) => (
            <li key={booking.id}>
              {TIME_SLOT_LABELS[booking.timeSlot]} · {booking.customerName} ·{" "}
              <span className="text-ink-muted">{BOOKING_STATUS_LABELS[booking.status]}</span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-5 text-sm font-medium text-ink-muted">Cómo quieres este día</h3>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Cómo quieres este día">
        {CHOICES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={current === value}
            disabled={saving}
            onClick={() => handleChoose(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
              current === value ? "bg-ink text-surface" : "bg-surface-alt text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ConfirmDialog
        open={pendingChoice !== null}
        title="Este día tiene una reserva confirmada"
        confirmLabel="Guardar igualmente"
        cancelLabel="Cancelar"
        busy={saving}
        onConfirm={() => {
          if (pendingChoice) void save(pendingChoice);
        }}
        onCancel={() => setPendingChoice(null)}
      >
        <p className="pb-4 text-sm text-ink">
          Tienes una reserva confirmada por la {leftFree.map((slot) => TIME_SLOT_LABELS[slot].toLowerCase()).join(" y la ")}.
          Esa franja seguirá ocupada por la reserva aunque marques el día así. Si la reserva ya no va, cancélala
          en la lista de reservas.
        </p>
      </ConfirmDialog>
    </section>
  );
}
