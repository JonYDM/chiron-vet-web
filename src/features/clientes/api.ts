import { http } from "@/lib/http";
import type {
  Cliente,
  FiltroEstado,
  Mascota,
  RegistroRapidoRequest,
  RegistroRapidoResponse,
  ResultadoPaginado,
} from "@/types/api";

/** Busca/lista clientes (paginado + filtro de estado, todo server-side). */
export function buscarClientes(
  veterinariaId: string,
  opciones: {
    texto?: string;
    estado?: FiltroEstado;
    pagina?: number;
    tamano?: number;
  } = {},
  signal?: AbortSignal,
): Promise<ResultadoPaginado<Cliente>> {
  const params = new URLSearchParams();
  if (opciones.texto) params.set("texto", opciones.texto);
  if (opciones.estado != null) params.set("estado", String(opciones.estado));
  params.set("pagina", String(opciones.pagina ?? 1));
  params.set("tamano", String(opciones.tamano ?? 20));
  return http.get<ResultadoPaginado<Cliente>>(
    `/api/veterinarias/${veterinariaId}/clientes?${params.toString()}`,
    signal,
  );
}

/** Lista las mascotas de un cliente (con filtro de estado). */
export function listarMascotas(
  clienteId: string,
  estado?: FiltroEstado,
  signal?: AbortSignal,
): Promise<Mascota[]> {
  const qs = estado != null ? `?estado=${estado}` : "";
  return http.get<Mascota[]>(`/api/clientes/${clienteId}/mascotas${qs}`, signal);
}

/** Activa o desactiva un cliente (baja lógica). */
export function cambiarEstadoCliente(clienteId: string, activar: boolean): Promise<unknown> {
  return http.post(`/api/clientes/${clienteId}/estado`, { activar });
}

/** Activa o desactiva una mascota (baja lógica). */
export function cambiarEstadoMascota(mascotaId: string, activar: boolean): Promise<unknown> {
  return http.post(`/api/mascotas/${mascotaId}/estado`, { activar });
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
