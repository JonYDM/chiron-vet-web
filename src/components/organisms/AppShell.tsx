import { type ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { KeyRound, LogOut, PawPrint } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth";
import { rolLabel } from "@/lib/enums";
import { type NavItem } from "@/app/navigation";
import { usePermisos } from "@/lib/usePermisos";
import { CambiarMiPinModal } from "@/features/usuarios";

interface AppShellProps {
  /** Ítems de navegación del área (staff, portal o admin). */
  nav: NavItem[];
  /** Título del área mostrado en el encabezado. */
  titulo: string;
  children: ReactNode;
}

/**
 * Layout general responsivo:
 * - Escritorio (md+): barra lateral fija con navegación + contenido.
 * - Móvil: contenido a pantalla completa + barra de navegación inferior.
 * Filtra los ítems de navegación según el rol de la sesión.
 */
export function AppShell({ nav, titulo, children }: AppShellProps) {
  const { sesion, cerrarSesion } = useAuth();
  const p = usePermisos();
  const items = nav.filter((i) => i.permiso === null || p(i.permiso));
  const [pinAbierto, setPinAbierto] = useState(false);

  return (
    <div className="min-h-full md:grid md:grid-cols-[260px_1fr]">
      {/* Sidebar (escritorio) */}
      <aside className="hidden border-r border-hairline bg-surface md:flex md:flex-col">
        <div className="flex items-center gap-3 p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
            <PawPrint className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-bold text-ink">Chiron</p>
            <p className="text-xs text-ink-soft">{titulo}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Navegación principal">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary"
                    : "text-ink-soft hover:bg-hairline/50 hover:text-ink",
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {sesion && (
          <div className="border-t border-hairline p-3">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-semibold text-ink">
                {sesion.nombre}
              </p>
              <p className="text-xs text-ink-soft">{rolLabel[sesion.rol]}</p>
            </div>
            <button
              onClick={() => setPinAbierto(true)}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-hairline/50 hover:text-ink"
            >
              <KeyRound className="h-5 w-5" aria-hidden />
              Cambiar mi PIN
            </button>
            <button
              onClick={cerrarSesion}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-5 w-5" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      {/* Contenido */}
      <div className="flex min-h-full flex-col">
        {/* Header móvil */}
        <header className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white">
              <PawPrint className="h-4 w-4" aria-hidden />
            </div>
            <span className="font-bold text-ink">Chiron</span>
          </div>
          <button
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-hairline/50"
          >
            <LogOut className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>

        {/* Bottom-nav (móvil) */}
        <nav
          className="fixed inset-x-0 bottom-0 z-10 flex border-t border-hairline bg-surface/95 backdrop-blur md:hidden"
          aria-label="Navegación principal"
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-ink-soft",
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              <span className="truncate px-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <CambiarMiPinModal open={pinAbierto} onClose={() => setPinAbierto(false)} />
    </div>
  );
}
