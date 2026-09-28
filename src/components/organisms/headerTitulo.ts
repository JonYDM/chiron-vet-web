import { createContext, useContext, type ReactNode } from "react";

export interface HeaderTituloValor {
  /** Título de la pantalla (grande en el header, se encoge a la barra al scrollear). */
  titulo: string | null;
  /** Subtítulo/nota bajo el título (opcional). */
  subtitulo: ReactNode;
  /** Acción a la derecha del título grande (opcional). */
  accion: ReactNode;
  /** True cuando el header está colapsado (scroll). */
  colapsado: boolean;
  registrar: (v: { titulo: string | null; subtitulo?: ReactNode; accion?: ReactNode }) => void;
  setColapsado: (v: boolean) => void;
}

export const HeaderTituloContext = createContext<HeaderTituloValor | null>(null);

/**
 * Estado del "collapsing header" de dos alturas: la pantalla registra su título,
 * subtítulo y acción; el AppShell los renderiza en el header y los encoge al scrollear.
 */
export function useHeaderTitulo(): HeaderTituloValor {
  const ctx = useContext(HeaderTituloContext);
  if (!ctx) {
    return {
      titulo: null,
      subtitulo: null,
      accion: null,
      colapsado: false,
      registrar: () => {},
      setColapsado: () => {},
    };
  }
  return ctx;
}
