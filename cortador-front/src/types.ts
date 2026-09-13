// Copia los enums y DTOs que expone cortador-back. Tener todo en un
// archivo ayuda a notar rápido si el frontend y el backend dejan de
// coincidir.

export type EventType = "WEDDING" | "BIRTHDAY" | "CORPORATE" | "OTHER";

export type ServiceType = "CUT_ONLY" | "FULL_SERVICE";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface HamType {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface BookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string; // formato yyyy-MM-dd
  eventTime: string; // formato HH:mm
  estimatedDurationHours: number;
  eventType: EventType;
  guestCount: number;
  location: string;
  serviceType: ServiceType;
  hamTypeId?: number;
  notes?: string;
}

export interface BookingResponse {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  estimatedDurationHours: number;
  eventType: EventType;
  guestCount: number;
  location: string;
  serviceType: ServiceType;
  hamTypeName: string | null;
  status: BookingStatus;
  estimatedPrice: number | null;
  notes: string | null;
  createdAt: string;
}
