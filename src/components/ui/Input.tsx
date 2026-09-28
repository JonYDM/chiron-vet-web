import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** "outline" (borde, por defecto) o "soft" (sin borde, relleno suave estilo Nubank). */
  variant?: "outline" | "soft";
}

/**
 * Campo de texto con anatomía y estados estilo shadcn/ui: borde e input tokenizados,
 * anillo de foco con el color de marca, estado de error y texto de ayuda accesibles.
 * La variante "soft" quita el borde y usa un relleno suave (look Nubank).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, variant = "outline", ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "flex w-full text-foreground transition-[color,box-shadow,border-color] duration-150",
            "placeholder:text-muted-foreground/70 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            variant === "soft"
              ? cn(
                  "h-14 rounded-2xl border-0 bg-muted px-4 text-base",
                  "focus-visible:ring-2 focus-visible:ring-ring/40",
                  error && "bg-destructive/10 focus-visible:ring-destructive/40",
                )
              : cn(
                  "h-11 rounded-md border bg-card px-3.5 py-2 text-sm shadow-xs",
                  "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
                  error ? "border-destructive focus-visible:ring-destructive/40" : "border-input",
                ),
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
