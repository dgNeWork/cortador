import { SLOT_COVERAGE_LABELS } from "../../labels";

// Leyenda de los colores del calendario. Se enseña igual en el
// formulario y en el panel, para que los dos se lean del mismo modo.
const ITEMS = [
  { coverage: "MIDDAY", className: "bg-slot-midday" },
  { coverage: "EVENING", className: "bg-slot-evening" },
  { coverage: "FULL_DAY", className: "bg-slot-full" },
] as const;

export default function CalendarLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
      {ITEMS.map(({ coverage, className }) => (
        <li key={coverage} className="flex items-center gap-2">
          <span className={`h-4 w-4 rounded ${className}`} aria-hidden="true" />
          {SLOT_COVERAGE_LABELS[coverage]}
        </li>
      ))}
    </ul>
  );
}
