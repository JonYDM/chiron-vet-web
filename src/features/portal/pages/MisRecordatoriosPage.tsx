import type { ReactNode } from "react";
import { BellRing, CalendarClock, Syringe } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Badge, SkeletonFila } from "@/components/ui";
import { tipoRecordatorioLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { diasHasta, textoRelativo } from "@/lib/mascotas";
import { TipoRecordatorio, type RecordatorioDetectado } from "@/types/api";
import { useMisRecordatorios } from "../hooks";

/** Portal del dueño: recordatorios de vacunas y citas, los más cercanos primero. */
export function MisRecordatoriosPage() {
  const { data: recordatorios, isLoading, isError } = useMisRecordatorios();
  const ordenados = [...(recordatorios ?? [])].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pendientes = ordenados.filter((r) => diasHasta(r.fecha) >= 0);
  const pasados = ordenados.filter((r) => diasHasta(r.fecha) < 0).reverse();

  return (
    <PantallaConHeader
      titulo="Recordatorios"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <BellRing className="h-4 w-4 text-primary-container" aria-hidden />
          {pendientes.length > 0
            ? `${pendientes.length} pendiente${pendientes.length === 1 ? "" : "s"}`
            : "Vacunas y citas de tus mascotas"}
        </p>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
          No se pudieron cargar los recordatorios.
        </div>
      ) : ordenados.length === 0 ? (
        <EmptyState titulo="Todo al día" descripcion="No tienes recordatorios pendientes por ahora." />
      ) : (
        <div className="flex flex-col gap-5">
          {pendientes.length > 0 && (
            <Seccion titulo="Próximos">
              {pendientes.map((r, i) => (
                <FilaRecordatorio key={`p-${r.clienteId}-${i}`} recordatorio={r} />
              ))}
            </Seccion>
          )}
          {pasados.length > 0 && (
            <Seccion titulo="Ya pasaron">
              {pasados.map((r, i) => (
                <FilaRecordatorio key={`v-${r.clienteId}-${i}`} recordatorio={r} pasado />
              ))}
            </Seccion>
          )}
        </div>
      )}
    </PantallaConHeader>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-label-sm font-bold uppercase tracking-wider text-outline">{titulo}</h2>
      {children}
    </section>
  );
}

function FilaRecordatorio({ recordatorio: r, pasado = false }: { recordatorio: RecordatorioDetectado; pasado?: boolean }) {
  const esVacuna = r.tipo === TipoRecordatorio.ProximaAplicacion;
  const dias = diasHasta(r.fecha);
  const tono = pasado ? "danger" : dias <= 7 ? "warning" : "neutral";
  return (
    <div
      className={
        "flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft " +
        (pasado ? "opacity-80" : "")
      }
    >
      <span
        className={
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl " +
          (esVacuna ? "bg-primary-fixed/40 text-tertiary" : "bg-secondary-fixed text-st-secondary")
        }
      >
        {esVacuna ? <Syringe className="h-5 w-5" aria-hidden /> : <CalendarClock className="h-5 w-5" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-label-lg font-bold text-on-surface">{r.nombreMascota}</p>
        <p className="truncate text-body-sm text-on-surface-variant">
          {tipoRecordatorioLabel[r.tipo]} · {r.detalle}
        </p>
        <p className="text-body-sm text-on-surface-variant">{formatDate(r.fecha)}</p>
      </div>
      <Badge tone={tono}>{textoRelativo(r.fecha)}</Badge>
    </div>
  );
}
