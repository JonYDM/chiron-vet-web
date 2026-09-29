import { useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  Pencil,
  Plus,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { Avatar, Badge, Button } from "@/components/ui";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { especieLabel, sexoLabel, tipoRegistroLabel } from "@/lib/enums";
import { edadEnAnios, formatDate } from "@/lib/format";
import { usePermisos } from "@/lib/usePermisos";
import { TipoRegistroMedico, type Mascota } from "@/types/api";
import { useExpediente } from "@/features/expedientes/hooks";
import { AgregarRegistroModal } from "@/features/expedientes/components/AgregarRegistroModal";
import { useToast } from "@/components/feedback/useToast";
import { GaleriaFotos } from "../components/GaleriaFotos";
import { useMascota, useSubirFotoPerfil } from "../hooks";
import { MascotaModal } from "@/features/clientes/components/MascotaModal";

/**
 * Perfil de paciente (pantalla estrella, calco Stitch): alerta médica, datos del
 * paciente, acciones, galería de fotos (R2) y expediente clínico embebido.
 * La mascota llega por router state (al navegar desde Clientes); si se entra por URL
 * directa, se degrada mostrando lo esencial + expediente (que carga por id).
 */
export function PerfilPacientePage() {
  const { mascotaId = "" } = useParams();
  const location = useLocation();
  const mascotaState = (location.state as { mascota?: Mascota } | null)?.mascota ?? null;
  const { data: mascotaApi } = useMascota(mascotaId);
  // Prioriza los datos completos del backend; si no hay (endpoint ausente), usa el state.
  const mascota = mascotaApi ?? mascotaState;
  const p = usePermisos();
  const puedeEditar = p("editar_expediente");
  const [modalRegistro, setModalRegistro] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const inputPerfilRef = useRef<HTMLInputElement>(null);
  const subirPerfil = useSubirFotoPerfil(mascotaId);
  const toast = useToast();

  async function onFotoPerfil(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      await subirPerfil.mutateAsync(f);
      toast.exito("Foto de perfil actualizada 📸");
    } catch {
      toast.error("No se pudo subir la foto de perfil.");
    }
  }

  const { data: registros } = useExpediente(mascotaId);
  const proxima = registros?.find((r) => r.fechaProximaAplicacion)?.fechaProximaAplicacion;
  const edad = mascota ? edadEnAnios(mascota.fechaNacimiento) : null;

  return (
    <PantallaConHeader titulo="Acerca de..." volverA={-1} tituloSuave>
      <div className="flex flex-col gap-4">
        {/* Tarjeta del paciente */}
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar nombre={mascota?.nombre ?? "?"} size="lg" tone="accent" src={mascota?.fotoPerfilUrl} />
              <input
                ref={inputPerfilRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFotoPerfil}
              />
              <button
                onClick={() => inputPerfilRef.current?.click()}
                disabled={subirPerfil.isPending}
                className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-primary-container text-on-primary shadow-soft ring-2 ring-surface-container-lowest"
                aria-label="Cambiar foto de perfil"
              >
                <Pencil className="h-3 w-3" aria-hidden />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-headline-md font-bold text-on-surface">
                  {mascota?.nombre ?? "Paciente"}
                </h2>
                {mascota && (
                  <Badge tone={mascota.activo ? "success" : "danger"}>
                    {mascota.activo ? "Activo" : "Inactivo"}
                  </Badge>
                )}
              </div>
              {mascota && (
                <p className="text-body-sm text-on-surface-variant">
                  {especieLabel[mascota.especie]}
                  {mascota.raza ? ` · ${mascota.raza}` : ""}
                  {edad != null ? ` · ${edad} ${edad === 1 ? "año" : "años"}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Métricas del paciente */}
          {mascota && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <DatoPaciente label="Sexo" valor={sexoLabel[mascota.sexo]} />
              <DatoPaciente
                label="Peso"
                valor={mascota.pesoKg != null ? `${mascota.pesoKg} kg` : "—"}
              />
              <DatoPaciente
                label="Esterilizado"
                valor={mascota.esterilizado == null ? "—" : mascota.esterilizado ? "Sí" : "No"}
              />
            </div>
          )}
        </div>

        {/* Alerta médica (entre la card y las acciones) */}
        {mascota?.padecimientos && (
          <div className="flex items-start gap-3 rounded-2xl bg-error-container/70 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-error-st text-white">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-label-sm font-bold uppercase tracking-wide text-on-error-container">
                Alerta médica
              </p>
              <p className="mt-0.5 text-body-sm font-medium text-on-error-container">
                {mascota.padecimientos}
              </p>
            </div>
          </div>
        )}

        {/* Próxima cita / dosis */}
        {proxima && (
          <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/20 text-accent-strong">
              <CalendarClock className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-label-sm font-semibold uppercase tracking-wide text-accent-strong">
                Próxima dosis / revisión
              </p>
              <p className="text-body-md font-bold text-on-surface">{formatDate(proxima)}</p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-2">
          {puedeEditar && (
            <Button onClick={() => setModalRegistro(true)} className="h-12">
              <Plus className="h-4 w-4" aria-hidden />
              Nueva consulta
            </Button>
          )}
          {mascota && (
            <Button variant="soft" className="h-12" onClick={() => setModalEditar(true)}>
              <Pencil className="h-4 w-4" aria-hidden />
              Editar
            </Button>
          )}
        </div>

        {/* Galería de fotos (R2) */}
        <GaleriaFotos mascotaId={mascotaId} puedeEditar={puedeEditar} />

        {/* Expediente (timeline embebido) */}
        <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary-container" aria-hidden />
            <h2 className="text-headline-sm font-bold text-on-surface">Historial clínico</h2>
          </div>
          {registros && registros.length > 0 ? (
            <div className="flex flex-col gap-3">
              {registros.map((r) => {
                const esVacuna =
                  r.tipo === TipoRegistroMedico.Vacuna ||
                  r.tipo === TipoRegistroMedico.Desparasitacion;
                return (
                  <div key={r.id} className="flex gap-3 rounded-xl bg-surface-container p-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary-container">
                      {esVacuna ? (
                        <Syringe className="h-4 w-4" aria-hidden />
                      ) : (
                        <FileText className="h-4 w-4" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="primary">{tipoRegistroLabel[r.tipo]}</Badge>
                        <span className="text-body-sm text-on-surface-variant">
                          {formatDate(r.fecha)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-body-md text-on-surface">{r.descripcion}</p>
                      {r.diagnostico && (
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                          <span className="font-semibold text-on-surface">Dx:</span> {r.diagnostico}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-body-sm text-on-surface-variant">
              Aún no hay registros médicos.
            </p>
          )}
        </section>
      </div>

      {puedeEditar && (
        <AgregarRegistroModal
          open={modalRegistro}
          onClose={() => setModalRegistro(false)}
          mascotaId={mascotaId}
        />
      )}
      {mascota && (
        <MascotaModal
          open={modalEditar}
          onClose={() => setModalEditar(false)}
          clienteId={mascota.clienteId}
          mascota={mascota}
        />
      )}
    </PantallaConHeader>
  );
}

function DatoPaciente({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl bg-surface-container p-3 text-center">
      <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="tabular mt-0.5 text-label-lg font-bold text-on-surface">{valor}</p>
    </div>
  );
}
