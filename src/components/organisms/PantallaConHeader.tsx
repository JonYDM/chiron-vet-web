import { useEffect, type ReactNode } from "react";
import { useHeaderTitulo } from "./headerTitulo";

interface Props {
  /** Título de la pantalla (lo muestra el header de dos alturas del AppShell). */
  titulo: string;
  /** Acción a la derecha del título grande (opcional). */
  accion?: ReactNode;
  /** Subtítulo/nota bajo el título (opcional). */
  subtitulo?: ReactNode;
  children: ReactNode;
}

// Umbrales con histéresis: colapsa al pasar 48px, expande al bajar de 24px.
// Dos umbrales distintos evitan el parpadeo en el punto límite.
const UMBRAL_COLAPSAR = 48;
const UMBRAL_EXPANDIR = 24;

/**
 * Registra el título/subtítulo/acción de la pantalla en el header de dos alturas del
 * AppShell y colapsa el header según el scroll de la ventana (estilo Spotify/Nubank:
 * título grande que se encoge a la barra). Usa histéresis para no parpadear.
 * Ver docs/PENDIENTES-TECNICOS.md.
 */
export function PantallaConHeader({ titulo, accion, subtitulo, children }: Props) {
  const { registrar, setColapsado } = useHeaderTitulo();

  useEffect(() => {
    registrar({ titulo, subtitulo, accion });
    return () => {
      registrar({ titulo: null });
      setColapsado(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulo]);

  useEffect(() => {
    let colapsadoActual = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!colapsadoActual && y > UMBRAL_COLAPSAR) {
        colapsadoActual = true;
        setColapsado(true);
      } else if (colapsadoActual && y < UMBRAL_EXPANDIR) {
        colapsadoActual = false;
        setColapsado(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // estado inicial
    return () => window.removeEventListener("scroll", onScroll);
  }, [setColapsado]);

  return <div>{children}</div>;
}
