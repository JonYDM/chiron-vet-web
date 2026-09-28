import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { resumenVentas } from "@/features/pos/api";
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

/** Rango [inicio, fin] del día de hoy en ISO, para el resumen de caja. */
function rangoHoy(): { desde: string; hasta: string } {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);
  return { desde: inicio.toISOString(), hasta: fin.toISOString() };
}

/** Resumen de caja del día (total + desglose por método de pago). */
export function useResumenCajaHoy(habilitado = true) {
  const veterinariaId = useVeterinariaId();
  const { desde, hasta } = rangoHoy();
  return useQuery({
    queryKey: ["resumen-caja", veterinariaId, desde.slice(0, 10)],
    queryFn: ({ signal }) => resumenVentas(veterinariaId, desde, hasta, signal),
    enabled: habilitado,
  });
}
