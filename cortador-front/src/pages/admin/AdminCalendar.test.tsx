// Tests de la pantalla "Calendario" del panel: carga el mes, muestra la
// ficha del día pulsado con sus reservas y el buscador salta a una fecha.
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminAvailability, getAvailabilityRules } from "../../api/availability";
import { getBookings } from "../../api/bookings";
import { toIsoDate } from "../../components/calendar/dates";
import { formatEventDate } from "../../format";
import type { BookingResponse } from "../../types";
import AdminCalendar from "./AdminCalendar";

vi.mock("../../api/availability", () => ({
  getAdminAvailability: vi.fn(),
  getAvailabilityRules: vi.fn(),
  setDayMark: vi.fn(),
  clearDayMark: vi.fn(),
}));
vi.mock("../../api/bookings", () => ({ getBookings: vi.fn() }));

// El día 10 de este mes, que siempre se ve al entrar.
const now = new Date();
const DAY = toIsoDate(new Date(now.getFullYear(), now.getMonth(), 10));

describe("Calendario del panel", () => {
  beforeEach(() => {
    vi.mocked(getAdminAvailability).mockResolvedValue([
      { date: DAY, booked: "MIDDAY", mark: null, blocked: "NONE", occupied: "MIDDAY" },
    ]);
    vi.mocked(getAvailabilityRules).mockResolvedValue([]);
    vi.mocked(getBookings).mockResolvedValue([
      { id: 1, eventDate: DAY, timeSlot: "MIDDAY", status: "CONFIRMED", customerName: "Ana Pérez" } as BookingResponse,
      { id: 2, eventDate: DAY, timeSlot: "EVENING", status: "CANCELLED", customerName: "Luis Gil" } as BookingResponse,
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("pinta el mes, y al pulsar un día muestra sus reservas sin las canceladas", async () => {
    const user = userEvent.setup();
    render(<AdminCalendar />);

    const day = await screen.findByRole("button", { name: `${formatEventDate(DAY)}: mañana/tarde ocupada` });
    await user.click(day);

    expect(screen.getByRole("heading", { name: formatEventDate(DAY) })).toBeInTheDocument();
    expect(await screen.findByText(/Ana Pérez/)).toBeInTheDocument();
    expect(screen.queryByText(/Luis Gil/)).not.toBeInTheDocument();
    expect(screen.getByText(/No tienes reglas/)).toBeInTheDocument();
  });

  it("el buscador salta al mes de la fecha elegida", async () => {
    render(<AdminCalendar />);
    await screen.findByText(/No tienes reglas/);

    fireEvent.change(screen.getByLabelText("Buscar un día"), { target: { value: "2030-05-20" } });

    expect(await screen.findByText("Mayo de 2030")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lunes, 20 de mayo de 2030" })).toBeInTheDocument();
    expect(getAdminAvailability).toHaveBeenLastCalledWith("2030-05-01", "2030-05-31");
  });

  it("si falla la carga, lo dice", async () => {
    vi.mocked(getBookings).mockRejectedValue(new Error("sin conexión"));
    render(<AdminCalendar />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se ha podido cargar el calendario");
  });
});
