import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  activarVeterinaria,
  ajustarRenovacion,
  ajustarRenovacionSucursal,
  anularPago,
  cambiarEstadoSucursal,
  configurarAdminOperativo,
  crearAdmin,
  crearSucursal,
  crearVeterinaria,
  desactivarVeterinaria,
  editarSucursal,
  editarVeterinaria,
  listarPagos,
  listarVeterinarias,
  obtenerMetricasSuperAdmin,
  renovarSucursal,
  renovarVeterinaria,
} from "./api";
import type { CrearAdminRequest, CrearVeterinariaRequest, RenovarRequest, SucursalRequest } from "@/types/api";

const KEY = ["veterinarias"];
const KEY_METRICAS = ["metricas-superadmin"];
const KEY_ADMINS = ["usuarios", "administradores"];
const KEY_PAGOS = ["pagos-suscripcion"];

/** Invalida todo lo que depende de las veterinarias (lista + métricas del SuperAdmin). */
function invalidarVeterinarias(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: KEY_METRICAS });
}

/** Lista de veterinarias. */
export function useVeterinarias() {
  return useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => listarVeterinarias(signal),
  });
}

/** Métricas globales de la plataforma (dashboard SuperAdmin). */
export function useMetricasSuperAdmin() {
  return useQuery({
    queryKey: KEY_METRICAS,
    queryFn: ({ signal }) => obtenerMetricasSuperAdmin(signal),
  });
}

/** Crea una veterinaria. */
export function useCrearVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearVeterinariaRequest) => crearVeterinaria(body),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Activa/desactiva una veterinaria. */
export function useCambiarEstadoVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activar }: { id: string; activar: boolean }) =>
      activar ? activarVeterinaria(id) : desactivarVeterinaria(id),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Renueva la suscripción de una veterinaria. */
export function useRenovarVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => renovarVeterinaria(id),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Ajusta a mano la fecha de renovación. */
export function useAjustarRenovacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fecha }: { id: string; fecha: string }) => ajustarRenovacion(id, fecha),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Edita los datos generales de una veterinaria. */
export function useEditarVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof editarVeterinaria>[1]) =>
      editarVeterinaria(id, body),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Crea el administrador de una veterinaria (refresca la lista de admins y las métricas). */
export function useCrearAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearAdminRequest) => crearAdmin(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_ADMINS });
      qc.invalidateQueries({ queryKey: KEY_METRICAS });
    },
  });
}

/** Obsoleto: configura el modo operativo del admin de una veterinaria. */
export function useConfigurarAdminOperativo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, operativo }: { id: string; operativo: boolean }) =>
      configurarAdminOperativo(id, operativo),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}


// ── Sucursales ── (todas invalidan la lista de veterinarias y las métricas)

/** Alta de sucursal. */
export function useCrearSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ veterinariaId, body }: { veterinariaId: string; body: SucursalRequest }) =>
      crearSucursal(veterinariaId, body),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Edición de sucursal (datos, plan y precio). */
export function useEditarSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SucursalRequest }) => editarSucursal(id, body),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Renueva un periodo y registra el cobro (refresca lista, métricas e historial de cobros). */
export function useRenovarSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: RenovarRequest }) => renovarSucursal(id, body),
    onSuccess: () => {
      invalidarVeterinarias(qc);
      qc.invalidateQueries({ queryKey: KEY_PAGOS });
    },
  });
}

/** Historial de cobros en un rango de fechas (YYYY-MM-DD). */
export function usePagos(desde: string, hasta: string) {
  return useQuery({
    queryKey: [...KEY_PAGOS, desde, hasta],
    queryFn: ({ signal }) => listarPagos(desde, hasta, signal),
  });
}

/** Anula un pago (refresca historial y métricas de ingresos). */
export function useAnularPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => anularPago(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_PAGOS });
      qc.invalidateQueries({ queryKey: KEY_METRICAS });
    },
  });
}

/** Ajusta a mano la fecha de renovación de la sucursal. */
export function useAjustarRenovacionSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fecha }: { id: string; fecha: string }) => ajustarRenovacionSucursal(id, fecha),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}

/** Activa/desactiva una sucursal (no la Matriz). */
export function useCambiarEstadoSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activar }: { id: string; activar: boolean }) => cambiarEstadoSucursal(id, activar),
    onSuccess: () => invalidarVeterinarias(qc),
  });
}
