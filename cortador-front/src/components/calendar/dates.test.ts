// Tests de las funciones de fechas del calendario (funciones puras).
import { describe, expect, it } from "vitest";
import { addMonths, formatMonth, fromIsoDate, monthOf, monthRange, monthWeeks, toIsoDate } from "./dates";

describe("Fechas del calendario", () => {
  it("convierte entre fecha y texto 'yyyy-MM-dd' con la fecha local", () => {
    expect(toIsoDate(new Date(2027, 2, 5))).toBe("2027-03-05");
    expect(fromIsoDate("2027-03-05")).toEqual(new Date(2027, 2, 5));
    expect(monthOf("2027-03-05")).toEqual({ year: 2027, month: 2 });
  });

  it("pasa de mes y de año correctamente", () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2027, month: 0 }, -1)).toEqual({ year: 2026, month: 11 });
  });

  it("las semanas empiezan en lunes y los huecos no tienen fecha", () => {
    // Marzo de 2027 empieza en lunes y tiene 31 días: 5 semanas.
    const march = monthWeeks({ year: 2027, month: 2 });
    expect(march).toHaveLength(5);
    expect(march[0][0].isoDate).toBe("2027-03-01");
    expect(march[4][2].isoDate).toBe("2027-03-31");
    expect(march[4][3].isoDate).toBeNull();

    // Noviembre de 2026 empieza en domingo: 6 huecos antes del día 1.
    const november = monthWeeks({ year: 2026, month: 10 });
    expect(november[0].slice(0, 6).every((cell) => cell.isoDate === null)).toBe(true);
    expect(november[0][6].isoDate).toBe("2026-11-01");

    // Todas las claves son distintas (las usa React).
    const keys = november.flat().map((cell) => cell.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("da el primer y el último día del mes y su nombre", () => {
    expect(monthRange({ year: 2027, month: 1 })).toEqual({ from: "2027-02-01", to: "2027-02-28" });
    expect(formatMonth({ year: 2027, month: 2 })).toBe("Marzo de 2027");
  });
});
