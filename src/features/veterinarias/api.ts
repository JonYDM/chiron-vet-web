import { http } from "@/lib/http";
import type {
  CrearAdminRequest,
  CrearVeterinariaRequest,
  Veterinaria,
} from "@/types/api";

/** Lista todas las veterinarias (tenants). */
export function listarVeterinarias(signal?: AbortSignal): Promise<Veterinaria[]> {
  return http.get<Veterinaria[]>("/api/admin/veterinarias", signal);
}

/** Crea una veterinaria. Devuelve datos básicos { id, nombre, activa }. */
export function crearVeterinaria(
  body: CrearVeterinariaRequest,
): Promise<{ id: string; nombre: string; activa: boolean }> {
  return http.post("/api/admin/veterinarias", body);
}

/** Activa una veterinaria (pago recibido). */
export function activarVeterinaria(id: string): Promise<unknown> {
  return http.post(`/api/admin/veterinarias/${id}/activar`);
}

/** Desactiva una veterinaria (impago). */
export function desactivarVeterinaria(id: string): Promise<unknown> {
  return http.post(`/api/admin/veterinarias/${id}/desactivar`);
}

/** Crea el usuario Administrador de una veterinaria. */
export function crearAdmin(body: CrearAdminRequest): Promise<unknown> {
  return http.post("/api/admin/usuarios-admin", body);
}

/** Configura si el Administrador de una veterinaria puede operar (true) o solo supervisar (false). */
export function configurarAdminOperativo(id: string, operativo: boolean): Promise<unknown> {
  return http.post(`/api/admin/veterinarias/${id}/admin-operativo`, { operativo });
}
