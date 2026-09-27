import { http } from "@/lib/http";
import type { AgendarCitaRequest, Cita } from "@/types/api";

/** Próximas citas de la veterinaria (a partir de ahora). */
export function proximasCitas(
  veterinariaId: string,
  signal?: AbortSignal,
): Promise<Cita[]> {
  return http.get<Cita[]>(
    `/api/veterinarias/${veterinariaId}/citas/proximas`,
    signal,
  );
}

/** Agenda una nueva cita. Devuelve el id de la cita creada. */
export function agendarCita(body: AgendarCitaRequest): Promise<string> {
  return http.post<string>("/api/citas", body);
}

/** Acción sobre una cita (coincide con el enum AccionCita del backend). */
export type AccionCita = 1 | 2 | 3; // 1=Atender, 2=Cancelar, 3=NoAsistio

/** Cambia el estado de una cita. */
export function cambiarEstadoCita(citaId: string, accion: AccionCita): Promise<unknown> {
  return http.post(`/api/citas/${citaId}/estado`, { accion });
}
