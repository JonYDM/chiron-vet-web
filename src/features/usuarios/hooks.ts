import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearStaff,
  listarAdministradores,
  listarStaff,
  obtenerUsuarioDeCliente,
  resetearPin,
} from "./api";
import type { CrearStaffRequest } from "@/types/api";

/** Lista el staff de la veterinaria actual. */
export function useStaff() {
  return useQuery({
    queryKey: ["usuarios", "staff"],
    queryFn: ({ signal }) => listarStaff(signal),
  });
}

/** Lista los administradores (SuperAdmin). */
export function useAdministradores() {
  return useQuery({
    queryKey: ["usuarios", "administradores"],
    queryFn: ({ signal }) => listarAdministradores(signal),
  });
}

/** Usuario (acceso al portal) de un cliente; null si no tiene acceso. */
export function useUsuarioDeCliente(clienteId: string | null) {
  return useQuery({
    queryKey: ["usuarios", "cliente", clienteId],
    queryFn: ({ signal }) => obtenerUsuarioDeCliente(clienteId as string, signal),
    enabled: !!clienteId,
  });
}

/** Resetea el PIN de un usuario. */
export function useResetearPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, nuevoPin }: { usuarioId: string; nuevoPin: string }) =>
      resetearPin(usuarioId, nuevoPin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

/** Crea un usuario de staff e invalida la lista de staff. */
export function useCrearStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearStaffRequest) => crearStaff(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios", "staff"] });
    },
  });
}
