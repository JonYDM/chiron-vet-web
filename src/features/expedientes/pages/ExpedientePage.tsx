import { useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarClock, FileText, Plus, Syringe } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Badge, Button, Card, CardContent, SkeletonFila } from "@/components/ui";
import { usePermisos } from "@/lib/usePermisos";
import { tipoRegistroLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { TipoRegistroMedico } from "@/types/api";
import { useExpediente } from "../hooks";
import { AgregarRegistroModal } from "../components/AgregarRegistroModal";

/** Página del expediente médico de una mascota (F3.3). */
export function ExpedientePage() {
  const { mascotaId = "" } = useParams();
  const [modalAbierto, setModalAbierto] = useState(false);
  const { data: registros, isLoading, isError } = useExpediente(mascotaId);
  const p = usePermisos();

  // Solo quien puede editar el expediente ve el botón de agregar.
  const puedeAgregar = p("editar_expediente");

  return (
    <div>
      <PageHeader
        titulo="Expediente médico"
        descripcion="Historial clínico de la mascota"
        accion={
          puedeAgregar ? (
            <Button onClick={() => setModalAbierto(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Agregar
            </Button>
          ) : undefined
        }
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
            No se pudo cargar el expediente.
          </CardContent>
        </Card>
      ) : registros && registros.length > 0 ? (
        <div className="space-y-3">
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
                      {r.diagnostico && (
                        <p className="mt-1 text-sm text-ink-soft">
                          <span className="font-medium text-ink">Diagnóstico:</span>{" "}
                          {r.diagnostico}
                        </p>
                      )}
                      {r.tratamiento && (
                        <p className="mt-1 text-sm text-ink-soft">
                          <span className="font-medium text-ink">Tratamiento:</span>{" "}
                          {r.tratamiento}
                        </p>
                      )}
                      {(r.pesoKg != null || r.temperaturaC != null) && (
                        <p className="mt-1 text-sm text-ink-soft">
                          {r.pesoKg != null && <>Peso: {r.pesoKg} kg&nbsp;&nbsp;</>}
                          {r.temperaturaC != null && <>Temp: {r.temperaturaC} °C</>}
                        </p>
                      )}
                      {r.notas && (
                        <p className="mt-1 text-sm italic text-ink-soft">{r.notas}</p>
                      )}
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
        </div>
      ) : (
        <EmptyState
          titulo="Expediente vacío"
          descripcion="Aún no hay registros médicos para esta mascota."
        />
      )}

      {puedeAgregar && (
        <AgregarRegistroModal
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          mascotaId={mascotaId}
        />
      )}
    </div>
  );
}
