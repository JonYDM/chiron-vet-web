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
        <h1 className="text-headline-lg-mobile font-bold tracking-tight text-on-surface">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 text-body-sm text-on-surface-variant">{descripcion}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
