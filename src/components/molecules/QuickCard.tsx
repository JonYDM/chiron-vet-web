import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

interface QuickCardProps {
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  to: string;
  /** Color de acento del icono. */
  tone?: "primary" | "accent" | "success";
}

const toneClasses: Record<NonNullable<QuickCardProps["tone"]>, string> = {
  primary: "bg-primary-50 text-primary",
  accent: "bg-accent/15 text-accent-strong",
  success: "bg-success/10 text-success",
};

/** Tarjeta de acceso rápido para los dashboards (navegable). */
export function QuickCard({
  titulo,
  descripcion,
  icon: Icon,
  to,
  tone = "primary",
}: QuickCardProps) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-soft transition-all duration-150 hover:shadow-lift active:scale-[0.99]"
    >
      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
          toneClasses[tone],
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-ink">{titulo}</p>
        <p className="mt-0.5 text-sm text-ink-soft">{descripcion}</p>
      </div>
    </Link>
  );
}
