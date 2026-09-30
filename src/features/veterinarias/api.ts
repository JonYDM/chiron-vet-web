import { http } from "@/lib/http";
import type {
  CrearAdminRequest,
  CrearVeterinariaRequest,
  MetricasSuperAdmin,
  PagoSuscripcion,
  PlanSuscripcion,
  RenovarRequest,
  Sucursal,
  SucursalRequest,
  UsuarioCreado,
  Veterinaria,
} from "@/types/api";

/** Lista todas las veterinarias (tenants). */
export function listarVeterinarias(signal?: AbortSignal): Promise<Veterinaria[]> {
  return http.get<Veterinaria[]>("/api/admin/veterinarias", signal);
}

/** Métricas globales de la plataforma para el SuperAdmin. */
export function obtenerMetricasSuperAdmin(signal?: AbortSignal): Promise<MetricasSuperAdmin> {
  return http.get<MetricasSuperAdmin>("/api/admin/metricas", signal);
}

/** Crea una veterinaria. Devuelve datos básicos { id, nombre, activa }. */
export function crearVeterinaria(
  body: CrearVeterinariaRequest,
): Promise<{ id: string; nombre: string; activa: boolean }> {
  return http.post("/api/admin/veterinarias", body);
}

/** Activa una veterinaria (pago recibido). */
export function activarVeterinaria(id: string): Promise<unknown> {
  return http.post(`/api/admin/veterinarias/${id}/activar`);
}

/** Desactiva una veterinaria (impago). */
export function desactivarVeterinaria(id: string): Promise<unknown> {
  return http.post(`/api/admin/veterinarias/${id}/desactivar`);
}

/** Edita los datos generales de una veterinaria. */
export function editarVeterinaria(
  id: string,
  body: { nombre: string; telefono: string; direccion?: string | null; plan: PlanSuscripcion },
): Promise<unknown> {
  return http.put(`/api/admin/veterinarias/${id}`, body);
}

/** Renueva la suscripción (extiende un periodo según el plan y reactiva). */
export function renovarVeterinaria(id: string): Promise<{ fechaRenovacion: string }> {
  return http.post(`/api/admin/veterinarias/${id}/renovar`);
}

/** Ajuste manual de la fecha de renovación (YYYY-MM-DD). */
export function ajustarRenovacion(id: string, fecha: string): Promise<unknown> {
  return http.post(`/api/admin/veterinarias/${id}/renovacion`, { fecha });
}

/** Crea el Administrador de una veterinaria; devuelve el usuario generado. */
export function crearAdmin(body: CrearAdminRequest): Promise<UsuarioCreado> {
  return http.post<UsuarioCreado>("/api/admin/usuarios-admin", body);
}

/** Configura si el Administrador de una veterinaria puede operar (true) o solo supervisar (false). */
export function configurarAdminOperativo(id: string, operativo: boolean): Promise<unknown> {
  return http.post(`/api/admin/veterinarias/${id}/admin-operativo`, { operativo });
}

// ── Sucursales (unidad de cobro) ──

/** Da de alta una sucursal de la veterinaria. */
export function crearSucursal(veterinariaId: string, body: SucursalRequest): Promise<Sucursal> {
  return http.post<Sucursal>(`/api/admin/veterinarias/${veterinariaId}/sucursales`, body);
}

/** Edita datos, plan y precio de una sucursal (no mueve la fecha de renovación). */
export function editarSucursal(id: string, body: SucursalRequest): Promise<Sucursal> {
  return http.put<Sucursal>(`/api/admin/sucursales/${id}`, body);
}

/** Renueva un periodo y registra el cobro (si es la Matriz, reactiva la veterinaria). */
export function renovarSucursal(id: string, body?: RenovarRequest): Promise<Sucursal> {
  return http.post<Sucursal>(`/api/admin/sucursales/${id}/renovar`, body ?? {});
}

/** Historial de cobros en un rango de fechas de pago (YYYY-MM-DD). */
export function listarPagos(desde: string, hasta: string, signal?: AbortSignal): Promise<PagoSuscripcion[]> {
  const q = new URLSearchParams({ desde, hasta });
  return http.get<PagoSuscripcion[]>(`/api/admin/pagos?${q.toString()}`, signal);
}

/** Anula un pago mal capturado (deja de contar en ingresos). */
export function anularPago(id: string): Promise<unknown> {
  return http.post(`/api/admin/pagos/${id}/anular`);
}

/** Ajuste manual de la fecha de renovación de la sucursal (YYYY-MM-DD). */
export function ajustarRenovacionSucursal(id: string, fecha: string): Promise<Sucursal> {
  return http.post<Sucursal>(`/api/admin/sucursales/${id}/renovacion`, { fecha });
}

/** Activa/desactiva una sucursal que no es la Matriz. */
export function cambiarEstadoSucursal(id: string, activar: boolean): Promise<Sucursal> {
  return http.post<Sucursal>(`/api/admin/sucursales/${id}/${activar ? "activar" : "desactivar"}`);
}
