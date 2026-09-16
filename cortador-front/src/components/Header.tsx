import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../config/site";

// Cabecera fija arriba de la página, con el logo (o su hueco reservado),
// el nombre del negocio, el enlace a la galería y el botón de reservar.
// El botón cambia de color si ya estamos en /reservar.
export default function Header() {
  const location = useLocation();
  const isBookingPage = location.pathname === "/reservar";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5">
        <Link to="/" className="flex items-center gap-3">
          {siteConfig.logoUrl ? (
            // object-contain (no recorte circular): el logo es un sello
            // redondo con texto propio, recortarlo lo dejaría ilegible.
            <img src={siteConfig.logoUrl} alt={siteConfig.businessName} className="h-16 w-16 object-contain" />
          ) : (
            // Hueco reservado para el logo: mientras no haya uno, se
            // muestra un círculo con la inicial del negocio.
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-brand-500 font-display text-sm text-brand-600">
              {siteConfig.businessName.charAt(0)}
            </span>
          )}
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            {siteConfig.businessName}
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/#galeria"
            className="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:inline"
          >
            Galería
          </Link>
          <Link
            to="/reservar"
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              isBookingPage
                ? "bg-ink text-surface"
                : "bg-brand-600 text-surface hover:bg-brand-700"
            }`}
          >
            Reservar
          </Link>
        </nav>
      </div>
    </header>
  );
}
