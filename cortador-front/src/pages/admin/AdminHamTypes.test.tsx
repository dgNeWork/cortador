// Tests de la pantalla "Jamones" del panel. Las llamadas al backend se
// sustituyen por mocks (vi.mock) para decidir qué catálogo "devuelve el
// servidor" y comprobar qué se le envía al guardar.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import { createHamType, getAdminHamTypes, updateHamType } from "../../api/hamTypes";
import type { HamType } from "../../types";
import AdminHamTypes from "./AdminHamTypes";

vi.mock("../../api/hamTypes", () => ({
  getAdminHamTypes: vi.fn(),
  createHamType: vi.fn(),
  updateHamType: vi.fn(),
}));

const cebo: HamType = { id: 1, name: "Cebo", description: "24 meses", price: 180, active: true };
const bellota: HamType = { id: 2, name: "Bellota", description: null, price: 390, active: false };

// Busca la tarjeta de un jamón por su nombre, para pulsar sus botones.
function cardOf(name: string): HTMLElement {
  return screen.getByText(name).closest("article")!;
}

describe("AdminHamTypes", () => {
  beforeEach(() => {
    vi.mocked(getAdminHamTypes).mockResolvedValue([cebo, bellota]);
  });

  afterEach(() => {
    vi.mocked(getAdminHamTypes).mockReset();
    vi.mocked(createHamType).mockReset();
    vi.mocked(updateHamType).mockReset();
  });

  it("muestra el catálogo con el precio en euros y marca los desactivados", async () => {
    render(<AdminHamTypes />);

    expect(await screen.findByText("Cebo")).toBeInTheDocument();
    // Intl pone un espacio especial antes del €, por eso se busca con una
    // expresión regular en vez de con el texto exacto.
    expect(within(cardOf("Cebo")).getByText(/180,00/)).toBeInTheDocument();
    expect(within(cardOf("Bellota")).getByText("Desactivado")).toBeInTheDocument();
  });

  it("añadir un jamón lo envía al backend y lo muestra en la lista", async () => {
    vi.mocked(createHamType).mockResolvedValue({ id: 3, name: "Cebo de campo", description: null, price: 260, active: true });
    const user = userEvent.setup();
    render(<AdminHamTypes />);

    await user.click(await screen.findByRole("button", { name: "Añadir jamón" }));
    await user.type(screen.getByLabelText("Nombre"), "Cebo de campo");
    await user.type(screen.getByLabelText("Precio (€)"), "260");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(createHamType).toHaveBeenCalledWith(expect.objectContaining({ name: "Cebo de campo", price: 260 }));
    expect(await screen.findByText("Cebo de campo")).toBeInTheDocument();
  });

  it("desactivar un jamón manda el mismo jamón con active: false", async () => {
    vi.mocked(updateHamType).mockResolvedValue({ ...cebo, active: false });
    const user = userEvent.setup();
    render(<AdminHamTypes />);

    await screen.findByText("Cebo");
    await user.click(within(cardOf("Cebo")).getByRole("button", { name: "Desactivar" }));

    expect(updateHamType).toHaveBeenCalledWith(1, expect.objectContaining({ name: "Cebo", active: false }));
    expect(await within(cardOf("Cebo")).findByText("Desactivado")).toBeInTheDocument();
  });

  it("si el backend rechaza un campo, muestra el error debajo de ese campo", async () => {
    vi.mocked(updateHamType).mockRejectedValue(
      new ApiError(400, "Revisa los campos marcados", { price: "El precio debe ser mayor que cero" }),
    );
    const user = userEvent.setup();
    render(<AdminHamTypes />);

    await screen.findByText("Cebo");
    await user.click(within(cardOf("Cebo")).getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("El precio debe ser mayor que cero")).toBeInTheDocument();
  });
});
