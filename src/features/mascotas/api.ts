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
  activo: boolean;
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
export function listarFotos(mascotaId: string, signal?: AbortSignal): Promise<FotoMascota[]> {
  return http.get<FotoMascota[]>(`/api/mascotas/${mascotaId}/fotos`, signal);
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

/** Elimina una foto de la galería. */
export function eliminarFoto(mascotaId: string, fotoId: string): Promise<void> {
  return http.delete<void>(`/api/mascotas/${mascotaId}/fotos/${fotoId}`);
}
