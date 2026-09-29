import { useMemo, useState } from "react";
import { KeyRound, Plus, Search, Settings2 } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Avatar, Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { useDebounce } from "@/lib/useDebounce";
import { rolLabel } from "@/lib/enums";
import { RolUsuario, type UsuarioDto } from "@/types/api";
import { useStaff } from "../hooks";
import { CrearStaffModal } from "../components/CrearStaffModal";
import { ResetearPinModal } from "../components/ResetearPinModal";
import { GestionarUsuarioModal } from "../components/GestionarUsuarioModal";

/** Gestión del equipo del Administrador (buscar, listar, crear, resetear PIN, gestionar). */
export function StaffPage() {
  const { data: usuarios, isLoading, isError } = useStaff();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [resetUsuario, setResetUsuario] = useState<UsuarioDto | null>(null);
  const [gestionUsuario, setGestionUsuario] = useState<UsuarioDto | null>(null);
  const [texto, setTexto] = useState("");
  const textoBuscado = useDebounce(texto);

  // Solo staff operativo (Veterinario/Recepcionista). Los dueños se gestionan
  // desde la ficha del cliente.
  const staff = useMemo(() => {
    const base = (usuarios ?? []).filter(
      (u) => u.rol === RolUsuario.Veterinario || u.rol === RolUsuario.Recepcionista,
    );
    const q = textoBuscado.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.nombreUsuario.toLowerCase().includes(q),
    );
  }, [usuarios, textoBuscado]);

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
        <GestionarUsuarioModal
          open={!!gestionUsuario}
          onClose={() => setGestionUsuario(null)}
          usuario={gestionUsuario}
        />
      )}
    </PantallaConHeader>
  );
}
