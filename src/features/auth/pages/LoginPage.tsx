import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, PawPrint } from "lucide-react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { PinInput } from "@/components/molecules/PinInput";
import { Blob, Huella } from "@/components/ilustraciones";
import { Reveal } from "@/lib/anim";
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
    <main className="relative min-h-full overflow-hidden bg-brand">
      {/* Fondo mesh + blobs (bloques de color generosos estilo Nubank). */}
      <div className="pointer-events-none absolute inset-0 bg-brand-mesh opacity-60" aria-hidden />
      <Blob className="pointer-events-none absolute -left-20 -top-16 h-80 w-80 text-white/10" />
      <Huella className="pointer-events-none absolute right-8 top-16 h-16 w-16 rotate-12 text-white/15" />
      <Huella className="pointer-events-none absolute bottom-24 left-10 h-10 w-10 -rotate-12 text-white/10" />

      <div className="relative grid min-h-full place-items-center p-6">
        <Reveal className="w-full max-w-sm">
          {/* Marca */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
              <PawPrint className="h-8 w-8 text-white" aria-hidden />
            </div>
            <h1 className="text-h1 text-white">Chiron</h1>
            <p className="mt-1 text-sm text-white/80">
              {paso === "identificador"
                ? "Ingresa tu usuario o teléfono"
                : "Ahora tu PIN de acceso"}
            </p>
          </div>

          {/* Card flotante */}
          <Card className="rounded-3xl border-0 shadow-float">
            <CardContent className="space-y-6 p-6">
              {/* Indicador de pasos */}
              <div className="flex items-center justify-center gap-2">
                <span className={`h-1.5 rounded-full transition-all duration-slow ${paso === "identificador" ? "w-8 bg-primary" : "w-4 bg-hairline"}`} />
                <span className={`h-1.5 rounded-full transition-all duration-slow ${paso === "pin" ? "w-8 bg-primary" : "w-4 bg-hairline"}`} />
              </div>

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
                    className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
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

          <p className="mt-6 text-center text-xs text-white/60">
            Chiron · Gestión veterinaria 🐾
          </p>
        </Reveal>
      </div>
    </main>
  );
}
