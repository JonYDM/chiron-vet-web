import { http } from "@/lib/http";
import type { Mascota, RegistroMedico, RecordatorioDetectado } from "@/types/api";

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
