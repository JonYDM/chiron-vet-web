import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agregarRegistro, verExpediente } from "./api";
import type { AgregarRegistroMedicoRequest } from "@/types/api";

/** Expediente médico de una mascota. */
export function useExpediente(mascotaId: string) {
  return useQuery({
    queryKey: ["expediente", mascotaId],
    queryFn: ({ signal }) => verExpediente(mascotaId, signal),
    enabled: !!mascotaId,
  });
}

/** Agrega una entrada al expediente e invalida el expediente de esa mascota. */
export function useAgregarRegistro(mascotaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AgregarRegistroMedicoRequest) => agregarRegistro(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expediente", mascotaId] });
    },
  });
}
