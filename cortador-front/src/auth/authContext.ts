import { createContext } from "react";

/**
 * Lo que cualquier componente puede saber y hacer sobre la sesión del
 * admin: si hay alguien logueado, quién es, y entrar o salir.
 */
export interface AuthContextValue {
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// El contexto empieza en null: si un componente lo usa fuera del
// AuthProvider, useAuth lo detecta y avisa con un error claro.
export const AuthContext = createContext<AuthContextValue | null>(null);
