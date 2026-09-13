import { apiFetch } from "./client";
import type { BookingRequest, BookingResponse, HamType } from "../types";

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
