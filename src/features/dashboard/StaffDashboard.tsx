import { Link } from "react-router-dom";
import {
  Stethoscope,
  CreditCard,
  UserPlus,
  CalendarCheck,
  Store,
  CalendarClock,
  SlidersHorizontal,
  BellRing,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { formatCurrency, fechaHoyLarga } from "@/lib/format";
import { saludoPorHora } from "@/lib/saludo";
import { usePermisos } from "@/lib/usePermisos";
import { useMetricas, useResumenCajaHoy } from "./hooks";
import { useRecordatorios } from "@/features/recordatorios";
import { useProximasCitas } from "@/features/citas/hooks";
import { estadoCitaLabel, rolLabel } from "@/lib/enums";
import { EstadoCita, RolUsuario, type Cita } from "@/types/api";

/**
 * Panel Operativo — estética clínica (base Stitch), mobile-first.
 * [REAL] Venta del día y desglose de caja (ResumenVentas), recordatorios pendientes
 * (GET /recordatorios), agenda de citas próximas (VerAgenda) y nombre del usuario.
 * Sala de espera/triage y alerta farmacéutica se RETIRARON (fuera del alcance: la clínica
 * los maneja aparte — decisión documentada en docs/REDISENO-STITCH.md §6).
 */
export function StaffDashboard() {
  const { sesion } = useAuth();
  const p = usePermisos();
  const rol = sesion?.rol;
  // Quién ve dinero: Admin (todo el negocio) y Recepcionista (su caja del día).
  // El Veterinario NO ve métricas de dinero.
  const puedeVerVentas = rol === RolUsuario.Administrador || rol === RolUsuario.Recepcionista;
  // El desglose acumulado / negocio es solo del Admin.
  const puedeVerNegocio = rol === RolUsuario.Administrador;

  const { data: metricas } = useMetricas();
  const ventaHoy = metricas?.ventasHoy ?? 0;
  const { data: recordatorios } = useRecordatorios();
  const pendientes = recordatorios?.length ?? 0;
  const { data: caja } = useResumenCajaHoy(puedeVerVentas);
  const { data: citas } = useProximasCitas();
  const citasHoy = (citas ?? []).filter((c) => esHoy(c.fechaHora));

  return (
    <PantallaConHeader
      titulo={`${saludoPorHora()}…`}
      accion={
        <img
          src="/vet.webp"
          alt={rolLabel[sesion?.rol ?? RolUsuario.Administrador]}
          className="-my-3 mr-3 h-16 w-16 shrink-0 object-contain drop-shadow-sm"
        />
      }
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <CalendarCheck className="h-4 w-4 text-primary-container" aria-hidden />
          {fechaHoyLarga()}
        </p>
      }
    >
      <div className="flex flex-col gap-6">

      {/* Acciones rápidas (4-grid) */}
      <div className="grid grid-cols-2 gap-2.5">
        <AccionRapida
          to={p("gestionar_citas") ? "/app/citas" : "/app"}
          icon={Stethoscope}
          titulo="Nueva Cita"
          sub="Agendar en la agenda"
          className="bg-primary-container text-on-primary"
          iconWrap="bg-white/20 text-on-primary"
        />
        {p("usar_pos") && (
          <AccionRapida
            to="/app/pos"
            icon={CreditCard}
            titulo="Cobrar en Caja"
            sub="Punto de venta"
            className="bg-secondary-container text-on-secondary"
            iconWrap="bg-white/20 text-on-secondary"
          />
        )}
        <AccionRapida
          to={p("operar_clientes") ? "/app/clientes" : "/app"}
          icon={UserPlus}
          titulo="Nuevo Paciente"
          sub="Alta y carnet digital"
          className="bg-tertiary-fixed text-on-tertiary-fixed-variant"
          iconWrap="bg-tertiary/15 text-tertiary"
        />
        <AccionRapida
          to="/app/recordatorios"
          icon={BellRing}
          titulo="Recordatorios"
          sub="A quién avisar"
          className="bg-secondary-fixed text-on-secondary-fixed"
          iconWrap="bg-st-secondary/15 text-st-secondary"
        />
      </div>

      {/* Métricas de hoy */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-bold uppercase tracking-wider text-outline">
            Métricas de Hoy
          </span>
          <span className="text-label-sm font-semibold text-primary-container">Corte en vivo</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Citas del día (REAL) */}
          <div className="flex flex-col justify-between rounded-2xl bg-primary-fixed/40 p-3.5 shadow-inset-up">
            <div className="flex items-center justify-between text-tertiary">
              <span className="text-label-sm font-semibold">Citas del Día</span>
              <CalendarCheck className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <div className="mt-2">
              <div className="tabular text-metric-display font-bold leading-none text-on-surface">
                {citasHoy.length}
              </div>
              <div className="mt-1 text-body-sm leading-tight text-on-surface-variant">
                {citasHoy.length === 0 ? "Sin citas hoy" : "Programadas para hoy"}
              </div>
            </div>
          </div>

          {/* Clientes activos (REAL) */}
          <div className="flex flex-col justify-between rounded-2xl bg-secondary-fixed/60 p-3.5 shadow-inset-up">
            <div className="flex items-center justify-between text-st-secondary">
              <span className="text-label-sm font-semibold">Clientes Activos</span>
              <UserPlus className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <div className="mt-2">
              <div className="tabular text-metric-display font-bold leading-none text-on-surface">
                {metricas?.clientesActivos ?? 0}
              </div>
              <div className="mt-1 text-body-sm leading-tight text-on-surface-variant">En la veterinaria</div>
            </div>
          </div>

          {/* Venta en caja: total del día (Admin y Recepcionista). Desglose por método
              solo para el Admin (métrica del negocio). */}
          {puedeVerVentas && (
            <div className="col-span-2 flex flex-col justify-between rounded-2xl bg-tertiary-fixed/50 p-3.5 shadow-inset-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Store className="h-[18px] w-[18px] text-tertiary" aria-hidden />
                  <span className="text-label-md font-bold text-on-surface">Venta en Caja · Hoy</span>
                </div>
                <span className="tabular text-headline-sm font-bold text-tertiary">
                  {formatCurrency(caja?.total ?? ventaHoy)}{" "}
                  <span className="text-[11px] font-normal text-on-surface-variant">MXN</span>
                </span>
              </div>
              {puedeVerNegocio && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-surface-container-lowest/70 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-tertiary/10 text-tertiary">
                      <Stethoscope className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase text-on-surface-variant">Consultas</div>
                      <div className="tabular text-label-md font-bold text-tertiary">
                        {formatCurrency(caja?.totalConsultas ?? 0)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
                      <Store className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase text-on-surface-variant">Productos</div>
                      <div className="tabular text-label-md font-bold text-on-surface">
                        {formatCurrency(caja?.totalProductos ?? 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agenda de citas (REAL: VerAgenda) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-headline-sm font-bold text-on-surface">Agenda de Citas</span>
          </div>
          <Link
            to="/app/citas"
            className="flex items-center gap-1 text-label-sm font-semibold text-primary-container"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
            Ver todas
          </Link>
        </div>
        {citasHoy.length === 0 ? (
          <div className="rounded-[0.75rem] bg-surface-container-lowest p-6 text-center shadow-soft">
            <CalendarClock className="mx-auto h-8 w-8 text-outline" aria-hidden />
            <p className="mt-2 text-body-sm text-on-surface-variant">No hay citas programadas para hoy.</p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-3.5 pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-surface-variant before:content-['']">
            {citasHoy.map((c) => (
              <CitaTimeline key={c.id} cita={c} />
            ))}
          </div>
        )}
      </div>

      {/* Recordatorios */}
      <Link
        to="/app/recordatorios"
        className="flex items-center justify-between rounded-[0.75rem] bg-surface-container p-4 shadow-soft active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container">
            <BellRing className="h-[22px] w-[22px]" aria-hidden />
          </div>
          <div>
            <div className="text-label-lg font-bold text-on-surface">
              {pendientes > 0
                ? `${pendientes} recordatorio${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"}`
                : "Sin recordatorios pendientes"}
            </div>
            <div className="text-body-sm text-on-surface-variant">
              Vacunas, desparasitaciones y citas próximas
            </div>
          </div>
        </div>
        <span className="rounded-lg bg-surface-container-lowest px-3 py-1.5 text-label-sm font-bold text-primary-container shadow-soft">
          Ver
        </span>
      </Link>
      </div>
    </PantallaConHeader>
  );
}

function AccionRapida({
  to,
  icon: Icon,
  titulo,
  sub,
  className,
  iconWrap,
}: {
  to: string;
  icon: typeof Stethoscope;
  titulo: string;
  sub: string;
  className: string;
  iconWrap: string;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 rounded-2xl p-3.5 shadow-soft transition-transform active:scale-[0.97] ${className}`}
    >
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconWrap}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="truncate text-label-md font-bold leading-tight">{titulo}</div>
        <div className="truncate text-[10px] opacity-80">{sub}</div>
      </div>
    </Link>
  );
}


/** Devuelve true si la fecha ISO cae en el día de hoy. */
function esHoy(iso: string): boolean {
  const d = new Date(iso);
  const hoy = new Date();
  return (
    d.getFullYear() === hoy.getFullYear() &&
    d.getMonth() === hoy.getMonth() &&
    d.getDate() === hoy.getDate()
  );
}

/** Hora corta (ej. "10:00 a. m.") a partir de un ISO. */
function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

/** Tono del punto del timeline según el estado de la cita. */
function dotPorEstado(estado: EstadoCita): string {
  switch (estado) {
    case EstadoCita.Atendida:
      return "bg-primary-container";
    case EstadoCita.Programada:
      return "bg-st-secondary";
    default:
      return "bg-surface-variant";
  }
}

/** Clases de la pastilla de estado (fondo + texto) según el estado de la cita. */
function estadoCitaChip(estado: EstadoCita): string {
  switch (estado) {
    case EstadoCita.Atendida:
      return "bg-primary-container/15 text-primary-container";
    case EstadoCita.Programada:
      return "bg-secondary-fixed text-on-secondary-fixed";
    case EstadoCita.Cancelada:
    case EstadoCita.NoAsistio:
      return "bg-error-container text-on-error-container";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
}

/** Item del timeline de agenda a partir de una Cita REAL del backend. */
function CitaTimeline({ cita }: { cita: Cita }) {
  return (
    <div className="relative flex flex-col gap-1 rounded-[0.75rem] bg-surface-container-lowest p-3 shadow-soft">
      <div
        className={`absolute -left-6 top-3.5 h-3 w-3 rounded-full ring-4 ring-background ${dotPorEstado(cita.estado)}`}
      />
      <div className="flex items-center justify-between">
        <span className="text-label-md font-bold text-on-surface">{horaCorta(cita.fechaHora)}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${estadoCitaChip(cita.estado)}`}>
          {estadoCitaLabel[cita.estado]}
        </span>
      </div>
      <div className="mt-1 text-body-sm text-on-surface-variant">{cita.motivo}</div>
    </div>
  );
}
