// Tests del calendario de un mes: cómo se pinta cada día, qué se puede
// pulsar y el paso de mes.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MonthCalendar from "./MonthCalendar";

const MARCH_2027 = { year: 2027, month: 2 };

describe("MonthCalendar", () => {
  it("pinta cada día según su ocupación y lo anuncia en su etiqueta", () => {
    render(
      <MonthCalendar
        month={MARCH_2027}
        onMonthChange={vi.fn()}
        occupancy={{ "2027-03-13": "EVENING", "2027-03-14": "FULL_DAY" }}
        selectedDate="2027-03-13"
        onSelectDate={vi.fn()}
      />,
    );

    expect(screen.getByText("Marzo de 2027")).toBeInTheDocument();
    const evening = screen.getByRole("button", { name: "Sábado, 13 de marzo de 2027: tarde/noche ocupada" });
    expect(evening).toHaveClass("bg-slot-evening");
    expect(evening).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Domingo, 14 de marzo de 2027: día completo ocupado" })).toHaveClass(
      "bg-slot-full",
    );
    expect(screen.getByRole("button", { name: "Lunes, 15 de marzo de 2027: libre" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("avisa del día pulsado y no deja pulsar los desactivados", async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    render(
      <MonthCalendar
        month={MARCH_2027}
        onMonthChange={vi.fn()}
        occupancy={{ "2027-03-14": "FULL_DAY" }}
        selectedDate={null}
        onSelectDate={onSelectDate}
        isDayDisabled={(_, coverage) => coverage === "FULL_DAY"}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^Lunes, 15 de marzo de 2027/ }));
    await user.click(screen.getByRole("button", { name: /^Domingo, 14 de marzo de 2027/ }));

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenCalledWith("2027-03-15");
  });

  it("pasa al mes siguiente y al anterior", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(
      <MonthCalendar month={MARCH_2027} onMonthChange={onMonthChange} occupancy={{}} selectedDate={null} onSelectDate={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));
    await user.click(screen.getByRole("button", { name: "Mes anterior" }));

    expect(onMonthChange).toHaveBeenNthCalledWith(1, { year: 2027, month: 3 });
    expect(onMonthChange).toHaveBeenNthCalledWith(2, { year: 2027, month: 1 });
  });

  it("en el formulario no deja volver a meses anteriores al actual", () => {
    const now = new Date();
    render(
      <MonthCalendar
        month={{ year: now.getFullYear(), month: now.getMonth() }}
        onMonthChange={vi.fn()}
        occupancy={{}}
        selectedDate={null}
        onSelectDate={vi.fn()}
        allowPastMonths={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Mes anterior" })).toBeDisabled();
  });
});
