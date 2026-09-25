import { useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import { createHamType, getAdminHamTypes, updateHamType } from "../../api/hamTypes";
import HamTypeForm from "../../components/admin/HamTypeForm";
import { formatEuros } from "../../format";
import type { HamType, HamTypeRequest } from "../../types";

// El backend ya los manda ordenados por precio; tras crear o editar uno
// se reordena aquí para que la lista no "salte" al recargar.
function byPrice(a: HamType, b: HamType): number {
  return a.price - b.price;
}

// Pantalla del panel para gestionar el catálogo de jamones: añadir,
// editar y activar/desactivar. No se borran: uno desactivado deja de
// salir en el formulario de reserva, pero las reservas antiguas lo siguen
// mostrando.
export default function AdminHamTypes() {
  const [hamTypes, setHamTypes] = useState<HamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    getAdminHamTypes()
      .then(setHamTypes)
      .catch(() => setError("No se ha podido cargar el catálogo. Inténtalo de nuevo."))
      .finally(() => setLoading(false));
  }, []);

  // Sustituye (o añade) un jamón en la lista con lo que devolvió el backend.
  function upsert(saved: HamType) {
    setHamTypes((prev) => [...prev.filter((h) => h.id !== saved.id), saved].sort(byPrice));
  }

  async function handleCreate(data: HamTypeRequest) {
    upsert(await createHamType(data));
    setCreating(false);
  }

  async function handleUpdate(id: number, data: HamTypeRequest) {
    upsert(await updateHamType(id, data));
    setEditingId(null);
  }

  async function handleToggleActive(hamType: HamType) {
    setError(null);
    setTogglingId(hamType.id);
    try {
      upsert(
        await updateHamType(hamType.id, {
          name: hamType.name,
          description: hamType.description ?? undefined,
          price: hamType.price,
          active: !hamType.active,
        }),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido cambiar el jamón.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Jamones</h1>
          <p className="mt-1 max-w-xl text-ink-muted">
            Los que ofreces en el servicio completo. Si desactivas uno, deja de salir en el formulario de
            reserva, pero las reservas que ya lo tenían lo conservan.
          </p>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-surface transition-colors hover:bg-brand-700"
          >
            Añadir jamón
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {creating && (
          <HamTypeForm submitLabel="Añadir" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        )}

        {loading && <p className="text-ink-muted">Cargando catálogo...</p>}

        {!loading && hamTypes.length === 0 && !creating && (
          <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-ink-muted">
            Todavía no hay jamones en el catálogo.
          </p>
        )}

        {hamTypes.map((hamType) =>
          editingId === hamType.id ? (
            <HamTypeForm
              key={hamType.id}
              initial={hamType}
              submitLabel="Guardar cambios"
              onSubmit={(data) => handleUpdate(hamType.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <article
              key={hamType.id}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 ${
                hamType.active ? "" : "opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {hamType.name}
                  {!hamType.active && (
                    <span className="ml-2 rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                      Desactivado
                    </span>
                  )}
                </p>
                {hamType.description && <p className="mt-0.5 text-sm text-ink-muted">{hamType.description}</p>}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-semibold text-ink">{formatEuros(hamType.price)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(hamType.id);
                    setCreating(false);
                  }}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:border-brand-400"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={togglingId === hamType.id}
                  onClick={() => handleToggleActive(hamType)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink disabled:opacity-60"
                >
                  {hamType.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
