import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { agendarCita, cambiarEstadoCita, listarCitas, proximasCitas, type AccionCita } from "./api";
import type { AgendarCitaRequest, EstadoCita } from "@/types/api";

/** Próximas citas de la veterinaria actual. */
export function useProximasCitas() {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["citas", veterinariaId],
    queryFn: ({ signal }) => proximasCitas(veterinariaId, signal),
  });
}

/** Lista de citas (con paciente/dueño), opcionalmente filtrada por estado. */
export function useCitas(estado?: EstadoCita) {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["citas-lista", veterinariaId, estado ?? "todas"],
    queryFn: ({ signal }) => listarCitas(estado, signal),
  });
}

/** Agenda una cita e invalida las listas de citas. */
export function useAgendarCita() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: (body: AgendarCitaRequest) => agendarCita(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas", veterinariaId] });
      queryClient.invalidateQueries({ queryKey: ["citas-lista", veterinariaId] });
    },
  });
}

/** Cambia el estado de una cita e invalida las listas de citas. */
export function useCambiarEstadoCita() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: ({ citaId, accion }: { citaId: string; accion: AccionCita }) =>
      cambiarEstadoCita(citaId, accion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas", veterinariaId] });
      queryClient.invalidateQueries({ queryKey: ["citas-lista", veterinariaId] });
    },
  });
}
