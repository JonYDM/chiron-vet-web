import { cn } from "@/lib/cn";

/**
 * Placeholder de carga con efecto shimmer. Da una sensación premium mientras
 * llegan los datos (mejor que un spinner suelto para listas y tarjetas).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("shimmer rounded-lg bg-hairline/70", className)}
      aria-hidden
    />
  );
}

/** Fila de skeleton típica para listados (avatar + dos líneas). */
export function SkeletonFila() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface p-4">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
