import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { especieLabel, sexoLabel } from "@/lib/enums";
import { EspecieMascota, SexoMascota, type Mascota } from "@/types/api";
import { useAgregarMascota, useEditarMascota } from "../hooks";
import type { DatosMascota } from "../api";

interface Props {
  open: boolean;
  onClose: () => void;
  clienteId: string;
  /** Si se pasa, el modal edita esa mascota; si no, crea una nueva. */
  mascota?: Mascota;
}

/** Modal para agregar o editar una mascota (con campos clínicos). */
export function MascotaModal({ open, onClose, clienteId, mascota }: Props) {
  const esEdicion = !!mascota;
  const agregar = useAgregarMascota();
  const editar = useEditarMascota();

  const [nombre, setNombre] = useState(mascota?.nombre ?? "");
  const [especie, setEspecie] = useState<number>(mascota?.especie ?? EspecieMascota.Perro);
  const [sexo, setSexo] = useState<number>(mascota?.sexo ?? SexoMascota.NoEspecificado);
  const [raza, setRaza] = useState(mascota?.raza ?? "");
  const [nacimiento, setNacimiento] = useState(mascota?.fechaNacimiento?.slice(0, 10) ?? "");
  const [peso, setPeso] = useState(mascota?.pesoKg != null ? String(mascota.pesoKg) : "");
  const [padecimientos, setPadecimientos] = useState(mascota?.padecimientos ?? "");
  const [esterilizado, setEsterilizado] = useState<string>(
    mascota?.esterilizado == null ? "" : mascota.esterilizado ? "si" : "no",
  );
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const datos: DatosMascota = {
      nombre: nombre.trim(),
      especie,
      sexo,
      raza: raza.trim() || null,
      fechaNacimiento: nacimiento || null,
      pesoKg: peso ? Number(peso) : null,
      padecimientos: padecimientos.trim() || null,
      esterilizado: esterilizado === "" ? null : esterilizado === "si",
    };
    try {
      if (esEdicion) {
        await editar.mutateAsync({ mascotaId: mascota!.id, datos });
      } else {
        await agregar.mutateAsync({ clienteId, datos });
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la mascota.");
    }
  }

  const cargando = agregar.isPending || editar.isPending;

  return (
    <Modal open={open} onClose={onClose} title={esEdicion ? "Editar mascota" : "Nueva mascota"}>
      <form onSubmit={enviar} className="space-y-4">
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
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
        <Input label="Raza (opcional)" value={raza} onChange={(e) => setRaza(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={nacimiento}
            onChange={(e) => setNacimiento(e.target.value)}
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.01"
            min="0"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />
        </div>
        <Input
          label="Padecimientos (opcional)"
          value={padecimientos}
          onChange={(e) => setPadecimientos(e.target.value)}
          placeholder="Alergias, condiciones crónicas…"
        />
        <Select
          label="¿Esterilizado?"
          value={esterilizado}
          onChange={(e) => setEsterilizado(e.target.value)}
          options={[
            { value: "", label: "No especificado" },
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
          ]}
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
          <Button type="submit" loading={cargando} fullWidth>
            {esEdicion ? "Guardar" : "Agregar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
