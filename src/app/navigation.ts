import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Home,
  PawPrint,
  ShoppingCart,
  Users,
  Bell,
  Building2,
  UserCog,
} from "lucide-react";
import { RolUsuario } from "@/types/api";

export interface NavItem {
  /** Ruta absoluta. */
  to: string;
  /** Etiqueta corta para el menú. */
  label: string;
  icon: LucideIcon;
  /** Roles que ven este ítem. */
  roles: RolUsuario[];
}

const STAFF = [
  RolUsuario.Administrador,
  RolUsuario.Veterinario,
  RolUsuario.Recepcionista,
];

/**
 * Navegación de la app de staff (/app/*). Cada ítem declara qué roles lo ven,
 * de modo que el mismo shell sirve a Admin/Veterinario/Recepcionista mostrando
 * solo lo permitido.
 */
export const navStaff: NavItem[] = [
  { to: "/app", label: "Inicio", icon: Home, roles: STAFF },
  { to: "/app/clientes", label: "Clientes", icon: Users, roles: STAFF },
  {
    to: "/app/citas",
    label: "Citas",
    icon: Calendar,
    roles: STAFF,
  },
  {
    to: "/app/pos",
    label: "Ventas",
    icon: ShoppingCart,
    roles: [RolUsuario.Administrador, RolUsuario.Recepcionista],
  },
  {
    to: "/app/recordatorios",
    label: "Recordatorios",
    icon: Bell,
    roles: [RolUsuario.Administrador],
  },
  {
    to: "/app/equipo",
    label: "Equipo",
    icon: UserCog,
    roles: [RolUsuario.Administrador],
  },
];

/** Navegación del portal del dueño (/portal/*). */
export const navPortal: NavItem[] = [
  { to: "/portal", label: "Mis mascotas", icon: PawPrint, roles: [RolUsuario.DuenoMascota] },
  {
    to: "/portal/recordatorios",
    label: "Recordatorios",
    icon: Bell,
    roles: [RolUsuario.DuenoMascota],
  },
];

/** Navegación del panel SuperAdmin (/admin/*). */
export const navAdmin: NavItem[] = [
  {
    to: "/admin/veterinarias",
    label: "Veterinarias",
    icon: Building2,
    roles: [RolUsuario.SuperAdmin],
  },
];

/** Devuelve los ítems visibles para un rol dado a partir de una lista. */
export function itemsVisibles(items: NavItem[], rol: RolUsuario): NavItem[] {
  return items.filter((i) => i.roles.includes(rol));
}
