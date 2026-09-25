import { useEffect, useState } from "react";
import { getQuote } from "../api/bookings";
import { ApiError } from "../api/client";
import type { Quote, QuoteRequest } from "../types";

// Espera tras el último cambio antes de pedir el precio: si el cliente
// está escribiendo "12" en las horas, no se piden dos presupuestos (1 y 12).
export const QUOTE_DELAY_MS = 350;

interface QuoteResult {
  key: string;
  quote: Quote | null;
  error: string | null;
}

/**
 * Presupuesto en vivo para el formulario de reserva. Recibe los datos de
 * los que depende el precio (o null si todavía faltan campos) y devuelve
 * el último presupuesto calculado por el backend.
 *
 * Cada respuesta se guarda junto a la "clave" de los datos que la pidieron.
 * Si el cliente cambia algo mientras llega una respuesta antigua, esa
 * respuesta no coincide con la clave actual y no se enseña: así nunca se
 * ve el precio de una elección anterior.
 */
export function useQuote(input: QuoteRequest | null) {
  const key = input ? JSON.stringify(input) : null;
  const [result, setResult] = useState<QuoteResult | null>(null);

  useEffect(() => {
    if (!key) {
      return;
    }
    const timer = setTimeout(() => {
      getQuote(JSON.parse(key) as QuoteRequest)
        .then((quote) => setResult({ key, quote, error: null }))
        .catch((err) =>
          setResult({
            key,
            quote: null,
            error: err instanceof ApiError ? err.message : "No se ha podido calcular el precio.",
          }),
        );
    }, QUOTE_DELAY_MS);
    // Si los datos cambian antes de que venza la espera, se cancela.
    return () => clearTimeout(timer);
  }, [key]);

  const current = result?.key === key ? result : null;
  return {
    quote: current?.quote ?? null,
    error: current?.error ?? null,
    loading: key !== null && current === null,
  };
}
