import { type ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";import { Bell, Check, ChevronDown, KeyRound, LogOut, MapPin, PawPrint } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth";
import { rolLabel } from "@/lib/enums";
import { fechaHoyCorta } from "@/lib/format";
import { RolUsuario } from "@/types/api";
import { type NavItem } from "@/app/navigation";
import { usePermisos } from "@/lib/usePermisos";
import { Avatar } from "@/components/ui";
import { CambiarMiPinModal } from "@/features/usuarios";
import { SUCURSALES_MOCK } from "./sucursalesMock";
import { HeaderTituloContext, useHeaderTitulo } from "./headerTitulo";

interface AppShellProps {
  nav: NavItem[];
  titulo: string;
  children: ReactNode;
}

/** Provider del estado del collapsing header. */
function HeaderTituloProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{
    titulo: string | null;
    subtitulo: ReactNode;
    accion: ReactNode;
    tituloSuave: boolean;
  }>({ titulo: null, subtitulo: null, accion: null, tituloSuave: false });
  const [colapsado, setColapsado] = useState(false);

  const registrar = (v: { titulo: string | null; subtitulo?: ReactNode; accion?: ReactNode; tituloSuave?: boolean }) =>
    setEstado({
      titulo: v.titulo,
      subtitulo: v.subtitulo ?? null,
      accion: v.accion ?? null,
      tituloSuave: v.tituloSuave ?? false,
    });

  return (
    <HeaderTituloContext.Provider
      value={{ ...estado, colapsado, registrar, setColapsado }}
    >
      {children}
    </HeaderTituloContext.Provider>
  );
}

/**
 * AppShell mobile-first (base Stitch) con header de DOS ALTURAS que se integra con
 * el contenido: barra fija (marca/sucursal + acciones) + zona de título grande que
 * se encoge hacia la barra al hacer scroll (collapsing header estilo iOS).
 */
export function AppShell({ nav, children }: AppShellProps) {
  return (
    <HeaderTituloProvider>
      <AppShellInterno nav={nav}>{children}</AppShellInterno>
    </HeaderTituloProvider>
  );
}

