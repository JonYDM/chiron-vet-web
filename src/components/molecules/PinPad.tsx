import { useCallback, useEffect } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PinPadProps {
  /** Valor actual del PIN (controlado). */
  value: string;
  /** Notifica el nuevo valor del PIN. */
  onChange: (next: string) => void;
  /** Longitud del PIN. Por defecto 6 (decisión del backend). */
  length?: number;
  /** Se dispara cuando el PIN alcanza la longitud completa. */
  onComplete?: (pin: string) => void;
  /** Deshabilita la entrada (ej: mientras se valida el login). */
  disabled?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Teclado numérico para capturar un PIN (login sin contraseña, estilo banca móvil).
 * - Puntos indicadores del progreso.
 * - Soporta teclado físico (dígitos + Backspace) además del táctil.
 * - Accesible: cada tecla es un button con aria-label.
 */
export function PinPad({
  value,
  onChange,
  length = 6,
  onComplete,
  disabled = false,
}: PinPadProps) {
  const push = useCallback(
    (digit: string) => {
      if (disabled || value.length >= length) return;
      const next = value + digit;
      onChange(next);
      if (next.length === length) onComplete?.(next);
    },
    [disabled, value, length, onChange, onComplete],
  );

  const pop = useCallback(() => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  }, [disabled, value, onChange]);

  // Soporte de teclado físico.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") push(e.key);
      else if (e.key === "Backspace") pop();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [push, pop]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Indicadores de progreso */}
      <div className="flex gap-3" role="status" aria-label={`${value.length} de ${length} dígitos`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-3.5 w-3.5 rounded-full transition-all duration-150",
              i < value.length ? "bg-primary scale-110" : "bg-hairline",
            )}
          />
        ))}
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((k) => (
          <PadButton key={k} onClick={() => push(k)} disabled={disabled} label={`Dígito ${k}`}>
            {k}
          </PadButton>
        ))}
        <span aria-hidden />
        <PadButton onClick={() => push("0")} disabled={disabled} label="Dígito 0">
          0
        </PadButton>
        <PadButton onClick={pop} disabled={disabled} label="Borrar">
          <Delete className="h-6 w-6" aria-hidden />
        </PadButton>
      </div>
    </div>
  );
}

function PadButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid h-16 w-16 place-items-center rounded-2xl bg-surface text-2xl font-semibold text-ink",
        "shadow-soft transition-all duration-150 hover:bg-primary-50",
        "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}
