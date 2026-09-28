import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, PawPrint } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { PinInput } from "@/components/molecules/PinInput";
import { Reveal } from "@/lib/anim";
import { ApiError } from "@/lib/http";
import { useAuth } from "../AuthContext";
import { identificar } from "../api";
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
  const [nombreReal, setNombreReal] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [cargando, setCargando] = useState(false);

  /** Paso 1: valida el identificador y (si el backend lo permite) trae el nombre. */
  async function siguiente() {
    const id = identificador.trim();
    if (id.length === 0 || verificando) return;
    setErrorId(null);
    setVerificando(true);
    try {
      const r = await identificar(id);
      if (!r.existe) {
        setErrorId("No encontramos una cuenta con ese usuario o teléfono.");
        return;
      }
      setNombreReal(r.nombre ?? null); // null si el backend aún no da el nombre (fallback)
      setPaso("pin");
    } catch {
      setErrorId("No se pudo verificar. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setVerificando(false);
    }
  }

  function volver() {
    setErrorPin(null);
    setPin("");
    setNombreReal(null);
    setPaso("identificador");
  }

  async function enviar() {
    if (pin.length !== PIN_LENGTH || cargando) return;
    setErrorPin(null);
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
      setErrorPin(msg);
      setPin("");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      {/* Difuminados teal para dar profundidad (que no se sienta tan blanco). */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-[0.14]"
        style={{
          background:
            "radial-gradient(75% 100% at 50% 0%, hsl(var(--primary)) 0%, transparent 72%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-16 h-72 w-72 rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "hsl(var(--primary))" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-32 h-64 w-64 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "hsl(var(--accent))" }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col px-6 pb-10 pt-16">
        {paso === "identificador" ? (
          <Reveal key="id" className="flex flex-1 flex-col">
            {/* Marca */}
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-primary-glow">
              <PawPrint className="h-7 w-7" aria-hidden />
            </div>

            {/* Encabezado grande, asimétrico */}
            <div className="mt-8">
              <h1 className="text-display font-bold leading-tight tracking-tight text-on-surface">
                Hola 👋
              </h1>
              <p className="mt-2 text-body-lg text-on-surface-variant">
                Ingresa tu usuario o teléfono para entrar a Chiron.
              </p>
            </div>

            {/* Formulario */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                siguiente();
              }}
              className="mt-10 flex flex-1 flex-col"
            >
              <Input
                variant="soft"
                aria-label="Usuario o teléfono"
                autoComplete="username"
                placeholder="Usuario o teléfono"
                value={identificador}
                onChange={(e) => {
                  setIdentificador(e.target.value);
                  if (errorId) setErrorId(null);
                }}
                error={errorId ?? undefined}
                autoFocus
              />

              {/* Botón grande, anclado abajo (mobile-first) */}
              <div className="mt-auto pt-8">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={verificando}
                  disabled={identificador.trim().length === 0}
                  className="h-14 text-base"
                >
                  Continuar
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </div>
            </form>
          </Reveal>
        ) : (
          <Reveal key="pin" className="flex flex-1 flex-col">
            <button
              onClick={volver}
              className="flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-label-md font-medium text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {identificador}
            </button>

            {/* Saludo grande con nombre real (si el backend lo dio) */}
            <div className="mt-8">
              <h1 className="text-display font-bold leading-tight tracking-tight text-on-surface">
                {nombreReal ? `Hola, ${nombreReal.split(" ")[0]}` : "Tu PIN"}
              </h1>
              <p className="mt-2 text-body-lg text-on-surface-variant">
                Ingresa tu PIN de {PIN_LENGTH} dígitos para continuar.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              <PinInput
                value={pin}
                onChange={(next) => {
                  setPin(next);
                  if (errorPin) setErrorPin(null);
                }}
                length={PIN_LENGTH}
                onComplete={enviar}
                disabled={cargando}
                autoFocus
              />

              {errorPin && (
                <p
                  role="alert"
                  className="rounded-2xl bg-error-container/60 px-4 py-3 text-center text-body-sm font-medium text-on-error-container"
                >
                  {errorPin}
                </p>
              )}
            </div>

            <div className="mt-auto pt-8">
              <Button
                fullWidth
                size="lg"
                onClick={enviar}
                loading={cargando}
                disabled={pin.length !== PIN_LENGTH}
                className="h-14 text-base"
              >
                Entrar
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
