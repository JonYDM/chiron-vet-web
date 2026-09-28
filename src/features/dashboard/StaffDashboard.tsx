import { Link } from "react-router-dom";
import {
  Stethoscope,
  CreditCard,
  UserPlus,
  CalendarCheck,
  Hourglass,
  Store,
  Syringe,
  Timer,
  Ear,
  CheckCircle2,
  NotebookPen,
  Stethoscope as MedicalIcon,
  MessageSquare,
  SlidersHorizontal,
  BellRing,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { formatCurrency, fechaHoyLarga } from "@/lib/format";
import { usePermisos } from "@/lib/usePermisos";
import { useMetricas } from "./hooks";
import { useRecordatorios } from "@/features/recordatorios";

/**
 * Panel Operativo — calco fiel del diseño Stitch (mobile-first, estética clínica).
 * [REAL] Métrica de venta del día, nombre del usuario y recordatorios pendientes vienen
 * del backend.
 * [MOCK] Turno, desglose de caja, alerta farmacéutica, sala de espera y agenda son datos
 * quemados (ver docs/REDISENO-STITCH.md §4) — features futuras.
 */
export function StaffDashboard() {
  const { sesion } = useAuth();
  const p = usePermisos();
  const { data: metricas } = useMetricas();
  const ventaHoy = metricas?.ventasHoy ?? 14850;
  const { data: recordatorios } = useRecordatorios();
  const pendientes = recordatorios?.length ?? 0;

  return (
    <PantallaConHeader
      titulo="Panel Operativo"
      accion={
        <span className="mt-1 inline-block shrink-0 rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-on-surface-variant">
          {sesion?.nombre ?? "—"}
        </span>
      }
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <CalendarCheck className="h-4 w-4 text-primary-container" aria-hidden />
          {fechaHoyLarga()}
        </p>
      }
    >
      <div className="flex flex-col gap-4">

      {/* Acciones rápidas (4-grid) */}
      <div className="grid grid-cols-2 gap-2">
        <AccionRapida
          to={p("gestionar_citas") ? "/app/citas" : "/app"}
          icon={Stethoscope}
          titulo="Nueva Consulta"
          sub="Abrir triage clínico"
          className="bg-primary-container text-on-primary"
          iconWrap="bg-white/15 text-on-primary"
        />
        <AccionRapida
          to={p("usar_pos") ? "/app/pos" : "/app"}
          icon={CreditCard}
          titulo="Cobrar en Caja"
          sub="POS / SPEI / Tarjeta"
          className="bg-surface-container-high text-on-surface"
          iconWrap="bg-st-secondary/15 text-st-secondary"
        />
        <AccionRapida
          to={p("operar_clientes") ? "/app/clientes" : "/app"}
          icon={UserPlus}
          titulo="Nuevo Paciente"
          sub="Alta y carnet digital"
          className="bg-surface-container text-on-surface"
          iconWrap="bg-primary-container/10 text-primary-container"
        />
        <AccionRapida
          to="/app"
          icon={BellRing}
          titulo="Avisos a dueños"
          sub="Recordatorios in-app"
          className="bg-surface-container text-on-surface"
          iconWrap="bg-tertiary-container/20 text-tertiary"
        />
      </div>

      {/* Métricas de hoy */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-bold uppercase tracking-wider text-outline">
            Métricas de Hoy
          </span>
          <span className="text-label-sm font-semibold text-primary-container">Corte en vivo</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Citas del día */}
          <div className="flex flex-col justify-between rounded-[0.75rem] bg-surface-container-lowest p-3.5 shadow-soft">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-label-sm">Citas del Día</span>
              <CalendarCheck className="h-[18px] w-[18px] text-primary-container" aria-hidden />
            </div>
            <div className="mt-2">
              <div className="tabular text-metric-display font-bold leading-none text-on-surface">8</div>
              <div className="mt-1 text-body-sm leading-tight text-outline">3 listas · 1 sala · 4 pend.</div>
            </div>
            <div className="mt-2.5 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div className="h-full bg-primary-container" style={{ width: "37.5%" }} />
              <div className="h-full bg-st-secondary" style={{ width: "12.5%" }} />
              <div className="h-full bg-surface-variant" style={{ width: "50%" }} />
            </div>
          </div>

          {/* En espera */}
          <div className="flex flex-col justify-between rounded-[0.75rem] bg-surface-container-lowest p-3.5 shadow-soft">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-label-sm">En Espera</span>
              <Hourglass className="h-[18px] w-[18px] text-st-secondary" aria-hidden />
            </div>
            <div className="mt-2">
              <div className="tabular text-metric-display font-bold leading-none text-st-secondary">
                2 <span className="text-body-sm font-normal text-on-surface-variant">pacientes</span>
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-error-container px-1.5 py-0.5 text-[10px] font-bold text-on-error-container">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error-st" />
                1 Urgencia leve
              </div>
            </div>
            <div className="mt-2 text-right text-[11px] text-on-surface-variant">Promedio: 14 min</div>
          </div>

          {/* Venta en caja */}
          <div className="col-span-2 flex flex-col justify-between rounded-[0.75rem] bg-surface-container-lowest p-3.5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Store className="h-[18px] w-[18px] text-primary-container" aria-hidden />
                <span className="text-label-md font-bold text-on-surface">Venta en Caja · Hoy</span>
              </div>
              <span className="tabular text-headline-sm font-bold text-primary-container">
                {formatCurrency(ventaHoy)}{" "}
                <span className="text-[11px] font-normal text-outline">MXN</span>
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-surface-container-low p-2 text-center">
              <CajaDesglose label="Efectivo" valor="$4,200" />
              <CajaDesglose label="Terminal TPV" valor="$7,450" />
              <CajaDesglose label="SPEI Directo" valor="$3,200" resaltado />
            </div>
          </div>
        </div>
      </div>

      {/* Alerta farmacéutica [MOCK] */}
      <div className="flex items-start gap-3 rounded-[0.75rem] bg-secondary-fixed/50 p-3.5 shadow-soft">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-st-secondary text-on-secondary">
          <Syringe className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="truncate text-label-md font-bold text-on-secondary-fixed">
              Alerta Farmacéutica
            </span>
            <span className="rounded-full bg-st-secondary px-2 py-0.5 text-[10px] font-bold text-on-secondary">
              5 dosis
            </span>
          </div>
          <p className="mt-0.5 text-body-sm text-on-secondary-fixed-variant">
            Vacuna sérica antirrábica por agotarse en refrigerador 2. Solicitar lote a droguería
            antes de las 14:00 hrs.
          </p>
        </div>
      </div>

      {/* Sala de espera [MOCK] */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-headline-sm font-bold text-on-surface">Sala de Espera</span>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-st-secondary text-[11px] font-bold text-on-secondary">
              2
            </span>
          </div>
          <button className="text-label-sm font-bold text-primary-container">Ver triaje completo</button>
        </div>
        <div className="flex flex-col gap-2">
          <SalaCard
            nombre="Milo"
            chip="Gato Persa · 4.0 kg"
            chipClass="bg-tertiary-fixed text-on-tertiary-fixed-variant"
            dueno="Dueño: Carlos Fuentes"
            espera="12 min"
            motivoIcon={Syringe}
            motivoIconClass="text-primary-container"
            motivo="Vacuna Leucemia Felina (Refuerzo anual)"
            accion="Llamar a C1"
            accionClass="bg-primary-container text-on-primary"
          />
          <SalaCard
            nombre="Luna"
            chip="Urgencia leve · Pug 8.2 kg"
            chipClass="bg-error-container text-on-error-container"
            dueno="Dueña: Andrea Valdés"
            espera="Consultorio 2"
            esperaClass="bg-primary-fixed text-on-primary-fixed"
            motivoIcon={Ear}
            motivoIconClass="text-error-st"
            motivo="Otitis recurrente bilateral & prurito"
            accion="Ver Ficha"
            accionClass="bg-surface-container-high text-primary-container"
          />
        </div>
      </div>

      {/* Agenda de citas (timeline) [MOCK] */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-headline-sm font-bold text-on-surface">Agenda de Citas</span>
            <span className="text-label-sm text-outline">Lunes 28</span>
          </div>
          <div className="flex items-center gap-1 text-label-sm font-semibold text-primary-container">
            <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
            Filtrar
          </div>
        </div>
        <div className="relative flex flex-col gap-3.5 pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-surface-variant before:content-['']">
          <CitaTimeline
            hora="10:00 AM"
            estado="Atendido"
            estadoClass="bg-surface-container text-outline"
            dotClass="bg-primary-container"
            responsable="Dra. Sofía Ramírez"
            paciente="Canelo"
            raza="(Golden Retriever)"
            detalle="Revisión Dermatología · Receta entregada"
            trailingIcon={CheckCircle2}
          />
          <CitaTimeline
            hora="11:30 AM"
            horaClass="text-st-secondary"
            estado="En Proceso"
            estadoClass="bg-secondary-fixed text-on-secondary-fixed"
            dotClass="bg-st-secondary animate-pulse"
            responsable="Consultorio 1"
            paciente="Milo"
            raza="(Gato Persa)"
            detalle="Vacunación Cuádruple + Desparasitación"
            trailingIcon={NotebookPen}
          />
          <CitaTimeline
            hora="01:00 PM"
            estado="Quirófano A"
            estadoClass="bg-surface-variant text-on-surface-variant"
            dotClass="bg-surface-variant"
            responsable="Ayuno 8h confirmado"
            responsableClass="text-error-st font-semibold"
            paciente="Rocky"
            raza="(Pastor Alemán · 31 kg)"
            detalle="Cirugía menor · Sutura de cojinete plantar"
            trailingIcon={MedicalIcon}
          />
          <CitaTimeline
            hora="04:30 PM"
            estado="Por Confirmar"
            estadoClass="bg-surface-container text-on-surface-variant"
            dotClass="bg-surface-variant"
            responsable="Gabinete Eco"
            paciente="Cleo"
            raza="(Gata Siamesa · 3.5 kg)"
            detalle="Ultrasonido abdominal preventivo"
            trailingIcon={MessageSquare}
          />
        </div>
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
      className={`flex items-center gap-2.5 rounded-[0.75rem] p-3 shadow-soft transition-transform active:scale-[0.98] ${className}`}
    >
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconWrap}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="truncate text-label-md font-bold leading-tight">{titulo}</div>
        <div className="truncate text-[10px] opacity-80">{sub}</div>
      </div>
    </Link>
  );
}

function CajaDesglose({ label, valor, resaltado }: { label: string; valor: string; resaltado?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-on-surface-variant">{label}</div>
      <div
        className={`tabular text-label-md font-bold ${resaltado ? "text-primary-container" : "text-on-surface"}`}
      >
        {valor}
      </div>
    </div>
  );
}

function SalaCard({
  nombre,
  chip,
  chipClass,
  dueno,
  espera,
  esperaClass = "bg-surface-container text-on-surface-variant",
  motivoIcon: MotivoIcon,
  motivoIconClass,
  motivo,
  accion,
  accionClass,
}: {
  nombre: string;
  chip: string;
  chipClass: string;
  dueno: string;
  espera: string;
  esperaClass?: string;
  motivoIcon: typeof Syringe;
  motivoIconClass: string;
  motivo: string;
  accion: string;
  accionClass: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[0.75rem] bg-surface-container-lowest p-4 shadow-soft">
      {/* Cabecera: avatar + bloque de identidad (nombre, especie/peso, dueño) + espera */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-container text-primary-container">
            <span className="text-label-md font-bold">{nombre.slice(0, 2)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-headline-sm font-bold leading-tight text-on-surface">{nombre}</span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${chipClass}`}>
                {chip}
              </span>
            </div>
            <p className="mt-0.5 truncate text-body-sm text-on-surface-variant">{dueno}</p>
          </div>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${esperaClass}`}
        >
          <Timer className="h-3.5 w-3.5" aria-hidden /> {espera}
        </span>
      </div>

      {/* Motivo + acción */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <MotivoIcon className={`h-4 w-4 shrink-0 ${motivoIconClass}`} aria-hidden />
          <span className="truncate text-label-md text-on-surface">{motivo}</span>
        </div>
        <button
          className={`shrink-0 rounded-lg px-3 py-1.5 text-label-sm font-bold active:scale-95 ${accionClass}`}
        >
          {accion}
        </button>
      </div>
    </div>
  );
}

function CitaTimeline({
  hora,
  horaClass = "text-on-surface",
  estado,
  estadoClass,
  dotClass,
  responsable,
  responsableClass = "text-outline",
  paciente,
  raza,
  detalle,
  trailingIcon: TrailingIcon,
}: {
  hora: string;
  horaClass?: string;
  estado: string;
  estadoClass: string;
  dotClass: string;
  responsable: string;
  responsableClass?: string;
  paciente: string;
  raza: string;
  detalle: string;
  trailingIcon: typeof CheckCircle2;
}) {
  return (
    <div className="relative flex flex-col gap-1 rounded-[0.75rem] bg-surface-container-lowest p-3 shadow-soft">
      <div className={`absolute -left-6 top-3.5 h-3 w-3 rounded-full ring-4 ring-background ${dotClass}`} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-label-md font-bold ${horaClass}`}>{hora}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${estadoClass}`}>{estado}</span>
        </div>
        <span className={`text-[11px] ${responsableClass}`}>{responsable}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <div>
          <div className="text-label-lg font-bold text-on-surface">
            {paciente} <span className="text-body-sm font-normal text-on-surface-variant">{raza}</span>
          </div>
          <div className="text-body-sm text-on-surface-variant">{detalle}</div>
        </div>
        <TrailingIcon className="h-5 w-5 text-outline" aria-hidden />
      </div>
    </div>
  );
}
