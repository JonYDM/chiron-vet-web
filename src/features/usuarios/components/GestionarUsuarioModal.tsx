import { useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { ApiError } from "@/lib/http";
import type { UsuarioDto } from "@/types/api";
import { useGestionarUsuario } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: UsuarioDto;
}

/** Modal para editar el nombre y activar/desactivar un usuario. */
export function GestionarUsuarioModal({ open, onClose, usuario }: Props) {
  const gestionar = useGestionarUsuario();
  const [nombre, setNombre] = useState(usuario.nombre);
  const [error, setError] = useState<string | null>(null);

  async function guardarNombre(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await gestionar.mutateAsync({ usuarioId: usuario.id, nuevoNombre: nombre.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    }
  }

  async function cambiarEstado() {
    setError(null);
    try {
      // accion 1=Activar, 2=Desactivar
      await gestionar.mutateAsync({
        usuarioId: usuario.id,
        accion: usuario.activo ? 2 : 1,
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el estado.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Gestionar usuario">
      <form onSubmit={guardarNombre} className="space-y-4">
        <Input
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant={usuario.activo ? "danger" : "secondary"}
            onClick={cambiarEstado}
            loading={gestionar.isPending}
          >
            {usuario.activo ? "Desactivar" : "Activar"}
          </Button>
          <Button type="submit" fullWidth loading={gestionar.isPending}>
            Guardar nombre
          </Button>
        </div>
      </form>
    </Modal>
  );
}
