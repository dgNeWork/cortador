import { apiFetch } from "./client";
import type { Locality, LocalityRequest, PricingSettings, PricingSettingsRequest, PublicLocalities } from "../types";

// Público: localidades para el desplegable del formulario de reserva.
export function getPublicLocalities(): Promise<PublicLocalities> {
  return apiFetch<PublicLocalities>("/localities");
}

// ---- Tarifas y localidades del panel del cortador (llevan el token) ----

export function getPricingSettings(): Promise<PricingSettings> {
  return apiFetch<PricingSettings>("/admin/pricing", { auth: true });
}

export function updatePricingSettings(data: PricingSettingsRequest): Promise<PricingSettings> {
  return apiFetch<PricingSettings>("/admin/pricing", {
    method: "PUT",
    body: JSON.stringify(data),
    auth: true,
  });
}

export function getLocalities(): Promise<Locality[]> {
  return apiFetch<Locality[]>("/admin/localities", { auth: true });
}

export function createLocality(data: LocalityRequest): Promise<Locality> {
  return apiFetch<Locality>("/admin/localities", {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
}

export function updateLocality(id: number, data: LocalityRequest): Promise<Locality> {
  return apiFetch<Locality>(`/admin/localities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    auth: true,
  });
}

export function deleteLocality(id: number): Promise<void> {
  return apiFetch<void>(`/admin/localities/${id}`, { method: "DELETE", auth: true });
}
