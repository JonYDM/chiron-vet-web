import { CalendarClock, Syringe } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Badge, Card, CardContent, SkeletonFila } from "@/components/ui";
import { tipoRecordatorioLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { TipoRecordatorio } from "@/types/api";
import { useMisRecordatorios } from "../hooks";

/** Portal del dueño: mis recordatorios (F4.3), in-app. */
export function MisRecordatoriosPage() {
  const { data: recordatorios, isLoading, isError } = useMisRecordatorios();

  return (
    <div>
      <PageHeader
        titulo="Recordatorios"
        descripcion="Próximas vacunas y citas de tus mascotas"
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar los recordatorios.
          </CardContent>
        </Card>
      ) : recordatorios && recordatorios.length > 0 ? (
        <div className="space-y-3">
          {recordatorios.map((r, i) => {
            const esVacuna = r.tipo === TipoRecordatorio.ProximaAplicacion;
            return (
              <div key={`${r.clienteId}-${i}`}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-strong">
                      {esVacuna ? (
                        <Syringe className="h-5 w-5" aria-hidden />
                      ) : (
                        <CalendarClock className="h-5 w-5" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">
                        {r.nombreMascota}: {r.detalle}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {formatDate(r.fecha)}
                      </p>
                    </div>
                    <Badge tone="warning">{tipoRecordatorioLabel[r.tipo]}</Badge>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          titulo="Todo al día 🎉"
          descripcion="No tienes recordatorios pendientes por ahora."
        />
      )}
    </div>
  );
}
