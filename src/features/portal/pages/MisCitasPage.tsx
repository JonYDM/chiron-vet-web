import { useState, type ReactNode } from "react";
import { CalendarCheck, CalendarClock, Check, Syringe, UserX } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { BarraBusqueda } from "@/components/molecules/BarraBusqueda";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Badge, Button, SkeletonFila } from "@/components/ui";
import { useToast } from "@/components/feedback/useToast";
import { ApiError } from "@/lib/http";
import { useDebounce } from "@/lib/useDebounce";
import { estadoCitaLabel, estadoCitaTone } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { diaLocal, diasHasta, horaLocal, textoRelativo } from "@/lib/mascotas";
import { ConfirmacionCita, EstadoCita, TipoRecordatorio, type MiCita } from "@/types/api";
import { useMisCitas, useMisRecordatorios, useResponderAsistencia } from "../hooks";

/**
 * Portal del dueño: CITAS. Arriba las próximas (puede avisar si va o no), luego las vacunas
 * y desparasitaciones pendientes, y al final el historial de citas. Una cita de hoy sigue
 * aquí aunque ya pasó su hora, mientras la clínica no la marque.
 */
export function MisCitasPage() {
  const { data: citas, isLoading, isError } = useMisCitas();
  const { data: recordatorios } = useMisRecordatorios();
  const [texto, setTexto] = useState("");
  const q = useDebounce(texto).trim().toLowerCase();
  const coincide = (...campos: string[]) => !q || campos.some((c) => c.toLowerCase().includes(q));

  const todas = (citas ?? []).filter((c) => coincide(c.mascotaNombre, c.motivo));
  const proximas = todas
    .filter((c) => c.estado === EstadoCita.Programada && diasHasta(diaLocal(c.fechaHora)) >= 0)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  const anteriores = todas.filter((c) => !proximas.includes(c));

  // Vacunas/desparasitaciones (las citas ya salen arriba con su propia card).
  const aplicaciones = (recordatorios ?? [])
    .filter((r) => r.tipo === TipoRecordatorio.ProximaAplicacion && diasHasta(r.fecha) >= 0)
    .filter((r) => coincide(r.nombreMascota, r.detalle))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const sinNada = proximas.length === 0 && aplicaciones.length === 0 && anteriores.length === 0;
  const hayDatos = (citas?.length ?? 0) > 0 || (recordatorios?.length ?? 0) > 0;

  return (
    <PantallaConHeader
      titulo="Citas"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <CalendarCheck className="h-4 w-4 text-primary-container" aria-hidden />
          {proximas.length > 0
            ? `${proximas.length} próxima${proximas.length === 1 ? "" : "s"}`
            : "Citas y vacunas de tus mascotas"}
        </p>
      }
    >
      <div className="flex flex-col gap-4">
      <BarraBusqueda valor={texto} onChange={setTexto} placeholder="Buscar por mascota o motivo" />
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
          No se pudieron cargar tus citas.
        </div>
      ) : sinNada ? (
        q && hayDatos ? (
          <EmptyState titulo="Sin resultados" descripcion="Ninguna cita o vacuna coincide con la búsqueda." />
        ) : (
          <EmptyState titulo="Todo al día" descripcion="No tienes citas ni vacunas pendientes por ahora." />
        )
      ) : (
        <div className="flex flex-col gap-6">
          {proximas.length > 0 && (
            <Seccion titulo="Próximas citas">
              {proximas.map((c) => (
                <CitaProxima key={c.id} cita={c} />
              ))}
            </Seccion>
          )}

          {aplicaciones.length > 0 && (
            <Seccion titulo="Vacunas y desparasitaciones">
              {aplicaciones.map((r, i) => (
                <div
                  key={`${r.nombreMascota}-${r.fecha}-${i}`}
                  className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
                    <Syringe className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-lg font-bold text-on-surface">{r.nombreMascota}</p>
                    <p className="truncate text-body-sm text-on-surface-variant">{r.detalle}</p>
                    <p className="text-body-sm text-on-surface-variant">{formatDate(r.fecha)}</p>
                  </div>
                  <Badge tone={diasHasta(r.fecha) <= 7 ? "warning" : "neutral"}>{textoRelativo(r.fecha)}</Badge>
                </div>
              ))}
            </Seccion>
          )}

          {anteriores.length > 0 && (
            <Seccion titulo="Historial de citas">
              {anteriores.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3.5 opacity-90"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-container text-on-surface-variant">
                    <CalendarClock className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md font-bold text-on-surface">
                      {c.mascotaNombre} · {c.motivo}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {formatDate(diaLocal(c.fechaHora))} · {horaLocal(c.fechaHora)}
                    </p>
                  </div>
                  {c.estado === EstadoCita.Programada ? (
                    // Ya pasó pero la clínica no la marcó: "Programada" confundiría al dueño.
                    <Badge tone="neutral">Sin registrar</Badge>
                  ) : (
                    <Badge tone={estadoCitaTone(c.estado)}>{estadoCitaLabel[c.estado]}</Badge>
                  )}
                </div>
              ))}
            </Seccion>
          )}
        </div>
      )}
      </div>
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

/** Cita próxima: cuándo, para quién, y la respuesta del dueño (editable). */
function CitaProxima({ cita: c }: { cita: MiCita }) {
  const responder = useResponderAsistencia();
  const toast = useToast();
  const [editando, setEditando] = useState(false);
  const dia = diaLocal(c.fechaHora);
  const respondio = c.confirmacion !== ConfirmacionCita.Pendiente;

  function enviar(asistira: boolean) {
    responder.mutate(
      { citaId: c.id, asistira },
      {
        onSuccess: () => {
          setEditando(false);
          toast.exito(asistira ? "¡Listo! La clínica sabrá que vas." : "Avisamos a la clínica que no podrás ir.");
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "No se pudo enviar tu respuesta."),
      },
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/40 px-3 py-1 text-tertiary">
          <CalendarClock className="h-4 w-4" aria-hidden />
          <span className="tabular whitespace-nowrap text-label-md font-bold">
            {textoRelativo(dia)} · {horaLocal(c.fechaHora)}
          </span>
        </span>
        <span className="text-body-sm text-on-surface-variant">{formatDate(dia)}</span>
      </div>

      <div>
        <p className="text-headline-sm font-bold leading-tight text-on-surface">{c.mascotaNombre}</p>
        <p className="mt-0.5 text-body-md text-on-surface-variant">{c.motivo}</p>
      </div>

      {respondio && !editando ? (
        <div className="flex items-center justify-between gap-2 border-t border-outline-variant/20 pt-3">
          {c.confirmacion === ConfirmacionCita.Confirmada ? (
            <span className="inline-flex items-center gap-1.5 text-label-md font-semibold text-success">
              <Check className="h-4 w-4" aria-hidden />
              Confirmaste que vas
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-label-md font-semibold text-[#B45309]">
              <UserX className="h-4 w-4" aria-hidden />
              Avisaste que no podrás ir
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditando(true)}>
            Cambiar
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
          <Button size="sm" fullWidth loading={responder.isPending && responder.variables?.asistira} onClick={() => enviar(true)}>
            <Check className="h-4 w-4" aria-hidden />
            Voy a asistir
          </Button>
          <Button
            variant="soft"
            size="sm"
            fullWidth
            loading={responder.isPending && responder.variables?.asistira === false}
            onClick={() => enviar(false)}
          >
            <UserX className="h-4 w-4" aria-hidden />
            No podré ir
          </Button>
        </div>
      )}
    </div>
  );
}
