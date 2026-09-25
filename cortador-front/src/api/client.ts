import { clearSession, getToken } from "../auth/session";

const API_URL =import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

/**
 * Representa el error en JSON que devuelve el GlobalExceptionHandler del
 * backend, para poder leer fácilmente el estado, un mensaje claro y, si
 * es un fallo de validación, qué campo lo causó.
 */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Opciones de fetch más una propia: "auth", para indicar que la petición
// es del panel de admin y tiene que llevar el token JWT.
export interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

// Función genérica para llamar a cualquier endpoint del backend.
// Si la respuesta no es correcta (status fuera del rango 2xx), lanza un
// ApiError con el mensaje que mandó el backend.
export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  // Separamos "auth" del resto porque fetch no la conoce.
  const { auth = false, ...fetchOptions } = options ?? {};
  const token = auth ? getToken() : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  // Si una petición del panel devuelve 401, el token ya no vale (ha
  // caducado o es inválido): cerramos la sesión para volver al login.
  if (response.status === 401 && auth) {
    clearSession();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message ?? "Request failed", body?.fieldErrors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
