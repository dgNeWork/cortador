import { Link } from "react-router-dom";

// Página para cualquier dirección que no existe (un enlace antiguo o mal
// escrito). Sin ella la pantalla se quedaba en blanco, sin cabecera ni
// forma de volver. Va dentro del marco público, así que el cliente sigue
// viendo la cabecera y el pie de la web.
export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="font-display text-sm uppercase tracking-[0.2em] text-brand-600">Error 404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Esta página no existe</h1>
      <p className="mt-3 text-ink-muted">
        Puede que el enlace esté mal escrito o que la página ya no esté disponible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-brand-400"
        >
          Ir al inicio
        </Link>
        <Link
          to="/reservar"
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-brand-700"
        >
          Consultar presupuesto y disponibilidad
        </Link>
      </div>
    </section>
  );
}
