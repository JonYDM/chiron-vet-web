import { http, ApiError } from "@/lib/http";
import type { LoginRequest, LoginResponse } from "@/types/api";

/** Llama al endpoint público de login. */
export function login(body: LoginRequest): Promise<LoginResponse> {
  return http.post<LoginResponse>("/api/auth/login", body);
}

/** Resultado de identificar (paso 1 del login estilo Nubank). */
export interface IdentificarResultado {
  /** El identificador corresponde a un usuario válido. */
  existe: boolean;
  /** Nombre real del usuario, para saludarlo antes del PIN (si el backend lo da). */
  nombre?: string;
  /**
   * True si el backend aún NO tiene el endpoint /auth/identificar. En ese caso el
   * frontend continúa al PIN sin validar (fallback), y el login real valida todo.
   */
  noDisponible?: boolean;
}

/**
 * [Requiere endpoint backend — ver docs/PENDIENTES-TECNICOS.md]
 * Valida el identificador ANTES de pedir el PIN y trae el nombre real del usuario.
 * Si el endpoint no existe todavía (404/405), devuelve `noDisponible: true` para que
 * el flujo continúe al PIN como fallback (sin romper el login).
 */
export async function identificar(identificador: string): Promise<IdentificarResultado> {
  try {
    return await http.post<IdentificarResultado>("/api/auth/identificar", {
      identificador,
    });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
      // El backend aún no implementa el endpoint → continuar sin validar.
      return { existe: true, noDisponible: true };
    }
    throw e;
  }
}
