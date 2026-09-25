import { apiFetch } from "./client";
import type { BookingRequest, BookingResponse, BookingStatus, HamType } from "../types";

// Pide al backend la lista de tipos de jamón disponibles.
export function getHamTypes(): Promise<HamType[]> {
  return apiFetch<HamType[]>("/ham-types");
}

// Envía una reserva nueva al backend.
export function createBooking(data: BookingRequest): Promise<BookingResponse> {
  return apiFetch<BookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Panel de admin (necesitan el token, por eso llevan auth: true) ----

// Lista todas las reservas para el panel del cortador.
export function getBookings(): Promise<BookingResponse[]> {
  return apiFetch<BookingResponse[]>("/bookings", { auth: true });
}

// Cambia el estado de una reserva (confirmar, cancelar, completar...).
export function updateBookingStatus(id: number, status: BookingStatus): Promise<BookingResponse> {
  return apiFetch<BookingResponse>(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    auth: true,
  });
}
