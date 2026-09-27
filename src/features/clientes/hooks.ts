import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import {
  agregarMascota,
  buscarClientes,
  crearAccesoDueno,
  crearCliente,
  editarCliente,
  editarMascota,
  listarMascotas,
  registroRapido,
  type DatosMascota,
} from "./api";
import type { RegistroRapidoRequest } from "@/types/api";

/** Lista/busca clientes de la veterinaria actual. */
export function useClientes(texto?: string) {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["clientes", veterinariaId, texto ?? ""],
    queryFn: ({ signal }) => buscarClientes(veterinariaId, texto, signal),
  });
}

/** Lista las mascotas de un cliente. */
export function useMascotas(clienteId: string | null) {
  return useQuery({
    queryKey: ["mascotas", clienteId],
    queryFn: ({ signal }) => listarMascotas(clienteId as string, signal),
    enabled: !!clienteId,
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
