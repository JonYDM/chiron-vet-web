import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { PinInput } from "@/components/molecules/PinInput";
import { ApiError } from "@/lib/http";
import { useCrearAccesoDueno } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string;
}

const PIN_LENGTH = 6;

/**
 * Modal para dar acceso al portal a un cliente: crea su usuario dueño con un PIN.
 * El identificador de acceso será su teléfono (según el backend).
 */
export function DarAccesoModal({
  open,
  onClose,
  clienteId,
  clienteNombre,
  clienteTelefono,
}: Props) {
  const crear = useCrearAccesoDueno();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function enviar() {
    if (pin.length !== PIN_LENGTH) return;
    setError(null);
    try {
      await crear.mutateAsync({ clienteId, pin });
      setOk(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo crear el acceso. Intenta de nuevo.",
      );
      setPin("");
    }
  }

  function cerrar() {
    setPin("");
    setError(null);
    setOk(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={cerrar} title="Dar acceso al portal">
      <div className="space-y-5">
        {ok ? (
          <div className="space-y-4 text-center">
            <p className="text-ink">
              ✅ Acceso creado para{" "}
              <span className="font-semibold">{clienteNombre}</span>.
            </p>
            <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-ink">
              El dueño entra con su teléfono{" "}
              <span className="font-semibold">{clienteTelefono}</span> y el PIN que
              acabas de asignar.
            </p>
            <Button fullWidth onClick={cerrar}>
              Entendido
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-soft">
              Asigna un PIN de {PIN_LENGTH} dígitos para que{" "}
              <span className="font-medium text-ink">{clienteNombre}</span> acceda
              al portal y vea sus mascotas y recordatorios.
            </p>

            <PinInput
              value={pin}
              onChange={(next) => {
                setPin(next);
                if (error) setError(null);
              }}
              length={PIN_LENGTH}
              onComplete={enviar}
              disabled={crear.isPending}
              autoFocus
            />

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-danger/10 px-4 py-3 text-center text-sm text-danger"
              >
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={cerrar} fullWidth>
                Cancelar
              </Button>
              <Button
                onClick={enviar}
                loading={crear.isPending}
                disabled={pin.length !== PIN_LENGTH}
                fullWidth
              >
                Crear acceso
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
