import type { SelectOption } from "@/components/ui";

/**
 * Convierte un mapa de enum (número → etiqueta) en opciones para <Select>.
 * Ej: opcionesDeEnum(especieLabel) → [{value:0,label:"No especificada"}, ...]
 */
export function opcionesDeEnum(
  labelMap: Record<number, string>,
): SelectOption[] {
  return Object.entries(labelMap).map(([value, label]) => ({
    value: Number(value),
    label,
  }));
}
