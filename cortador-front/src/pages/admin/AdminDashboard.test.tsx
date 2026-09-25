// Tests del panel de reservas. Igual que en el login, las llamadas al
// backend (api/bookings) se sustituyen por mocks para controlar qué
// reservas "devuelve el servidor" y comprobar qué hace el panel con ellas.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/client";
import { adjustBookingPrice, getBookings, updateBookingStatus } from "../../api/bookings";
import type { BookingResponse } from "../../types";
import AdminDashboard from "./AdminDashboard";

vi.mock("../../api/bookings", () => ({
  getBookings: vi.fn(),
  updateBookingStatus: vi.fn(),
  adjustBookingPrice: vi.fn(),
}));

// Crea una reserva de ejemplo; cada test cambia solo lo que le interesa.
function makeBooking(overrides: Partial<BookingResponse>): BookingResponse {
  return {
    id: 1,
    customerName: "Cliente de prueba",
    customerEmail: "cliente@example.com",
    customerPhone: "+34 600 000 000",
    eventDate: "2026-10-17",
    eventTime: "13:30:00",
    estimatedDurationHours: 3,
    eventType: "WEDDING",
    guestCount: 100,
    location: "Finca de prueba",
    serviceType: "CUT_ONLY",
    hamTypeName: null,
    status: "PENDING",
    localityName: "Jerez de la Frontera",
    distanceKm: 0,
    serviceCost: 150,
    hamCost: null,
    travelCost: 0,
    estimatedPrice: 150,
    finalPrice: null,
    priceNote: null,
    notes: null,
    createdAt: "2026-09-25T10:00:00",
    ...overrides,
  };
}

const lucia = makeBooking({ id: 1, customerName: "Lucía Moreno", eventDate: "2026-10-17" });
const marta = makeBooking({ id: 2, customerName: "Marta Gil", eventDate: "2026-10-03" });
const carlos = makeBooking({ id: 3, customerName: "Carlos Ruiz", status: "CONFIRMED" });

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.mocked(getBookings).mockResolvedValue([lucia, marta, carlos]);
  });

  afterEach(() => {
    vi.mocked(getBookings).mockReset();
    vi.mocked(updateBookingStatus).mockReset();
    vi.mocked(adjustBookingPrice).mockReset();
    vi.restoreAllMocks();
  });

  it("empieza mostrando solo las pendientes, con la fecha más cercana primero", async () => {
    render(<AdminDashboard />);

    const names = await screen.findAllByText(/Lucía Moreno|Marta Gil/);
    expect(names.map((el) => el.textContent)).toEqual(["Marta Gil", "Lucía Moreno"]);
    expect(screen.queryByText("Carlos Ruiz")).not.toBeInTheDocument();
  });

  it("las pestañas muestran cuántas reservas hay de cada estado", async () => {
    render(<AdminDashboard />);

    expect(await screen.findByRole("button", { name: "Pendientes (2)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmadas (1)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todas (3)" })).toBeInTheDocument();
  });

  it("al cambiar de pestaña, filtra la lista por ese estado", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await user.click(await screen.findByRole("button", { name: "Confirmadas (1)" }));

    expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();
    expect(screen.queryByText("Lucía Moreno")).not.toBeInTheDocument();
  });

  it("al confirmar una reserva, llama al backend y la reserva pasa a confirmadas", async () => {
    vi.mocked(updateBookingStatus).mockResolvedValue({ ...marta, status: "CONFIRMED" });
    const user = userEvent.setup();
    render(<AdminDashboard />);

    // within(): buscamos el botón "Confirmar" solo dentro de la tarjeta
    // de Marta, porque hay uno igual en cada reserva pendiente.
    const martaCard = (await screen.findByText("Marta Gil")).closest("article")!;
    await user.click(within(martaCard).getByRole("button", { name: "Confirmar" }));

    expect(updateBookingStatus).toHaveBeenCalledWith(2, "CONFIRMED");
    expect(await screen.findByRole("button", { name: "Confirmadas (2)" })).toBeInTheDocument();
    expect(screen.queryByText("Marta Gil")).not.toBeInTheDocument();
  });

  it("cancelar pide confirmación y, si el cortador dice que no, no hace nada", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<AdminDashboard />);

    const martaCard = (await screen.findByText("Marta Gil")).closest("article")!;
    await user.click(within(martaCard).getByRole("button", { name: "Cancelar" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(updateBookingStatus).not.toHaveBeenCalled();
  });

  it("si no se pueden cargar las reservas, muestra un aviso", async () => {
    vi.mocked(getBookings).mockRejectedValue(new Error("sin conexión"));
    render(<AdminDashboard />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se han podido cargar las reservas");
  });

  it("ajustar el precio envía el nuevo precio con su motivo y muestra el calculado tachado", async () => {
    vi.mocked(adjustBookingPrice).mockResolvedValue({ ...marta, finalPrice: 120, priceNote: "Descuento aplicado" });
    const user = userEvent.setup();
    render(<AdminDashboard />);

    const martaCard = (await screen.findByText("Marta Gil")).closest("article")!;
    await user.click(within(martaCard).getByRole("button", { name: "Ajustar precio" }));
    // El formulario empieza con el precio vigente (150 €).
    const priceInput = within(martaCard).getByLabelText("Precio final (€)");
    expect(priceInput).toHaveValue(150);
    await user.clear(priceInput);
    await user.type(priceInput, "120");
    await user.type(within(martaCard).getByLabelText("Motivo"), "Descuento aplicado");
    await user.click(within(martaCard).getByRole("button", { name: "Guardar precio" }));

    expect(adjustBookingPrice).toHaveBeenCalledWith(2, { finalPrice: 120, note: "Descuento aplicado" });
    expect(await within(martaCard).findByText("Motivo: Descuento aplicado")).toBeInTheDocument();
    // El calculado (150 €) sigue visible, tachado, junto al nuevo precio.
    expect(martaCard.querySelector(".line-through")).toHaveTextContent("150,00");
  });

  it("si el backend rechaza el ajuste, muestra el error en el propio formulario de precio", async () => {
    vi.mocked(adjustBookingPrice).mockRejectedValue(
      new ApiError(400, "Revisa los campos marcados", { note: "Escribe el motivo del cambio de precio" }),
    );
    const user = userEvent.setup();
    render(<AdminDashboard />);

    const martaCard = (await screen.findByText("Marta Gil")).closest("article")!;
    await user.click(within(martaCard).getByRole("button", { name: "Ajustar precio" }));
    // El motivo es obligatorio también en el navegador; se escribe uno de
    // espacios para simular que el backend lo rechaza.
    await user.type(within(martaCard).getByLabelText("Motivo"), "   ");
    await user.click(within(martaCard).getByRole("button", { name: "Guardar precio" }));

    expect(await within(martaCard).findByText("Escribe el motivo del cambio de precio")).toBeInTheDocument();
  });
});
