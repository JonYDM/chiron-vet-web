import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const avatarVariants = cva(
  "inline-grid shrink-0 place-items-center rounded-full font-semibold uppercase",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-lg",
      },
      tone: {
        primary: "bg-primary-100 text-primary-700",
        accent: "bg-accent-100 text-accent-700",
        neutral: "bg-hairline text-ink-soft",
      },
    },
    defaultVariants: { size: "md", tone: "primary" },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** Nombre del que se derivan las iniciales. */
  nombre: string;
  className?: string;
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).slice(0, 2);
  return partes.map((p) => p[0] ?? "").join("");
}

/** Avatar con iniciales derivadas del nombre. */
export function Avatar({ nombre, size, tone, className }: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size, tone }), className)} aria-hidden>
      {iniciales(nombre)}
    </span>
  );
}
