import { type ReactNode } from "react";
import { MascotaVacio } from "@/components/ilustraciones";
import { Reveal } from "@/lib/anim";

interface Props {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

/** Estado vacío ilustrado (estilo Nubank: amigable, con carácter, no texto plano). */
export function EmptyState({ titulo, descripcion, accion }: Props) {
  return (
    <Reveal className="flex flex-col items-center gap-4 py-14 text-center">
      <MascotaVacio className="h-36 w-36" />
      <div>
        <p className="text-h3 text-ink">{titulo}</p>
        {descripcion && (
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">{descripcion}</p>
        )}
      </div>
      {accion}
    </Reveal>
  );
}
