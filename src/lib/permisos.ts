import { RolUsuario } from "@/types/api";
import type { Sesion } from "@/features/auth/types";

/**
 * Acciones/capacidades de la app. Centralizar los permisos aquí (una sola fuente de
 * verdad) evita checks de rol dispersos y mantiene la UI coherente con el backend.
 */
export type Accion =
  | "ver_metricas" // dashboard de negocio
  | "gestionar_equipo" // crear/editar/desactivar staff
  | "gestionar_veterinarias" // SuperAdmin
  | "operar_clientes" // registrar/editar/baja de clientes y mascotas (onboarding)
  | "ver_expediente" // ver historial médico
  | "editar_expediente" // agregar consultas/tratamientos
  | "gestionar_citas" // agendar y cambiar estado
  | "usar_pos" // punto de venta / cobrar
  | "gestionar_acceso_portal"; // dar acceso / ver acceso de un cliente

/**
 * Matriz base de permisos por rol. El Administrador tiene un tratamiento especial:
 * siempre puede métricas y equipo, y el resto (operar) depende del flag AdminOperativo
 * de su veterinaria.
 */
const PERMISOS_VET: Accion[] = [
  "operar_clientes",
  "ver_expediente",
  "editar_expediente",
  "gestionar_citas",
  "gestionar_acceso_portal",
];

const PERMISOS_RECEP: Accion[] = [
  "operar_clientes",
  "ver_expediente", // solo lectura (la UI no muestra "agregar")
  "gestionar_citas",
  "usar_pos",
  "gestionar_acceso_portal",
];

/** Acciones "operativas" que el Admin solo tiene si su veterinaria es AdminOperativo. */
const OPERATIVAS: Accion[] = [
  "operar_clientes",
  "ver_expediente",
  "editar_expediente",
  "gestionar_citas",
  "usar_pos",
  "gestionar_acceso_portal",
];

/**
 * ¿La sesión puede realizar la acción? Única fuente de verdad de permisos en el front.
 */
export function puede(sesion: Sesion | null, accion: Accion): boolean {
  if (!sesion) return false;

  switch (sesion.rol) {
    case RolUsuario.SuperAdmin:
      return accion === "gestionar_veterinarias";

    case RolUsuario.Administrador:
      // Siempre: métricas y equipo.
      if (accion === "ver_metricas" || accion === "gestionar_equipo") return true;
      // Operativas: solo si la veterinaria habilita al admin como operativo.
      if (OPERATIVAS.includes(accion)) return sesion.adminOperativo;
      return false;

    case RolUsuario.Veterinario:
      return PERMISOS_VET.includes(accion);

    case RolUsuario.Recepcionista:
      return PERMISOS_RECEP.includes(accion);

    default:
      return false;
  }
}
