import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { enviarRecordatorios, listarRecordatorios } from "./api";

/** Recordatorios pendientes de la veterinaria (para el staff). */
export function useRecordatorios(dias?: number) {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["recordatorios", veterinariaId, dias ?? 30],
    queryFn: ({ signal }) => listarRecordatorios(dias, signal),
  });
}

/** Dispara el envío de recordatorios e invalida la lista. */
export function useEnviarRecordatorios() {
  const veterinariaId = useVeterinariaId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dias?: number) => enviarRecordatorios(veterinariaId, dias),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recordatorios"] }),
  });
}
