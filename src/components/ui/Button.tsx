import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 " +
  "active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-soft hover:bg-primary-dark",
  secondary: "bg-primary-50 text-primary hover:bg-primary-100",
  ghost: "bg-transparent text-ink hover:bg-hairline/60",
  danger: "bg-danger text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Botón base del design system. Variantes con tokens "Visión Canina",
 * estado de carga accesible y microinteracción (active:scale) estilo Nubank.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
