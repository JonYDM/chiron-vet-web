import { http } from "@/lib/http";
import type {
  AgregarProductoRequest,
  Producto,
  RegistrarVentaRequest,
  VentaResponse,
  VentaHistorial,
  ResumenVentas,
} from "@/types/api";

/** Historial de ventas de la veterinaria (Admin), rango de fechas opcional. */
export function listarVentas(
  veterinariaId: string,
  desde?: string,
  hasta?: string,
  signal?: AbortSignal,
): Promise<VentaHistorial[]> {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return http.get<VentaHistorial[]>(
    `/api/veterinarias/${veterinariaId}/ventas${qs}`,
    signal,
  );
}

/** Historial de compras de un cliente. */
export function listarVentasDeCliente(
  clienteId: string,
  signal?: AbortSignal,
): Promise<VentaHistorial[]> {
  return http.get<VentaHistorial[]>(`/api/clientes/${clienteId}/ventas`, signal);
}

/** Resumen de ventas de un período (total, conteo, desglose por método). */
export function resumenVentas(
  veterinariaId: string,
  desde?: string,
  hasta?: string,
  signal?: AbortSignal,
): Promise<ResumenVentas> {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return http.get<ResumenVentas>(
    `/api/veterinarias/${veterinariaId}/ventas/resumen${qs}`,
    signal,
  );
}

/** Catálogo de productos de la veterinaria. */
export function listarCatalogo(
  veterinariaId: string,
  signal?: AbortSignal,
): Promise<Producto[]> {
  return http.get<Producto[]>(
    `/api/veterinarias/${veterinariaId}/catalogo`,
    signal,
  );
}

/** Agrega un producto al catálogo (solo Admin). Devuelve el id. */
export function agregarProducto(body: AgregarProductoRequest): Promise<string> {
  return http.post<string>("/api/productos", body);
}

/** Registra una venta (Admin/Recepcionista). */
export function registrarVenta(
  body: RegistrarVentaRequest,
): Promise<VentaResponse> {
  return http.post<VentaResponse>("/api/ventas", body);
}

/** Edita un producto (Admin). */
export function editarProducto(
  productoId: string,
  body: { nombre: string; categoria: number; precio: number },
): Promise<unknown> {
  return http.put(`/api/productos/${productoId}`, body);
}

/** Reabastece stock de un producto (Admin). */
export function reabastecerStock(productoId: string, cantidad: number): Promise<unknown> {
  return http.post(`/api/productos/${productoId}/reabastecer`, { cantidad });
}

/** Desactiva (baja lógica) un producto (Admin). */
export function desactivarProducto(productoId: string): Promise<unknown> {
  return http.post(`/api/productos/${productoId}/desactivar`);
}
