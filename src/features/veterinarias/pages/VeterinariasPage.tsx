import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  UserCog,
} from "lucide-react";
import { Badge, Button, Drawer, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { useToast } from "@/components/feedback/useToast";
import type { Veterinaria } from "@/types/api";
import {
  useAjustarRenovacion,
  useCambiarEstadoVeterinaria,
  useRenovarVeterinaria,
  useVeterinarias,
} from "../hooks";
import { diasParaRenovar, estadoSuscripcion, planLabel, textoSuscripcion } from "../suscripcion";
import { CrearVeterinariaModal } from "../components/CrearVeterinariaModal";
import { CrearAdminModal } from "../components/CrearAdminModal";
import { AdministradoresSection } from "../components/AdministradoresSection";

/** Panel SuperAdmin: suscripciones y gestión de veterinarias (clientes de Patwi). */
export function VeterinariasPage() {
  const { data: veterinarias, isLoading, isError } = useVeterinarias();
  const cambiarEstado = useCambiarEstadoVeterinaria();
  const renovar = useRenovarVeterinaria();
  const toast = useToast();
  const [modalCrear, setModalCrear] = useState(false);
  const [adminDe, setAdminDe] = useState<Veterinaria | null>(null);
  const [ajustarDe, setAjustarDe] = useState<Veterinaria | null>(null);

  // Orden: primero las que requieren cobro (vencidas, luego por vencer), después el resto.
  const lista = useMemo(
    () =>
      [...(veterinarias ?? [])].sort((a, b) => {
        const da = diasParaRenovar(a.fechaRenovacion);
        const db = diasParaRenovar(b.fechaRenovacion);
        if (da === db) return a.nombre.localeCompare(b.nombre);
        return da < db ? -1 : 1;
      }),
    [veterinarias],
  );

  const total = lista.length;
  const activas = lista.filter((v) => v.activa).length;
  const porVencer = lista.filter((v) => estadoSuscripcion(v.fechaRenovacion) === "porVencer").length;
  const vencidas = lista.filter((v) => estadoSuscripcion(v.fechaRenovacion) === "vencida").length;

  function onRenovar(v: Veterinaria) {
    renovar.mutate(v.id, {
      onSuccess: (r) => toast.exito(`${v.nombre}: ${textoSuscripcion(r.fechaRenovacion)}`),
      onError: () => toast.error("No se pudo renovar la veterinaria."),
    });
  }

  return (
    <PantallaConHeader
      titulo="Veterinarias"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Building2 className="h-4 w-4 text-primary-container" aria-hidden />
          {total === 0 ? "Clientes de Patwi" : `${total} veterinaria${total === 1 ? "" : "s"}`}
        </p>
      }
      accion={
        <Button size="icon" onClick={() => setModalCrear(true)} aria-label="Nueva veterinaria">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Métricas de suscripción (a quién cobrar) */}
        <div className="grid grid-cols-3 gap-3">
          <Metrica
            icon={CheckCircle2}
            label="Activas"
            valor={activas}
            className="bg-primary-container text-on-primary"
            iconWrap="bg-white/20"
          />
          <Metrica
            icon={CalendarClock}
            label="Por vencer"
            valor={porVencer}
            className="bg-secondary-fixed text-on-secondary-fixed"
            iconWrap="bg-st-secondary/15 text-st-secondary"
          />
          <Metrica
            icon={AlertTriangle}
            label="Vencidas"
            valor={vencidas}
            className="bg-error-container text-on-error-container"
            iconWrap="bg-error-st/10 text-error-st"
          />
        </div>

        {/* Lista */}
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm font-bold text-on-surface">Clientes de Patwi</h2>

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
          ) : total > 0 ? (
            <div className="flex flex-col gap-3">
              {lista.map((v) => {
                const estado = estadoSuscripcion(v.fechaRenovacion);
                const toneSusc = estado === "vencida" ? "danger" : estado === "porVencer" ? "warning" : "neutral";
                return (
                  <div
                    key={v.id}
                    className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                  >
                    {/* Cabecera */}
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
                        <Building2 className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-label-lg font-bold text-on-surface">{v.nombre}</span>
                          {!v.activa && <Badge tone="danger">Inactiva</Badge>}
                        </div>
                        <p className="text-body-sm text-on-surface-variant">{v.telefono}</p>
                        {v.direccion && (
                          <p className="mt-0.5 flex items-center gap-1 truncate text-body-sm text-on-surface-variant">
                            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <span className="truncate">{v.direccion}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Suscripción */}
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2">
                      <span className="flex items-center gap-2 text-body-md text-on-surface">
                        <CalendarClock className="h-4 w-4 text-primary-container" aria-hidden />
                        Plan {planLabel[v.plan] ?? "Mensual"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={toneSusc}>{textoSuscripcion(v.fechaRenovacion)}</Badge>
                        <button
                          type="button"
                          onClick={() => setAjustarDe(v)}
                          aria-label={`Ajustar fecha de renovación de ${v.nombre}`}
                          className="grid h-7 w-7 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        loading={renovar.isPending && renovar.variables === v.id}
                        onClick={() => onRenovar(v)}
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                        Renovar
                      </Button>
                      <Button variant="soft" size="sm" fullWidth onClick={() => setAdminDe(v)}>
                        <UserCog className="h-4 w-4" aria-hidden />
                        Admin
                      </Button>
                      <Button
                        variant={v.activa ? "warning" : "soft"}
                        size="icon"
                        loading={cambiarEstado.isPending && cambiarEstado.variables?.id === v.id}
                        onClick={() => cambiarEstado.mutate({ id: v.id, activar: !v.activa })}
                        aria-label={v.activa ? `Desactivar ${v.nombre}` : `Activar ${v.nombre}`}
                      >
                        <Power className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState titulo="Sin veterinarias" descripcion="Da de alta la primera veterinaria cliente." />
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
      {ajustarDe && (
        <AjustarRenovacionDrawer veterinaria={ajustarDe} onClose={() => setAjustarDe(null)} />
      )}
    </PantallaConHeader>
  );
}

/** Ajuste manual de la fecha de renovación (pagos irregulares, prórrogas). */
function AjustarRenovacionDrawer({ veterinaria, onClose }: { veterinaria: Veterinaria; onClose: () => void }) {
  const ajustar = useAjustarRenovacion();
  const toast = useToast();
  const [fecha, setFecha] = useState((veterinaria.fechaRenovacion ?? "").slice(0, 10));

  function guardar() {
    ajustar.mutate(
      { id: veterinaria.id, fecha },
      {
        onSuccess: () => {
          toast.exito("Fecha de renovación actualizada");
          onClose();
        },
        onError: () => toast.error("No se pudo actualizar la fecha."),
      },
    );
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Ajustar renovación"
      descripcion={`Cambia a mano la fecha de vencimiento de ${veterinaria.nombre}.`}
    >
      <div className="flex flex-col gap-4">
        <Input label="Nueva fecha de renovación" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <Button fullWidth size="lg" onClick={guardar} loading={ajustar.isPending} disabled={!fecha}>
          Guardar fecha
        </Button>
      </div>
    </Drawer>
  );
}

function Metrica({
  icon: Icon,
  label,
  valor,
  className,
  iconWrap,
}: {
  icon: typeof Building2;
  label: string;
  valor: number;
  className: string;
  iconWrap: string;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-2xl p-3.5 shadow-soft ${className}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${iconWrap}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="tabular mt-1 text-metric font-bold leading-none">{valor}</span>
      <span className="text-body-sm opacity-80">{label}</span>
    </div>
  );
}
