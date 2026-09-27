import { http } from "@/lib/http";
import type {
  AgregarRegistroMedicoRequest,
  RegistroMedico,
} from "@/types/api";

/** Ver el expediente médico completo de una mascota. */
export function verExpediente(
  mascotaId: string,
  signal?: AbortSignal,
): Promise<RegistroMedico[]> {
  return http.get<RegistroMedico[]>(
    `/api/mascotas/${mascotaId}/expediente`,
    signal,
  );
}

/** Agregar una entrada al expediente (consulta, vacuna, etc.). Devuelve el id. */
export function agregarRegistro(
  body: AgregarRegistroMedicoRequest,
): Promise<string> {
  return http.post<string>("/api/expediente", body);
}
