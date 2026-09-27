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
  /** Si el Admin de la veterinaria puede operar (no solo supervisar). */
  adminOperativo: boolean;
}

export interface AuthState {
  sesion: Sesion | null;
  cargando: boolean;
}
