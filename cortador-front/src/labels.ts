import type { BookingStatus, EventType, ServiceType } from "./types";

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

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};
