import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { origenClienteLabel } from "@/lib/enums";
import type { Cliente } from "@/types/api";
import { useEditarCliente } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  cliente: Cliente;
}

/** Modal para editar los datos de un cliente. */
export function EditarClienteModal({ open, onClose, cliente }: Props) {
  const editar = useEditarCliente();
  const [nombre, setNombre] = useState(cliente.nombre);
  const [telefono, setTelefono] = useState(cliente.telefono);
  const [origen, setOrigen] = useState<number>(cliente.origen);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await editar.mutateAsync({
        clienteId: cliente.id,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        origen,
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar cliente">
      <form onSubmit={enviar} className="space-y-4">
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <Input
          label="Teléfono"
          inputMode="numeric"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <Select
          label="¿Cómo nos conoció?"
          value={origen}
          onChange={(e) => setOrigen(Number(e.target.value))}
          options={opcionesDeEnum(origenClienteLabel)}
        />
        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" loading={editar.isPending} fullWidth>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
