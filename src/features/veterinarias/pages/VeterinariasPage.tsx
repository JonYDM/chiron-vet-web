import { useState } from "react";
import { Building2, CheckCircle2, Plus, Power, UserCog, XCircle } from "lucide-react";
import { Badge, Button, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { formatDate } from "@/lib/format";
import type { Veterinaria } from "@/types/api";
import { useCambiarEstadoVeterinaria, useVeterinarias } from "../hooks";
import { CrearVeterinariaModal } from "../components/CrearVeterinariaModal";
import { CrearAdminModal } from "../components/CrearAdminModal";
import { AdministradoresSection } from "../components/AdministradoresSection";

/** Panel SuperAdmin: métricas + gestión de veterinarias (clientes de Chiron). */
export function VeterinariasPage() {
  const { data: veterinarias, isLoading, isError } = useVeterinarias();
  const cambiarEstado = useCambiarEstadoVeterinaria();
  const [modalCrear, setModalCrear] = useState(false);
  const [adminDe, setAdminDe] = useState<Veterinaria | null>(null);

  const total = veterinarias?.length ?? 0;
  const activas = veterinarias?.filter((v) => v.activa).length ?? 0;
  const inactivas = total - activas;

  return (
    <PantallaConHeader
      titulo="Veterinarias"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Building2 className="h-4 w-4 text-primary-container" aria-hidden />
          {total === 0 ? "Clientes de Chiron" : `${total} veterinaria${total === 1 ? "" : "s"}`}
        </p>
      }
      accion={
        <Button size="icon" onClick={() => setModalCrear(true)} aria-label="Nueva veterinaria">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Métricas (bento) */}
        <div className="grid grid-cols-3 gap-3">
          <Metrica icon={Building2} label="Total" valor={total} tone="primary" />
          <Metrica icon={CheckCircle2} label="Activas" valor={activas} tone="success" />
          <Metrica icon={XCircle} label="Inactivas" valor={inactivas} tone="danger" />
        </div>

        {/* Lista de veterinarias */}
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm font-bold text-on-surface">Clientes de Chiron</h2>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonFila key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
              No se pudieron cargar las veterinarias.
            </div>
          ) : veterinarias && veterinarias.length > 0 ? (
            <div className="flex flex-col gap-3">
              {veterinarias.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary-container">
                      <Building2 className="h-6 w-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-label-lg font-bold text-on-surface">
                          {v.nombre}
                        </span>
                        <Badge tone={v.activa ? "success" : "danger"}>
                          {v.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        {v.telefono} · alta {formatDate(v.fechaAlta)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
                    <Button variant="soft" size="sm" fullWidth onClick={() => setAdminDe(v)}>
                      <UserCog className="h-4 w-4" aria-hidden />
                      Administrador
                    </Button>
                    <Button
                      variant={v.activa ? "warning" : "primary"}
                      size="sm"
                      fullWidth
                      loading={cambiarEstado.isPending && cambiarEstado.variables?.id === v.id}
                      onClick={() => cambiarEstado.mutate({ id: v.id, activar: !v.activa })}
                    >
                      <Power className="h-4 w-4" aria-hidden />
                      {v.activa ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              titulo="Sin veterinarias"
              descripcion="Da de alta la primera veterinaria cliente."
            />
          )}
        </section>

        <AdministradoresSection />
      </div>

      <CrearVeterinariaModal open={modalCrear} onClose={() => setModalCrear(false)} />
      {adminDe && (
        <CrearAdminModal
          open={!!adminDe}
          onClose={() => setAdminDe(null)}
          veterinariaId={adminDe.id}
          veterinariaNombre={adminDe.nombre}
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
  icon: typeof Building2;
  label: string;
  valor: number;
  tone: "primary" | "success" | "danger";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-error-st"
        : "text-primary-container";
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3.5 shadow-soft">
      <Icon className={`h-5 w-5 ${color}`} aria-hidden />
      <span className="tabular mt-1 text-metric font-bold leading-none text-on-surface">{valor}</span>
      <span className="text-body-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
