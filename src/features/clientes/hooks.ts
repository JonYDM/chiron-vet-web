import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import {
  agregarMascota,
  buscarClientes,
  cambiarEstadoCliente,
  cambiarEstadoMascota,
  crearAccesoDueno,
  crearCliente,
  editarCliente,
  editarMascota,
  listarMascotas,
  registroRapido,
  type DatosMascota,
} from "./api";
import type { FiltroEstado, RegistroRapidoRequest } from "@/types/api";

/** Lista/busca clientes (paginado + filtro de estado). */
export function useClientes(opciones: {
  texto?: string;
  estado?: FiltroEstado;
  pagina?: number;
  tamano?: number;
} = {}) {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: [
      "clientes",
      veterinariaId,
      opciones.texto ?? "",
      opciones.estado ?? "",
      opciones.pagina ?? 1,
    ],
    queryFn: ({ signal }) => buscarClientes(veterinariaId, opciones, signal),
  });
}

/** Lista las mascotas de un cliente (con filtro de estado). */
export function useMascotas(clienteId: string | null, estado?: FiltroEstado) {
  return useQuery({
    queryKey: ["mascotas", clienteId, estado ?? ""],
    queryFn: ({ signal }) => listarMascotas(clienteId as string, estado, signal),
    enabled: !!clienteId,
  });
}

/** Activa o desactiva un cliente e invalida la lista. */
export function useCambiarEstadoCliente() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: ({ clienteId, activar }: { clienteId: string; activar: boolean }) =>
      cambiarEstadoCliente(clienteId, activar),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["clientes", veterinariaId] }),
  });
}

/** Activa o desactiva una mascota e invalida las mascotas del cliente. */
export function useCambiarEstadoMascota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mascotaId, activar }: { mascotaId: string; activar: boolean }) =>
      cambiarEstadoMascota(mascotaId, activar),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mascotas"] }),
  });
}

/** Registro rápido de cliente + mascota. Invalida la lista de clientes al éxito. */
export function useRegistroRapido() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: (body: RegistroRapidoRequest) => registroRapido(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", veterinariaId] });
    },
  });
}

/** Crea el acceso al portal (usuario dueño + PIN) para un cliente. */
export function useCrearAccesoDueno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { clienteId: string; pin: string }) =>
      crearAccesoDueno(body),
    onSuccess: (_data, variables) => {
      // Refresca el estado de acceso del cliente en la tarjeta.
      queryClient.invalidateQueries({
        queryKey: ["usuarios", "cliente", variables.clienteId],
      });
    },
  });
}

/** Crea solo un cliente e invalida la lista. */
export function useCrearCliente() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: (body: { nombre: string; telefono: string; origen: number }) =>
      crearCliente(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["clientes", veterinariaId] }),
  });
}

/** Edita un cliente e invalida la lista. */
export function useEditarCliente() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: ({
      clienteId,
      ...body
    }: {
      clienteId: string;
      nombre: string;
      telefono: string;
      origen: number;
    }) => editarCliente(clienteId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["clientes", veterinariaId] }),
  });
}

/** Agrega una mascota a un cliente e invalida sus mascotas. */
export function useAgregarMascota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clienteId, datos }: { clienteId: string; datos: DatosMascota }) =>
      agregarMascota(clienteId, datos),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["mascotas", variables.clienteId] }),
  });
}

/** Edita una mascota e invalida las listas de mascotas. */
export function useEditarMascota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mascotaId, datos }: { mascotaId: string; datos: DatosMascota }) =>
      editarMascota(mascotaId, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mascotas"] }),
  });
}
