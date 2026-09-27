import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import {
  agregarProducto,
  desactivarProducto,
  editarProducto,
  listarCatalogo,
  listarVentas,
  listarVentasDeCliente,
  reabastecerStock,
  registrarVenta,
} from "./api";
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
      queryClient.invalidateQueries({ queryKey: ["ventas", veterinariaId] });
    },
  });
}

/** Edita un producto e invalida el catálogo. */
export function useEditarProducto() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: ({
      productoId,
      nombre,
      categoria,
      precio,
    }: {
      productoId: string;
      nombre: string;
      categoria: number;
      precio: number;
    }) => editarProducto(productoId, { nombre, categoria, precio }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo", veterinariaId] });
    },
  });
}

/** Reabastece stock e invalida el catálogo. */
export function useReabastecerStock() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: ({ productoId, cantidad }: { productoId: string; cantidad: number }) =>
      reabastecerStock(productoId, cantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo", veterinariaId] });
    },
  });
}

/** Desactiva un producto e invalida el catálogo. */
export function useDesactivarProducto() {
  const queryClient = useQueryClient();
  const veterinariaId = useVeterinariaId();
  return useMutation({
    mutationFn: (productoId: string) => desactivarProducto(productoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo", veterinariaId] });
    },
  });
}

/** Historial de ventas de la veterinaria. */
export function useVentas(desde?: string, hasta?: string) {
  const veterinariaId = useVeterinariaId();
  return useQuery({
    queryKey: ["ventas", veterinariaId, desde ?? "", hasta ?? ""],
    queryFn: ({ signal }) => listarVentas(veterinariaId, desde, hasta, signal),
  });
}

/** Historial de compras de un cliente. */
export function useVentasDeCliente(clienteId: string | null) {
  return useQuery({
    queryKey: ["ventas", "cliente", clienteId],
    queryFn: ({ signal }) => listarVentasDeCliente(clienteId as string, signal),
    enabled: !!clienteId,
  });
}
