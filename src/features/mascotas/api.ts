import { http } from "@/lib/http";

/** Foto de la galería de una mascota (coincide con FotoMascotaDto del backend). */
export interface FotoMascota {
  id: string;
  mascotaId: string;
  registroMedicoId: string | null;
  url: string;
  fechaSubida: string;
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
