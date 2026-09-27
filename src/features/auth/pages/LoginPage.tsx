import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { PinPad } from "@/components/molecules/PinPad";
import { ApiError } from "@/lib/http";
import { useAuth } from "../AuthContext";
import { rutaInicialPorRol } from "../roles";

const PIN_LENGTH = 6;

/** Estado de la ubicación previa (para volver tras login). */
interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identificador, setIdentificador] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const puedeEnviar =
    identificador.trim().length > 0 && pin.length === PIN_LENGTH && !cargando;

  async function enviar() {
    if (!puedeEnviar) return;
    setError(null);
    setCargando(true);
    try {
      const sesion = await iniciarSesion(identificador.trim(), pin);
      // Redirige al destino previo (si venía redirigido) o a su home por rol.
      const state = location.state as LocationState | null;
      const destino = state?.from?.pathname ?? rutaInicialPorRol(sesion.rol);
      navigate(destino, { replace: true });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "No se pudo conectar. Revisa tu internet e intenta de nuevo.";
      setError(msg);
      setPin("");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="grid min-h-full place-items-center bg-canvas p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary text-white shadow-lift">
            <PawPrint className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-ink">Bienvenido a Chiron</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Ingresa con tu usuario o teléfono y tu PIN
          </p>
        </div>

        <Card className="animate-fade-in-up">
          <CardContent className="space-y-6">
            <Input
              label="Usuario o teléfono"
              inputMode="text"
              autoComplete="username"
              placeholder="ej: admindemo"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              disabled={cargando}
            />

            <div>
              <p className="mb-3 text-center text-sm font-medium text-ink">
                Tu PIN de {PIN_LENGTH} dígitos
              </p>
              <PinPad
                value={pin}
                onChange={(next) => {
                  setPin(next);
                  if (error) setError(null);
                }}
                length={PIN_LENGTH}
                onComplete={enviar}
                disabled={cargando}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-danger/10 px-4 py-3 text-center text-sm text-danger"
              >
                {error}
              </p>
            )}

            <Button
              fullWidth
              size="lg"
              onClick={enviar}
              loading={cargando}
              disabled={!puedeEnviar}
            >
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
