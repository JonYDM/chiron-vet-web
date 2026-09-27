import { cn } from "@/lib/cn";

/** Placeholder de carga con shimmer (tokens semánticos). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md bg-muted", className)} aria-hidden />;
}

/** Fila de skeleton típica para listados (avatar + dos líneas). */
export function SkeletonFila() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-11 w-11 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
