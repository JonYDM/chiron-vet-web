import { useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarClock, FileText, Plus, Syringe } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Badge, Button, Card, CardContent, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { tipoRegistroLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { RolUsuario, TipoRegistroMedico } from "@/types/api";
import { useExpediente } from "../hooks";
import { AgregarRegistroModal } from "../components/AgregarRegistroModal";

/** Página del expediente médico de una mascota (F3.3). */
export function ExpedientePage() {
  const { mascotaId = "" } = useParams();
  const { sesion } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  const { data: registros, isLoading, isError } = useExpediente(mascotaId);

  // Solo Admin y Veterinario pueden agregar al expediente (regla del backend).
  const puedeAgregar =
    sesion?.rol === RolUsuario.Administrador ||
    sesion?.rol === RolUsuario.Veterinario;

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
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando expediente…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudo cargar el expediente.
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
            <p className="font-semibold text-ink">Expediente vacío</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Aún no hay registros médicos para esta mascota.
            </p>
          </CardContent>
        </Card>
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
