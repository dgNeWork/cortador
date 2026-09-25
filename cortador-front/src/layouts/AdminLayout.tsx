import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { siteConfig } from "../config/site";

// Marco del panel del cortador. No lleva la cabecera ni el pie de la web
// pública (no pintan nada aquí): solo una barra con el nombre del negocio,
// un enlace para volver a la web y el botón de cerrar sesión.
export default function AdminLayout() {
  const { email, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <p className="font-display text-lg font-semibold text-ink">
            {siteConfig.businessName}
            <span className="ml-2 font-sans text-sm font-normal text-ink-muted">· Panel</span>
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-ink-muted sm:inline">{email}</span>
            <Link to="/" className="text-ink-muted transition-colors hover:text-ink">
              Ver web
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-border px-4 py-1.5 font-medium text-ink transition-colors hover:border-brand-400"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
