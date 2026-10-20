// Tests de las reglas habituales del panel: cómo se describen, crear,
// editar, borrar y lo que pide el formulario.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAvailabilityRule, deleteAvailabilityRule, updateAvailabilityRule } from "../../api/availability";
import type { AvailabilityRule } from "../../types";
import AvailabilityRules from "./AvailabilityRules";

vi.mock("../../api/availability", () => ({
  createAvailabilityRule: vi.fn(),
  updateAvailabilityRule: vi.fn(),
  deleteAvailabilityRule: vi.fn(),
}));

const weekdays: AvailabilityRule = {
  id: 1,
  daysOfWeek: ["MONDAY", "TUESDAY"],
  coverage: "FULL_DAY",
  startDate: null,
  endDate: null,
};

describe("AvailabilityRules", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("sin reglas, explica para qué sirven", () => {
    render(<AvailabilityRules initialRules={[]} onChanged={vi.fn()} />);

    expect(screen.getByText(/No tienes reglas/)).toBeInTheDocument();
  });

  it("describe cada regla con sus días, lo que ocupa y su periodo", () => {
    render(
      <AvailabilityRules
        initialRules={[
          weekdays,
          { ...weekdays, id: 2, coverage: "EVENING", startDate: "2026-11-01", endDate: "2027-06-30" },
          { ...weekdays, id: 3, startDate: "2026-11-01" },
          { ...weekdays, id: 4, endDate: "2027-06-30" },
        ]}
        onChanged={vi.fn()}
      />,
    );

    expect(screen.getByText("Lunes, Martes · Día completo ocupado · siempre")).toBeInTheDocument();
    expect(
      screen.getByText("Lunes, Martes · Tarde/noche ocupada · del domingo, 1 de noviembre de 2026 al miércoles, 30 de junio de 2027"),
    ).toBeInTheDocument();
    expect(screen.getByText(/desde el domingo, 1 de noviembre de 2026/)).toBeInTheDocument();
    expect(screen.getByText(/hasta el miércoles, 30 de junio de 2027/)).toBeInTheDocument();
  });

  it("crea una regla con los días marcados y avisa para repintar el calendario", async () => {
    vi.mocked(createAvailabilityRule).mockResolvedValue({ ...weekdays, id: 9, daysOfWeek: ["SATURDAY"] });
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(<AvailabilityRules initialRules={[]} onChanged={onChanged} />);

    await user.click(screen.getByRole("button", { name: "Añadir regla" }));
    // Sin días, el formulario avisa y no guarda.
    await user.click(screen.getByRole("button", { name: "Añadir regla" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Elige al menos un día de la semana");

    await user.click(screen.getByLabelText("Sábado"));
    await user.selectOptions(screen.getByLabelText("Qué tienes ocupado esos días"), "Tarde/noche");
    await user.click(screen.getByRole("button", { name: "Añadir regla" }));

    expect(createAvailabilityRule).toHaveBeenCalledWith({
      daysOfWeek: ["SATURDAY"],
      coverage: "EVENING",
      startDate: undefined,
      endDate: undefined,
    });
    expect(await screen.findByText(/^Sábado · /)).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalled();
  });

  it("edita y borra una regla", async () => {
    vi.mocked(updateAvailabilityRule).mockResolvedValue({ ...weekdays, coverage: "MIDDAY" });
    vi.mocked(deleteAvailabilityRule).mockResolvedValue();
    const user = userEvent.setup();
    render(<AvailabilityRules initialRules={[weekdays]} onChanged={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.selectOptions(screen.getByLabelText("Qué tienes ocupado esos días"), "Mañana/tarde");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(updateAvailabilityRule).toHaveBeenCalledWith(1, expect.objectContaining({ coverage: "MIDDAY" }));
    expect(await screen.findByText(/Mañana\/tarde ocupada/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Borrar" }));
    expect(deleteAvailabilityRule).toHaveBeenCalledWith(1);
    expect(await screen.findByText(/No tienes reglas/)).toBeInTheDocument();
  });
});
