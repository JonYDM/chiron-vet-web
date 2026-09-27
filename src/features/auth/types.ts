import type { RolUsuario } from "@/types/api";

/** Sesión activa del usuario, derivada del login + claims del JWT. */
export interface Sesion {
  token: string;
  nombre: string;
  rol: RolUsuario;
  expiraEn: string;
  /** Del JWT (ausente para SuperAdmin). */
  veterinariaId?: string;
  /** Del JWT (solo dueños de mascota). */
  clienteId?: string;
}

export interface AuthState {
  sesion: Sesion | null;
  cargando: boolean;
}
