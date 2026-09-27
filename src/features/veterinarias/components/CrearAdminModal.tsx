import { useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { RolUsuario } from "@/types/api";
import { useCrearAdmin } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  veterinariaId: string;
  veterinariaNombre: string;
}

/** Modal para crear el usuario Administrador de una veterinaria. */
export function CrearAdminModal({
  open,
  onClose,
  veterinariaId,
  veterinariaNombre,
}: Props) {
  const crear = useCrearAdmin();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await crear.mutateAsync({
        veterinariaId,
        nombreUsuario: nombreUsuario.trim(),
        nombre: nombre.trim(),
        pin: pin.trim(),
        rol: RolUsuario.Administrador,
      });
      setOk(true);
      setNombreUsuario("");
      setNombre("");
      setPin("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo crear el administrador.",
      );
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Admin de ${veterinariaNombre}`}>
      <form onSubmit={enviar} className="space-y-4">
        <Input
          label="Nombre de usuario"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
          required
        />
        <Input
          label="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Input
          label="PIN (6 dígitos)"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          required
        />
        {ok && (
          <p role="status" className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
            Administrador creado. Ya puede iniciar sesión.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} fullWidth>
            Cerrar
          </Button>
          <Button type="submit" loading={crear.isPending} fullWidth>
            Crear admin
          </Button>
        </div>
      </form>
    </Modal>
  );
}
