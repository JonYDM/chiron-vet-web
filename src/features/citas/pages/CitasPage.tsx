import { useState } from "react";
import { CalendarDays, Check, Plus, X, UserX } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Badge, Button, Card, CardContent, SkeletonFila } from "@/components/ui";
import { estadoCitaLabel, estadoCitaTone } from "@/lib/enums";
import { formatDateTime } from "@/lib/format";
import { EstadoCita } from "@/types/api";
import { useCambiarEstadoCita, useProximasCitas } from "../hooks";
import { AgendarCitaModal } from "../components/AgendarCitaModal";

/** Página de agenda: próximas citas + acciones de estado (F3.4 + cambio de estado). */
export function CitasPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const { data: citas, isLoading, isError } = useProximasCitas();
  const cambiar = useCambiarEstadoCita();

  return (
    <div>
      <PageHeader
        titulo="Citas"
        descripcion="Próximas citas programadas"
        accion={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Agendar
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar las citas.
          </CardContent>
        </Card>
      ) : citas && citas.length > 0 ? (
        <div className="space-y-3">
          {citas.map((c) => (
            <div key={c.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                      <CalendarDays className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{c.motivo}</p>
                      <p className="text-sm text-ink-soft">
                        {formatDateTime(c.fechaHora)}
                      </p>
                    </div>
                    <Badge tone={estadoCitaTone(c.estado)}>
                      {estadoCitaLabel[c.estado]}
                    </Badge>
                  </div>

                  {c.estado === EstadoCita.Programada && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-hairline pt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={cambiar.isPending && cambiar.variables?.citaId === c.id}
                        onClick={() => cambiar.mutate({ citaId: c.id, accion: 1 })}
                      >
                        <Check className="h-4 w-4" aria-hidden />
                        Atender
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cambiar.mutate({ citaId: c.id, accion: 3 })}
                      >
                        <UserX className="h-4 w-4" aria-hidden />
                        No asistió
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cambiar.mutate({ citaId: c.id, accion: 2 })}
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          titulo="Sin citas próximas"
          descripcion="Agenda la primera cita con el botón de arriba 🐾"
        />
      )}

      <AgendarCitaModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </div>
  );
}
