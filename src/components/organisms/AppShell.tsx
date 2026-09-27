import { type ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { KeyRound, LogOut, Menu, PawPrint, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth";
import { rolLabel } from "@/lib/enums";
import { type NavItem } from "@/app/navigation";
import { usePermisos } from "@/lib/usePermisos";
import { Avatar } from "@/components/ui";
import { CambiarMiPinModal } from "@/features/usuarios";

interface AppShellProps {
  nav: NavItem[];
  titulo: string;
  children: ReactNode;
}

/**
 * Layout de aplicación moderno:
 * - Escritorio: sidebar fija refinada + topbar con contexto + contenido con ancho máximo.
 * - Móvil: topbar con menú + drawer lateral + bottom-nav.
 */
export function AppShell({ nav, titulo, children }: AppShellProps) {
  const { sesion, cerrarSesion } = useAuth();
  const p = usePermisos();
  const items = nav.filter((i) => i.permiso === null || p(i.permiso));
  const [pinAbierto, setPinAbierto] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const marca = (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-primary-glow">
        <PawPrint className="h-5 w-5" aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="font-bold text-foreground">Chiron</p>
        <p className="text-[11px] text-muted-foreground">{titulo}</p>
      </div>
    </div>
  );

  const navLinks = (onNavigate?: () => void) =>
    items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to.split("/").length <= 2}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
            isActive
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon
              className={cn("h-[18px] w-[18px]", isActive && "text-primary")}
              aria-hidden
            />
            {item.label}
          </>
        )}
      </NavLink>
    ));

  const perfil = sesion && (
    <div className="rounded-xl border border-border bg-card p-2">
      <div className="flex items-center gap-2.5 px-1.5 py-1">
        <Avatar nombre={sesion.nombre} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{sesion.nombre}</p>
          <p className="text-xs text-muted-foreground">{rolLabel[sesion.rol]}</p>
        </div>
      </div>
      <div className="mt-1 flex gap-1">
        <button
          onClick={() => setPinAbierto(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          PIN
        </button>
        <button
          onClick={cerrarSesion}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Salir
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-background md:grid md:grid-cols-[256px_1fr]">
      {/* Sidebar (escritorio) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card/60 p-3 backdrop-blur md:flex">
        <div className="px-2 py-3">{marca}</div>
        <nav className="mt-2 flex-1 space-y-1" aria-label="Navegación principal">
          {navLinks()}
        </nav>
        {perfil}
      </aside>

      {/* Columna de contenido */}
      <div className="flex min-h-full flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerAbierto(true)}
              aria-label="Abrir menú"
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <h1 className="text-base font-semibold text-foreground">{titulo}</h1>
          </div>
          {sesion && <Avatar nombre={sesion.nombre} size="sm" className="md:hidden" />}
        </header>

        {/* Contenido con ancho máximo */}
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>

        {/* Bottom-nav (móvil) */}
        <nav
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-card/95 backdrop-blur md:hidden"
          aria-label="Navegación principal"
        >
          {items.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              <span className="truncate px-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Drawer móvil */}
      {drawerAbierto && (
        <div className="fixed inset-0 z-40 md:hidden" role="presentation" onClick={() => setDrawerAbierto(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 flex h-full w-72 animate-fade-in-up flex-col border-r border-border bg-card p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 py-3">
              {marca}
              <button
                onClick={() => setDrawerAbierto(false)}
                aria-label="Cerrar menú"
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="mt-2 flex-1 space-y-1">{navLinks(() => setDrawerAbierto(false))}</nav>
            {perfil}
          </div>
        </div>
      )}

      <CambiarMiPinModal open={pinAbierto} onClose={() => setPinAbierto(false)} />
    </div>
  );
}
