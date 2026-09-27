import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Home,
  PawPrint,
  ShoppingCart,
  Users,
  Building2,
  UserCog,
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
}

/**
 * Navegación de la app de staff (/app/*). Cada ítem declara el permiso que requiere;
 * el shell lo filtra según la sesión (rol + AdminOperativo). Una sola fuente de verdad.
 */
export const navStaff: NavItem[] = [
  { to: "/app", label: "Inicio", icon: Home, permiso: null },
  { to: "/app/clientes", label: "Clientes", icon: Users, permiso: "operar_clientes" },
  { to: "/app/citas", label: "Citas", icon: Calendar, permiso: "gestionar_citas" },
  { to: "/app/pos", label: "Ventas", icon: ShoppingCart, permiso: "usar_pos" },
  { to: "/app/equipo", label: "Equipo", icon: UserCog, permiso: "gestionar_equipo" },
];

/** Navegación del portal del dueño (/portal/*). */
export const navPortal: NavItem[] = [
  { to: "/portal", label: "Mis mascotas", icon: PawPrint, permiso: null },
  { to: "/portal/recordatorios", label: "Recordatorios", icon: Home, permiso: null },
];

/** Navegación del panel SuperAdmin (/admin/*). */
export const navAdmin: NavItem[] = [
  {
    to: "/admin/veterinarias",
    label: "Veterinarias",
    icon: Building2,
    permiso: "gestionar_veterinarias",
  },
];
