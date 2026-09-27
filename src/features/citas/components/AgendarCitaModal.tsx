import { useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { ApiError } from "@/lib/http";
import type { AgendarCitaRequest } from "@/types/api";
import { useAgendarCita } from "../hooks";
import { SelectorMascota } from "./SelectorMascota";
import { SelectorVeterinario } from "./SelectorVeterinario";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Modal para agendar una cita: mascota, responsable, fecha/hora y motivo. */
export function AgendarCitaModal({ open, onClose }: Props) {
  const veterinariaId = useVeterinariaId();
  const agendar = useAgendarCita();

  const [mascotaId, setMascotaId] = useState<string | null>(null);
  const [veterinarioId, setVeterinarioId] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!mascotaId) {
      setError("Selecciona una mascota.");
      return;
    }
    const body: AgendarCitaRequest = {
      veterinariaId,
      mascotaId,
      fechaHora: new Date(fechaHora).toISOString(),
      motivo: motivo.trim(),
      veterinarioId: veterinarioId || null,
    };
    try {
      await agendar.mutateAsync(body);
      setMascotaId(null);
      setVeterinarioId("");
      setFechaHora("");
      setMotivo("");
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo agendar la cita.",
      );
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Agendar cita">
      <form onSubmit={enviar} className="space-y-4">
        <SelectorMascota onSelect={setMascotaId} />
        <SelectorVeterinario value={veterinarioId} onChange={setVeterinarioId} />
        <Input
          label="Fecha y hora"
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          required
        />
        <Input
          label="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="ej: Consulta general"
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
          <Button type="submit" loading={agendar.isPending} fullWidth>
            Agendar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
