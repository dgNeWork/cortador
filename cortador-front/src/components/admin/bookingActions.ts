import type { BookingStatus } from "../../types";

/**
 * Un botón de acción del panel: qué texto muestra, a qué estado pasa la
 * reserva al pulsarlo y si hay que pedir confirmación antes (para las
 * acciones que no tienen vuelta atrás, como cancelar).
 */
export interface BookingAction {
  label: string;
  targetStatus: BookingStatus;
  variant: "primary" | "secondary" | "danger";
  confirmMessage?: string;
}

const cancelAction: BookingAction = {
  label: "Cancelar",
  targetStatus: "CANCELLED",
  variant: "danger",
  confirmMessage: "¿Seguro que quieres cancelar esta reserva? No se puede deshacer.",
};

// Qué acciones tiene cada estado. Es el único sitio donde se decide el
// "flujo" de una reserva en el panel: para añadir un paso nuevo (por
// ejemplo, "Señal recibida") basta con añadir su acción aquí, sin tocar
// los componentes. Los estados finales (completada, cancelada) no tienen
// acciones porque el backend no deja cambiarlos.
export const BOOKING_ACTIONS: Record<BookingStatus, BookingAction[]> = {
  PENDING: [{ label: "Confirmar", targetStatus: "CONFIRMED", variant: "primary" }, cancelAction],
  CONFIRMED: [{ label: "Marcar como completada", targetStatus: "COMPLETED", variant: "secondary" }, cancelAction],
  COMPLETED: [],
  CANCELLED: [],
};
