import { http } from "@/lib/http";
import type {
  AgregarProductoRequest,
  Producto,
  RegistrarVentaRequest,
  VentaResponse,
} from "@/types/api";

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
