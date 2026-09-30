import { cn } from "@/lib/cn";
import type { PlanSuscripcion } from "@/types/api";
import { PLANES } from "../planes";

/** Selector de plan (Mensual/Anual) — el mismo en alta y edición de veterinaria. */
export function SelectorPlan({ plan, onChange }: { plan: PlanSuscripcion; onChange: (p: PlanSuscripcion) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-label-md font-semibold text-on-surface-variant">Plan de suscripción</p>
      <div className="grid grid-cols-2 gap-2">
        {PLANES.map((p) => {
          const activo = plan === p.valor;
          return (
            <button
              key={p.valor}
              type="button"
              onClick={() => onChange(p.valor)}
              aria-pressed={activo}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors",
                activo
                  ? "border-primary-container bg-primary-container/10 text-primary-container"
                  : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant",
              )}
            >
              <p.icon className="h-5 w-5" aria-hidden />
              <span className="text-label-md font-bold">{p.label}</span>
              <span className="text-body-sm opacity-80">{p.detalle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
