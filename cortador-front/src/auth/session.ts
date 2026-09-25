/**
 * Guarda la sesión del admin (el token JWT y su email) en el localStorage
 * del navegador, para que no tenga que volver a hacer login cada vez que
 * recarga la página.
 *
 * Es el único sitio que sabe DÓNDE se guarda el token: si algún día se
 * cambia localStorage por otra cosa, solo hay que tocar este archivo.
 */

const TOKEN_KEY = "cortador.admin.token";
const EMAIL_KEY = "cortador.admin.email";

export interface Session {
  token: string;
  email: string;
}

// Funciones que quieren enterarse de cuándo se cierra la sesión (por
// ejemplo, el AuthContext, para mandar al admin de vuelta al login).
type SessionClearedListener = () => void;
const listeners = new Set<SessionClearedListener>();

// localStorage puede fallar (navegación privada, almacenamiento bloqueado),
// así que cualquier lectura o escritura va dentro de try/catch: si falla,
// la app sigue funcionando, solo que sin recordar la sesión.
export function getSession(): Session | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const email = localStorage.getItem(EMAIL_KEY);
    return token && email ? { token, email } : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(EMAIL_KEY, session.email);
  } catch {
    // Sin almacenamiento disponible: la sesión durará solo mientras la
    // pestaña siga abierta (la guarda el AuthContext en memoria).
  }
}

// Borra la sesión y avisa a quien esté escuchando. Se llama al pulsar
// "Cerrar sesión" y también cuando el backend responde 401 (token caducado).
export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
  listeners.forEach((listener) => listener());
}

// Permite suscribirse al cierre de sesión. Devuelve la función para
// darse de baja (útil en el cleanup de un useEffect).
export function onSessionCleared(listener: SessionClearedListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
