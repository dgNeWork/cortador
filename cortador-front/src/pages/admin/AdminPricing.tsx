import { useEffect, useState } from "react";
import { getLocalities, getPricingSettings } from "../../api/pricing";
import LocalityList from "../../components/admin/LocalityList";
import PricingSettingsForm from "../../components/admin/PricingSettingsForm";
import type { Locality, PricingSettings } from "../../types";

// Pantalla "Tarifas" del panel: lo que cobra el cortador (por hora y por
// km) y las localidades a las que se desplaza. Esta página solo carga los
// datos; cada bloque se encarga de guardar lo suyo.
export default function AdminPricing() {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Las dos peticiones van a la vez (Promise.all) en vez de una detrás
  // de otra, así la pantalla carga antes.
  useEffect(() => {
    Promise.all([getPricingSettings(), getLocalities()])
      .then(([loadedSettings, loadedLocalities]) => {
        setSettings(loadedSettings);
        setLocalities(loadedLocalities);
      })
      .catch(() => setError("No se han podido cargar las tarifas. Inténtalo de nuevo."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Tarifas</h1>
      <p className="mt-1 max-w-xl text-ink-muted">
        Con esto se calcula el precio que ve el cliente al reservar. Siempre podrás ajustarlo a mano en cada
        reserva.
      </p>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <p className="mt-8 text-ink-muted">Cargando tarifas...</p>}

      {settings && (
        <>
          <h2 className="mt-10 font-display text-xl font-semibold text-ink">Precios</h2>
          <div className="mt-4">
            <PricingSettingsForm initial={settings} onSaved={setSettings} />
          </div>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">Desplazamientos</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            Localidades a las que vas, con los km del trayecto completo (ida y vuelta). En{" "}
            {settings.homeLocality ? <strong className="text-ink">{settings.homeLocality}</strong> : "tu localidad"} no
            se cobra desplazamiento. Si un cliente es de una localidad que no está aquí, verá el precio "a
            consultar".
          </p>
          <div className="mt-4">
            <LocalityList initialLocalities={localities} pricePerKm={settings.pricePerKm} />
          </div>
        </>
      )}
    </section>
  );
}
