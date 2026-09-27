import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, PawPrint } from "lucide-react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { PinInput } from "@/components/molecules/PinInput";
import { ApiError } from "@/lib/http";
import { fadeInUp, transicionSuave } from "@/lib/motion";
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
    <main className="relative grid min-h-full place-items-center overflow-hidden bg-canvas p-6">
      {/* Fondo decorativo con el color de marca (blur suave). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/20 blur-3xl"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...transicionSuave, delay: 0.05 }}
            className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-primary text-white shadow-primary-glow"
          >
            <PawPrint className="h-8 w-8" aria-hidden />
          </motion.div>
          <h1 className="text-h1 text-ink">Bienvenido a Chiron</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {paso === "identificador"
              ? "Ingresa tu usuario o teléfono"
              : "Ahora tu PIN de acceso"}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            className={`h-1.5 rounded-full transition-all duration-slow ${paso === "identificador" ? "w-8 bg-primary" : "w-4 bg-hairline"}`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-slow ${paso === "pin" ? "w-8 bg-primary" : "w-4 bg-hairline"}`}
          />
        </div>

        <Card className="shadow-lift">
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {paso === "identificador" ? (
                <motion.form
                  key="paso-id"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={transicionSuave}
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
                </motion.form>
              ) : (
                <motion.div
                  key="paso-pin"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={transicionSuave}
                  className="space-y-5"
                >
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
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="rounded-xl bg-danger/10 px-4 py-3 text-center text-sm text-danger"
                    >
                      {error}
                    </motion.p>
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
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
