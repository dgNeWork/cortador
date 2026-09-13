import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../config/site";

// Cabecera fija arriba de la página, con el nombre del negocio y el
// botón de reservar. El botón cambia de color si ya estamos en /reservar.
export default function Header() {
  const location = useLocation();
  const isBookingPage = location.pathname === "/reservar";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          {siteConfig.businessName}
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
      </div>
    </header>
  );
}
