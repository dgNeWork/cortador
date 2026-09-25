// Tests de la pantalla "Tarifas" del panel, con la API sustituida por
// mocks (vi.mock), igual que en las otras pantallas del panel.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import {
  createLocality,
  deleteLocality,
  getLocalities,
  getPricingSettings,
  updatePricingSettings,
} from "../../api/pricing";
import type { Locality, PricingSettings } from "../../types";
import AdminPricing from "./AdminPricing";

vi.mock("../../api/pricing", () => ({
  getPricingSettings: vi.fn(),
  updatePricingSettings: vi.fn(),
  getLocalities: vi.fn(),
  createLocality: vi.fn(),
  updateLocality: vi.fn(),
  deleteLocality: vi.fn(),
}));

const settings: PricingSettings = { hourlyRate: 50, pricePerKm: 0.4, homeLocality: "Jerez de la Frontera" };
const cadiz: Locality = { id: 4, name: "Cádiz", distanceKm: 70 };

function cardOf(name: string): HTMLElement {
  return screen.getByText(name).closest("article")!;
}

describe("AdminPricing", () => {
  beforeEach(() => {
    vi.mocked(getPricingSettings).mockResolvedValue(settings);
    vi.mocked(getLocalities).mockResolvedValue([cadiz]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("carga las tarifas en el formulario y muestra cuánto cuesta ir a cada localidad", async () => {
    render(<AdminPricing />);

    expect(await screen.findByLabelText("Precio por hora de corte (€)")).toHaveValue(50);
    expect(screen.getByLabelText("Tu localidad")).toHaveValue("Jerez de la Frontera");
    // 70 km x 0,40 €/km = 28 €.
    expect(within(cardOf("Cádiz")).getByText(/70 km ida y vuelta · desplazamiento 28,00/)).toBeInTheDocument();
  });

  it("guardar tarifas envía los números y avisa de que se han guardado", async () => {
    vi.mocked(updatePricingSettings).mockResolvedValue({ ...settings, hourlyRate: 60 });
    const user = userEvent.setup();
    render(<AdminPricing />);

    const hourly = await screen.findByLabelText("Precio por hora de corte (€)");
    await user.clear(hourly);
    await user.type(hourly, "60");
    await user.click(screen.getByRole("button", { name: "Guardar tarifas" }));

    expect(updatePricingSettings).toHaveBeenCalledWith({
      hourlyRate: 60,
      pricePerKm: 0.4,
      homeLocality: "Jerez de la Frontera",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Tarifas guardadas.");
  });

  it("añadir una localidad la muestra en la lista", async () => {
    vi.mocked(createLocality).mockResolvedValue({ id: 5, name: "Rota", distanceKm: 60 });
    const user = userEvent.setup();
    render(<AdminPricing />);

    await user.click(await screen.findByRole("button", { name: "Añadir localidad" }));
    await user.type(screen.getByLabelText("Localidad"), "Rota");
    await user.type(screen.getByLabelText("Km ida y vuelta"), "60");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(createLocality).toHaveBeenCalledWith({ name: "Rota", distanceKm: 60 });
    expect(await screen.findByText("Rota")).toBeInTheDocument();
  });

  it("si la localidad está repetida, muestra el mensaje del backend", async () => {
    vi.mocked(createLocality).mockRejectedValue(new ApiError(400, "Ya tienes Cádiz en la lista"));
    const user = userEvent.setup();
    render(<AdminPricing />);

    await user.click(await screen.findByRole("button", { name: "Añadir localidad" }));
    await user.type(screen.getByLabelText("Localidad"), "Cádiz");
    await user.type(screen.getByLabelText("Km ida y vuelta"), "70");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ya tienes Cádiz en la lista");
  });

  it("quitar una localidad pide confirmación y, si se acepta, la borra", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(deleteLocality).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AdminPricing />);

    await screen.findByText("Cádiz");
    await user.click(within(cardOf("Cádiz")).getByRole("button", { name: "Quitar" }));

    expect(window.confirm).toHaveBeenCalledWith("¿Quitar Cádiz de tu lista?");
    expect(deleteLocality).toHaveBeenCalledWith(4);
    expect(screen.queryByText("Cádiz")).not.toBeInTheDocument();
  });
});
