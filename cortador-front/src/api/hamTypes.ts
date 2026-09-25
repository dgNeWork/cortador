import { apiFetch } from "./client";
import type { HamType, HamTypeRequest } from "../types";

// Catálogo público: solo los jamones que el cortador tiene activos.
// Lo usa el formulario de reserva.
export function getHamTypes(): Promise<HamType[]> {
  return apiFetch<HamType[]>("/ham-types");
}

// ---- Panel de admin (necesitan el token, por eso llevan auth: true) ----

// Catálogo completo, activos e inactivos.
export function getAdminHamTypes(): Promise<HamType[]> {
  return apiFetch<HamType[]>("/admin/ham-types", { auth: true });
}

export function createHamType(data: HamTypeRequest): Promise<HamType> {
  return apiFetch<HamType>("/admin/ham-types", {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
}

// Sirve tanto para editar los datos como para activar/desactivar.
export function updateHamType(id: number, data: HamTypeRequest): Promise<HamType> {
  return apiFetch<HamType>(`/admin/ham-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    auth: true,
  });
}
