import { http } from "@/lib/http";
import type { CrearStaffRequest, UsuarioDto } from "@/types/api";

/** Lista el staff (y dueños) de la veterinaria del Administrador autenticado. */
export function listarStaff(signal?: AbortSignal): Promise<UsuarioDto[]> {
  return http.get<UsuarioDto[]>("/api/usuarios/staff", signal);
}

/** Crea un usuario de staff (Veterinario o Recepcionista) en la veterinaria del admin. */
export function crearStaff(body: CrearStaffRequest): Promise<string> {
  return http.post<string>("/api/usuarios/staff", body);
}

/** Lista los Administradores (para el SuperAdmin). */
export function listarAdministradores(signal?: AbortSignal): Promise<UsuarioDto[]> {
  return http.get<UsuarioDto[]>("/api/admin/administradores", signal);
}

/** Resetea el PIN de un usuario por su id. */
export function resetearPin(usuarioId: string, nuevoPin: string): Promise<unknown> {
  return http.post(`/api/usuarios/${usuarioId}/resetear-pin`, { nuevoPin });
}

/** Cambia el PIN del usuario autenticado (autoservicio). */
export function cambiarMiPin(pinActual: string, nuevoPin: string): Promise<unknown> {
  return http.post("/api/mi-pin", { pinActual, nuevoPin });
}

/** Edita nombre y/o activa-desactiva un usuario (Admin/SuperAdmin). */
export function gestionarUsuario(
  usuarioId: string,
  body: { nuevoNombre?: string | null; accion?: 1 | 2 | null },
): Promise<unknown> {
  return http.post(`/api/usuarios/${usuarioId}/gestionar`, body);
}

/**
 * Obtiene el usuario (acceso al portal) de un cliente, o null si no tiene acceso.
 * El backend devuelve 204 (sin contenido) cuando el cliente no tiene usuario.
 */
export function obtenerUsuarioDeCliente(
  clienteId: string,
  signal?: AbortSignal,
): Promise<UsuarioDto | null> {
  return http
    .get<UsuarioDto | undefined>(`/api/clientes/${clienteId}/usuario`, signal)
    .then((u) => u ?? null);
}
