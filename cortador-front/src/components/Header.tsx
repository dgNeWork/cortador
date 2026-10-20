import { Link, useLocation } from "react-router-dom";
import { getBookingTexts } from "../config/bookingTexts";
import { siteConfig } from "../config/site";

// Cabecera fija arriba de la página, con el logo (o su hueco reservado),
// el nombre del negocio, el enlace a la galería y el botón de reservar
// (o de pedir presupuesto, según el modo de la web).
// El botón cambia de color si ya estamos en /reservar.
export default function Header() {
  const location = useLocation();
  const { navLabel, navShortLabel } = getBookingTexts();
  const isBookingPage = location.pathname === "/reservar";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      {/* En el móvil todo es algo más pequeño para que el nombre y el botón
          quepan en una fila sin montarse; el botón nunca se encoge. */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          {siteConfig.logoUrl ? (
            // object-contain (no recorte circular): el logo es un sello
            // redondo con texto propio, recortarlo lo dejaría ilegible.
            <img src={siteConfig.logoUrl} alt={siteConfig.businessName} className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16" />
          ) : (
            // Hueco reservado para el logo: mientras no haya uno, se
            // muestra un círculo con la inicial del negocio.
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-brand-500 font-display text-sm text-brand-600">
              {siteConfig.businessName.charAt(0)}
            </span>
          )}
          <span className="font-display text-lg font-semibold leading-tight tracking-tight text-ink sm:text-xl">
            {siteConfig.businessName}
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-6">
          <Link
            to="/#galeria"
            className="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:inline"
          >
            Galería
          </Link>
          <Link
            to="/reservar"
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              isBookingPage
                ? "bg-ink text-surface"
                : "bg-brand-600 text-surface hover:bg-brand-700"
            }`}
          >
            {/* En el móvil, el texto corto; desde "sm" (tablet), el completo. */}
            <span className="sm:hidden">{navShortLabel}</span>
            <span className="hidden sm:inline">{navLabel}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