function AppShellInterno({ nav, children }: { nav: NavItem[]; children: ReactNode }) {
  const { sesion, cerrarSesion } = useAuth();
  const p = usePermisos();
  const items = nav.filter((i) => i.permiso === null || p(i.permiso));
  const [pinAbierto, setPinAbierto] = useState(false);
  const { titulo, subtitulo, accion, tituloSuave, colapsado } = useHeaderTitulo();

  return (
    <div className="min-h-screen bg-surface">
      {/* HEADER de dos alturas, fijo, integrado con el contenido */}
      <header className="fixed inset-x-0 top-0 z-40 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto w-[90%] max-w-2xl">
          {/* Fila-barra: marca/sucursal + título compacto (al colapsar) + acciones */}
          <div className="relative flex h-16 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-primary-glow">
                <PawPrint className="h-5 w-5" aria-hidden />
              </div>
              {/* Marca/sucursal — se desvanece al colapsar */}
              <div
                className={cn(
                  "transition-all duration-300",
                  colapsado ? "pointer-events-none absolute -translate-y-1 opacity-0" : "opacity-100",
                )}
              >
                {sesion && <ContextoHeader rol={sesion.rol} />}
              </div>
              {/* Título compacto + fecha — aparece al colapsar, en el lugar de la marca */}
              {titulo && (
                <div
                  className={cn(
                    "min-w-0 leading-tight transition-all duration-300",
                    colapsado ? "translate-y-0 opacity-100" : "pointer-events-none absolute translate-y-1 opacity-0",
                  )}
                >
                  <span className="block truncate text-headline-sm font-bold text-on-surface">
                    {titulo}
                  </span>
                  <span className="block truncate text-[11px] font-medium text-on-surface-variant">
                    {fechaHoyCorta()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <EstadoSincronizado />
              <NotificacionesMock />
              {sesion && (
                <PerfilMenu
                  nombre={sesion.nombre}
                  rol={sesion.rol}
                  onPin={() => setPinAbierto(true)}
                  onSalir={cerrarSesion}
                />
              )}
            </div>
          </div>

          {/* Fila-título: título GRANDE + subtítulo/acción — colapsa al scrollear */}
          <div
            className={cn(
              "grid overflow-hidden transition-all duration-300 ease-out",
              colapsado ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
            )}
          >
            <div className="min-h-0">
              <div className="flex items-start justify-between gap-3 pb-3 pt-1">
                <div className="min-w-0">
                  {subtitulo && <div className="mb-1">{subtitulo}</div>}
                  <h1
                    className={cn(
                      "tracking-tight text-on-surface",
                      tituloSuave
                        ? "text-headline-sm font-semibold text-on-surface-variant"
                        : "text-headline-lg-mobile font-bold",
                    )}
                  >
                    {titulo}
                  </h1>
                </div>
                {accion && <div className="shrink-0">{accion}</div>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN scrolleable. El padding-top se ajusta según el header (expandido/colapsado). */}
      <main
        className={cn(
          "mx-auto w-[90%] max-w-2xl pb-28 transition-[padding] duration-300 ease-out",
          colapsado ? "pt-20" : "pt-[8.5rem]",
        )}
      >
        {children}
      </main>

      {/* BOTTOM-NAV flotante (isla con blur + safe-area) */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div
          className="mx-auto mb-3 flex w-[90%] max-w-sm items-center justify-around gap-1 rounded-full border border-primary-container/20 bg-surface-container-lowest/85 px-1.5 py-1 backdrop-blur-xl"
          style={{
            boxShadow:
              "inset 0 1px 2px rgba(13,110,110,0.18), inset 0 -1px 3px rgba(13,110,110,0.10), 0 10px 24px -6px rgba(8,76,76,0.22)",
          }}
        >
          {items.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-full py-1 text-[9px] font-semibold transition-colors",
                  isActive
                    ? "text-primary-container"
                    : "text-on-surface-variant hover:text-on-surface",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full transition-colors",
                      isActive && "bg-primary-container/10",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <span className="truncate px-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <CambiarMiPinModal open={pinAbierto} onClose={() => setPinAbierto(false)} />
    </div>
  );
}

/**
 * Contexto del header por rol:
 *  - Administrador (multi-sucursal [MOCK]) → selector de sucursal.
 *  - Otros roles → marca "Chiron" + nombre del módulo.
 */
function ContextoHeader({ rol }: { rol: RolUsuario }) {
  if (rol === RolUsuario.Administrador) {
    return <SelectorSucursal />;
  }
  return (
    <div className="min-w-0 leading-tight">
      <p className="truncate text-headline-sm font-bold text-on-surface">Chiron</p>
      <p className="truncate text-[11px] font-medium text-on-surface-variant">Roma Norte</p>
    </div>
  );
}

/** [MOCK] Selector de sucursal (solo Administrador con multi-sucursal). */
function SelectorSucursal() {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(SUCURSALES_MOCK[0]);

  return (
    <div className="relative min-w-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-surface-container"
      >
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-headline-sm font-bold text-on-surface">Chiron</span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
            <span className="truncate">{activa.zona}</span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 shrink-0 transition-transform", abierto && "rotate-180")}
              aria-hidden
            />
          </span>
        </span>
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div className="absolute left-0 top-full z-50 mt-1.5 w-60 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-1.5 shadow-lift">
            <p className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Tus sucursales
            </p>
            {SUCURSALES_MOCK.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiva(s);
                  setAbierto(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-surface-container"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container text-primary-container">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label-lg font-semibold text-on-surface">{s.zona}</span>
                  <span className="block text-body-sm text-on-surface-variant">{s.nombre}</span>
                </span>
                {s.id === activa.id && <Check className="h-4 w-4 text-primary-container" aria-hidden />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** [MOCK] Estado en línea / sincronizado (visual). */
function EstadoSincronizado() {
  return (
    <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-primary-container/10 px-2.5 py-1 text-[11px] font-semibold text-primary-container sm:inline-flex">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
      Sincronizado
    </span>
  );
}

/** [MOCK] Notificaciones con badge. */
function NotificacionesMock() {
  return (
    <button
      aria-label="Notificaciones"
      className="relative grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <Bell className="h-5 w-5" aria-hidden />
      <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-st-secondary px-1 text-[9px] font-bold text-on-secondary">
        3
      </span>
    </button>
  );
}

/** Menú de perfil (avatar → PIN / salir). */
function PerfilMenu({
  nombre,
  rol,
  onPin,
  onSalir,
}: {
  nombre: string;
  rol: RolUsuario;
  onPin: () => void;
  onSalir: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Perfil"
        className="rounded-full p-0.5 transition-colors hover:bg-surface-container"
      >
        <Avatar nombre={nombre} size="sm" />
      </button>
      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-1.5 shadow-lift">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <Avatar nombre={nombre} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-label-lg font-semibold text-on-surface">{nombre}</p>
                <p className="text-body-sm text-on-surface-variant">{rolLabel[rol]}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-outline-variant/30" />
            <button
              onClick={() => {
                setAbierto(false);
                onPin();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <KeyRound className="h-4 w-4" aria-hidden />
              Cambiar mi PIN
            </button>
            <button
              onClick={onSalir}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-label-md font-medium text-error-st transition-colors hover:bg-error-container/40"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
