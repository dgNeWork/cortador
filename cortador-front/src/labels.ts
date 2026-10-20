import type { BookingStatus, DayOfWeek, EventType, ServiceType, SlotCoverage, TimeSlot } from "./types";

// Textos en español para los valores de los enums del backend. Están en
// un solo archivo porque los usan tanto el formulario de reserva como el
// panel del admin, y así no se repiten ni se desincronizan.

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WEDDING: "Boda",
  BIRTHDAY: "Cumpleaños",
  CORPORATE: "Evento corporativo",
  OTHER: "Otro",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  CUT_ONLY: "Solo corte",
  FULL_SERVICE: "Servicio completo",
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  MIDDAY: "Mañana/tarde",
  EVENING: "Tarde/noche",
};

// Cómo se nombra cada ocupación en la leyenda y en el panel.
export const SLOT_COVERAGE_LABELS: Record<SlotCoverage, string> = {
  NONE: "Libre",
  MIDDAY: "Mañana/tarde ocupada",
  EVENING: "Tarde/noche ocupada",
  FULL_DAY: "Día completo ocupado",
};

// De lunes a domingo, en el orden en que se muestran.
export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};
