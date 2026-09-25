// Tests del acceso al panel: el formulario de login y la protección de
// la ruta /admin. Se monta un mini-router en memoria (MemoryRouter) con
// las mismas rutas que la app, para comprobar a dónde acaba el usuario.
//
// La llamada real al backend (api/auth) se sustituye por un "mock" con
// vi.mock: así decidimos en cada test si el login sale bien o mal, sin
// necesitar el servidor arrancado.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { login } from "../../api/auth";
import { ApiError } from "../../api/client";
import { AuthProvider } from "../../auth/AuthProvider";
import { getSession, saveSession } from "../../auth/session";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminLogin from "./AdminLogin";

vi.mock("../../api/auth", () => ({ login: vi.fn() }));

// Monta la app mínima empezando en la URL indicada. El panel se sustituye
// por un simple texto: aquí solo importa si se llega a él o no.
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<p>Panel de reservas</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

// Rellena el formulario y pulsa "Entrar", como haría el cortador.
async function submitLogin(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Contraseña"), password);
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("Acceso al panel del cortador", () => {
  afterEach(() => {
    vi.mocked(login).mockReset();
    localStorage.clear();
  });

  it("sin sesión, entrar en /admin redirige al login", () => {
    renderAt("/admin");

    expect(screen.getByRole("heading", { name: "Acceso cortador" })).toBeInTheDocument();
    expect(screen.queryByText("Panel de reservas")).not.toBeInTheDocument();
  });

  it("con una sesión guardada, /admin muestra el panel directamente", () => {
    saveSession({ token: "token-guardado", email: "admin@example.com" });

    renderAt("/admin");

    expect(screen.getByText("Panel de reservas")).toBeInTheDocument();
  });

  it("con credenciales correctas, guarda la sesión y lleva al panel", async () => {
    vi.mocked(login).mockResolvedValue({ token: "token-nuevo", email: "admin@example.com" });
    renderAt("/admin/login");

    await submitLogin("admin@example.com", "secreta");

    expect(await screen.findByText("Panel de reservas")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({ email: "admin@example.com", password: "secreta" });
    expect(getSession()).toEqual({ token: "token-nuevo", email: "admin@example.com" });
  });

  it("con credenciales incorrectas, muestra el error y no entra", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, "Email o contraseña incorrectos"));
    renderAt("/admin/login");

    await submitLogin("admin@example.com", "mala");

    expect(await screen.findByRole("alert")).toHaveTextContent("Email o contraseña incorrectos.");
    expect(getSession()).toBeNull();
  });

  it("si el servidor no responde, lo dice en vez de culpar a la contraseña", async () => {
    vi.mocked(login).mockRejectedValue(new TypeError("Failed to fetch"));
    renderAt("/admin/login");

    await submitLogin("admin@example.com", "secreta");

    expect(await screen.findByRole("alert")).toHaveTextContent("No se ha podido conectar con el servidor");
  });
});
