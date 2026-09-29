import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Plus,
  RefreshCw,
  UserCog,
  UserX,
} from "lucide-react";
import { Badge, Button, SkeletonFila } from "@/components/ui";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { useToast } from "@/components/feedback/useToast";
import { fechaHoyLarga } from "@/lib/format";
import { saludoPorHora } from "@/lib/saludo";
import { useMetricasSuperAdmin, useRenovarVeterinaria } from "../hooks";
import { planLabel, textoSuscripcion } from "../suscripcion";
import { CrearVeterinariaModal } from "../components/CrearVeterinariaModal";

/** Dashboard del SuperAdmin: panorama general de la plataforma (suscripciones y cobro). */
export function ResumenSuperAdminPage() {
  const { data: m, isLoading, isError } = useMetricasSuperAdmin();
  const renovar = useRenovarVeterinaria();
  const toast = useToast();
  const [modalCrear, setModalCrear] = useState(false);

  function onRenovar(id: string, nombre: string) {
    renovar.mutate(id, {
      onSuccess: (r) => toast.exito(`${nombre}: ${textoSuscripcion(r.fechaRenovacion)}`),
      onError: () => toast.error("No se pudo renovar la veterinaria."),
    });
  }

  return (
    <PantallaConHeader
      titulo={`${saludoPorHora()}…`}
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <CalendarCheck className="h-4 w-4 text-primary-container" aria-hidden />
          {fechaHoyLarga()}
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center gap-2.5 rounded-2xl bg-primary-container p-3.5 text-left text-on-primary shadow-soft transition-transform active:scale-[0.97]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20">
              <Plus className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-label-md font-bold leading-tight">Nueva veterinaria</span>
              <span className="block truncate text-[10px] opacity-80">Alta de cliente</span>
            </span>
          </button>
          <Link
            to="/admin/administradores"
            className="flex items-center gap-2.5 rounded-2xl bg-secondary-fixed p-3.5 text-on-secondary-fixed shadow-soft transition-transform active:scale-[0.97]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-st-secondary/15 text-st-secondary">
              <UserCog className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-label-md font-bold leading-tight">Administradores</span>
              <span className="block truncate text-[10px] opacity-80">Accesos y PIN</span>
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError || !m ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar las métricas.
          </div>
        ) : (
          <>
            {/* Estado de la plataforma */}
            <div className="flex flex-col gap-2.5">
              <span className="text-label-sm font-bold uppercase tracking-wider text-outline">
                Estado de la plataforma
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <Metrica
                  icon={CheckCircle2}
                  label="Veterinarias activas"
                  valor={m.veterinariasActivas}
                  nota={`de ${m.totalVeterinarias} en total`}
                  className="bg-primary-fixed/40"
                  colorIcono="text-tertiary"
                />
                <Metrica
                  icon={UserCog}
                  label="Administradores"
                  valor={m.administradoresActivos}
                  nota="con acceso activo"
                  className="bg-tertiary-fixed/50"
                  colorIcono="text-tertiary"
                />
                <Metrica
                  icon={CalendarClock}
                  label="Por vencer"
                  valor={m.porVencer}
                  nota="en los próximos 7 días"
                  className="bg-secondary-fixed/60"
                  colorIcono="text-st-secondary"
                />
                <Metrica
                  icon={AlertTriangle}
                  label="Vencidas"
                  valor={m.vencidas}
                  nota="requieren cobro"
                  className="bg-error-container/70"
                  colorIcono="text-error-st"
                />

                {/* Planes y crecimiento */}
                <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-surface-container p-3.5">
                  <div className="flex-1">
                    <span className="text-body-sm text-on-surface-variant">Plan mensual</span>
                    <span className="tabular block text-label-lg font-bold text-on-surface">{m.planMensual}</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/40" />
                  <div className="flex-1">
                    <span className="text-body-sm text-on-surface-variant">Plan anual</span>
                    <span className="tabular block text-label-lg font-bold text-on-surface">{m.planAnual}</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/40" />
                  <div className="flex-1">
                    <span className="text-body-sm text-on-surface-variant">Altas del mes</span>
                    <span className="tabular block text-label-lg font-bold text-primary-container">{m.altasMes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta: veterinarias sin administrador */}
            {m.veterinariasSinAdmin > 0 && (
              <Link
                to="/admin/veterinarias"
                className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-3.5 transition-transform active:scale-[0.99]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-warning/15 text-[#B45309]">
                  <UserX className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-label-lg font-bold text-on-surface">
                    {m.veterinariasSinAdmin} veterinaria{m.veterinariasSinAdmin === 1 ? "" : "s"} sin administrador
                  </span>
                  <span className="block text-body-sm text-on-surface-variant">
                    Asígnales un admin para que puedan operar
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant/50" aria-hidden />
              </Link>
            )}

            {/* Por cobrar */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-sm font-bold text-on-surface">Por cobrar</h2>
                <Link to="/admin/veterinarias" className="text-label-sm font-semibold text-primary-container">
                  Ver todas
                </Link>
              </div>

              {m.proximasRenovaciones.length === 0 ? (
                <div className="rounded-2xl bg-surface-container-lowest p-6 text-center shadow-soft">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-primary-container" aria-hidden />
                  <p className="mt-2 text-body-sm text-on-surface-variant">
                    Todo al día: ninguna suscripción vence esta semana.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {m.proximasRenovaciones.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3.5 shadow-soft"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
                        <Building2 className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-label-lg font-bold text-on-surface">{r.nombre}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Badge tone={r.diasRestantes < 0 ? "danger" : "warning"}>
                            {textoSuscripcion(r.fechaRenovacion)}
                          </Badge>
                          <span className="text-body-sm text-on-surface-variant">
                            {planLabel[r.plan] ?? "Mensual"}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        loading={renovar.isPending && renovar.variables === r.id}
                        onClick={() => onRenovar(r.id, r.nombre)}
                        aria-label={`Renovar ${r.nombre}`}
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                        Renovar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <CrearVeterinariaModal open={modalCrear} onClose={() => setModalCrear(false)} />
    </PantallaConHeader>
  );
}

function Metrica({
  icon: Icon,
  label,
  valor,
  nota,
  className,
  colorIcono,
}: {
  icon: typeof Building2;
  label: string;
  valor: number;
  nota: string;
  className: string;
  colorIcono: string;
}) {
  return (
    <div className={`flex flex-col justify-between rounded-2xl p-3.5 shadow-inset-up ${className}`}>
      <div className={`flex items-center justify-between ${colorIcono}`}>
        <span className="text-label-sm font-semibold">{label}</span>
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </div>
      <div className="mt-2">
        <div className="tabular text-metric-display font-bold leading-none text-on-surface">{valor}</div>
        <div className="mt-1 text-body-sm leading-tight text-on-surface-variant">{nota}</div>
      </div>
    </div>
  );
}
