import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { comprimirImagen } from "@/lib/imagen";
import { eliminarFoto, listarFotos, subirFoto } from "./api";

/** Galería de fotos de una mascota. */
export function useFotos(mascotaId: string) {
  return useQuery({
    queryKey: ["fotos", mascotaId],
    queryFn: ({ signal }) => listarFotos(mascotaId, signal),
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
