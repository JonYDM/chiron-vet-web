import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-hairline text-ink-soft",
  primary: "bg-primary-50 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-accent/15 text-[#9A6A00]",
  danger: "bg-danger/10 text-danger",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/**
 * Etiqueta de estado. Usa los colores semánticos para comunicar el estado
 * de una acción/entidad (estilo de feedback claro tipo Nubank).
 */
export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
