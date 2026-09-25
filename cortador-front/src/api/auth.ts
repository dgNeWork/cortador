import { apiFetch } from "./client";
import type { LoginRequest, LoginResponse } from "../types";

// Envía el email y la contraseña del admin. Si son correctos, el backend
// devuelve el token JWT; si no, apiFetch lanza un ApiError con status 401.
export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
