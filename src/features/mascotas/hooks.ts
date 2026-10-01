import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { comprimirImagen } from "@/lib/imagen";
import { eliminarFoto, listarFotos, listarPacientes, obtenerMascota, subirFoto, subirFotoPerfil } from "./api";

/** Obtiene una mascota completa por id (con fallback si el endpoint no existe). */
export function useMascota(mascotaId: string) {
  return useQuery({
    queryKey: ["mascota", mascotaId],
    queryFn: ({ signal }) => obtenerMascota(mascotaId, signal),
    enabled: !!mascotaId,
  });
}

/** Lista todas las mascotas de la veterinaria (vista Pacientes). Con fallback. */
export function usePacientes(texto?: string) {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["pacientes", veterinariaId, texto ?? ""],
    queryFn: ({ signal }) => listarPacientes(texto, signal),
  });
}

/** Galería de fotos de una mascota. */
export function useFotos(mascotaId: string, portal = false) {
  return useQuery({
    queryKey: ["fotos", mascotaId, portal ? "portal" : "staff"],
    queryFn: ({ signal }) => listarFotos(mascotaId, signal, portal),
    enabled: !!mascotaId,
  });
}

/** Sube una foto (comprimida en cliente) e invalida la galería. */
export function useSubirFoto(mascotaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { archivo: File; registroMedicoId?: string }) => {
      const blob = await comprimirImagen(params.archivo);
      return subirFoto(mascotaId, blob, params.registroMedicoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fotos", mascotaId] });
    },
  });
}

/** Sube la foto de perfil (avatar) de la mascota e invalida sus datos. */
export function useSubirFotoPerfil(mascotaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (archivo: File) => {
      const blob = await comprimirImagen(archivo);
      return subirFotoPerfil(mascotaId, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascota", mascotaId] });
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    },
  });
}

/** Elimina una foto e invalida la galería. */
export function useEliminarFoto(mascotaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fotoId: string) => eliminarFoto(mascotaId, fotoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fotos", mascotaId] });
    },
  });
}
