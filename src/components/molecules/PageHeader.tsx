import { type ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  /** Acción a la derecha (ej: botón "Nuevo"). */
  accion?: ReactNode;
}

/** Encabezado de página consistente: título, descripción opcional y acción. */
export function PageHeader({ titulo, descripcion, accion }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 text-sm text-ink-soft">{descripcion}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
