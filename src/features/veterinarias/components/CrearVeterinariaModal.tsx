import { useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { useCrearVeterinaria } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Modal para dar de alta una veterinaria. */
export function CrearVeterinariaModal({ open, onClose }: Props) {
  const crear = useCrearVeterinaria();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await crear.mutateAsync({ nombre: nombre.trim(), telefono: telefono.trim() });
      setNombre("");
      setTelefono("");
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo crear la veterinaria.",
      );
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva veterinaria">
      <form onSubmit={enviar} className="space-y-4">
        <Input
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Input
          label="Teléfono"
          inputMode="numeric"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
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
          <Button type="submit" loading={crear.isPending} fullWidth>
            Crear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
