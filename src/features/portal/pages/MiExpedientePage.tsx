import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarClock, FileText, Syringe } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Badge, Card, CardContent, Spinner } from "@/components/ui";
import { tipoRegistroLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { TipoRegistroMedico } from "@/types/api";
import { useMiExpediente } from "../hooks";

/** Expediente de solo lectura de una de MIS mascotas (F4.2). */
export function MiExpedientePage() {
  const { mascotaId = "" } = useParams();
  const { data: registros, isLoading, isError } = useMiExpediente(mascotaId);

  return (
    <div>
      <Link
        to="/portal"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Mis mascotas
      </Link>

      <PageHeader
        titulo="Historial médico"
        descripcion="Consultas, vacunas y tratamientos"
      />

      {isLoading ? (
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando historial…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudo cargar el historial.
          </CardContent>
        </Card>
      ) : registros && registros.length > 0 ? (
        <ul className="space-y-3">
          {registros.map((r) => {
            const esVacuna =
              r.tipo === TipoRegistroMedico.Vacuna ||
              r.tipo === TipoRegistroMedico.Desparasitacion;
            return (
              <li key={r.id}>
                <Card>
                  <CardContent className="flex gap-3 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                      {esVacuna ? (
                        <Syringe className="h-5 w-5" aria-hidden />
                      ) : (
                        <FileText className="h-5 w-5" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="primary">{tipoRegistroLabel[r.tipo]}</Badge>
                        <span className="text-xs text-ink-soft">
                          {formatDate(r.fecha)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-ink">{r.descripcion}</p>
                      {r.fechaProximaAplicacion && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9A6A00]">
                          <CalendarClock className="h-4 w-4" aria-hidden />
                          Próxima: {formatDate(r.fechaProximaAplicacion)}
                        </p>
                      )}
                    </div>
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
              <FileText className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-semibold text-ink">Sin historial</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Aún no hay registros médicos para esta mascota.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
