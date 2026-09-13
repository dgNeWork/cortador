const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

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

// Función genérica para llamar a cualquier endpoint del backend.
// Si la respuesta no es correcta (status fuera del rango 2xx), lanza un
// ApiError con el mensaje que mandó el backend.
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message ?? "Request failed", body?.fieldErrors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
