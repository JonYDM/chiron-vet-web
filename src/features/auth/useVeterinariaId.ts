import { useAuth } from "@/features/auth";

/**
 * Devuelve el veterinariaId de la sesión (tenant actual).
 * Los endpoints de staff lo requieren en la URL. Lanza si no existe
 * (no debería pasar dentro de rutas protegidas de staff).
 */
export function useVeterinariaId(): string {
  const { sesion } = useAuth();
  if (!sesion?.veterinariaId) {
    throw new Error("La sesión no tiene veterinariaId.");
  }
  return sesion.veterinariaId;
}
