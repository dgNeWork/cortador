import { useCallback, useEffect, useMemo, useState } from "react";
import { login as loginRequest } from "../api/auth";
import { AuthContext, type AuthContextValue } from "./authContext";
import { clearSession, getSession, onSessionCleared, saveSession, type Session } from "./session";

/**
 * Envuelve toda la app y guarda en un único sitio el estado de la sesión
 * del admin. Así el login, el botón de "Cerrar sesión" y las rutas
 * protegidas comparten la misma información sin pasársela a mano.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Al arrancar, recuperamos la sesión guardada (si el admin ya había
  // entrado antes y no cerró sesión).
  const [session, setSession] = useState<Session | null>(() => getSession());

  // Si la sesión se borra desde fuera de React (por ejemplo, apiFetch
  // recibe un 401 porque el token caducó), actualizamos el estado para
  // que las rutas protegidas manden al admin de vuelta al login.
  useEffect(() => onSessionCleared(() => setSession(null)), []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    const newSession = { token: response.token, email: response.email };
    saveSession(newSession);
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, []);

  // useMemo evita crear un objeto nuevo en cada render, lo que haría
  // re-renderizar sin necesidad a todos los que usan el contexto.
  const value = useMemo<AuthContextValue>(
    () => ({
      email: session?.email ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
