import { Link } from "react-router-dom";
import { ChevronRight, PawPrint } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Badge, Card, CardContent, Spinner } from "@/components/ui";
import { especieLabel, sexoLabel } from "@/lib/enums";
import { edadEnAnios } from "@/lib/format";
import { SexoMascota } from "@/types/api";
import { useMisMascotas } from "../hooks";

/** Portal del dueño: listado de mis mascotas (F4.2). */
export function MisMascotasPage() {
  const { data: mascotas, isLoading, isError } = useMisMascotas();

  return (
    <div>
      <PageHeader
        titulo="Mis mascotas"
        descripcion="Consulta el historial de tus peludos 🐾"
      />

      {isLoading ? (
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando mascotas…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar tus mascotas.
          </CardContent>
        </Card>
      ) : mascotas && mascotas.length > 0 ? (
        <div className="space-y-3">
          {mascotas.map((m) => {
            const edad = edadEnAnios(m.fechaNacimiento);
            return (
              <Link key={m.id} to={`/portal/mascotas/${m.id}`}>
                <Card className="transition-all duration-150 hover:shadow-lift active:scale-[0.99]">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                      <PawPrint className="h-6 w-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{m.nombre}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">{especieLabel[m.especie]}</Badge>
                        {m.sexo !== SexoMascota.NoEspecificado && (
                          <Badge tone="neutral">{sexoLabel[m.sexo]}</Badge>
                        )}
                        {edad !== null && (
                          <span className="text-sm text-ink-soft">
                            {edad} {edad === 1 ? "año" : "años"}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft" aria-hidden />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          titulo="Sin mascotas"
          descripcion="Aún no tienes mascotas registradas. Pídele a tu veterinaria que las agregue 🐾"
        />
      )}
    </div>
  );
}
