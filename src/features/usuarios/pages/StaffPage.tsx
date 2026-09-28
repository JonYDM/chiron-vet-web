import { useState } from "react";
import { KeyRound, Plus, Settings2, Stethoscope, Users } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Avatar, Badge, Button, SkeletonFila } from "@/components/ui";
import { rolLabel } from "@/lib/enums";
import { RolUsuario, type UsuarioDto } from "@/types/api";
import { useStaff } from "../hooks";
import { CrearStaffModal } from "../components/CrearStaffModal";
import { ResetearPinModal } from "../components/ResetearPinModal";
import { GestionarUsuarioModal } from "../components/GestionarUsuarioModal";

/** Gestión del equipo del Administrador (listar, crear, resetear PIN, gestionar). */
export function StaffPage() {
  const { data: usuarios, isLoading, isError } = useStaff();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [resetUsuario, setResetUsuario] = useState<UsuarioDto | null>(null);
  const [gestionUsuario, setGestionUsuario] = useState<UsuarioDto | null>(null);

  // Solo staff operativo (Veterinario/Recepcionista). Los dueños se gestionan
  // desde la ficha del cliente.
  const staff = (usuarios ?? []).filter(
    (u) => u.rol === RolUsuario.Veterinario || u.rol === RolUsuario.Recepcionista,
  );
  const veterinarios = staff.filter((u) => u.rol === RolUsuario.Veterinario).length;
  const recepcionistas = staff.filter((u) => u.rol === RolUsuario.Recepcionista).length;

  return (
    <PantallaConHeader
      titulo="Equipo"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Users className="h-4 w-4 text-primary-container" aria-hidden />
          {staff.length === 0 ? "Personal de la veterinaria" : `${staff.length} integrante${staff.length === 1 ? "" : "s"}`}
        </p>
      }
      accion={
        <Button size="icon" onClick={() => setCrearAbierto(true)} aria-label="Nuevo integrante">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <Metrica icon={Users} label="Equipo" valor={staff.length} tone="primary" />
          <Metrica icon={Stethoscope} label="Veterinarios" valor={veterinarios} tone="accent" />
          <Metrica icon={KeyRound} label="Recepción" valor={recepcionistas} tone="accent" />
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm font-bold text-on-surface">Personal</h2>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
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
                  className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <Avatar nombre={u.nombre} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-label-lg font-bold text-on-surface">
                          {u.nombre}
                        </span>
                        <Badge tone={u.activo ? "success" : "neutral"}>
                          {u.activo ? rolLabel[u.rol] : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="truncate text-body-sm text-on-surface-variant">
                        @{u.nombreUsuario}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
                    <Button variant="soft" size="sm" fullWidth onClick={() => setResetUsuario(u)}>
                      <KeyRound className="h-4 w-4" aria-hidden />
                      Resetear PIN
                    </Button>
                    <Button
                      variant="soft"
                      size="sm"
                      fullWidth
                      onClick={() => setGestionUsuario(u)}
                    >
                      <Settings2 className="h-4 w-4" aria-hidden />
                      Gestionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              titulo="Sin personal"
              descripcion="Agrega veterinarios y recepcionistas a tu equipo."
            />
          )}
        </section>
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

function Metrica({
  icon: Icon,
  label,
  valor,
  tone,
}: {
  icon: typeof Users;
  label: string;
  valor: number;
  tone: "primary" | "accent";
}) {
  const color = tone === "accent" ? "text-accent-strong" : "text-primary-container";
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3.5 shadow-soft">
      <Icon className={`h-5 w-5 ${color}`} aria-hidden />
      <span className="tabular mt-1 text-metric font-bold leading-none text-on-surface">{valor}</span>
      <span className="text-body-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
