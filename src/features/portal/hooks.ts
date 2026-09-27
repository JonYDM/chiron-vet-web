import { useQuery } from "@tanstack/react-query";
import { miExpediente, misMascotas, misRecordatorios } from "./api";

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

/** Mis recordatorios. */
export function useMisRecordatorios() {
  return useQuery({
    queryKey: ["portal", "recordatorios"],
    queryFn: ({ signal }) => misRecordatorios(signal),
  });
}
