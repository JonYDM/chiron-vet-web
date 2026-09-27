import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { agregarProducto, listarCatalogo, registrarVenta } from "./api";
import type { AgregarProductoRequest, RegistrarVentaRequest } from "@/types/api";

/** Catálogo de productos de la veterinaria actual. */
export function useCatalogo() {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["catalogo", veterinariaId],
    queryFn: ({ signal }) => listarCatalogo(veterinariaId, signal),
  });
}

/** Agrega un producto e invalida el catálogo. */
export function useAgregarProducto() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: (body: AgregarProductoRequest) => agregarProducto(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo", veterinariaId] });
    },
  });
}

/** Registra una venta e invalida el catálogo (cambia el stock). */
export function useRegistrarVenta() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: (body: RegistrarVentaRequest) => registrarVenta(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo", veterinariaId] });
    },
  });
}
