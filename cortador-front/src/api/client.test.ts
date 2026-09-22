// Test unitario de apiFetch: no usa React ni el navegador de verdad, solo
// sustituye "fetch" por una versión falsa (un "mock") para comprobar cómo
// reacciona nuestro código ante distintas respuestas del backend, sin
// necesidad de tener el backend arrancado.
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
});
