import { formatCurrency } from "@/lib/format";
import { PlanSuscripcion, type Sucursal, type Veterinaria } from "@/types/api";

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

/** Precio base por sucursal (igual que el backend): $250/mes o $2,500/año (2 meses gratis). */
export const PRECIO_BASE: Record<PlanSuscripcion, number> = {
  [PlanSuscripcion.Mensual]: 250,
  [PlanSuscripcion.Anual]: 2500,
};

/** "$250/mes" o "$2,500/año". */
export function textoPrecio(s: Pick<Sucursal, "precio" | "plan">): string {
  return `${formatCurrency(s.precio)}/${s.plan === PlanSuscripcion.Anual ? "año" : "mes"}`;
}

/** Renta equivalente por mes (las anuales cuentan como precio / 12). */
export function rentaMensual(s: Pick<Sucursal, "precio" | "plan">): number {
  return s.plan === PlanSuscripcion.Anual ? s.precio / 12 : s.precio;
}

/**
 * Sucursal que define el estado de cobro de la veterinaria: la activa que vence antes
 * (si no hay activas, cualquiera). Null si no tiene sucursales.
 */
export function sucursalMasUrgente(v: Veterinaria): Sucursal | null {
  const lista = v.sucursales ?? [];
  const candidatas = lista.some((s) => s.activa) ? lista.filter((s) => s.activa) : lista;
  return candidatas.reduce<Sucursal | null>(
    (peor, s) => (!peor || diasParaRenovar(s.fechaRenovacion) < diasParaRenovar(peor.fechaRenovacion) ? s : peor),
    null,
  );
}

/** Fecha de renovación que manda en la veterinaria (la sucursal más urgente o, en su defecto, la propia). */
export function fechaCobroVeterinaria(v: Veterinaria): string {
  return sucursalMasUrgente(v)?.fechaRenovacion ?? v.fechaRenovacion;
}


/** Convierte el texto de un campo de monto a número válido (o null). */
export function montoValido(valor: string): number | null {
  const n = Number(valor);
  return valor.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : null;
}
