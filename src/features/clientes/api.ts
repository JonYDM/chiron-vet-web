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

/** Crea el acceso al portal de un cliente (usuario dueño con PIN). */
export function crearAccesoDueno(body: {
  clienteId: string;
  pin: string;
}): Promise<unknown> {
  return http.post("/api/usuarios/dueno", body);
}

/** Crea SOLO un cliente (sin mascota). */
export function crearCliente(body: {
  nombre: string;
  telefono: string;
  origen: number;
}): Promise<string> {
  return http.post<string>("/api/clientes", body);
}

/** Edita un cliente. */
export function editarCliente(
  clienteId: string,
  body: { nombre: string; telefono: string; origen: number },
): Promise<unknown> {
  return http.put(`/api/clientes/${clienteId}`, body);
}

/** Datos para crear/editar una mascota. */
export interface DatosMascota {
  nombre: string;
  especie: number;
  sexo: number;
  raza?: string | null;
  fechaNacimiento?: string | null;
  pesoKg?: number | null;
  padecimientos?: string | null;
  esterilizado?: boolean | null;
}

/** Agrega una mascota a un cliente existente. */
export function agregarMascota(
  clienteId: string,
  datos: DatosMascota,
): Promise<string> {
  return http.post<string>("/api/mascotas", { clienteId, ...datos });
}

/** Edita una mascota. */
export function editarMascota(
  mascotaId: string,
  datos: DatosMascota,
): Promise<unknown> {
  return http.put(`/api/mascotas/${mascotaId}`, datos);
}
