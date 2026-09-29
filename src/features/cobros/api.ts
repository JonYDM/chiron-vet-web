import { http } from "@/lib/http";

/** Cargo pendiente (cuenta por cobrar) para la caja. */
export interface CargoPendiente {
  id: string;
  mascotaId: string;
  mascotaNombre: string;
  clienteId: string;
  clienteNombre: string;
  concepto: string;
  monto: number;
  fechaCreacion: string;
}

/** Datos para generar un cargo (monto libre) desde una consulta/servicio. */
export interface GenerarCargoRequest {
  mascotaId: string;
  concepto: string;
  monto: number;
  registroMedicoId?: string | null;
}

/** Genera un cargo pendiente. Devuelve el id del cargo. */
export function generarCargo(body: GenerarCargoRequest): Promise<string> {
  return http.post<string>("/api/cargos", body);
}

/** Lista los cargos pendientes de la veterinaria (para la caja). */
export function listarCargosPendientes(signal?: AbortSignal): Promise<CargoPendiente[]> {
  return http.get<CargoPendiente[]>("/api/cargos/pendientes", signal);
}
