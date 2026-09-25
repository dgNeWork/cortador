import { apiFetch } from "./client";
import type {
  BookingRequest,
  BookingResponse,
  BookingStatus,
  PriceAdjustmentRequest,
  Quote,
  QuoteRequest,
} from "../types";

// Envía una reserva nueva al backend.
export function createBooking(data: BookingRequest): Promise<BookingResponse> {
  return apiFetch<BookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Presupuesto en vivo mientras el cliente rellena el formulario. No
// guarda nada: la reserva vuelve a calcular el mismo precio al enviarse.
export function getQuote(data: QuoteRequest): Promise<Quote> {
  return apiFetch<Quote>("/bookings/quote", {
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

// El cortador fija el precio final a mano, con un motivo.
export function adjustBookingPrice(id: number, data: PriceAdjustmentRequest): Promise<BookingResponse> {
  return apiFetch<BookingResponse>(`/bookings/${id}/price`, {
    method: "PATCH",
    body: JSON.stringify(data),
    auth: true,
  });
}
