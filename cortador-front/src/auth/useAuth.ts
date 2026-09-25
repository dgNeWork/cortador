import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "./authContext";

// Atajo para leer la sesión desde cualquier componente. Si se usa fuera
// del AuthProvider, falla con un mensaje claro en vez de devolver null
// y provocar errores raros más adelante.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
