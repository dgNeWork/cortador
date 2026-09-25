// Tests del formulario público de reserva, centrados en lo nuevo: el
// desplegable de localidad, el precio en vivo y lo que se envía al backend.
// Todas las llamadas a la API son mocks (vi.mock), así que no hace falta
// el backend arrancado.
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBooking, getQuote } from "../api/bookings";
import { getHamTypes } from "../api/hamTypes";
import { getPublicLocalities } from "../api/pricing";
import type { BookingResponse, Quote } from "../types";
import Booking from "./Booking";

vi.mock("../api/bookings", () => ({ createBooking: vi.fn(), getQuote: vi.fn() }));
vi.mock("../api/hamTypes", () => ({ getHamTypes: vi.fn() }));
vi.mock("../api/pricing", () => ({ getPublicLocalities: vi.fn() }));

// Presupuesto de 3 h en Cádiz: 150 € + 28 € de desplazamiento.
const cadizQuote: Quote = {
  localityName: "Cádiz",
  hours: 3,
  hourlyRate: 50,
  serviceCost: 150,
  hamTypeName: null,
  hamCost: null,
  distanceKm: 70,
  pricePerKm: 0.4,
  travelCost: 28,
  total: 178,
  onRequest: false,
};

describe("Formulario de reserva", () => {
  beforeEach(() => {
    vi.mocked(getHamTypes).mockResolvedValue([]);
    vi.mocked(getPublicLocalities).mockResolvedValue({
      homeLocality: "Jerez de la Frontera",
      localities: [{ id: 4, name: "Cádiz", distanceKm: 70 }],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("el desplegable ofrece la localidad del cortador, su lista y 'Otra localidad'", async () => {
    render(<Booking />);

    const select = screen.getByLabelText("Localidad del evento");
    expect(await within(select).findByRole("option", { name: "Jerez de la Frontera (sin desplazamiento)" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Cádiz" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Otra localidad" })).toBeInTheDocument();
  });

  it("con la duración y la localidad elegidas, pide el presupuesto y lo muestra desglosado", async () => {
    vi.mocked(getQuote).mockResolvedValue(cadizQuote);
    const user = userEvent.setup();
    render(<Booking />);

    await user.type(screen.getByLabelText("Duración estimada (horas)"), "3");
    await within(screen.getByLabelText("Localidad del evento")).findByRole("option", { name: "Cádiz" });
    await user.selectOptions(screen.getByLabelText("Localidad del evento"), "Cádiz");

    // findBy espera (hasta 1 s) a que pase la pausa antes de pedir el precio.
    expect(await screen.findByText(/178,00/)).toBeInTheDocument();
    expect(getQuote).toHaveBeenLastCalledWith({
      estimatedDurationHours: 3,
      serviceType: "CUT_ONLY",
      hamTypeId: undefined,
      localityOption: "LISTED",
      localityId: 4,
    });
    expect(screen.getByText("Cádiz · 70 km")).toBeInTheDocument();
  });

  it("con 'Otra localidad', el total aparece como 'A consultar'", async () => {
    vi.mocked(getQuote).mockResolvedValue({
      ...cadizQuote,
      localityName: "Vejer",
      distanceKm: null,
      travelCost: null,
      total: null,
      onRequest: true,
    });
    const user = userEvent.setup();
    render(<Booking />);

    await user.type(screen.getByLabelText("Duración estimada (horas)"), "3");
    await user.selectOptions(screen.getByLabelText("Localidad del evento"), "Otra localidad");
    await user.type(screen.getByLabelText("¿Qué localidad?"), "Vejer");

    expect(await screen.findAllByText("A consultar")).toHaveLength(2); // desplazamiento y total
    expect(getQuote).toHaveBeenLastCalledWith(expect.objectContaining({ localityOption: "OTHER", otherLocalityName: "Vejer" }));
  });

  it("mientras falten datos, no pide presupuesto y explica qué falta", () => {
    render(<Booking />);

    expect(screen.getByText(/Completa la duración, el servicio y la localidad/)).toBeInTheDocument();
    expect(getQuote).not.toHaveBeenCalled();
  });

  it("al enviar, manda la localidad elegida y muestra el precio en la confirmación", async () => {
    vi.mocked(getQuote).mockResolvedValue(cadizQuote);
    vi.mocked(createBooking).mockResolvedValue({
      id: 12,
      customerName: "Lucía Moreno",
      customerEmail: "lucia@example.com",
      eventDate: "2026-10-17",
      location: "Finca Los Olivos",
      estimatedPrice: 178,
    } as BookingResponse);
    const user = userEvent.setup();
    render(<Booking />);

    await user.type(screen.getByLabelText("Nombre"), "Lucía Moreno");
    await user.type(screen.getByLabelText("Email"), "lucia@example.com");
    await user.type(screen.getByLabelText("Teléfono"), "611222333");
    // Los campos de fecha y hora se rellenan de golpe: el navegador
    // simulado no deja "teclearlos" carácter a carácter.
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-10-17" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "13:30" } });
    await user.type(screen.getByLabelText("Duración estimada (horas)"), "3");
    await user.type(screen.getByLabelText("Número de invitados"), "120");
    await within(screen.getByLabelText("Localidad del evento")).findByRole("option", { name: "Cádiz" });
    await user.selectOptions(screen.getByLabelText("Localidad del evento"), "Cádiz");
    await user.type(screen.getByLabelText("Dirección del evento"), "Finca Los Olivos");
    await user.click(screen.getByRole("button", { name: "Enviar solicitud" }));

    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ localityOption: "LISTED", localityId: 4, estimatedDurationHours: 3 }),
    );
    expect(await screen.findByText(/Solicitud recibida, Lucía/)).toBeInTheDocument();
    expect(screen.getByText(/178,00/)).toBeInTheDocument();
  });
});
