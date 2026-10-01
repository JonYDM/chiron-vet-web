import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { miExpediente, misCitas, misCompras, misMascotas, misRecordatorios, responderAsistencia } from "./api";

/** Mis mascotas (dueño autenticado). */
export function useMisMascotas() {
  return useQuery({
    queryKey: ["portal", "mascotas"],
    queryFn: ({ signal }) => misMascotas(signal),
  });
}

/** Expediente de una de mis mascotas. */
export function useMiExpediente(mascotaId: string) {
  return useQuery({
    queryKey: ["portal", "expediente", mascotaId],
    queryFn: ({ signal }) => miExpediente(mascotaId, signal),
    enabled: !!mascotaId,
  });
}

/** Mis recordatorios (vacunas/desparasitaciones y citas próximas). */
export function useMisRecordatorios() {
  return useQuery({
    queryKey: ["portal", "recordatorios"],
    queryFn: ({ signal }) => misRecordatorios(signal),
  });
}

/** Citas de mis mascotas. */
export function useMisCitas() {
  return useQuery({
    queryKey: ["portal", "citas"],
    queryFn: ({ signal }) => misCitas(signal),
  });
}

/** Respondo si asistiré (refresca citas y recordatorios). */
export function useResponderAsistencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ citaId, asistira }: { citaId: string; asistira: boolean }) => responderAsistencia(citaId, asistira),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal", "citas"] });
      qc.invalidateQueries({ queryKey: ["portal", "recordatorios"] });
    },
  });
}

/** Mis compras/cobros (lo que pagué). */
export function useMisCompras() {
  return useQuery({
    queryKey: ["portal", "compras"],
    queryFn: ({ signal }) => misCompras(signal),
  });
}
