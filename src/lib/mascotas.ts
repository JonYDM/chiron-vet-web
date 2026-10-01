import { EspecieMascota } from "@/types/api";

/** Tono de badge por especie (para distinguir de un vistazo). Mismo en staff y portal. */
export function toneEspecie(especie: EspecieMascota): "primary" | "info" | "warning" | "success" | "neutral" {
  switch (especie) {
    case EspecieMascota.Perro:
      return "primary";
    case EspecieMascota.Gato:
      return "warning";
    case EspecieMascota.Ave:
      return "info";
    case EspecieMascota.Conejo:
      return "success";
    default:
      return "neutral";
  }
}

/** Días desde hoy hasta una fecha ISO (negativo si ya pasó). */
export function diasHasta(fechaIso: string, hoy: Date = new Date()): number {
  const [y, m, d] = fechaIso.slice(0, 10).split("-").map(Number);
  const objetivo = new Date(y, m - 1, d);
  const hoyCero = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((objetivo.getTime() - hoyCero.getTime()) / 86_400_000);
}

/** "Hoy", "Mañana", "En 5 días", "Hace 2 días". */
export function textoRelativo(fechaIso: string): string {
  const dias = diasHasta(fechaIso);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias === -1) return "Ayer";
  return dias > 0 ? `En ${dias} días` : `Hace ${Math.abs(dias)} días`;
}
