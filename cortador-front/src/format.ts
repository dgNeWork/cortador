// Formato de moneda en español: "1.234,50 €". Se crea una sola vez y se
// reutiliza, porque construir un Intl.NumberFormat en cada llamada es caro.
const eurosFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

// Todos los precios de la web pasan por aquí, para que se vean igual en
// el formulario de reserva, en el panel y en cualquier sitio nuevo.
export function formatEuros(amount: number): string {
  return eurosFormatter.format(amount);
}

// El backend manda la fecha como "2026-10-12". La convertimos en algo
// más legible ("Lunes, 12 de octubre de 2026"). Se construye la fecha
// con año/mes/día por separado para que no se desplace un día por la
// zona horaria.
export function formatEventDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const text = new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // Solo la primera letra en mayúscula. La clase CSS "capitalize" no
  // sirve aquí: pone en mayúscula cada palabra ("10 De Octubre De").
  return text.charAt(0).toUpperCase() + text.slice(1);
}
