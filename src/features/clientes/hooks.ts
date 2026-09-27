import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { buscarClientes, crearAccesoDueno, listarMascotas, registroRapido } from "./api";
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
  return useMutation({
    mutationFn: (body: { clienteId: string; pin: string }) =>
      crearAccesoDueno(body),
  });
}
