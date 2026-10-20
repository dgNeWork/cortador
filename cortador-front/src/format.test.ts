// Tests de las funciones de formato que comparten la web pública y el
// panel. Son funciones puras (entra un valor, sale un texto), así que no
// hace falta montar ningún componente.
import { describe, expect, it } from "vitest";
import { formatEventDate, formatEuros } from "./format";

describe("formatEventDate", () => {
  it("convierte la fecha del backend en texto legible con solo la primera letra en mayúscula", () => {
    expect(formatEventDate("2026-10-20")).toBe("Martes, 20 de octubre de 2026");
  });

  it("no se desplaza un día por la zona horaria en el primer día del año", () => {
    expect(formatEventDate("2027-01-01")).toBe("Viernes, 1 de enero de 2027");
  });
});

describe("formatEuros", () => {
  it("usa coma decimal y el símbolo del euro detrás", () => {
    // Intl separa el número y el "€" con un espacio especial que no se
    // parte (U+00A0), por eso se compara quitando los espacios.
    expect(formatEuros(310.4).replace(/\s/g, "")).toBe("310,40€");
  });
});
