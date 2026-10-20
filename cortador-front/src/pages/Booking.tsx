import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createBooking } from "../api/bookings";
import { getHamTypes } from "../api/hamTypes";
import { ApiError } from "../api/client";
import { getPublicLocalities } from "../api/pricing";
import ConfirmDialog from "../components/ConfirmDialog";
import { Field, inputClass } from "../components/FormField";
import PriceSummary from "../components/PriceSummary";
import { getBookingTexts } from "../config/bookingTexts";
import { siteConfig } from "../config/site";
import { formatEuros, formatEventDate } from "../format";
import { useQuote } from "../hooks/useQuote";
import { EVENT_TYPE_LABELS, SERVICE_TYPE_LABELS, TIME_SLOT_LABELS } from "../labels";
import type {
  BookingResponse,
  EventType,
  HamType,
  PublicLocalities,
  QuoteRequest,
  ServiceType,
  TimeSlot,
} from "../types";

// Todos los campos del formulario van como texto (string), aunque algunos
// sean números o fechas: así es más fácil controlar los inputs de React,
// y los convertimos a su tipo real justo antes de enviar la reserva.
interface FormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  // "" mientras el cliente no haya elegido franja.
  timeSlot: TimeSlot | "";
  estimatedDurationHours: string;
  eventType: EventType;
  guestCount: string;
  location: string;
  serviceType: ServiceType;
  hamTypeId: string;
  // Valor del desplegable de localidad: "HOME", "OTHER" o el id de una
  // localidad de la lista del cortador ("" si aún no ha elegido).
  locality: string;
  otherLocalityName: string;
  notes: string;
}

const initialState: FormState = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  eventDate: "",
  eventTime: "",
  timeSlot: "",
  estimatedDurationHours: "",
  eventType: "WEDDING",
  guestCount: "",
  location: "",
  serviceType: "CUT_ONLY",
  hamTypeId: "",
  locality: "",
  otherLocalityName: "",
  notes: "",
};

type LocalityFields = Pick<QuoteRequest, "localityOption" | "localityId" | "otherLocalityName">;

// Traduce lo elegido en el desplegable de localidad a los campos que
// espera el backend. Devuelve null si todavía no ha elegido nada.
function toLocalityFields(form: FormState): LocalityFields | null {
  if (form.locality === "") return null;
  if (form.locality === "HOME") return { localityOption: "HOME" };
  if (form.locality === "OTHER") return { localityOption: "OTHER", otherLocalityName: form.otherLocalityName.trim() };
  return { localityOption: "LISTED", localityId: Number(form.locality) };
}

// Nombre de la localidad elegida, para el resumen de la solicitud.
function localityName(form: FormState, localities: PublicLocalities): string {
  if (form.locality === "HOME") return localities.homeLocality ?? "";
  if (form.locality === "OTHER") return form.otherLocalityName.trim();
  return localities.localities.find((locality) => String(locality.id) === form.locality)?.name ?? "";
}

// Datos para el presupuesto en vivo, o null si aún falta algo de lo que
// depende el precio (así no se piden presupuestos que van a fallar).
function toQuoteRequest(form: FormState): QuoteRequest | null {
  const hours = Number(form.estimatedDurationHours);
  const locality = toLocalityFields(form);
  const needsHam = form.serviceType === "FULL_SERVICE";

  if (!Number.isInteger(hours) || hours < 1 || !locality) return null;
  if (needsHam && !form.hamTypeId) return null;
  if (locality.localityOption === "OTHER" && !locality.otherLocalityName) return null;

  return {
    estimatedDurationHours: hours,
    serviceType: form.serviceType,
    hamTypeId: needsHam ? Number(form.hamTypeId) : undefined,
    ...locality,
  };
}

