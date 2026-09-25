// Test unitario de apiFetch: no usa React ni el navegador de verdad, solo
// sustituye "fetch" por una versión falsa (un "mock") para comprobar cómo
// reacciona nuestro código ante distintas respuestas del backend, sin
// necesidad de tener el backend arrancado.
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./client";
import { getSession, saveSession } from "../auth/session";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("cuando la respuesta es correcta, devuelve el JSON ya convertido", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, name: "Bellota" }),
    });
    vi.stubGlobal("fetch", fakeFetch);

    const result = await apiFetch<{ id: number; name: string }>("/ham-types/1");

    expect(result).toEqual({ id: 1, name: "Bellota" });
  });

  it("cuando el backend responde con error, lanza un ApiError con el mensaje del backend", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Customer email is required", fieldErrors: { customerEmail: "Customer email is required" } }),
    });
    vi.stubGlobal("fetch", fakeFetch);

    // expect(...).rejects comprueba que la promesa termina en error, en vez
    // de tener que envolver el await en try/catch a mano.
    await expect(apiFetch("/bookings")).rejects.toMatchObject({
      status: 400,
      message: "Customer email is required",
    });
  });

  it("cuando la respuesta es 204 (sin contenido), no intenta leer el cuerpo", async () => {
    const jsonSpy = vi.fn();
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: jsonSpy,
    });
    vi.stubGlobal("fetch", fakeFetch);

    const result = await apiFetch("/bookings/1");

    expect(result).toBeUndefined();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it("ApiError guarda el status y los errores de campo para poder mostrarlos en el formulario", () => {
    const error = new ApiError(400, "Datos inválidos", { customerEmail: "Email no válido" });

    expect(error.status).toBe(400);
    expect(error.fieldErrors).toEqual({ customerEmail: "Email no válido" });
  });

  // ---- Peticiones del panel de admin (opción auth) ----

  // Devuelve la cabecera Authorization con la que se llamó al fetch falso.
  function sentAuthorizationHeader(fakeFetch: ReturnType<typeof vi.fn>): string | undefined {
    const [, init] = fakeFetch.mock.calls[0];
    return (init.headers as Record<string, string>).Authorization;
  }

  it("con auth: true y sesión iniciada, envía el token en la cabecera Authorization", async () => {
    saveSession({ token: "token-de-prueba", email: "admin@example.com" });
    const fakeFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal("fetch", fakeFetch);

    await apiFetch("/bookings", { auth: true });

    expect(sentAuthorizationHeader(fakeFetch)).toBe("Bearer token-de-prueba");
  });

  it("sin auth, no envía el token aunque haya sesión (las peticiones públicas no lo necesitan)", async () => {
    saveSession({ token: "token-de-prueba", email: "admin@example.com" });
    const fakeFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal("fetch", fakeFetch);

    await apiFetch("/ham-types");

    expect(sentAuthorizationHeader(fakeFetch)).toBeUndefined();
  });

  it("si una petición con auth devuelve 401 (token caducado), cierra la sesión", async () => {
    saveSession({ token: "token-caducado", email: "admin@example.com" });
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Es necesario iniciar sesión" }),
    });
    vi.stubGlobal("fetch", fakeFetch);

    await expect(apiFetch("/bookings", { auth: true })).rejects.toMatchObject({ status: 401 });
    expect(getSession()).toBeNull();
  });
});
