import { PlanSuscripcion } from "@/types/api";

/** Días que avisamos antes del vencimiento ("por vencer"). */
export const DIAS_AVISO = 7;

export type EstadoSuscripcion = "vigente" | "porVencer" | "vencida" | "sinFecha";

/** Convierte "YYYY-MM-DD..." a fecha local, o null si no hay fecha válida. */
function aFecha(fecha?: string | null): Date | null {
  if (!fecha) return null;
  const [y, m, d] = fecha.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d || y < 2000) return null; // 0001-01-01 u otras fechas vacías
  return new Date(y, m - 1, d);
}

/** Días que faltan para la renovación (negativo si ya venció). Infinity si no hay fecha. */
export function diasParaRenovar(fechaRenovacion?: string | null, hoy: Date = new Date()): number {
  const venc = aFecha(fechaRenovacion);
  if (!venc) return Number.POSITIVE_INFINITY;
  const hoyCero = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((venc.getTime() - hoyCero.getTime()) / 86_400_000);
}

export function estadoSuscripcion(fechaRenovacion?: string | null): EstadoSuscripcion {
  const dias = diasParaRenovar(fechaRenovacion);
  if (!Number.isFinite(dias)) return "sinFecha";
  if (dias < 0) return "vencida";
  if (dias <= DIAS_AVISO) return "porVencer";
  return "vigente";
}

/** Texto corto para la card: "Vence en 3 días", "Venció hace 2 días", "Renueva el 12 oct". */
export function textoSuscripcion(fechaRenovacion?: string | null): string {
  const dias = diasParaRenovar(fechaRenovacion);
  if (!Number.isFinite(dias)) return "Sin fecha";
  if (dias < 0) return `Venció hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? "" : "s"}`;
  if (dias === 0) return "Vence hoy";
  if (dias <= DIAS_AVISO) return `Vence en ${dias} día${dias === 1 ? "" : "s"}`;
  const fecha = aFecha(fechaRenovacion)!.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  return `Renueva el ${fecha}`;
}

export const planLabel: Record<PlanSuscripcion, string> = {
  [PlanSuscripcion.Mensual]: "Mensual",
  [PlanSuscripcion.Anual]: "Anual",
};
