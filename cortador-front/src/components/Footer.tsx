import { siteConfig } from "../config/site";

// Pie de página con el nombre del negocio, el eslogan y los datos de contacto.
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-muted">
        <p className="font-display text-base text-ink">{siteConfig.businessName}</p>
        <p className="mt-1">{siteConfig.tagline}</p>
        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:gap-6">
          <span>{siteConfig.contactEmail}</span>
          <span>{siteConfig.contactPhone}</span>
        </div>
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} {siteConfig.businessName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
