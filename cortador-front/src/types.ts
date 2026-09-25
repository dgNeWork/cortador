// Copia los enums y DTOs que expone cortador-back. Tener todo en un
// archivo ayuda a notar rápido si el frontend y el backend dejan de
// coincidir.

export type EventType = "WEDDING" | "BIRTHDAY" | "CORPORATE" | "OTHER";

export type ServiceType = "CUT_ONLY" | "FULL_SERVICE";

// Qué elige el cliente en "Localidad del evento": la del cortador, una
// de su lista, u otra que no está en la lista (precio a consultar).
export type LocalityOption = "HOME" | "LISTED" | "OTHER";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface HamType {
  id: number;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
}

// Lo que envía el panel para crear o editar un jamón del catálogo.
export interface HamTypeRequest {
  name: string;
  description?: string;
  price: number;
  active?: boolean;
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
  localityOption: LocalityOption;
  localityId?: number;
  otherLocalityName?: string;
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
  // Copia del precio en el momento de reservar.
  localityName: string | null;
  distanceKm: number | null;
  serviceCost: number | null;
  hamCost: number | null;
  travelCost: number | null;
  // Total calculado (null si era "a consultar").
  estimatedPrice: number | null;
  // Precio que ha fijado el cortador a mano, y por qué.
  finalPrice: number | null;
  priceNote: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
}

// Tarifas del cortador. Van a null si todavía no las ha configurado.
export interface PricingSettings {
  hourlyRate: number | null;
  pricePerKm: number | null;
  homeLocality: string | null;
}

export interface PricingSettingsRequest {
  hourlyRate: number;
  pricePerKm: number;
  homeLocality: string;
}

// Localidad a la que se desplaza el cortador, con los km del trayecto
// completo (ida y vuelta) desde su casa.
export interface Locality {
  id: number;
  name: string;
  distanceKm: number;
}

export interface LocalityRequest {
  name: string;
  distanceKm: number;
}

// Localidades para el desplegable del formulario de reserva.
export interface PublicLocalities {
  homeLocality: string | null;
  localities: Locality[];
}

// Datos de los que depende el precio (presupuesto en vivo del formulario).
export interface QuoteRequest {
  estimatedDurationHours: number;
  serviceType: ServiceType;
  hamTypeId?: number;
  localityOption: LocalityOption;
  localityId?: number;
  otherLocalityName?: string;
}

// Presupuesto desglosado. Lo que no se puede calcular va a null y
// onRequest = true ("a consultar").
export interface Quote {
  localityName: string;
  hours: number;
  hourlyRate: number | null;
  serviceCost: number | null;
  hamTypeName: string | null;
  hamCost: number | null;
  distanceKm: number | null;
  pricePerKm: number | null;
  travelCost: number | null;
  total: number | null;
  onRequest: boolean;
}

export interface PriceAdjustmentRequest {
  finalPrice: number;
  note: string;
}
