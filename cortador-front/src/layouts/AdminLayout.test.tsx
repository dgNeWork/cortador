// Tests del marco del panel: la barra con el email del cortador, las
// pestañas de secciones y el botón de cerrar sesión.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../auth/AuthProvider";
import { clearSession, getSession, saveSession } from "../auth/session";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "./AdminLayout";

// Monta el panel con sesión iniciada. Las páginas se sustituyen por un
// texto simple: aquí solo importa el marco que las rodea.
function renderPanel() {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<p>Pantalla de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<p>Lista de reservas</p>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Marco del panel", () => {
  beforeEach(() => {
    saveSession({ token: "token-de-prueba", email: "cortador@example.com" });
  });

  afterEach(() => {
    clearSession();
  });

  it("muestra el email del cortador, las secciones y la página actual", () => {
    renderPanel();

    expect(screen.getByText("cortador@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lista de reservas")).toBeInTheDocument();
    const sections = screen.getByRole("navigation", { name: "Secciones del panel" });
    expect(sections).toHaveTextContent("Reservas");
    expect(sections).toHaveTextContent("Jamones");
    expect(sections).toHaveTextContent("Tarifas");
  });

  it("'Cerrar sesión' borra la sesión y vuelve al login", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
    expect(getSession()).toBeNull();
  });
});
