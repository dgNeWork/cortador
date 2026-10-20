// Tests del mapa de rutas: una dirección que no existe muestra la página
// 404 dentro del marco público (con cabecera y pie), no una pantalla en
// blanco.
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";

describe("Rutas de la app", () => {
  beforeEach(() => {
    // jsdom no implementa el scroll; ScrollToTop lo llama al cambiar de página.
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("una dirección que no existe muestra la página 404 con la cabecera de la web", () => {
    render(
      <MemoryRouter initialEntries={["/esta-pagina-no-existe"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Esta página no existe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
    // La cabecera sigue ahí, con su botón para reservar.
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
