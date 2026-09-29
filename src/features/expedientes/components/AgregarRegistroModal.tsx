import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { tipoRegistroLabel } from "@/lib/enums";
import { TipoRegistroMedico, type AgregarRegistroMedicoRequest } from "@/types/api";
import { SelectorVeterinario } from "@/features/citas/components/SelectorVeterinario";
import { useGenerarCargo } from "@/features/cobros/hooks";
import { useToast } from "@/components/feedback/useToast";
import { useAgregarRegistro } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  mascotaId: string;
}

const hoyISO = () => new Date().toISOString().slice(0, 10);

/** Modal para agregar una entrada al expediente médico, con detalle clínico opcional. */
export function AgregarRegistroModal({ open, onClose, mascotaId }: Props) {
  const veterinariaId = useVeterinariaId();
  const agregar = useAgregarRegistro(mascotaId);

  const [tipo, setTipo] = useState<TipoRegistroMedico>(TipoRegistroMedico.Consulta);
  const [fecha, setFecha] = useState(hoyISO());
  const [descripcion, setDescripcion] = useState("");
  const [proxima, setProxima] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [peso, setPeso] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [notas, setNotas] = useState("");
  const [atendidoPorId, setAtendidoPorId] = useState("");
  const [costo, setCosto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const generarCargo = useGenerarCargo();
  const toast = useToast();

  const requiereProxima =
    tipo === TipoRegistroMedico.Vacuna ||
    tipo === TipoRegistroMedico.Desparasitacion;

  function limpiar() {
    setDescripcion("");
    setProxima("");
    setDiagnostico("");
    setTratamiento("");
    setPeso("");
    setTemperatura("");
    setNotas("");
    setCosto("");
  }

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
      diagnostico: diagnostico.trim() || null,
      tratamiento: tratamiento.trim() || null,
      pesoKg: peso ? Number(peso) : null,
      temperaturaC: temperatura ? Number(temperatura) : null,
      notas: notas.trim() || null,
      atendidoPorId: atendidoPorId || null,
    };
    try {
      const registroId = await agregar.mutateAsync(body);
      // Si el vet indicó un costo, genera el cargo (cuenta por cobrar) para la caja.
      const monto = costo ? Number(costo) : 0;
      if (monto > 0) {
        try {
          await generarCargo.mutateAsync({
            mascotaId,
            concepto: descripcion.trim() || tipoRegistroLabel[tipo],
            monto,
            registroMedicoId: typeof registroId === "string" ? registroId : null,
          });
          toast.exito("Registro guardado y cargo enviado a caja 💳");
        } catch {
          // El registro sí se guardó; solo falló el cargo.
          toast.error("Registro guardado, pero no se pudo enviar el cargo a caja.");
        }
      } else {
        toast.exito("Registro guardado");
      }
      limpiar();
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
          placeholder="ej: Vacuna antirrábica / Consulta general"
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

        {/* Cobro: costo del servicio → genera un cargo pendiente para la caja */}
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-3">
          <Input
            label="Costo del servicio (opcional)"
            inputMode="decimal"
            value={costo}
            onChange={(e) => {
              const limpio = e.target.value.replace(/[^\d.]/g, "");
              if (/^\d{0,6}(\.\d{0,2})?$/.test(limpio) || limpio === "") setCosto(limpio);
            }}
            placeholder="0.00"
            hint="Si lo indicas, se envía como cargo pendiente a la caja para cobrarlo."
          />
        </div>

        {/* Detalle clínico (opcional) */}
        <div className="rounded-xl bg-canvas p-3">
          <p className="mb-3 text-sm font-semibold text-ink-soft">
            Detalle clínico (opcional)
          </p>
          <div className="space-y-3">
            <Input
              label="Diagnóstico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
            />
            <Input
              label="Tratamiento administrado"
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              placeholder="Medicamento, dosis, indicaciones"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Peso (kg)"
                type="number"
                step="0.01"
                min="0"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
              <Input
                label="Temperatura (°C)"
                type="number"
                step="0.1"
                value={temperatura}
                onChange={(e) => setTemperatura(e.target.value)}
              />
            </div>
            <Input
              label="Notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
            <SelectorVeterinario
              value={atendidoPorId}
              onChange={setAtendidoPorId}
              label="Atendido por (opcional)"
            />
          </div>
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
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
