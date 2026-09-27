import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import type { MetricasDashboard } from "@/types/api";

function obtenerMetricas(
  veterinariaId: string,
  signal?: AbortSignal,
): Promise<MetricasDashboard> {
  return http.get<MetricasDashboard>(
    `/api/veterinarias/${veterinariaId}/metricas`,
    signal,
  );
}

/** Métricas del dashboard de la veterinaria actual. */
export function useMetricas() {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["metricas", veterinariaId],
    queryFn: ({ signal }) => obtenerMetricas(veterinariaId, signal),
  });
}
