import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Badge, Button, Card, CardContent, Spinner } from "@/components/ui";
import { estadoCitaLabel, estadoCitaTone } from "@/lib/enums";
import { formatDateTime } from "@/lib/format";
import { useProximasCitas } from "../hooks";
import { AgendarCitaModal } from "../components/AgendarCitaModal";

/** Página de agenda: próximas citas de la veterinaria (F3.4). */
export function CitasPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const { data: citas, isLoading, isError } = useProximasCitas();

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
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando citas…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar las citas.
          </CardContent>
        </Card>
      ) : citas && citas.length > 0 ? (
        <ul className="space-y-3">
          {citas.map((c) => (
            <li key={c.id}>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
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
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-hairline text-ink-soft">
              <CalendarDays className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-semibold text-ink">Sin citas próximas</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Agenda la primera cita con el botón de arriba.
            </p>
          </CardContent>
        </Card>
      )}

      <AgendarCitaModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </div>
  );
}
