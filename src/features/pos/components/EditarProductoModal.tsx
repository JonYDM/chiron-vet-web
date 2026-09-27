import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { categoriaProductoLabel } from "@/lib/enums";
import type { Producto } from "@/types/api";
import {
  useDesactivarProducto,
  useEditarProducto,
  useReabastecerStock,
} from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  producto: Producto;
}

/** Modal para editar un producto, reabastecer su stock o darlo de baja. */
export function EditarProductoModal({ open, onClose, producto }: Props) {
  const editar = useEditarProducto();
  const reabastecer = useReabastecerStock();
  const desactivar = useDesactivarProducto();

  const [nombre, setNombre] = useState(producto.nombre);
  const [categoria, setCategoria] = useState<number>(producto.categoria);
  const [precio, setPrecio] = useState(String(producto.precio));
  const [reabasto, setReabasto] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await editar.mutateAsync({
        productoId: producto.id,
        nombre: nombre.trim(),
        categoria,
        precio: Number(precio),
      });
      if (reabasto && Number(reabasto) > 0) {
        await reabastecer.mutateAsync({
          productoId: producto.id,
          cantidad: Number(reabasto),
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    }
  }

  async function darDeBaja() {
    setError(null);
    try {
      await desactivar.mutateAsync(producto.id);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo desactivar.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar producto">
      <form onSubmit={guardar} className="space-y-4">
        <Input
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Select
          label="Categoría"
          value={categoria}
          onChange={(e) => setCategoria(Number(e.target.value))}
          options={opcionesDeEnum(categoriaProductoLabel)}
        />
        <Input
          label="Precio (MXN)"
          type="number"
          min="1"
          step="0.01"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
        <Input
          label="Reabastecer (sumar al stock)"
          type="number"
          min="0"
          value={reabasto}
          onChange={(e) => setReabasto(e.target.value)}
          hint={`Stock actual: ${producto.stock}`}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="danger"
            onClick={darDeBaja}
            loading={desactivar.isPending}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Dar de baja
          </Button>
          <Button
            type="submit"
            fullWidth
            loading={editar.isPending || reabastecer.isPending}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
