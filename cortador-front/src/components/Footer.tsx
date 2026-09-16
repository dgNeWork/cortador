import { Link } from "react-router-dom";
import { siteConfig } from "../config/site";

// El enlace de WhatsApp necesita el teléfono solo con dígitos (sin
// espacios ni el "+"), así que se calcula aquí a partir de contactPhone.
const whatsappUrl = `https://wa.me/${siteConfig.contactPhone.replace(/\D/g, "")}`;

// Pie de página con el nombre del negocio, el eslogan, enlaces rápidos,
// los datos de contacto y, al final del todo, las redes sociales.
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-muted">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-display text-base text-ink">{siteConfig.businessName}</p>
            <p className="mt-1">{siteConfig.tagline}</p>
          </div>
          <nav className="flex gap-6">
            <Link to="/#galeria" className="transition-colors hover:text-ink">
              Galería
            </Link>
            <Link to="/reservar" className="transition-colors hover:text-ink">
              Reservar
            </Link>
          </nav>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span>{siteConfig.contactEmail}</span>
          <span>{siteConfig.contactPhone}</span>

          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path d="M6.5 17.5 4 20l2.6-.7A8 8 0 1 0 4 12a7.9 7.9 0 0 0 1 3.9Z" />
              <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.5 0 1-.4 1-1v-.8a.6.6 0 0 0-.4-.6l-1.5-.5a.6.6 0 0 0-.6.2l-.3.4a4.4 4.4 0 0 1-2.4-2.4l.4-.3a.6.6 0 0 0 .2-.6l-.5-1.5a.6.6 0 0 0-.6-.4H9a1 1 0 0 0-1 1Z" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>

        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} {siteConfig.businessName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
