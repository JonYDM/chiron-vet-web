import { http, ApiError } from "@/lib/http";
import type { EspecieMascota, SexoMascota } from "@/types/api";

/** Foto de la galería de una mascota (coincide con FotoMascotaDto del backend). */
export interface FotoMascota {
  id: string;
  mascotaId: string;
  registroMedicoId: string | null;
  url: string;
  fechaSubida: string;
}

/** Mascota con el nombre de su dueño, para la vista Pacientes (listado de veterinaria). */
export interface MascotaConDueno {
  id: string;
  nombre: string;
  especie: EspecieMascota;
  raza: string | null;
  sexo: SexoMascota;
  fechaNacimiento: string | null;
  pesoKg: number | null;
  padecimientos: string | null;
  esterilizado: boolean | null;
  activo: boolean;
  fotoPerfilUrl: string | null;
  clienteId: string;
  clienteNombre: string;
}

/** Resultado de listar pacientes; incluye flag de "endpoint no disponible aún". */
export interface ResultadoPacientes {
  items: MascotaConDueno[];
  noDisponible?: boolean;
}

/**
 * [Requiere endpoint backend GET /mascotas — ver docs] Lista todas las mascotas de la
 * veterinaria (con el dueño). Si el endpoint no existe aún (404/405), devuelve
 * noDisponible=true para que la vista muestre un estado elegante sin romperse.
 */
export async function listarPacientes(
  texto: string | undefined,
  signal?: AbortSignal,
): Promise<ResultadoPacientes> {
  const qs = texto ? `?texto=${encodeURIComponent(texto)}` : "";
  try {
    const items = await http.get<MascotaConDueno[]>(`/api/mascotas${qs}`, signal);
    return { items };
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
      return { items: [], noDisponible: true };
    }
    throw e;
  }
}

/** Lista la galería de fotos de una mascota (más recientes primero). */
/** Galería de la mascota. `portal` = el dueño (endpoint que valida que la mascota sea suya). */
export function listarFotos(mascotaId: string, signal?: AbortSignal, portal = false): Promise<FotoMascota[]> {
  const base = portal ? "/api/portal/mascotas" : "/api/mascotas";
  return http.get<FotoMascota[]>(`${base}/${mascotaId}/fotos`, signal);
}

/** Sube una foto (multipart) a la galería. Opcionalmente ligada a un registro médico. */
export function subirFoto(
  mascotaId: string,
  archivo: File | Blob,
  registroMedicoId?: string,
): Promise<FotoMascota> {
  const form = new FormData();
  form.append("archivo", archivo);
  const query = registroMedicoId ? `?registroMedicoId=${registroMedicoId}` : "";
  return http.postForm<FotoMascota>(`/api/mascotas/${mascotaId}/fotos${query}`, form);
}

/** Sube (o reemplaza) la foto de PERFIL (avatar) de la mascota. Devuelve la URL. */
export function subirFotoPerfil(mascotaId: string, archivo: File | Blob): Promise<string> {
  const form = new FormData();
  form.append("archivo", archivo);
  return http.postForm<string>(`/api/mascotas/${mascotaId}/foto-perfil`, form);
}

/** Elimina una foto de la galería. */
export function eliminarFoto(mascotaId: string, fotoId: string): Promise<void> {
  return http.delete<void>(`/api/mascotas/${mascotaId}/fotos/${fotoId}`);
}

/**
 * Obtiene una mascota completa por id (peso, esterilizado, padecimientos, etc.).
 * [Requiere endpoint GET /mascotas/{id}] Si no existe aún (404/405), devuelve null
 * para que la vista use el fallback (router state).
 */
export async function obtenerMascota(
  mascotaId: string,
  signal?: AbortSignal,
): Promise<import("@/types/api").Mascota | null> {
  try {
    return await http.get<import("@/types/api").Mascota>(`/api/mascotas/${mascotaId}`, signal);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) return null;
    throw e;
  }
}
