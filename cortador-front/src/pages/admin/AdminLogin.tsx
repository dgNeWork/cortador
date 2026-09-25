import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/useAuth";
import { Field, inputClass } from "../../components/FormField";

// Página de acceso del cortador a su panel de reservas. No hay registro:
// la única cuenta de admin la crea el backend al arrancar.
export default function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión abierta, no tiene sentido enseñar el login.
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      // 401 = credenciales incorrectas. Cualquier otro error suele ser
      // que el servidor no responde, y el mensaje debe dejarlo claro.
      if (err instanceof ApiError && err.status === 401) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError("No se ha podido conectar con el servidor. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-ink">Acceso cortador</h1>
      <p className="mt-2 text-ink-muted">Entra para ver y gestionar tus reservas.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Field label="Email">
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Contraseña">
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-600 px-8 py-3 text-sm font-medium text-surface transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
