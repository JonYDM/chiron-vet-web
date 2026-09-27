import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { categoriaProductoLabel } from "@/lib/enums";
import { CategoriaProducto, type AgregarProductoRequest } from "@/types/api";
import { useAgregarProducto } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Modal para agregar un producto al catálogo (solo Admin). */
export function AgregarProductoModal({ open, onClose }: Props) {
  const veterinariaId = useVeterinariaId();
  const agregar = useAgregarProducto();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProducto>(
    CategoriaProducto.Alimento,
  );
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body: AgregarProductoRequest = {
      veterinariaId,
      nombre: nombre.trim(),
      categoria,
      precio: Number(precio),
      stock: Number(stock),
    };
    try {
      await agregar.mutateAsync(body);
      setNombre("");
      setPrecio("");
      setStock("");
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo agregar el producto.",
      );
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo producto">
      <form onSubmit={enviar} className="space-y-4">
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
        <div className="grid grid-cols-2 gap-3">
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
            label="Stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" loading={agregar.isPending} fullWidth>
            Agregar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
