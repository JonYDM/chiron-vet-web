import { RolUsuario } from "@/types/api";

/** Ruta "home" a la que se redirige cada rol tras iniciar sesión. */
export function rutaInicialPorRol(rol: RolUsuario): string {
  switch (rol) {
    case RolUsuario.SuperAdmin:
      return "/admin";
    case RolUsuario.DuenoMascota:
      return "/portal";
    case RolUsuario.Administrador:
    case RolUsuario.Veterinario:
    case RolUsuario.Recepcionista:
      return "/app";
    default:
      return "/app";
  }
}
