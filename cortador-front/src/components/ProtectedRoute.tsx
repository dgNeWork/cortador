import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

// Guardián de las rutas del panel: si hay sesión, muestra la página que
// toque (Outlet); si no, redirige al login. "replace" evita que el botón
// "atrás" del navegador vuelva a una página a la que no se puede entrar.
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
