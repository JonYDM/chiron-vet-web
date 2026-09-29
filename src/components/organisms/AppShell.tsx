import { type ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";import { Check, ChevronDown, KeyRound, LogOut, MapPin, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth";
import { rolLabel } from "@/lib/enums";
import { saludoPorHora } from "@/lib/saludo";
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
  const primarios = items.filter((i) => !i.secundario);
  const secundarios = items.filter((i) => i.secundario);
  const [pinAbierto, setPinAbierto] = useState(false);
  const { titulo, subtitulo, accion } = useHeaderTitulo();

  return (
    <div className="min-h-dvh bg-surface">
      {/* HEADER simple, claro, continuo con la barra de estado (sube hasta el notch). */}
      <header
        className="fixed inset-x-0 top-0 z-40 bg-surface"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto w-[90%] max-w-2xl">
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Izquierda: marca (Patwi + Wipo) o selector de sucursal */}
            <div className="flex min-w-0 items-center gap-2.5">
              {sesion && <ContextoHeader rol={sesion.rol} />}
            </div>

            {/* Derecha: perfil */}
            <div className="flex shrink-0 items-center gap-1">
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
        </div>
      </header>

      {/* MAIN scrolleable. El padding-top deja espacio al header + safe-area del notch. */}
      <main
        className="mx-auto w-[90%] max-w-2xl pb-28"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4.5rem)" }}
      >
        {/* Encabezado de la vista dentro del contenido (título grande + subtítulo + acción) */}
        {(subtitulo || accion || titulo) && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {subtitulo && <div className="mb-1">{subtitulo}</div>}
              <h1 className="text-headline-lg-mobile font-bold tracking-tight text-on-surface">
                {titulo}
              </h1>
            </div>
            {accion && <div className="shrink-0">{accion}</div>}
          </div>
        )}
        {children}
      </main>

      {/* BOTTOM-NAV docked (edge-to-edge, pegado al borde, top-rounded, tinte translúcido) */}
      <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-40">
        <div
          className="flex items-center justify-around gap-1 rounded-t-3xl border-t border-primary-container/15 bg-surface-nav px-2 pt-2 backdrop-blur-xl"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
            boxShadow: "0 -8px 24px -12px rgba(8,76,76,0.20)",
          }}
        >
          {primarios.map((item) => {
            const esInicio = item.to === "/app" || item.to === "/admin";
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split("/").length <= 2}
                className="flex flex-1 flex-col items-center"
              >
                {({ isActive }) =>
                  esInicio ? (
                    // Inicio: destacado al centro (pastilla verde).
                    <span
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-full px-3 py-1 text-[9px] font-bold transition-colors",
                        isActive
                          ? "bg-primary-container text-on-primary shadow-primary-glow"
                          : "text-primary-container",
                      )}
                    >
                      <item.icon className="h-[20px] w-[20px]" aria-hidden />
                      <span>{item.label}</span>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-full py-1 text-[9px] font-semibold transition-colors",
                        isActive ? "text-primary-container" : "text-on-surface-variant hover:text-on-surface",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-full transition-colors",
                          isActive && "bg-primary-container/10",
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px]" aria-hidden />
                      </span>
                      <span className="truncate px-0.5">{item.label}</span>
                    </span>
                  )
                }
              </NavLink>
            );
          })}

          {/* Botón "Más": módulos secundarios. */}
          {secundarios.length > 0 && <MenuMas items={secundarios} />}
        </div>
      </nav>

      <CambiarMiPinModal open={pinAbierto} onClose={() => setPinAbierto(false)} />
    </div>
  );
}

/**
 * Avatar de Wipo como botón que abre un popover con Wipo saludando (estilo login).
 * Es independiente del selector de sucursal: solo la carita de Wipo.
 */
function WipoPopover() {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Wipo"
        aria-expanded={abierto}
        className="rounded-full transition-transform active:scale-95"
      >
        <Avatar nombre="Wipo" src="/profile-wipo.webp" size="sm" />
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-52 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-center shadow-lift">
            <img src="/wipo.webp" alt="Wipo" className="mx-auto h-14 w-14 object-contain" />
            <p className="mt-1 font-marca text-base font-extrabold text-primary-container">
              ¡{saludoPorHora()}!
            </p>
            <p className="mt-0.5 text-body-sm leading-snug text-on-surface-variant">
              Soy Wipo, ¡qué gusto verte!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Contenido izquierdo del header: Wipo (con popover propio) + marca "Patwi".
 * El Administrador ve además el selector de sucursal [MOCK].
 */
function ContextoHeader({ rol }: { rol: RolUsuario }) {
  if (rol === RolUsuario.Administrador) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <WipoPopover />
        <SelectorSucursal />
      </div>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-2">
      <WipoPopover />
      <span className="truncate font-marca text-headline-sm font-extrabold text-on-surface">Patwi</span>
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
        className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-surface-container"
      >
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-marca text-headline-sm font-extrabold text-on-surface">Patwi</span>
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

/**
 * Botón "Más" del bottom-nav: agrupa los módulos secundarios (recordatorios, ventas,
 * equipo). El perfil (PIN / cerrar sesión) vive en el avatar del header. Abre hacia ARRIBA.
 */
function MenuMas({ items }: { items: NavItem[] }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="flex flex-1 flex-col items-center">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Más opciones"
        aria-expanded={abierto}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-full py-1 text-[9px] font-semibold transition-colors",
          abierto ? "text-primary-container" : "text-on-surface-variant hover:text-on-surface",
        )}
      >
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full transition-colors",
            abierto && "bg-primary-container/10",
          )}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span>Más</span>
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div className="absolute bottom-full right-0 z-50 mb-2 w-56 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-1.5 shadow-lift">
            <p className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Más módulos
            </p>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setAbierto(false)}
                className={({ isActive }) =>
                  cn(
                    "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-label-md font-medium transition-colors",
                    isActive
                      ? "bg-primary-container/10 text-primary-container"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Menú de perfil del header (avatar → PIN / salir). */
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
