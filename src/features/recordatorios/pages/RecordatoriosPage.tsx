import { useMemo, useState } from "react";
import { BellRing, CalendarClock, Phone, Send, Syringe } from "lucide-react";
import { Badge, Button, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { useToast } from "@/components/feedback/useToast";
import { tipoRecordatorioLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { TipoRecordatorio, type RecordatorioDetectado } from "@/types/api";
import { useEnviarRecordatorios, useRecordatorios } from "../hooks";

/** Agrupa los recordatorios por su fecha (secciones por día). */
function agruparPorFecha(items: RecordatorioDetectado[]) {
  const grupos = new Map<string, RecordatorioDetectado[]>();
  for (const r of items) {
    const arr = grupos.get(r.fecha) ?? [];
    arr.push(r);
    grupos.set(r.fecha, arr);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/** Panel del staff: recordatorios pendientes de la clínica (el gancho: que vuelvan). */
export function RecordatoriosPage() {
  const { data: recordatorios, isLoading, isError } = useRecordatorios();
  const enviar = useEnviarRecordatorios();
  const toast = useToast();

  const total = recordatorios?.length ?? 0;
  const aplicaciones =
    recordatorios?.filter((r) => r.tipo === TipoRecordatorio.ProximaAplicacion).length ?? 0;
  const citas = recordatorios?.filter((r) => r.tipo === TipoRecordatorio.Cita).length ?? 0;

  const grupos = useMemo(() => agruparPorFecha(recordatorios ?? []), [recordatorios]);

  async function enviarAvisos() {
    try {
      const res = await enviar.mutateAsync(undefined);
      toast.exito(`Avisos enviados: ${res.enviados} de ${res.detectados}`);
    } catch {
      toast.error("No se pudieron enviar los avisos");
    }
  }

  return (
    <PantallaConHeader
      titulo="Recordatorios"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <BellRing className="h-4 w-4 text-primary-container" aria-hidden />
          {total === 0 ? "A quién contactar" : `${total} pendiente${total === 1 ? "" : "s"}`}
        </p>
      }
      accion={
        total > 0 ? (
          <Button size="sm" onClick={enviarAvisos} loading={enviar.isPending}>
            <Send className="h-4 w-4" aria-hidden />
            Avisar a todos
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        {/* Métricas (bento con color, estilo acciones rápidas del dashboard) */}
        <div className="grid grid-cols-3 gap-3">
          <Metrica
            icon={BellRing}
            label="Pendientes"
            valor={total}
            className="bg-primary-container text-on-primary"
            iconWrap="bg-white/20"
          />
          <Metrica
            icon={Syringe}
            label="Aplicaciones"
            valor={aplicaciones}
            className="bg-tertiary-fixed text-on-tertiary-fixed-variant"
            iconWrap="bg-tertiary/15 text-tertiary"
          />
          <Metrica
            icon={CalendarClock}
            label="Citas"
            valor={citas}
            className="bg-secondary-fixed text-on-secondary-fixed"
            iconWrap="bg-st-secondary/15 text-st-secondary"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar los recordatorios.
          </div>
        ) : total > 0 ? (
          <div className="flex flex-col gap-5">
            {grupos.map(([fecha, items]) => (
              <section key={fecha} className="flex flex-col gap-3">
                <h2 className="text-label-lg font-bold text-on-surface-variant">{formatDate(fecha)}</h2>
                <div className="flex flex-col gap-3">
                  {items.map((r, i) => (
                    <RecordatorioCard key={`${r.clienteId}-${i}`} recordatorio={r} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            titulo="Todo al día"
            descripcion="No hay recordatorios pendientes por ahora."
          />
        )}
      </div>
    </PantallaConHeader>
  );
}

/** Card de recordatorio: cabecera (ícono + tipo) → paciente/dueño → acción (llamar). */
function RecordatorioCard({ recordatorio: r }: { recordatorio: RecordatorioDetectado }) {
  const [copiado, setCopiado] = useState(false);
  const toast = useToast();
  const esVacuna = r.tipo === TipoRecordatorio.ProximaAplicacion;
  const Icono = esVacuna ? Syringe : CalendarClock;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(r.telefonoCliente);
      setCopiado(true);
      toast.exito("Teléfono copiado");
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft">
      {/* Cabecera: ícono + tipo + badge */}
      <div className="flex items-center gap-3">
        <span
          className={
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl " +
            (esVacuna ? "bg-tertiary-fixed text-tertiary" : "bg-secondary-fixed text-st-secondary")
          }
        >
          <Icono className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-lg font-bold text-on-surface">{r.nombreMascota}</p>
          <p className="truncate text-body-sm text-on-surface-variant">Dueño: {r.nombreCliente}</p>
        </div>
        <Badge tone={esVacuna ? "info" : "primary"}>{tipoRecordatorioLabel[r.tipo]}</Badge>
      </div>

      {/* Motivo */}
      <div className="rounded-xl bg-surface-container-low px-3 py-2">
        <p className="truncate text-body-md text-on-surface">{r.detalle}</p>
      </div>

      {/* Acción: llamar / copiar teléfono */}
      <div className="flex items-center gap-2 border-t border-outline-variant/20 pt-3">
        <a href={`tel:${r.telefonoCliente}`} className="flex-1">
          <Button variant="soft" size="sm" fullWidth>
            <Phone className="h-4 w-4" aria-hidden />
            Llamar
          </Button>
        </a>
        <Button variant="ghost" size="sm" onClick={copiar}>
          {copiado ? "¡Copiado!" : r.telefonoCliente}
        </Button>
      </div>
    </div>
  );
}

function Metrica({
  icon: Icon,
  label,
  valor,
  className,
  iconWrap,
}: {
  icon: typeof BellRing;
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
