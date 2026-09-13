import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createBooking, getHamTypes } from "../api/bookings";
import { ApiError } from "../api/client";
import type { BookingResponse, EventType, HamType, ServiceType } from "../types";

// Traduce cada valor del enum EventType a un texto legible en el select.
const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WEDDING: "Boda",
  BIRTHDAY: "Cumpleaños",
  CORPORATE: "Evento corporativo",
  OTHER: "Otro",
};

// Todos los campos del formulario van como texto (string), aunque algunos
// sean números o fechas: así es más fácil controlar los inputs de React,
// y los convertimos a su tipo real justo antes de enviar la reserva.
interface FormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  estimatedDurationHours: string;
  eventType: EventType;
  guestCount: string;
  location: string;
  serviceType: ServiceType;
  hamTypeId: string;
  notes: string;
}

const initialState: FormState = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  eventDate: "",
  eventTime: "",
  estimatedDurationHours: "",
  eventType: "WEDDING",
  guestCount: "",
  location: "",
  serviceType: "CUT_ONLY",
  hamTypeId: "",
  notes: "",
};

// Página con el formulario de reserva. Al enviarse con éxito, muestra la
// pantalla de confirmación en vez del formulario.
export default function Booking() {
  const [form, setForm] = useState<FormState>(initialState);
  const [hamTypes, setHamTypes] = useState<HamType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null);

  // Al cargar la página, pedimos los tipos de jamón para el desplegable.
  // Si falla, dejamos la lista vacía en vez de romper la página.
  useEffect(() => {
    getHamTypes()
      .then(setHamTypes)
      .catch(() => setHamTypes([]));
  }, []);

  // Actualiza un solo campo del formulario sin tocar el resto.
  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // evita que el navegador recargue la página
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      // Convertimos los campos de texto a número donde hace falta, y
      // solo mandamos hamTypeId si el servicio es completo.
      const booking = await createBooking({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        estimatedDurationHours: Number(form.estimatedDurationHours),
        eventType: form.eventType,
        guestCount: Number(form.guestCount),
        location: form.location,
        serviceType: form.serviceType,
        hamTypeId: form.serviceType === "FULL_SERVICE" && form.hamTypeId
          ? Number(form.hamTypeId)
          : undefined,
        notes: form.notes || undefined,
      });
      setConfirmedBooking(booking);
    } catch (error) {
      // Si el error viene del backend (ApiError), mostramos su mensaje
      // y marcamos los campos concretos que fallaron. Si es otro tipo de
      // error (por ejemplo, sin conexión), mostramos un mensaje genérico.
      if (error instanceof ApiError) {
        setFormError(error.message);
        setFieldErrors(error.fieldErrors ?? {});
      } else {
        setFormError("No se ha podido enviar la reserva. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Si ya se envió la reserva con éxito, mostramos la confirmación
  // en vez del formulario.
  if (confirmedBooking) {
    return <BookingConfirmation booking={confirmedBooking} />;
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Solicitar reserva</h1>
      <p className="mt-2 text-ink-muted">
        Cuéntanos los detalles de tu evento y te confirmaremos la disponibilidad lo antes posible.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-10">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-semibold text-ink">
            Datos de contacto
          </legend>

          <Field label="Nombre" error={fieldErrors.customerName}>
            <input
              required
              type="text"
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Email" error={fieldErrors.customerEmail}>
            <input
              required
              type="email"
              value={form.customerEmail}
              onChange={(e) => updateField("customerEmail", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Teléfono" error={fieldErrors.customerPhone}>
            <input
              required
              type="tel"
              value={form.customerPhone}
              onChange={(e) => updateField("customerPhone", e.target.value)}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-semibold text-ink">
            Detalles del evento
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha" error={fieldErrors.eventDate}>
              <input
                required
                type="date"
                value={form.eventDate}
                onChange={(e) => updateField("eventDate", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Hora" error={fieldErrors.eventTime}>
              <input
                required
                type="time"
                value={form.eventTime}
                onChange={(e) => updateField("eventTime", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Duración estimada (horas)" error={fieldErrors.estimatedDurationHours}>
              <input
                required
                type="number"
                min={1}
                value={form.estimatedDurationHours}
                onChange={(e) => updateField("estimatedDurationHours", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Número de invitados" error={fieldErrors.guestCount}>
              <input
                required
                type="number"
                min={1}
                value={form.guestCount}
                onChange={(e) => updateField("guestCount", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Tipo de evento" error={fieldErrors.eventType}>
            <select
              value={form.eventType}
              onChange={(e) => updateField("eventType", e.target.value as EventType)}
              className={inputClass}
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ubicación" error={fieldErrors.location}>
            <input
              required
              type="text"
              placeholder="Dirección o nombre del salón/finca"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-semibold text-ink">Servicio</legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <ServiceOption
              label="Solo corte"
              description="Tú aportas el jamón"
              selected={form.serviceType === "CUT_ONLY"}
              onSelect={() => updateField("serviceType", "CUT_ONLY")}
            />
            <ServiceOption
              label="Servicio completo"
              description="Incluye el jamón"
              selected={form.serviceType === "FULL_SERVICE"}
              onSelect={() => updateField("serviceType", "FULL_SERVICE")}
            />
          </div>

          {/* Este desplegable solo aparece si el servicio es completo,
              con una animación suave de apertura y cierre. */}
          <AnimatePresence>
            {form.serviceType === "FULL_SERVICE" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <Field label="Tipo de jamón" error={fieldErrors.hamTypeId}>
                  <select
                    required
                    value={form.hamTypeId}
                    onChange={(e) => updateField("hamTypeId", e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Selecciona una opción
                    </option>
                    {hamTypes.map((hamType) => (
                      <option key={hamType.id} value={hamType.id}>
                        {hamType.name} — {hamType.price.toFixed(2)}€
                      </option>
                    ))}
                  </select>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <Field label="Notas adicionales (opcional)" error={fieldErrors.notes}>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={4}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-600 px-8 py-3 text-sm font-medium text-surface transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>
    </section>
  );
}

// Pantalla que se muestra tras enviar la reserva con éxito.
function BookingConfirmation({ booking }: { booking: BookingResponse }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-xl px-6 py-24 text-center"
    >
      <h1 className="font-display text-3xl font-semibold text-ink">
        ¡Solicitud recibida, {booking.customerName.split(" ")[0]}!
      </h1>
      <p className="mt-3 text-ink-muted">
        Te hemos apuntado la reserva #{booking.id} para el {booking.eventDate} en{" "}
        {booking.location}. Te contactaremos a {booking.customerEmail} en cuanto la confirmemos.
      </p>
      <p className="mt-6 inline-block rounded-full bg-surface-alt px-4 py-1.5 text-sm font-medium text-ink-muted">
        Estado: pendiente de confirmación
      </p>
    </motion.section>
  );
}

// Envuelve un input con su etiqueta encima y el mensaje de error debajo
// (si lo hay), para no repetir ese bloque en cada campo del formulario.
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-muted">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

// Tarjeta seleccionable para elegir "Solo corte" o "Servicio completo".
function ServiceOption({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border px-5 py-4 text-left transition-colors ${
        selected
          ? "border-brand-600 bg-brand-600/5"
          : "border-border bg-surface hover:border-brand-400"
      }`}
    >
      <span className="block font-medium text-ink">{label}</span>
      <span className="block text-sm text-ink-muted">{description}</span>
    </button>
  );
}

// Estilo común para todos los inputs, select y textarea del formulario.
const inputClass =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-brand-500";
