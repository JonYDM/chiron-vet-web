import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { PinInput } from "@/components/molecules/PinInput";
import { ApiError } from "@/lib/http";
import { useResetearPin } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  usuarioId: string;
  /** Nombre a mostrar del usuario cuyo PIN se resetea. */
  nombre: string;
}

const PIN_LENGTH = 6;

/** Modal para asignar un nuevo PIN a un usuario (recuperación de acceso). */
export function ResetearPinModal({ open, onClose, usuarioId, nombre }: Props) {
  const resetear = useResetearPin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function enviar() {
    if (pin.length !== PIN_LENGTH) return;
    setError(null);
    try {
      await resetear.mutateAsync({ usuarioId, nuevoPin: pin });
      setOk(true);
      setPin("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo resetear el PIN.",
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
    <Modal open={open} onClose={cerrar} title="Resetear PIN">
      <div className="space-y-5">
        {ok ? (
          <div className="space-y-4 text-center">
            <p className="text-ink">
              ✅ Nuevo PIN asignado a{" "}
              <span className="font-semibold">{nombre}</span>.
            </p>
            <p className="text-sm text-ink-soft">
              Ya puede iniciar sesión con su nuevo PIN.
            </p>
            <Button fullWidth onClick={cerrar}>
              Entendido
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-soft">
              Asigna un nuevo PIN de {PIN_LENGTH} dígitos para{" "}
              <span className="font-medium text-ink">{nombre}</span>.
            </p>
            <PinInput
              value={pin}
              onChange={(next) => {
                setPin(next);
                if (error) setError(null);
              }}
              length={PIN_LENGTH}
              onComplete={enviar}
              disabled={resetear.isPending}
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
                loading={resetear.isPending}
                disabled={pin.length !== PIN_LENGTH}
                fullWidth
              >
                Resetear PIN
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
