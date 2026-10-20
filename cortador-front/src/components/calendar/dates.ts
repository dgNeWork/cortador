// Funciones de fechas del calendario. Las fechas viajan como texto
// "yyyy-MM-dd" (igual que en el backend) y se construyen siempre con la
// fecha local, nunca con toISOString(), que usa la hora UTC y podría
// cambiar el día de noche.

// Convierte una fecha a "yyyy-MM-dd".
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Convierte "yyyy-MM-dd" en una fecha local.
export function fromIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

// Mes del calendario: año y mes (0 = enero, como en Date).
export interface CalendarMonth {
  year: number;
  month: number;
}

export function monthOf(isoDate: string): CalendarMonth {
  const date = fromIsoDate(isoDate);
  return { year: date.getFullYear(), month: date.getMonth() };
}

// Mes siguiente o anterior (delta = 1 o -1).
export function addMonths({ year, month }: CalendarMonth, delta: number): CalendarMonth {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

// Una casilla del calendario: un día ("yyyy-MM-dd") o un hueco (null).
// Cada una lleva su propia clave para que React las distinga.
export interface CalendarCell {
  key: string;
  isoDate: string | null;
}

/**
 * Semanas que se pintan para un mes, de lunes a domingo. Los huecos de
 * antes del día 1 y de después del último día no tienen fecha.
 */
export function monthWeeks({ year, month }: CalendarMonth): CalendarCell[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay(): 0 = domingo. Lo pasamos a 0 = lunes.
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: CalendarCell[] = [];
  for (let blank = 0; blank < leadingBlanks; blank++) {
    cells.push({ key: `antes-${blank}`, isoDate: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isoDate = toIsoDate(new Date(year, month, day));
    cells.push({ key: isoDate, isoDate });
  }
  for (let blank = 0; cells.length % 7 !== 0; blank++) {
    cells.push({ key: `despues-${blank}`, isoDate: null });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// Primer y último día del mes, para pedir su disponibilidad al backend.
export function monthRange({ year, month }: CalendarMonth): { from: string; to: string } {
  return {
    from: toIsoDate(new Date(year, month, 1)),
    to: toIsoDate(new Date(year, month + 1, 0)),
  };
}

// "marzo de 2027", para la cabecera del calendario.
export function formatMonth({ year, month }: CalendarMonth): string {
  const text = new Date(year, month, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
