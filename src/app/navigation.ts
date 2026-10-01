import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Home,
  PawPrint,
  ShoppingCart,
  Users,
  Building2,
  UserCog,
  BellRing,
  Receipt,
  Wallet,
} from "lucide-react";
import type { Accion } from "@/lib/permisos";

export interface NavItem {
  /** Ruta absoluta. */
  to: string;
  /** Etiqueta corta para el menú. */
  label: string;
  icon: LucideIcon;
  /**
   * Acción/permiso requerido para ver el ítem. Si es null, lo ven todos los
   * usuarios del área (ej: Inicio). El AppShell filtra con `puede`.
   */
  permiso: Accion | null;
  /**
   * Si true, el ítem NO va en la barra inferior sino en el menú "Más" (módulos
   * secundarios/administrativos: recordatorios, ventas, equipo).
   */
  secundario?: boolean;
}

/**
 * Navegación de la app de staff (/app/*). Cada ítem declara el permiso que requiere;
 * el shell lo filtra según la sesión (rol + AdminOperativo). Una sola fuente de verdad.
 *
 * La barra inferior muestra hasta 4 ítems PRIMARIOS + un botón "Más" que agrupa los
 * `secundario: true` junto con el perfil. Inicio va al CENTRO y resaltado.
 */
export const navStaff: NavItem[] = [
  { to: "/app/clientes", label: "Clientes", icon: Users, permiso: "operar_clientes" },
  { to: "/app/pacientes", label: "Pacientes", icon: PawPrint, permiso: "operar_clientes" },
  { to: "/app", label: "Inicio", icon: Home, permiso: null },
  { to: "/app/citas", label: "Citas", icon: Calendar, permiso: "gestionar_citas" },
  // Secundarios → menú "Más".
  { to: "/app/pos", label: "Ventas", icon: ShoppingCart, permiso: "usar_pos", secundario: true },
  { to: "/app/ventas", label: "Historial de ventas", icon: Receipt, permiso: "ver_metricas", secundario: true },
  { to: "/app/recordatorios", label: "Recordatorios", icon: BellRing, permiso: null, secundario: true },
  { to: "/app/equipo", label: "Equipo", icon: UserCog, permiso: "gestionar_equipo", secundario: true },
];

/** Navegación del portal del dueño (/portal/*). */
export const navPortal: NavItem[] = [
  { to: "/portal", label: "Mis mascotas", icon: PawPrint, permiso: null },
  { to: "/portal/citas", label: "Citas", icon: Calendar, permiso: null },
  { to: "/portal/compras", label: "Mis pagos", icon: Receipt, permiso: null },
];

/**
 * Navegación del panel SuperAdmin (/admin/*). Con 4 módulos no hay centro exacto:
 * Inicio va primero (convención de apps) y conserva su pastilla destacada.
 */
export const navAdmin: NavItem[] = [
  { to: "/admin", label: "Inicio", icon: Home, permiso: "gestionar_veterinarias" },
  {
    to: "/admin/veterinarias",
    label: "Veterinarias",
    icon: Building2,
    permiso: "gestionar_veterinarias",
  },
  { to: "/admin/cobros", label: "Cobros", icon: Wallet, permiso: "gestionar_veterinarias" },
  {
    to: "/admin/administradores",
    label: "Clientes",
    icon: Users,
    permiso: "gestionar_veterinarias",
  },
];
