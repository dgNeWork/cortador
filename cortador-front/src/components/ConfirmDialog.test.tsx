// Tests de la ventana de confirmación: cómo se cierra (botón, Escape,
// clic fuera) y que mientras se envía no se puede cerrar ni repetir.
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog";

// El fondo oscuro es el elemento que envuelve a la ventana.
function backdrop(): HTMLElement {
  return screen.getByRole("dialog").parentElement as HTMLElement;
}

function renderDialog({ busy = false } = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      open
      title="Revisa tu solicitud"
      confirmLabel="Confirmar solicitud"
      cancelLabel="Corregir"
      busy={busy}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>Resumen de prueba</p>
    </ConfirmDialog>,
  );
  return { onConfirm, onCancel };
}

describe("ConfirmDialog", () => {
  it("se anuncia como ventana con su título y pone el foco en confirmar", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "Revisa tu solicitud" })).toBeInTheDocument();
    expect(screen.getByText("Resumen de prueba")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar solicitud" })).toHaveFocus();
  });

  it("los botones avisan de confirmar o cancelar", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Confirmar solicitud" }));
    await user.click(screen.getByRole("button", { name: "Corregir" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Escape y el clic fuera de la ventana la cancelan; el clic dentro no", () => {
    const { onCancel } = renderDialog();

    fireEvent.click(screen.getByText("Resumen de prueba"));
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(backdrop());
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("mientras se envía, los botones se desactivan y no se puede cerrar", () => {
    const { onCancel } = renderDialog({ busy: true });

    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Corregir" })).toBeDisabled();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(backdrop());
    expect(onCancel).not.toHaveBeenCalled();
  });
});
