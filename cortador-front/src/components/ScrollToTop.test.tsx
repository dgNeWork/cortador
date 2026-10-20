// Tests de ScrollToTop: al cambiar de página se vuelve arriba, salvo
// cuando el enlace lleva un ancla (#galeria), que tiene su propio scroll.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ScrollToTop from "./ScrollToTop";

// Dos páginas mínimas con enlaces entre ellas, para simular la navegación.
function renderWithRoutes() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Link to="/reservar">Ir a reservar</Link>
              <Link to="/#galeria">Ir a la galería</Link>
            </>
          }
        />
        <Route path="/reservar" element={<p>Formulario</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ScrollToTop", () => {
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("vuelve arriba del todo al cambiar de página", async () => {
    const user = userEvent.setup();
    renderWithRoutes();
    scrollTo.mockClear(); // descartamos la llamada de la carga inicial

    await user.click(screen.getByRole("link", { name: "Ir a reservar" }));

    expect(screen.getByText("Formulario")).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("no toca el scroll si el enlace lleva un ancla", async () => {
    const user = userEvent.setup();
    renderWithRoutes();
    scrollTo.mockClear();

    await user.click(screen.getByRole("link", { name: "Ir a la galería" }));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
