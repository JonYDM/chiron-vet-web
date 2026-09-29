import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { generarCargo, listarCargosPendientes, type GenerarCargoRequest } from "./api";

/** Cargos pendientes de la veterinaria (para la caja). */
export function useCargosPendientes() {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["cargos-pendientes", veterinariaId],
    queryFn: ({ signal }) => listarCargosPendientes(signal),
  });
}

/** Genera un cargo e invalida la lista de pendientes. */
export function useGenerarCargo() {
  const veterinariaId = useVeterinariaId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerarCargoRequest) => generarCargo(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cargos-pendientes", veterinariaId] }),
  });
}
