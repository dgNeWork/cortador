// Comprueba que cada función de la carpeta api llama al endpoint correcto
// del backend: la ruta, el método HTTP y si lleva el token del panel.
// Las páginas usan estas funciones con mocks, así que sin este test un
// error en una ruta (por ejemplo "/admin/pricing" mal escrita) no lo
// detectaría ningún otro test.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, saveSession } from "../auth/session";
import { adjustBookingPrice, createBooking, getBookings, getQuote, updateBookingStatus } from "./bookings";
import { createHamType, getAdminHamTypes, getHamTypes, updateHamType } from "./hamTypes";
import {
  createLocality,
  deleteLocality,
  getLocalities,
  getPricingSettings,
  getPublicLocalities,
  updateLocality,
  updatePricingSettings,
} from "./pricing";

// Cada caso: nombre, llamada, ruta esperada, método y si va con token.
const cases: { name: string; call: () => Promise<unknown>; path: string; method: string; auth: boolean }[] = [
  { name: "createBooking", call: () => createBooking({} as never), path: "/bookings", method: "POST", auth: false },
  { name: "getQuote", call: () => getQuote({} as never), path: "/bookings/quote", method: "POST", auth: false },
  { name: "getBookings", call: () => getBookings(), path: "/bookings", method: "GET", auth: true },
  { name: "updateBookingStatus", call: () => updateBookingStatus(7, "CONFIRMED"), path: "/bookings/7/status", method: "PATCH", auth: true },
  { name: "adjustBookingPrice", call: () => adjustBookingPrice(7, { finalPrice: 300, note: "Descuento" }), path: "/bookings/7/price", method: "PATCH", auth: true },
  { name: "getHamTypes", call: () => getHamTypes(), path: "/ham-types", method: "GET", auth: false },
  { name: "getAdminHamTypes", call: () => getAdminHamTypes(), path: "/admin/ham-types", method: "GET", auth: true },
  { name: "createHamType", call: () => createHamType({ name: "Bellota", price: 390 }), path: "/admin/ham-types", method: "POST", auth: true },
  { name: "updateHamType", call: () => updateHamType(2, { name: "Bellota", price: 390 }), path: "/admin/ham-types/2", method: "PUT", auth: true },
  { name: "getPublicLocalities", call: () => getPublicLocalities(), path: "/localities", method: "GET", auth: false },
  { name: "getPricingSettings", call: () => getPricingSettings(), path: "/admin/pricing", method: "GET", auth: true },
  { name: "updatePricingSettings", call: () => updatePricingSettings({ hourlyRate: 50, pricePerKm: 0.4, homeLocality: "Jerez" }), path: "/admin/pricing", method: "PUT", auth: true },
  { name: "getLocalities", call: () => getLocalities(), path: "/admin/localities", method: "GET", auth: true },
  { name: "createLocality", call: () => createLocality({ name: "Cádiz", distanceKm: 70 }), path: "/admin/localities", method: "POST", auth: true },
  { name: "updateLocality", call: () => updateLocality(4, { name: "Cádiz", distanceKm: 70 }), path: "/admin/localities/4", method: "PUT", auth: true },
  { name: "deleteLocality", call: () => deleteLocality(4), path: "/admin/localities/4", method: "DELETE", auth: true },
];

describe("Funciones de la API", () => {
  let fakeFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Sesión iniciada, para que las llamadas del panel puedan llevar token.
    saveSession({ token: "token-de-prueba", email: "cortador@example.com" });
    fakeFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", fakeFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearSession();
  });

  it.each(cases)("$name llama a $method $path", async ({ call, path, method, auth }) => {
    await call();

    const [url, options] = fakeFetch.mock.calls[0];
    expect(url).toMatch(new RegExp(`/api${path}$`));
    // Sin method, fetch hace un GET.
    expect(options.method ?? "GET").toBe(method);
    if (auth) {
      expect(options.headers.Authorization).toBe("Bearer token-de-prueba");
    } else {
      expect(options.headers.Authorization).toBeUndefined();
    }
  });
});
