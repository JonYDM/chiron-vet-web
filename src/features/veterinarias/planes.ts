import { CalendarDays, CalendarRange } from "lucide-react";
import { PlanSuscripcion } from "@/types/api";

/** Opciones de plan para los selectores de alta y edición de veterinaria. */
export const PLANES = [
  { valor: PlanSuscripcion.Mensual, label: "Mensual", detalle: "Renueva cada mes", icon: CalendarDays },
  { valor: PlanSuscripcion.Anual, label: "Anual", detalle: "Renueva cada año", icon: CalendarRange },
] as const;
