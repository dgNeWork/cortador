import { siteConfig } from "./site";

/**
 * Textos de los botones y títulos que cambian según el modo de la web
 * (siteConfig.quoteMode): "pedir presupuesto" o "reservar con precio".
 * Están aquí juntos para que la cabecera, la home, el formulario y la
 * página 404 digan siempre lo mismo.
 *
 * Es una función (y no un objeto fijo) para que lea quoteMode en el
 * momento de usarse: así los tests pueden probar los dos modos.
 */
export function getBookingTexts() {
  if (siteConfig.quoteMode) {
    return {
      navLabel: "Pedir presupuesto",
      // Versión corta para la cabecera en el móvil, donde no cabe la larga.
      navShortLabel: "Presupuesto",
      ctaLabel: "Consultar presupuesto y disponibilidad",
      pageTitle: "Solicitar presupuesto",
      pageIntro: "Elige el día, cuéntanos los detalles de tu evento y te llamaremos con el presupuesto.",
      submitLabel: "Consultar presupuesto y disponibilidad",
    };
  }
  return {
    navLabel: "Reservar",
    navShortLabel: "Reservar",
    ctaLabel: "Reservar ahora",
    pageTitle: "Solicitar reserva",
    pageIntro: "Cuéntanos los detalles de tu evento y te confirmaremos la disponibilidad lo antes posible.",
    submitLabel: "Enviar solicitud",
  };
}
