import { http } from "@/lib/http";
import type { RecordatorioDetectado } from "@/types/api";

/** Recordatorios pendientes de la veterinaria (el veterinariaId sale del token). */
export function listarRecordatorios(
  dias?: number,
  signal?: AbortSignal,
): Promise<RecordatorioDetectado[]> {
  const qs = dias ? `?dias=${dias}` : "";
  return http.get<RecordatorioDetectado[]>(`/api/recordatorios${qs}`, signal);
}

/** Resultado del envío de recordatorios. */
export interface EnvioResultado {
  detectados: number;
  enviados: number;
}

/** Dispara el envío de recordatorios de la veterinaria. */
export function enviarRecordatorios(
  veterinariaId: string,
  dias?: number,
): Promise<EnvioResultado> {
  const qs = dias ? `?dias=${dias}` : "";
  return http.post<EnvioResultado>(
    `/api/veterinarias/${veterinariaId}/recordatorios/enviar${qs}`,
    {},
  );
}
