import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Variantes del botón definidas con CVA (class-variance-authority): tipadas y
 * centralizadas. Ejes: variant (color/estilo) y size (tamaño). El estado
 * (loading/disabled) se maneja por props. Microinteracción: escala al presionar
 * y transición suave (estética Nubank/Apple).
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
    "transition-all duration-200 ease-out-expo select-none",
    "focus-visible:outline-none focus-visible:shadow-focus",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-soft hover:bg-primary-600 hover:shadow-primary-glow",
        secondary: "bg-primary-50 text-primary hover:bg-primary-100",
        soft: "bg-hairline/60 text-ink hover:bg-hairline",
        ghost: "bg-transparent text-ink hover:bg-hairline/60",
        danger: "bg-danger text-white shadow-soft hover:brightness-95",
        outline:
          "border border-hairline bg-surface text-ink hover:border-primary hover:text-primary",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, loading = false, disabled, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
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
