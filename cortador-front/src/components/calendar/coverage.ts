import type { SlotCoverage, TimeSlot } from "../../types";

// Indica si una ocupación incluye la franja dada (la misma regla que
// SlotCoverage.covers en el backend).
export function coversSlot(coverage: SlotCoverage, slot: TimeSlot): boolean {
  return coverage === "FULL_DAY" || coverage === slot;
}
