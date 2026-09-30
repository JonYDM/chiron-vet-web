import { Input } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { PlanSuscripcion } from "@/types/api";
import { PRECIO_BASE } from "../suscripcion";

interface Props {
  plan: PlanSuscripcion;
  /** Texto tal cual lo teclea el usuario (se valida como decimal). */
  valor: string;
  onChange: (v: string) => void;
}

/** Solo dígitos y un punto con hasta 2 decimales. */
function limpiarMonto(v: string): string {
  const limpio = v.replace(/[^\d.]/g, "");
  const [entero, ...resto] = limpio.split(".");
  return resto.length ? `${entero.slice(0, 8)}.${resto.join("").slice(0, 2)}` : entero.slice(0, 8);
}

/** Renta de la sucursal por periodo del plan. Muestra el precio base como referencia. */
export function CampoPrecio({ plan, valor, onChange }: Props) {
  const periodo = plan === PlanSuscripcion.Anual ? "año" : "mes";
  return (
    <Input
      label={`Renta por ${periodo}`}
      inputMode="decimal"
      value={valor}
      onChange={(e) => onChange(limpiarMonto(e.target.value))}
      hint={`Precio base: ${formatCurrency(PRECIO_BASE[plan])}. Ajústalo si la sucursal es más grande o más chica.`}
      required
    />
  );
}
