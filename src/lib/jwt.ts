import type { JwtClaims } from "@/types/api";

/**
 * Decodifica el payload de un JWT sin verificar la firma (eso lo hace el backend).
 * Ligero: usa atob nativo, sin dependencias. Devuelve null si el token es inválido.
 *
 * Nota: la firma NO se valida en el cliente; el token solo se usa para leer claims
 * de conveniencia (veterinariaId, clienteId) y su expiración. La autoridad real
 * es el backend, que sí valida la firma en cada petición.
 */
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

/** Claim estándar de .NET para nameidentifier / rol (por si vienen como URI). */
const CLAIM_VETERINARIA = "veterinariaId";
const CLAIM_CLIENTE = "clienteId";

/** Extrae el veterinariaId del token (o undefined si no está). */
export function getVeterinariaId(claims: JwtClaims | null): string | undefined {
  const v = claims?.[CLAIM_VETERINARIA];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** Extrae el clienteId del token (solo dueños de mascota). */
export function getClienteId(claims: JwtClaims | null): string | undefined {
  const v = claims?.[CLAIM_CLIENTE];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** Indica si el token ya expiró (con margen de 10s para desfaces de reloj). */
export function isExpired(claims: JwtClaims | null): boolean {
  if (!claims?.exp) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return claims.exp <= nowSeconds + 10;
}
