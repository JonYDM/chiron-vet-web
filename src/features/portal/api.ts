import { http } from "@/lib/http";
import type { Mascota, MiCita, RegistroMedico, RecordatorioDetectado, VentaHistorial } from "@/types/api";

/** Citas de MIS mascotas (más recientes primero). */
export function misCitas(signal?: AbortSignal): Promise<MiCita[]> {
  return http.get<MiCita[]>("/api/portal/mis-citas", signal);
}

/** Respondo si asistiré a una cita (solo mientras siga programada). */
export function responderAsistencia(citaId: string, asistira: boolean): Promise<MiCita> {
  return http.post<MiCita>(`/api/portal/citas/${citaId}/asistencia`, { asistira });
}

/** Mis compras/cobros (lo que el dueño pagó: consultas, artículos). */
export function misCompras(signal?: AbortSignal): Promise<VentaHistorial[]> {
  return http.get<VentaHistorial[]>("/api/portal/mis-compras", signal);
}

/** Mis mascotas (del dueño autenticado; el clienteId sale del token). */
export function misMascotas(signal?: AbortSignal): Promise<Mascota[]> {
  return http.get<Mascota[]>("/api/portal/mis-mascotas", signal);
}

/** Expediente de una de MIS mascotas (el backend valida que sea mía). */
export function miExpediente(
  mascotaId: string,
  signal?: AbortSignal,
): Promise<RegistroMedico[]> {
  return http.get<RegistroMedico[]>(
    `/api/portal/mascotas/${mascotaId}/expediente`,
    signal,
  );
}

/** Mis recordatorios (vacunas/citas próximas de mis mascotas). */
export function misRecordatorios(
  signal?: AbortSignal,
): Promise<RecordatorioDetectado[]> {
  return http.get<RecordatorioDetectado[]>(
    "/api/portal/mis-recordatorios",
    signal,
  );
}
