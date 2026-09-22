// Este archivo se ejecuta una vez antes de todos los tests (ver
// setupFiles en vite.config.ts). Añade matchers extra de Jest a las
// aserciones de Vitest, como toBeInTheDocument() o toHaveTextContent(),
// para no tener que comprobar el DOM a mano con cosas más incómodas.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library no limpia el DOM simulado solo entre tests: sin
// esto, cada test siguiente vería también los componentes que montaron
// los tests anteriores, mezclando resultados (por ejemplo, "encontrar
// dos botones" cuando en realidad son de dos tests distintos).
afterEach(() => {
  cleanup();
});
