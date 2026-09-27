import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Tono = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  mensaje: string;
  tono: Tono;
}

interface ToastContextValue {
  /** Muestra un toast. */
  mostrar: (mensaje: string, tono?: Tono) => void;
  exito: (mensaje: string) => void;
  error: (mensaje: string) => void;
  info: (mensaje: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const iconos = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
};

const estilos: Record<Tono, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  info: "border-primary/30 bg-primary-50 text-primary",
  warning: "border-accent/40 bg-accent/15 text-[#9A6A00]",
};

/**
 * Provider global de toasts. Ofrece feedback consistente (estilo Nubank) para
 * confirmar acciones o reportar errores en toda la app.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const quitar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (mensaje: string, tono: Tono = "info") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, mensaje, tono }]);
      // Autocierre a los 4s.
      setTimeout(() => quitar(id), 4000);
    },
    [quitar],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      mostrar,
      exito: (m) => mostrar(m, "success"),
      error: (m) => mostrar(m, "error"),
      info: (m) => mostrar(m, "info"),
    }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Contenedor de toasts */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => {
          const Icono = iconos[t.tono];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm animate-fade-in-up items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lift",
                estilos[t.tono],
              )}
            >
              <Icono className="h-5 w-5 shrink-0" aria-hidden />
              <p className="flex-1 text-sm font-medium text-ink">{t.mensaje}</p>
              <button
                onClick={() => quitar(t.id)}
                aria-label="Cerrar"
                className="text-ink-soft hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>.");
  return ctx;
}
