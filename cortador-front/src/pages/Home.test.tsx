// Tests de la página de inicio. Todos sus textos salen de config/site.ts,
// así que se comprueba que la página pinta lo que haya allí (si un
// cortador cambia site.ts, la home cambia sin tocar el componente).
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "../config/site";
import Home from "./Home";

function renderHome(path = "/") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Home />
    </MemoryRouter>,
  );
}

describe("Página de inicio", () => {
  beforeEach(() => {
    // jsdom no implementa el scroll de los elementos.
    Element.prototype.scrollIntoView = vi.fn();
    // Ni IntersectionObserver, que Framer Motion usa para animar cada
    // sección cuando entra en pantalla (whileInView). Basta con una
    // versión vacía: aquí no se prueban las animaciones.
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("pinta la portada y la sección 'Quién soy' con los datos de site.ts", () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 1, name: siteConfig.home.heroTitle })).toBeInTheDocument();
    expect(screen.getByText(siteConfig.home.heroText)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: siteConfig.owner.name })).toBeInTheDocument();
    expect(screen.getByText(`${siteConfig.owner.yearsExperience}+`)).toBeInTheDocument();
  });

  it("pinta las modalidades y los pasos, numerando los pasos según su orden", () => {
    renderHome();

    siteConfig.home.services.forEach((service) => {
      expect(screen.getByRole("heading", { name: service.title })).toBeInTheDocument();
    });
    siteConfig.home.steps.forEach((step, index) => {
      expect(screen.getByRole("heading", { name: step.title })).toBeInTheDocument();
      expect(screen.getByText(String(index + 1).padStart(2, "0"))).toBeInTheDocument();
    });
  });

  it("los botones de reservar llevan al formulario", () => {
    renderHome();

    const links = screen.getAllByRole("link", { name: "Reservar ahora" });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/reservar"));
  });

  it("al llegar con #galeria en la dirección, baja hasta la galería", () => {
    renderHome("/#galeria");

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
