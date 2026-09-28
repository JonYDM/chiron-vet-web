import { http } from "@/lib/http";
import type { AgendarCitaRequest, Cita, EstadoCita } from "@/types/api";

/** Cita enriquecida con nombre de mascota y dueño (del endpoint GET /citas). */
export interface CitaConPaciente {
  id: string;
  mascotaId: string;
  mascotaNombre: string;
  clienteNombre: string;
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
  veterinarioId: string | null;
}

/** Lista las citas de la veterinaria, opcionalmente filtradas por estado. */
export function listarCitas(
  estado?: EstadoCita,
  signal?: AbortSignal,
): Promise<CitaConPaciente[]> {
  const qs = estado != null ? `?estado=${estado}` : "";
  return http.get<CitaConPaciente[]>(`/api/citas${qs}`, signal);
}

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
