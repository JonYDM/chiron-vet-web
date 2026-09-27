import { Bell, CalendarClock, Syringe } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Badge, Card, CardContent, Spinner } from "@/components/ui";
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
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando recordatorios…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar los recordatorios.
          </CardContent>
        </Card>
      ) : recordatorios && recordatorios.length > 0 ? (
        <ul className="space-y-3">
          {recordatorios.map((r, i) => {
            const esVacuna = r.tipo === TipoRecordatorio.ProximaAplicacion;
            return (
              <li key={`${r.clienteId}-${i}`}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-[#9A6A00]">
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
              </li>
            );
          })}
        </ul>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-hairline text-ink-soft">
              <Bell className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-semibold text-ink">Todo al día 🎉</p>
            <p className="max-w-xs text-sm text-ink-soft">
              No tienes recordatorios pendientes por ahora.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
