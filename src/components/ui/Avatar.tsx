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
        primary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent/20 text-accent-foreground",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { size: "md", tone: "primary" },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  nombre: string;
  className?: string;
}

function iniciales(nombre: string): string {
  return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0] ?? "").join("");
}

/** Avatar con iniciales derivadas del nombre. */
export function Avatar({ nombre, size, tone, className }: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size, tone }), className)} aria-hidden>
      {iniciales(nombre)}
    </span>
  );
}
