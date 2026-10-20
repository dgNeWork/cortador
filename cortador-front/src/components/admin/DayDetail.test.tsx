// Tests de la ficha de un día en el calendario del panel: marcarlo, volver
// a las reglas y el aviso al dejar libre una franja con reserva confirmada.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearDayMark, setDayMark } from "../../api/availability";
import { ApiError } from "../../api/client";
import type { AdminDayAvailability, BookingResponse } from "../../types";
import DayDetail from "./DayDetail";

vi.mock("../../api/availability", () => ({ setDayMark: vi.fn(), clearDayMark: vi.fn() }));

const DATE = "2027-03-13";

function renderDay(day: AdminDayAvailability | undefined, bookings: BookingResponse[] = []) {
  const onChanged = vi.fn();
  render(<DayDetail date={DATE} day={day} bookings={bookings} onChanged={onChanged} />);
  return { onChanged };
}

const booking = {
  id: 4,
  customerName: "Ana Pérez",
  timeSlot: "MIDDAY",
  status: "CONFIRMED",
} as BookingResponse;

describe("DayDetail", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("un día libre: muestra la fecha, sin reservas, y 'Según mis reglas' elegido", () => {
    renderDay(undefined);

    expect(screen.getByRole("heading", { name: "Sábado, 13 de marzo de 2027" })).toBeInTheDocument();
    expect(screen.getByText("Ninguna.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Según mis reglas" })).toHaveAttribute("aria-pressed", "true");
  });

  it("explica cuando el día lo ocupan las reglas habituales", () => {
    renderDay({ date: DATE, booked: "NONE", mark: null, blocked: "FULL_DAY", occupied: "FULL_DAY" });

    expect(screen.getByText(/por tus reglas habituales/)).toBeInTheDocument();
  });

  it("marcar el día guarda la marca y avisa para repintar el calendario", async () => {
    vi.mocked(setDayMark).mockResolvedValue();
    const user = userEvent.setup();
    const { onChanged } = renderDay(undefined);

    await user.click(screen.getByRole("button", { name: "Tarde/noche ocupada" }));

    expect(setDayMark).toHaveBeenCalledWith(DATE, "EVENING");
    expect(onChanged).toHaveBeenCalled();
  });

  it("'Según mis reglas' quita la marca del día", async () => {
    vi.mocked(clearDayMark).mockResolvedValue();
    const user = userEvent.setup();
    renderDay({ date: DATE, booked: "NONE", mark: "FULL_DAY", blocked: "FULL_DAY", occupied: "FULL_DAY" });

    await user.click(screen.getByRole("button", { name: "Según mis reglas" }));

    expect(clearDayMark).toHaveBeenCalledWith(DATE);
  });

  it("dejar libre una franja con reserva confirmada pide confirmación antes de guardar", async () => {
    vi.mocked(setDayMark).mockResolvedValue();
    const user = userEvent.setup();
    renderDay({ date: DATE, booked: "MIDDAY", mark: null, blocked: "NONE", occupied: "MIDDAY" }, [booking]);

    expect(screen.getByText(/Ana Pérez/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Libre" }));

    const dialog = screen.getByRole("dialog", { name: "Este día tiene una reserva confirmada" });
    expect(within(dialog).getByText(/por la mañana\/tarde/)).toBeInTheDocument();
    expect(setDayMark).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Guardar igualmente" }));
    expect(setDayMark).toHaveBeenCalledWith(DATE, "NONE");
  });

  it("si al guardar falla el backend, muestra su mensaje", async () => {
    vi.mocked(setDayMark).mockRejectedValue(new ApiError(400, "Fecha no válida"));
    const user = userEvent.setup();
    renderDay(undefined);

    await user.click(screen.getByRole("button", { name: "Día completo ocupado" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Fecha no válida");
  });
});
