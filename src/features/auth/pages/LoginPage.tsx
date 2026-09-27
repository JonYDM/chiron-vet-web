import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, PawPrint } from "lucide-react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { PinInput } from "@/components/molecules/PinInput";
import { ApiError } from "@/lib/http";
import { useAuth } from "../AuthContext";
import { rutaInicialPorRol } from "../roles";

const PIN_LENGTH = 6;

interface LocationState {
  from?: { pathname: string };
}

type Paso = "identificador" | "pin";

export function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [paso, setPaso] = useState<Paso>("identificador");
  const [identificador, setIdentificador] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function siguiente() {
    if (identificador.trim().length === 0) return;
    setError(null);
    setPaso("pin");
  }

  function volver() {
    setError(null);
    setPin("");
    setPaso("identificador");
  }

  async function enviar() {
    if (pin.length !== PIN_LENGTH || cargando) return;
    setError(null);
    setCargando(true);
    try {
      const sesion = await iniciarSesion(identificador.trim(), pin);
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
            {paso === "identificador"
              ? "Ingresa tu usuario o teléfono"
              : "Ahora tu PIN de acceso"}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            className={`h-1.5 w-8 rounded-full ${paso === "identificador" ? "bg-primary" : "bg-hairline"}`}
          />
          <span
            className={`h-1.5 w-8 rounded-full ${paso === "pin" ? "bg-primary" : "bg-hairline"}`}
          />
        </div>

        <Card className="animate-fade-in-up">
          <CardContent className="space-y-6">
            {paso === "identificador" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  siguiente();
                }}
                className="space-y-5"
              >
                <Input
                  label="Usuario o teléfono"
                  autoComplete="username"
                  placeholder="ej: 7771523546"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={identificador.trim().length === 0}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <button
                  onClick={volver}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {identificador}
                </button>

                <PinInput
                  value={pin}
                  onChange={(next) => {
                    setPin(next);
                    if (error) setError(null);
                  }}
                  length={PIN_LENGTH}
                  onComplete={enviar}
                  disabled={cargando}
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

                <Button
                  fullWidth
                  size="lg"
                  onClick={enviar}
                  loading={cargando}
                  disabled={pin.length !== PIN_LENGTH}
                >
                  Entrar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
