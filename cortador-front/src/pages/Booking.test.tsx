// Tests del formulario público de reserva: la franja, la ventana de
// revisión antes de enviar y lo que se manda al backend, en los dos modos
// de la web (con precio en vivo y modo presupuesto, sin precios).
// Todas las llamadas a la API son mocks (vi.mock), así que no hace falta
// el backend arrancado.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAvailability } from "../api/availability";
import { createBooking, getQuote } from "../api/bookings";
import { ApiError } from "../api/client";
import { getHamTypes } from "../api/hamTypes";
import { getPublicLocalities } from "../api/pricing";
import { toIsoDate } from "../components/calendar/dates";
import { siteConfig } from "../config/site";
import { formatEventDate } from "../format";
import type { BookingResponse, Quote } from "../types";
import Booking from "./Booking";

vi.mock("../api/availability", () => ({ getAvailability: vi.fn() }));
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

// El día 17 del mes que viene: siempre es futuro, y para llegar a él en
// el calendario basta con pulsar "Mes siguiente" una vez.
const now = new Date();
const EVENT_DATE = toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 17));

// Pulsa un día del calendario del mes que viene.
async function pickNextMonthDay(user: ReturnType<typeof userEvent.setup>, isoDate = EVENT_DATE) {
  await user.click(screen.getByRole("button", { name: "Mes siguiente" }));
  await user.click(await screen.findByRole("button", { name: new RegExp(`^${formatEventDate(isoDate)}:`) }));
}

// Lo que devuelve el backend al crear la solicitud de Lucía.
const luciaBooking = {
  id: 12,
  customerName: "Lucía Moreno",
  customerEmail: "lucia@example.com",
  eventDate: "2026-10-17",
  timeSlot: "MIDDAY",
  location: "Finca Los Olivos",
  estimatedPrice: 178,
} as BookingResponse;

type User = ReturnType<typeof userEvent.setup>;

// Rellena el formulario completo como lo haría Lucía, sin enviarlo.
async function fillForm(user: User, { chooseSlot = true, chooseDate = true } = {}) {
  await user.type(screen.getByLabelText("Nombre"), "Lucía Moreno");
  await user.type(screen.getByLabelText("Email"), "lucia@example.com");
  await user.type(screen.getByLabelText("Teléfono"), "611222333");
  if (chooseDate) {
    await pickNextMonthDay(user);
  }
  // La hora se rellena de golpe: el navegador simulado no deja
  // "teclearla" carácter a carácter.
  fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "13:30" } });
  if (chooseSlot) {
    await user.click(screen.getByRole("button", { name: /Mañana\/tarde/ }));
  }
  await user.type(screen.getByLabelText("Duración estimada (horas)"), "3");
  await user.type(screen.getByLabelText("Número de invitados"), "120");
  await within(screen.getByLabelText("Localidad del evento")).findByRole("option", { name: "Cádiz" });
  await user.selectOptions(screen.getByLabelText("Localidad del evento"), "Cádiz");
  await user.type(screen.getByLabelText("Dirección del evento"), "Finca Los Olivos");
}

describe("Formulario de reserva con precio (quoteMode = false)", () => {
  beforeEach(() => {
    siteConfig.quoteMode = false;
    vi.mocked(getAvailability).mockResolvedValue([]);
    vi.mocked(getHamTypes).mockResolvedValue([]);
    vi.mocked(getPublicLocalities).mockResolvedValue({
      homeLocality: "Jerez de la Frontera",
      localities: [{ id: 4, name: "Cádiz", distanceKm: 70 }],
    });
  });

  afterEach(() => {
    siteConfig.quoteMode = true;
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

  it("al confirmar en la ventana, manda la localidad y la franja y muestra el precio", async () => {
    vi.mocked(getQuote).mockResolvedValue(cadizQuote);
    vi.mocked(createBooking).mockResolvedValue(luciaBooking);
    const user = userEvent.setup();
    render(<Booking />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Enviar solicitud" }));
    await user.click(screen.getByRole("button", { name: "Confirmar solicitud" }));

    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ localityOption: "LISTED", localityId: 4, estimatedDurationHours: 3, timeSlot: "MIDDAY" }),
    );
    expect(await screen.findByText(/Solicitud recibida, Lucía/)).toBeInTheDocument();
    expect(screen.getByText(/178,00/)).toBeInTheDocument();
  });
});

