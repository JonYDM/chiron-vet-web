import { cn } from "@/lib/cn";
import { FiltroEstado } from "@/types/api";

interface Props {
  value: FiltroEstado;
  onChange: (estado: FiltroEstado) => void;
}

const opciones: { valor: FiltroEstado; label: string }[] = [
  { valor: FiltroEstado.Activos, label: "Activos" },
  { valor: FiltroEstado.Inactivos, label: "Inactivos" },
  { valor: FiltroEstado.Todos, label: "Todos" },
];

/** Selector segmentado de estado (Activos / Inactivos / Todos). */
export function FiltroEstadoTabs({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filtro de estado"
      className="inline-flex rounded-xl bg-hairline/50 p-1"
    >
      {opciones.map((o) => (
        <button
          key={o.valor}
          role="tab"
          aria-selected={value === o.valor}
          onClick={() => onChange(o.valor)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            value === o.valor
              ? "bg-surface text-ink shadow-soft"
              : "text-ink-soft hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
