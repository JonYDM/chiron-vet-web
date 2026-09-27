import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold",
  {
    variants: {
      tone: {
        neutral: "bg-hairline text-ink-soft",
        primary: "bg-primary-50 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-accent-50 text-accent-700",
        danger: "bg-danger/10 text-danger",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/** Etiqueta de estado con variantes tipadas (tono + tamaño). */
export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
