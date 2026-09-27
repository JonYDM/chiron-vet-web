import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarClock, FileText, Syringe } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Badge, Card, CardContent, SkeletonFila } from "@/components/ui";
import { Reveal } from "@/lib/anim";
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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudo cargar el historial.
          </CardContent>
        </Card>
      ) : registros && registros.length > 0 ? (
        <Reveal stagger className="space-y-3">
          {registros.map((r) => {
            const esVacuna =
              r.tipo === TipoRegistroMedico.Vacuna ||
              r.tipo === TipoRegistroMedico.Desparasitacion;
            return (
              <div key={r.id}>
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
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-accent-strong">
                          <CalendarClock className="h-4 w-4" aria-hidden />
                          Próxima: {formatDate(r.fechaProximaAplicacion)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </Reveal>
      ) : (
        <EmptyState
          titulo="Sin historial"
          descripcion="Aún no hay registros médicos para esta mascota."
        />
      )}
    </div>
  );
}
