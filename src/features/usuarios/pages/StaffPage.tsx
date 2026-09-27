import { useState } from "react";
import { KeyRound, Plus, Settings2, UserCog } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Badge, Button, Card, CardContent, SkeletonFila } from "@/components/ui";
import { Reveal } from "@/lib/anim";
import { rolLabel } from "@/lib/enums";
import { RolUsuario, type UsuarioDto } from "@/types/api";
import { useStaff } from "../hooks";
import { CrearStaffModal } from "../components/CrearStaffModal";
import { ResetearPinModal } from "../components/ResetearPinModal";
import { GestionarUsuarioModal } from "../components/GestionarUsuarioModal";

/** Pantalla de gestión de staff del Administrador (listar, crear, resetear PIN). */
export function StaffPage() {
  const { data: usuarios, isLoading, isError } = useStaff();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [resetUsuario, setResetUsuario] = useState<UsuarioDto | null>(null);
  const [gestionUsuario, setGestionUsuario] = useState<UsuarioDto | null>(null);

  // Mostrar solo staff operativo (Veterinario/Recepcionista). Los dueños se
  // gestionan desde la ficha del cliente.
  const staff = (usuarios ?? []).filter(
    (u) => u.rol === RolUsuario.Veterinario || u.rol === RolUsuario.Recepcionista,
  );

  return (
    <div>
      <PageHeader
        titulo="Equipo"
        descripcion="Gestiona el personal de tu veterinaria"
        accion={
          <Button onClick={() => setCrearAbierto(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudo cargar el equipo.
          </CardContent>
        </Card>
      ) : staff.length > 0 ? (
        <Reveal stagger className="space-y-3">
          {staff.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                  <UserCog className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{u.nombre}</p>
                  <p className="text-sm text-ink-soft">@{u.nombreUsuario}</p>
                </div>
                <Badge tone={u.activo ? "primary" : "neutral"}>
                  {u.activo ? rolLabel[u.rol] : "Inactivo"}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setResetUsuario(u)}
                >
                  <KeyRound className="h-4 w-4" aria-hidden />
                  PIN
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setGestionUsuario(u)}
                  aria-label={`Gestionar ${u.nombre}`}
                >
                  <Settings2 className="h-4 w-4" aria-hidden />
                </Button>
              </CardContent>
            </Card>
          ))}
        </Reveal>
      ) : (
        <EmptyState
          titulo="Sin personal"
          descripcion="Agrega veterinarios y recepcionistas a tu equipo."
        />
      )}

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
    </div>
  );
}
