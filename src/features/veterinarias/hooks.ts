import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activarVeterinaria,
  ajustarRenovacion,
  configurarAdminOperativo,
  crearAdmin,
  crearVeterinaria,
  desactivarVeterinaria,
  editarVeterinaria,
  listarVeterinarias,
  renovarVeterinaria,
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

/** Renueva la suscripción de una veterinaria e invalida la lista. */
export function useRenovarVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => renovarVeterinaria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Ajusta a mano la fecha de renovación e invalida la lista. */
export function useAjustarRenovacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fecha }: { id: string; fecha: string }) => ajustarRenovacion(id, fecha),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Edita los datos generales de una veterinaria e invalida la lista. */
export function useEditarVeterinaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof editarVeterinaria>[1]) =>
      editarVeterinaria(id, body),
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
