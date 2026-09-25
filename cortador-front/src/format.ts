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
