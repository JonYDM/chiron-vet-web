import { useMemo, useState } from "react";
import { ConciergeBell, KeyRound, Plus, Search, Settings2, Stethoscope } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Avatar, Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { useDebounce } from "@/lib/useDebounce";
import { rolLabel } from "@/lib/enums";
import { RolUsuario, type UsuarioDto } from "@/types/api";
import { useStaff } from "../hooks";
import { CrearStaffModal } from "../components/CrearStaffModal";
import { ResetearPinModal } from "../components/ResetearPinModal";
import { DetalleUsuarioDrawer } from "../components/DetalleUsuarioDrawer";

/** Gestión del equipo del Administrador (buscar, listar, crear, resetear PIN, gestionar). */
export function StaffPage() {
  const { data: usuarios, isLoading, isError } = useStaff();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [resetUsuario, setResetUsuario] = useState<UsuarioDto | null>(null);
  const [gestionUsuario, setGestionUsuario] = useState<UsuarioDto | null>(null);
  const [texto, setTexto] = useState("");
  const [rolFiltro, setRolFiltro] = useState<RolUsuario | null>(null);
  const textoBuscado = useDebounce(texto);

  // Solo staff operativo (Veterinario/Recepcionista). Los dueños se gestionan
  // desde la ficha del cliente.
  const base = useMemo(
    () =>
      (usuarios ?? []).filter(
        (u) => u.rol === RolUsuario.Veterinario || u.rol === RolUsuario.Recepcionista,
      ),
    [usuarios],
  );
  const veterinarios = base.filter((u) => u.rol === RolUsuario.Veterinario).length;
  const recepcionistas = base.filter((u) => u.rol === RolUsuario.Recepcionista).length;

  const staff = useMemo(() => {
    const q = textoBuscado.trim().toLowerCase();
    return base.filter((u) => {
      if (rolFiltro !== null && u.rol !== rolFiltro) return false;
      if (!q) return true;
      return u.nombre.toLowerCase().includes(q) || u.nombreUsuario.toLowerCase().includes(q);
    });
  }, [base, rolFiltro, textoBuscado]);

  function toggleRol(rol: RolUsuario) {
    setRolFiltro((actual) => (actual === rol ? null : rol));
  }

  return (
    <PantallaConHeader
      titulo="Equipo"
      subtitulo={
        <p className="text-body-sm text-on-surface-variant">Personal de la veterinaria</p>
      }
      accion={
        <Button size="icon" onClick={() => setCrearAbierto(true)} aria-label="Nuevo integrante">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Buscador (patrón de Clientes/Pacientes) */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            variant="soft"
            aria-label="Buscar en el equipo"
            placeholder="Buscar por nombre o usuario"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {/* Filtro por rol: 2 cards estilo acciones rápidas (toggle) */}
        <div className="grid grid-cols-2 gap-2">
          <CardRol
            icon={Stethoscope}
            label="Veterinarios"
            conteo={veterinarios}
            activo={rolFiltro === RolUsuario.Veterinario}
            onClick={() => toggleRol(RolUsuario.Veterinario)}
          />
          <CardRol
            icon={ConciergeBell}
            label="Recepción"
            conteo={recepcionistas}
            activo={rolFiltro === RolUsuario.Recepcionista}
            onClick={() => toggleRol(RolUsuario.Recepcionista)}
          />
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudo cargar el equipo.
          </div>
        ) : staff.length > 0 ? (
          <div className="flex flex-col gap-3">
            {staff.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <Avatar nombre={u.nombre} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-label-lg font-bold text-on-surface">{u.nombre}</span>
                      <Badge tone={u.activo ? "success" : "neutral"}>
                        {u.activo ? rolLabel[u.rol] : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="truncate text-body-sm text-on-surface-variant">@{u.nombreUsuario}</p>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
                  <Button variant="soft" size="sm" fullWidth onClick={() => setResetUsuario(u)}>
                    <KeyRound className="h-4 w-4" aria-hidden />
                    Resetear PIN
                  </Button>
                  <Button variant="soft" size="sm" fullWidth onClick={() => setGestionUsuario(u)}>
                    <Settings2 className="h-4 w-4" aria-hidden />
                    Gestionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            titulo={textoBuscado ? "Sin resultados" : "Sin personal"}
            descripcion={
              textoBuscado
                ? "No hay integrantes que coincidan con la búsqueda."
                : "Agrega veterinarios y recepcionistas a tu equipo."
            }
          />
        )}
      </div>

      <CrearStaffModal open={crearAbierto} onClose={() => setCrearAbierto(false)} />
      {resetUsuario && (
        <ResetearPinModal
          open={!!resetUsuario}
          onClose={() => setResetUsuario(null)}
          usuarioId={resetUsuario.id}
          nombre={resetUsuario.nombre}
        />
      )}
      {gestionUsuario && (
        <DetalleUsuarioDrawer
          open={!!gestionUsuario}
          onClose={() => setGestionUsuario(null)}
          usuarioId={gestionUsuario.id}
          onResetearPin={() => {
            setResetUsuario(gestionUsuario);
            setGestionUsuario(null);
          }}
        />
      )}
    </PantallaConHeader>
  );
}


/** Card de filtro por rol (neutra). Toggle: activa/desactiva el filtro. */
function CardRol({
  icon: Icon,
  label,
  conteo,
  activo,
  onClick,
}: {
  icon: typeof Stethoscope;
  label: string;
  conteo: number;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={activo}
      className={
        "flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all active:scale-[0.98] " +
        (activo
          ? "border-primary-container bg-primary-container/10"
          : "border-outline-variant/40 bg-surface-container")
      }
    >
      <span
        className={
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg " +
          (activo ? "bg-primary-container/15 text-primary-container" : "bg-surface-container-lowest text-on-surface-variant")
        }
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className={"block truncate text-label-md font-bold leading-tight " + (activo ? "text-primary-container" : "text-on-surface")}>
          {label}
        </span>
        <span className="tabular text-body-sm text-on-surface-variant">{conteo}</span>
      </span>
    </button>
  );
}