describe("Formulario en modo presupuesto (quoteMode = true)", () => {
  beforeEach(() => {
    siteConfig.quoteMode = true;
    vi.mocked(getAvailability).mockResolvedValue([]);
    // Framer Motion llama a window.scrollTo al animar la apertura del
    // desplegable de jamones, y jsdom no lo implementa.
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.mocked(getHamTypes).mockResolvedValue([{ id: 2, name: "Bellota", description: null, price: 390, active: true }]);
    vi.mocked(getPublicLocalities).mockResolvedValue({
      homeLocality: "Jerez de la Frontera",
      localities: [{ id: 4, name: "Cádiz", distanceKm: 70 }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("no muestra ningún precio ni lo pide, salvo el de los jamones", async () => {
    const user = userEvent.setup();
    render(<Booking />);

    expect(screen.getByRole("heading", { name: "Solicitar presupuesto" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Servicio completo/ }));
    expect(await screen.findByRole("option", { name: /Bellota — 390,00/ })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Duración estimada (horas)"), "3");

    expect(screen.queryByText("Precio")).not.toBeInTheDocument();
    expect(getQuote).not.toHaveBeenCalled();
  });

  it("si no se elige franja, avisa en vez de abrir la ventana", async () => {
    const user = userEvent.setup();
    render(<Booking />);

    await fillForm(user, { chooseSlot: false });
    await user.click(screen.getByRole("button", { name: "Consultar presupuesto y disponibilidad" }));

    expect(screen.getByText("Elige la franja del evento")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("la ventana resume los datos y 'Corregir' la cierra sin enviar nada", async () => {
    const user = userEvent.setup();
    render(<Booking />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Consultar presupuesto y disponibilidad" }));

    const dialog = screen.getByRole("dialog", { name: "Revisa tu solicitud" });
    expect(within(dialog).getByText(formatEventDate(EVENT_DATE))).toBeInTheDocument();
    expect(within(dialog).getByText("Mañana/tarde")).toBeInTheDocument();
    expect(within(dialog).getByText("Cádiz")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Corregir" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(createBooking).not.toHaveBeenCalled();
  });

  it("al confirmar, envía la solicitud y la confirmación no lleva precio", async () => {
    vi.mocked(createBooking).mockResolvedValue(luciaBooking);
    const user = userEvent.setup();
    render(<Booking />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Consultar presupuesto y disponibilidad" }));
    await user.click(screen.getByRole("button", { name: "Confirmar solicitud" }));

    expect(await screen.findByText(/Solicitud recibida, Lucía/)).toBeInTheDocument();
    expect(screen.getByText(/por la mañana\/tarde/)).toBeInTheDocument();
    expect(screen.queryByText(/Precio/)).not.toBeInTheDocument();
  });

  it("si la franja se ha ocupado mientras tanto, cierra la ventana y muestra el aviso del backend", async () => {
    vi.mocked(createBooking).mockRejectedValue(
      new ApiError(409, "Esa franja ya no está disponible ese día. Elige otro día u otra franja."),
    );
    const user = userEvent.setup();
    render(<Booking />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Consultar presupuesto y disponibilidad" }));
    await user.click(screen.getByRole("button", { name: "Confirmar solicitud" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Esa franja ya no está disponible");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("si no se elige día, avisa en vez de abrir la ventana", async () => {
    const user = userEvent.setup();
    render(<Booking />);

    await fillForm(user, { chooseDate: false });
    await user.click(screen.getByRole("button", { name: "Consultar presupuesto y disponibilidad" }));

    expect(screen.getByText("Elige el día en el calendario")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("el calendario no deja elegir días pasados ni completos, y desactiva la franja ocupada", async () => {
    const fullDay = toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 18));
    vi.mocked(getAvailability).mockResolvedValue([
      { date: EVENT_DATE, occupied: "MIDDAY" },
      { date: fullDay, occupied: "FULL_DAY" },
    ]);
    const user = userEvent.setup();
    render(<Booking />);

    // Ayer (si es de este mes) no se puede pulsar.
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (yesterday.getMonth() === now.getMonth()) {
      expect(screen.getByRole("button", { name: new RegExp(`^${formatEventDate(toIsoDate(yesterday))}:`) })).toBeDisabled();
    }

    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));
    expect(
      await screen.findByRole("button", { name: `${formatEventDate(fullDay)}: día completo ocupado` }),
    ).toBeDisabled();

    // Con mañana/tarde elegida, al pulsar un día con esa franja ocupada,
    // la franja se quita y su tarjeta queda desactivada.
    await user.click(screen.getByRole("button", { name: /Mañana\/tarde/ }));
    await user.click(screen.getByRole("button", { name: `${formatEventDate(EVENT_DATE)}: mañana/tarde ocupada` }));

    const middayCard = screen.getByRole("button", { name: /Mañana\/tarde/ });
    expect(middayCard).toBeDisabled();
    expect(middayCard).toHaveAttribute("aria-pressed", "false");
    expect(middayCard).toHaveTextContent("Ocupada ese día");
    expect(screen.getByRole("button", { name: /Tarde\/noche/ })).toBeEnabled();
    expect(screen.getByText(`Has elegido: ${formatEventDate(EVENT_DATE)}`)).toBeInTheDocument();
  });
});
