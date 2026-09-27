import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activarVeterinaria,
  configurarAdminOperativo,
  crearAdmin,
  crearVeterinaria,
  desactivarVeterinaria,
  listarVeterinarias,
} from "./api";
import type { CrearAdminRequest, CrearVeterinariaRequest } from "@/types/api";

const KEY = ["veterinarias"];

/** Lista de veterinarias. */
export function useVeterinarias() {
  return useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => listarVeterinarias(signal),
  });
}

/** Crea una veterinaria e invalida la lista. */
export function useCrearVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearVeterinariaRequest) => crearVeterinaria(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Activa/desactiva una veterinaria e invalida la lista. */
export function useCambiarEstadoVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activar }: { id: string; activar: boolean }) =>
      activar ? activarVeterinaria(id) : desactivarVeterinaria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Crea el administrador de una veterinaria. */
export function useCrearAdmin() {
  return useMutation({
    mutationFn: (body: CrearAdminRequest) => crearAdmin(body),
  });
}

/** Configura el modo operativo del admin de una veterinaria e invalida la lista. */
export function useConfigurarAdminOperativo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, operativo }: { id: string; operativo: boolean }) =>
      configurarAdminOperativo(id, operativo),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
