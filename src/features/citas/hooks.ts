import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { agendarCita, cambiarEstadoCita, proximasCitas, type AccionCita } from "./api";
import type { AgendarCitaRequest } from "@/types/api";

/** Próximas citas de la veterinaria actual. */
export function useProximasCitas() {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["citas", veterinariaId],
    queryFn: ({ signal }) => proximasCitas(veterinariaId, signal),
  });
}

/** Agenda una cita e invalida la lista de próximas. */
export function useAgendarCita() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: (body: AgendarCitaRequest) => agendarCita(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas", veterinariaId] });
    },
  });
}

/** Cambia el estado de una cita e invalida la lista. */
export function useCambiarEstadoCita() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: ({ citaId, accion }: { citaId: string; accion: AccionCita }) =>
      cambiarEstadoCita(citaId, accion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas", veterinariaId] });
    },
  });
}
