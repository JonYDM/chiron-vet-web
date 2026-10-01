import { useParams } from "react-router-dom";
import { AlertTriangle, CalendarClock, FileText, Scissors, Stethoscope, Syringe, type LucideIcon } from "lucide-react";
import { Avatar, Badge, SkeletonFila } from "@/components/ui";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { PaginaError } from "@/components/organisms/PaginaError";
import { especieLabel, sexoLabel, tipoRegistroLabel } from "@/lib/enums";
import { edadEnAnios, formatDate } from "@/lib/format";
import { diasHasta, textoRelativo } from "@/lib/mascotas";
import { TipoRegistroMedico } from "@/types/api";
import { GaleriaFotos } from "@/features/mascotas/components/GaleriaFotos";
import { useMiExpediente, useMisMascotas } from "../hooks";

/** Ícono y color por tipo de registro (vacunas en teal, cirugía en terracota, resto neutro). */
const ESTILO_TIPO: Record<TipoRegistroMedico, { icon: LucideIcon; clase: string }> = {
  [TipoRegistroMedico.Consulta]: { icon: Stethoscope, clase: "bg-surface-container-high text-tertiary" },
  [TipoRegistroMedico.Vacuna]: { icon: Syringe, clase: "bg-primary-fixed/40 text-tertiary" },
  [TipoRegistroMedico.Desparasitacion]: { icon: Syringe, clase: "bg-primary-fixed/40 text-tertiary" },
  [TipoRegistroMedico.Cirugia]: { icon: Scissors, clase: "bg-secondary-fixed text-st-secondary" },
  [TipoRegistroMedico.Otro]: { icon: FileText, clase: "bg-surface-container-high text-on-surface-variant" },
};

/**
 * Perfil de MI mascota (portal): mismo maquetado que el perfil del veterinario, en solo
 * lectura (sin acciones): datos, alerta médica, próxima aplicación, galería e historial.
 */
export function MiExpedientePage() {
  const { mascotaId = "" } = useParams();
  const { data: mascotas, isLoading: cargandoMascotas } = useMisMascotas();
  const { data: registros, isLoading: cargandoRegistros, isError } = useMiExpediente(mascotaId);
  const mascota = mascotas?.find((m) => m.id === mascotaId);
  const edad = mascota ? edadEnAnios(mascota.fechaNacimiento) : null;

  // Próxima aplicación pendiente (hoy cuenta como pendiente).
  const proxima = (registros ?? [])
    .filter((r) => r.fechaProximaAplicacion && diasHasta(r.fechaProximaAplicacion) >= 0)
    .sort((a, b) => a.fechaProximaAplicacion!.localeCompare(b.fechaProximaAplicacion!))[0];

  // La mascota no es mía o no existe.
  if (!cargandoMascotas && !mascota) {
    return (
      <PaginaError
        codigo="404"
        titulo="Mascota no encontrada"
        descripcion="Esta mascota no existe o no está registrada a tu nombre."
        irA="/portal"
        irATexto="Ver mis mascotas"
      />
    );
  }

  return (
    <PantallaConHeader titulo="Acerca de..." volverA="/portal" volverTexto="Mis mascotas" tituloSuave>
      <div className="flex flex-col gap-4">
        {/* Tarjeta de la mascota */}
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar nombre={mascota?.nombre ?? "?"} size="lg" tone="accent" src={mascota?.fotoPerfilUrl} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-headline-md font-bold text-on-surface">{mascota?.nombre ?? "Mi mascota"}</h2>
              {mascota && (
                <p className="text-body-sm text-on-surface-variant">
                  {especieLabel[mascota.especie]}
                  {mascota.raza ? ` · ${mascota.raza}` : ""}
                  {edad != null ? ` · ${edad} ${edad === 1 ? "año" : "años"}` : ""}
                </p>
              )}
            </div>
          </div>
          {mascota && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Dato label="Sexo" valor={sexoLabel[mascota.sexo]} />
              <Dato label="Peso" valor={mascota.pesoKg != null ? `${mascota.pesoKg} kg` : "—"} />
              <Dato label="Esterilizado" valor={mascota.esterilizado == null ? "—" : mascota.esterilizado ? "Sí" : "No"} />
            </div>
          )}
        </div>

        {/* Alerta médica */}
        {mascota?.padecimientos && (
          <div className="flex items-start gap-3 rounded-2xl bg-error-container/70 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-error-st text-white">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-label-sm font-bold uppercase tracking-wide text-on-error-container">Alerta médica</p>
              <p className="mt-0.5 text-body-sm font-medium text-on-error-container">{mascota.padecimientos}</p>
            </div>
          </div>
        )}

        {/* Próxima dosis / revisión */}
        {proxima && (
          <div className="flex items-center gap-3 rounded-2xl bg-secondary-fixed/50 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-fixed text-on-secondary-fixed-variant">
              <CalendarClock className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-label-sm font-semibold uppercase tracking-wide text-on-secondary-fixed-variant">
                Próxima {tipoRegistroLabel[proxima.tipo].toLowerCase()}
              </p>
              <p className="text-body-md font-bold text-on-surface">{formatDate(proxima.fechaProximaAplicacion!)}</p>
            </div>
            <Badge tone={diasHasta(proxima.fechaProximaAplicacion!) <= 7 ? "warning" : "neutral"}>
              {textoRelativo(proxima.fechaProximaAplicacion!)}
            </Badge>
          </div>
        )}

        {/* Galería (solo lectura, endpoint del portal) */}
        <GaleriaFotos mascotaId={mascotaId} puedeEditar={false} portal />

        {/* Historial clínico */}
        <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary-container" aria-hidden />
            <h2 className="text-headline-sm font-bold text-on-surface">Historial clínico</h2>
          </div>
          {cargandoRegistros ? (
            <div className="flex flex-col gap-3">
              <SkeletonFila />
              <SkeletonFila />
            </div>
          ) : isError ? (
            <p className="py-6 text-center text-body-sm text-error-st">No se pudo cargar el historial.</p>
          ) : registros && registros.length > 0 ? (
            <div className="flex flex-col gap-3">
              {registros.map((r) => {
                const estilo = ESTILO_TIPO[r.tipo] ?? ESTILO_TIPO[TipoRegistroMedico.Otro];
                return (
                  <div key={r.id} className="flex gap-3 rounded-xl bg-surface-container p-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${estilo.clase}`}>
                      <estilo.icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="primary">{tipoRegistroLabel[r.tipo]}</Badge>
                        <span className="text-body-sm text-on-surface-variant">{formatDate(r.fecha)}</span>
                      </div>
                      <p className="mt-1.5 text-body-md text-on-surface">{r.descripcion}</p>
                      {r.diagnostico && (
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                          <span className="font-semibold text-on-surface">Dx:</span> {r.diagnostico}
                        </p>
                      )}
                      {r.fechaProximaAplicacion && (
                        <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/30 px-2.5 py-0.5 text-label-sm font-semibold text-tertiary">
                          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                          Próxima: {formatDate(r.fechaProximaAplicacion)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-body-sm text-on-surface-variant">Aún no hay registros médicos.</p>
          )}
        </section>
      </div>
    </PantallaConHeader>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl bg-surface-container p-3 text-center">
      <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="tabular mt-0.5 text-label-lg font-bold text-on-surface">{valor}</p>
    </div>
  );
}
