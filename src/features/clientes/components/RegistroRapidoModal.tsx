import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { especieLabel, origenClienteLabel, sexoLabel } from "@/lib/enums";
import {
  EspecieMascota,
  OrigenCliente,
  SexoMascota,
  type RegistroRapidoRequest,
} from "@/types/api";
import { useRegistroRapido } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Modal con el formulario de registro rápido de cliente + su primera mascota. */
export function RegistroRapidoModal({ open, onClose }: Props) {
  const veterinariaId = useVeterinariaId();
  const registrar = useRegistroRapido();

  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [origen, setOrigen] = useState<OrigenCliente>(OrigenCliente.NoEspecificado);
  const [nombreMascota, setNombreMascota] = useState("");
  const [especie, setEspecie] = useState<EspecieMascota>(EspecieMascota.Perro);
  const [sexo, setSexo] = useState<SexoMascota>(SexoMascota.NoEspecificado);
  const [raza, setRaza] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetear() {
    setNombreCliente("");
    setTelefonoCliente("");
    setOrigen(OrigenCliente.NoEspecificado);
    setNombreMascota("");
    setEspecie(EspecieMascota.Perro);
    setSexo(SexoMascota.NoEspecificado);
    setRaza("");
    setError(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body: RegistroRapidoRequest = {
      veterinariaId,
      nombreCliente: nombreCliente.trim(),
      telefonoCliente: telefonoCliente.trim(),
      origenCliente: origen,
      nombreMascota: nombreMascota.trim(),
      especie,
      sexo,
      raza: raza.trim() || null,
    };
    try {
      await registrar.mutateAsync(body);
      resetear();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo registrar. Intenta de nuevo.",
      );
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Registro rápido">
      <form onSubmit={enviar} className="space-y-4">
        <p className="text-sm font-semibold text-ink-soft">Datos del dueño</p>
        <Input
          label="Nombre del dueño"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          required
        />
        <Input
          label="Teléfono"
          inputMode="numeric"
          value={telefonoCliente}
          onChange={(e) => setTelefonoCliente(e.target.value)}
          hint="Al menos 10 dígitos"
          required
        />
        <Select
          label="¿Cómo nos conoció?"
          value={origen}
          onChange={(e) => setOrigen(Number(e.target.value))}
          options={opcionesDeEnum(origenClienteLabel)}
        />

        <hr className="border-hairline" />
        <p className="text-sm font-semibold text-ink-soft">Datos de la mascota</p>
        <Input
          label="Nombre de la mascota"
          value={nombreMascota}
          onChange={(e) => setNombreMascota(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Especie"
            value={especie}
            onChange={(e) => setEspecie(Number(e.target.value))}
            options={opcionesDeEnum(especieLabel)}
          />
          <Select
            label="Sexo"
            value={sexo}
            onChange={(e) => setSexo(Number(e.target.value))}
            options={opcionesDeEnum(sexoLabel)}
          />
        </div>
        <Input
          label="Raza (opcional)"
          value={raza}
          onChange={(e) => setRaza(e.target.value)}
        />

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" loading={registrar.isPending} fullWidth>
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
