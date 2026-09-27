import { http } from "@/lib/http";
import type {
  Cliente,
  Mascota,
  RegistroRapidoRequest,
  RegistroRapidoResponse,
} from "@/types/api";

/** Busca/lista clientes de una veterinaria (texto opcional). */
export function buscarClientes(
  veterinariaId: string,
  texto?: string,
  signal?: AbortSignal,
): Promise<Cliente[]> {
  const query = texto ? `?texto=${encodeURIComponent(texto)}` : "";
  return http.get<Cliente[]>(
    `/api/veterinarias/${veterinariaId}/clientes${query}`,
    signal,
  );
}

/** Lista las mascotas de un cliente. */
export function listarMascotas(
  clienteId: string,
  signal?: AbortSignal,
): Promise<Mascota[]> {
  return http.get<Mascota[]>(`/api/clientes/${clienteId}/mascotas`, signal);
}

/** Registro rápido: crea cliente + su primera mascota en una sola operación. */
export function registroRapido(
  body: RegistroRapidoRequest,
): Promise<RegistroRapidoResponse> {
  return http.post<RegistroRapidoResponse>("/api/registro-rapido", body);
}
