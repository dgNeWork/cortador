import { apiFetch } from "./client";
import type {
  AdminDayAvailability,
  AvailabilityRule,
  AvailabilityRuleRequest,
  PublicDayAvailability,
  SlotCoverage,
} from "../types";

// Público: días ocupados de un periodo, para el calendario del formulario.
export function getAvailability(from: string, to: string): Promise<PublicDayAvailability[]> {
  return apiFetch<PublicDayAvailability[]>(`/availability?from=${from}&to=${to}`);
}

// ---- Calendario del panel (necesitan el token, por eso llevan auth: true) ----

export function getAdminAvailability(from: string, to: string): Promise<AdminDayAvailability[]> {
  return apiFetch<AdminDayAvailability[]>(`/admin/availability?from=${from}&to=${to}`, { auth: true });
}

export function setDayMark(date: string, coverage: SlotCoverage): Promise<void> {
  return apiFetch<void>(`/admin/day-marks/${date}`, {
    method: "PUT",
    body: JSON.stringify({ coverage }),
    auth: true,
  });
}

// Quita la marca del día: vuelve a mandar lo que digan las reglas.
export function clearDayMark(date: string): Promise<void> {
  return apiFetch<void>(`/admin/day-marks/${date}`, { method: "DELETE", auth: true });
}

export function getAvailabilityRules(): Promise<AvailabilityRule[]> {
  return apiFetch<AvailabilityRule[]>("/admin/availability-rules", { auth: true });
}

export function createAvailabilityRule(data: AvailabilityRuleRequest): Promise<AvailabilityRule> {
  return apiFetch<AvailabilityRule>("/admin/availability-rules", {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
}

export function updateAvailabilityRule(id: number, data: AvailabilityRuleRequest): Promise<AvailabilityRule> {
  return apiFetch<AvailabilityRule>(`/admin/availability-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    auth: true,
  });
}

export function deleteAvailabilityRule(id: number): Promise<void> {
  return apiFetch<void>(`/admin/availability-rules/${id}`, { method: "DELETE", auth: true });
}