// Página con el formulario de reserva. Al pulsar el botón se abre una
// ventana con el resumen para que el cliente lo revise; solo al confirmar
// se envía. Si sale bien, muestra la pantalla de confirmación en vez del
// formulario.
// En modo presupuesto (siteConfig.quoteMode) no se muestra ningún precio:
// el cálculo lo hace el backend y solo lo ve el cortador.
export default function Booking() {
  const { quoteMode } = siteConfig;
  const texts = getBookingTexts();
  const [form, setForm] = useState<FormState>(initialState);
  const [hamTypes, setHamTypes] = useState<HamType[]>([]);
  const [localities, setLocalities] = useState<PublicLocalities>({ homeLocality: null, localities: [] });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null);
  // true mientras está abierta la ventana de revisión de la solicitud.
  const [reviewing, setReviewing] = useState(false);

  // Al cargar la página, pedimos los tipos de jamón para el desplegable.
  // Si falla, dejamos la lista vacía en vez de romper la página.
  useEffect(() => {
    getHamTypes()
      .then(setHamTypes)
      .catch(() => setHamTypes([]));
    getPublicLocalities()
      .then(setLocalities)
      .catch(() => setLocalities({ homeLocality: null, localities: [] }));
  }, []);

  // Precio en vivo: se recalcula cuando cambia algo de lo que depende.
  // En modo presupuesto no se pide (null), porque el cliente no lo ve.
  const { quote, loading: quoteLoading, error: quoteError } = useQuote(quoteMode ? null : toQuoteRequest(form));

  // Actualiza un solo campo del formulario sin tocar el resto.
  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Primer paso al pulsar el botón: el navegador ya ha comprobado los
  // campos obligatorios; aquí se comprueba lo que él no puede (las
  // tarjetas de franja no son un input) y se abre la ventana de revisión.
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // evita que el navegador recargue la página
    setFormError(null);
    setFieldErrors({});

    // El desplegable ya es obligatorio (required), pero por si acaso.
    if (!toLocalityFields(form)) {
      setFieldErrors({ localityOption: "Elige la localidad del evento" });
      return;
    }
    if (!form.timeSlot) {
      setFieldErrors({ timeSlot: "Elige la franja del evento" });
      return;
    }
    setReviewing(true);
  }

  // Segundo paso: el cliente ha revisado el resumen y confirma el envío.
  async function sendBooking() {
    const locality = toLocalityFields(form);
    if (!locality || !form.timeSlot) return; // ya comprobado en handleSubmit
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
        timeSlot: form.timeSlot,
        estimatedDurationHours: Number(form.estimatedDurationHours),
        eventType: form.eventType,
        guestCount: Number(form.guestCount),
        location: form.location,
        serviceType: form.serviceType,
        hamTypeId: form.serviceType === "FULL_SERVICE" && form.hamTypeId
          ? Number(form.hamTypeId)
          : undefined,
        ...locality,
        notes: form.notes || undefined,
      });
      setConfirmedBooking(booking);
    } catch (error) {
      // Si el error viene del backend (ApiError), mostramos su mensaje
      // y marcamos los campos concretos que fallaron. Si es otro tipo de
      // error (por ejemplo, sin conexión), mostramos un mensaje genérico.
      // Se cierra la ventana para que el cliente pueda corregir.
      if (error instanceof ApiError) {
        setFormError(error.message);
        setFieldErrors(error.fieldErrors ?? {});
      } else {
        setFormError("No se ha podido enviar la solicitud. Inténtalo de nuevo.");
      }
      setReviewing(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Si ya se envió la reserva con éxito, mostramos la confirmación
  // en vez del formulario.
  if (confirmedBooking) {
    return <BookingConfirmation booking={confirmedBooking} showPrice={!quoteMode} />;
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">{texts.pageTitle}</h1>
      <p className="mt-2 text-ink-muted">{texts.pageIntro}</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-10">

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

          {/* Franja: dos tarjetas en vez de un desplegable, para que se vean
              las dos opciones de un vistazo. Sin horas: así lo entiende
              cualquier cliente. */}
          <div>
            <span className="text-sm font-medium text-ink-muted">Franja del evento</span>
            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              <OptionCard
                label={TIME_SLOT_LABELS.MIDDAY}
                description="Comidas y eventos de mediodía"
                selected={form.timeSlot === "MIDDAY"}
                onSelect={() => updateField("timeSlot", "MIDDAY")}
              />
              <OptionCard
                label={TIME_SLOT_LABELS.EVENING}
                description="Cenas y eventos de noche"
                selected={form.timeSlot === "EVENING"}
                onSelect={() => updateField("timeSlot", "EVENING")}
              />
            </div>
            {fieldErrors.timeSlot && <span className="mt-1 block text-sm text-red-600">{fieldErrors.timeSlot}</span>}
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

          {/* La localidad decide el desplazamiento; la dirección exacta
              va aparte, en texto libre. */}
          <Field label="Localidad del evento" error={fieldErrors.localityOption}>
            <select
              required
              value={form.locality}
              onChange={(e) => updateField("locality", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Selecciona una localidad
              </option>
              {localities.homeLocality && (
                <option value="HOME">{localities.homeLocality} (sin desplazamiento)</option>
              )}
              {localities.localities.map((locality) => (
                <option key={locality.id} value={locality.id}>
                  {locality.name}
                </option>
              ))}
              <option value="OTHER">Otra localidad</option>
            </select>
          </Field>

          {form.locality === "OTHER" && (
            <Field label="¿Qué localidad?" error={fieldErrors.otherLocalityName}>
              <input
                required
                type="text"
                maxLength={100}
                value={form.otherLocalityName}
                onChange={(e) => updateField("otherLocalityName", e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Dirección del evento" error={fieldErrors.location}>
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
            <OptionCard
              label={SERVICE_TYPE_LABELS.CUT_ONLY}
              description="Tú aportas el jamón"
              selected={form.serviceType === "CUT_ONLY"}
              onSelect={() => updateField("serviceType", "CUT_ONLY")}
            />
            <OptionCard
              label={SERVICE_TYPE_LABELS.FULL_SERVICE}
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
                        {hamType.name} — {formatEuros(hamType.price)}
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

        {!quoteMode && (
          <fieldset className="space-y-4">
            <legend className="font-display text-lg font-semibold text-ink">Precio</legend>
            <PriceSummary quote={quote} loading={quoteLoading} error={quoteError} />
          </fieldset>
        )}

        {/* El error general va junto al botón: es lo que el cliente tiene
            delante al cerrarse la ventana de revisión. */}
        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-brand-600 px-8 py-3 text-sm font-medium text-surface transition-colors hover:bg-brand-700"
        >
          {texts.submitLabel}
        </button>
      </form>

      <ConfirmDialog
        open={reviewing}
        title="Revisa tu solicitud"
        confirmLabel="Confirmar solicitud"
        cancelLabel="Corregir"
        busy={submitting}
        onConfirm={sendBooking}
        onCancel={() => setReviewing(false)}
      >
        <BookingSummary
          form={form}
          localityName={localityName(form, localities)}
          hamTypeName={hamTypes.find((hamType) => String(hamType.id) === form.hamTypeId)?.name}
        />
      </ConfirmDialog>
    </section>
  );
}

// Resumen de lo que ha rellenado el cliente, para la ventana de revisión.
function BookingSummary({
  form,
  localityName,
  hamTypeName,
}: {
  form: FormState;
  localityName: string;
  hamTypeName?: string;
}) {
  const service =
    form.serviceType === "FULL_SERVICE" && hamTypeName
      ? `${SERVICE_TYPE_LABELS.FULL_SERVICE} · ${hamTypeName}`
      : SERVICE_TYPE_LABELS[form.serviceType];
  const rows: [string, string][] = [
    ["Nombre", form.customerName],
    ["Email", form.customerEmail],
    ["Teléfono", form.customerPhone],
    ["Fecha", form.eventDate ? formatEventDate(form.eventDate) : ""],
    ["Franja", form.timeSlot ? TIME_SLOT_LABELS[form.timeSlot] : ""],
    ["Hora", form.eventTime],
    ["Duración", `${form.estimatedDurationHours} h`],
    ["Invitados", form.guestCount],
    ["Tipo de evento", EVENT_TYPE_LABELS[form.eventType]],
    ["Localidad", localityName],
    ["Dirección", form.location],
    ["Servicio", service],
  ];
  if (form.notes) rows.push(["Notas", form.notes]);

  return (
    <dl className="divide-y divide-border text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-2">
          <dt className="text-ink-muted">{label}</dt>
          <dd className="text-right font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Pantalla que se muestra tras enviar la solicitud con éxito. El precio
// solo aparece si la web no está en modo presupuesto.
function BookingConfirmation({ booking, showPrice }: { booking: BookingResponse; showPrice: boolean }) {
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
        {/* La fecha y la franja van en mitad de la frase, así que en
            minúscula ("para el martes, 20 de octubre de 2026, por la tarde/noche"). */}
        Te hemos apuntado la solicitud #{booking.id} para el {formatEventDate(booking.eventDate).toLowerCase()},
        por la {TIME_SLOT_LABELS[booking.timeSlot].toLowerCase()}, en {booking.location}. Te contactaremos a{" "}
        {booking.customerEmail} en cuanto la revisemos.
      </p>
      {showPrice && (
        <p className="mt-4 text-ink">
          Precio:{" "}
          <strong>
            {booking.estimatedPrice !== null ? formatEuros(booking.estimatedPrice) : "a consultar"}
          </strong>
        </p>
      )}
      <p className="mt-6 inline-block rounded-full bg-surface-alt px-4 py-1.5 text-sm font-medium text-ink-muted">
        Estado: pendiente de confirmación
      </p>
    </motion.section>
  );
}

// Tarjeta seleccionable: se usa para la franja y para el tipo de servicio.
function OptionCard({
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
      aria-pressed={selected}
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
