import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { tipoRegistroLabel } from "@/lib/enums";
import { TipoRegistroMedico, type AgregarRegistroMedicoRequest } from "@/types/api";
import { useAgregarRegistro } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  mascotaId: string;
}

const hoyISO = () => new Date().toISOString().slice(0, 10);

/** Modal para agregar una entrada al expediente médico. */
export function AgregarRegistroModal({ open, onClose, mascotaId }: Props) {
  const veterinariaId = useVeterinariaId();
  const agregar = useAgregarRegistro(mascotaId);

  const [tipo, setTipo] = useState<TipoRegistroMedico>(TipoRegistroMedico.Consulta);
  const [fecha, setFecha] = useState(hoyISO());
  const [descripcion, setDescripcion] = useState("");
  const [proxima, setProxima] = useState("");
  const [error, setError] = useState<string | null>(null);

  // La próxima aplicación solo aplica a vacunas/desparasitaciones.
  const requiereProxima =
    tipo === TipoRegistroMedico.Vacuna ||
    tipo === TipoRegistroMedico.Desparasitacion;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body: AgregarRegistroMedicoRequest = {
      veterinariaId,
      mascotaId,
      tipo,
      fecha,
      descripcion: descripcion.trim(),
      fechaProximaAplicacion: requiereProxima && proxima ? proxima : null,
    };
    try {
      await agregar.mutateAsync(body);
      setDescripcion("");
      setProxima("");
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el registro.",
      );
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva entrada al expediente">
      <form onSubmit={enviar} className="space-y-4">
        <Select
          label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(Number(e.target.value))}
          options={opcionesDeEnum(tipoRegistroLabel)}
        />
        <Input
          label="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
        <Input
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="ej: Vacuna antirrábica"
          required
        />
        {requiereProxima && (
          <Input
            label="Próxima aplicación (opcional)"
            type="date"
            value={proxima}
            onChange={(e) => setProxima(e.target.value)}
            hint="Genera un recordatorio automático"
          />
        )}

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
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
