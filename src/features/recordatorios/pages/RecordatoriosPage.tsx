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

/** Agrupa los recordatorios por su fecha (para mostrarlos en secciones por día). */
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
  const [copiado, setCopiado] = useState<string | null>(null);

  const total = recordatorios?.length ?? 0;
  const aplicaciones =
    recordatorios?.filter((r) => r.tipo === TipoRecordatorio.ProximaAplicacion).length ?? 0;
  const citas = recordatorios?.filter((r) => r.tipo === TipoRecordatorio.Cita).length ?? 0;

  const grupos = useMemo(() => agruparPorFecha(recordatorios ?? []), [recordatorios]);

  async function copiarTelefono(tel: string) {
    try {
      await navigator.clipboard.writeText(tel);
      setCopiado(tel);
      toast.exito("Teléfono copiado");
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

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
      subtitulo="A quién contactar para que regrese"
      accion={
        total > 0 ? (
          <Button
            size="sm"
            onClick={enviarAvisos}
            loading={enviar.isPending}
            aria-label="Enviar avisos"
          >
            <Send className="h-4 w-4" aria-hidden />
            Avisar
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <Metrica icon={BellRing} label="Pendientes" valor={total} tone="primary" />
          <Metrica icon={Syringe} label="Aplicaciones" valor={aplicaciones} tone="accent" />
          <Metrica icon={CalendarClock} label="Citas" valor={citas} tone="accent" />
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
                <h2 className="text-label-lg font-bold text-on-surface-variant">
                  {formatDate(fecha)}
                </h2>
                <div className="flex flex-col gap-3">
                  {items.map((r, i) => {
                    const esVacuna = r.tipo === TipoRecordatorio.ProximaAplicacion;
                    return (
                      <div
                        key={`${r.clienteId}-${i}`}
                        className="flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                      >
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-strong">
                          {esVacuna ? (
                            <Syringe className="h-5 w-5" aria-hidden />
                          ) : (
                            <CalendarClock className="h-5 w-5" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-label-lg font-bold text-on-surface">
                            {r.nombreMascota}: {r.detalle}
                          </p>
                          <p className="truncate text-body-sm text-on-surface-variant">
                            {r.nombreCliente}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <Badge tone="warning">{tipoRecordatorioLabel[r.tipo]}</Badge>
                          <button
                            type="button"
                            onClick={() => copiarTelefono(r.telefonoCliente)}
                            className="flex items-center gap-1 text-body-sm font-medium text-primary-container transition-opacity active:opacity-60"
                          >
                            <Phone className="h-3.5 w-3.5" aria-hidden />
                            {copiado === r.telefonoCliente ? "¡Copiado!" : r.telefonoCliente}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            titulo="Todo al día 🎉"
            descripcion="No hay recordatorios pendientes por ahora."
          />
        )}
      </div>
    </PantallaConHeader>
  );
}

function Metrica({
  icon: Icon,
  label,
  valor,
  tone,
}: {
  icon: typeof BellRing;
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
