import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { RolUsuario } from "@/types/api";
import { useCrearStaff } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Modal para que el Administrador cree un Veterinario o Recepcionista. */
export function CrearStaffModal({ open, onClose }: Props) {
  const crear = useCrearStaff();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [rol, setRol] = useState<RolUsuario>(RolUsuario.Recepcionista);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await crear.mutateAsync({
        nombreUsuario: nombreUsuario.trim(),
        nombre: nombre.trim(),
        pin: pin.trim(),
        rol: rol as RolUsuario.Veterinario | RolUsuario.Recepcionista,
      });
      setNombreUsuario("");
      setNombre("");
      setPin("");
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo crear el usuario.",
      );
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo miembro del staff">
      <form onSubmit={enviar} className="space-y-4">
        <Select
          label="Rol"
          value={rol}
          onChange={(e) => setRol(Number(e.target.value))}
          options={[
            { value: RolUsuario.Recepcionista, label: "Recepcionista" },
            { value: RolUsuario.Veterinario, label: "Veterinario" },
          ]}
        />
        <Input
          label="Nombre de usuario"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
          hint="Con esto inicia sesión"
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
