import { useState } from "react";
import { ApiError } from "../../api/client";
import { createLocality, deleteLocality, updateLocality } from "../../api/pricing";
import { formatEuros } from "../../format";
import type { Locality, LocalityRequest } from "../../types";
import LocalityForm from "./LocalityForm";

interface LocalityListProps {
  initialLocalities: Locality[];
  // Se usa solo para enseñar al cortador cuánto cobra por ir a cada sitio.
  pricePerKm: number | null;
}

function byDistance(a: Locality, b: Locality): number {
  return a.distanceKm - b.distanceKm;
}

// Lista de localidades a las que se desplaza el cortador: añadir, editar
// y borrar, mostrando cuánto sale el desplazamiento a cada una.
export default function LocalityList({ initialLocalities, pricePerKm }: LocalityListProps) {
  const [localities, setLocalities] = useState(initialLocalities);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function upsert(saved: Locality) {
    setLocalities((prev) => [...prev.filter((l) => l.id !== saved.id), saved].sort(byDistance));
  }

  async function handleCreate(data: LocalityRequest) {
    upsert(await createLocality(data));
    setCreating(false);
  }

  async function handleUpdate(id: number, data: LocalityRequest) {
    upsert(await updateLocality(id, data));
    setEditingId(null);
  }

  async function handleDelete(locality: Locality) {
    if (!window.confirm(`¿Quitar ${locality.name} de tu lista?`)) {
      return;
    }
    setError(null);
    try {
      await deleteLocality(locality.id);
      setLocalities((prev) => prev.filter((l) => l.id !== locality.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido quitar la localidad.");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {localities.length === 0 && !creating && (
        <p className="rounded-2xl border border-dashed border-border px-6 py-8 text-center text-ink-muted">
          No tienes localidades. Los clientes de fuera de tu localidad verán el precio "a consultar".
        </p>
      )}

      {localities.map((locality) =>
        editingId === locality.id ? (
          <LocalityForm
            key={locality.id}
            initial={locality}
            submitLabel="Guardar cambios"
            onSubmit={(data) => handleUpdate(locality.id, data)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <article
            key={locality.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-3"
          >
            <div>
              <p className="font-medium text-ink">{locality.name}</p>
              <p className="text-sm text-ink-muted">
                {locality.distanceKm} km ida y vuelta
                {pricePerKm !== null && ` · desplazamiento ${formatEuros(locality.distanceKm * pricePerKm)}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(locality.id);
                  setCreating(false);
                }}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:border-brand-400"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(locality)}
                className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          </article>
        ),
      )}

      {creating ? (
        <LocalityForm submitLabel="Añadir" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      ) : (
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditingId(null);
          }}
          className="rounded-full border border-dashed border-brand-500 px-5 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-600/5"
        >
          Añadir localidad
        </button>
      )}
    </div>
  );
}
