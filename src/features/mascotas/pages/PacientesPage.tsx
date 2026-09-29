import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, PawPrint, Plus, Search, Stethoscope, User } from "lucide-react";
import { Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { especieLabel } from "@/lib/enums";
import { EspecieMascota } from "@/types/api";
import { useDebounce } from "@/lib/useDebounce";
import { usePacientes } from "../hooks";
import type { MascotaConDueno } from "../api";
import { MascotaModal } from "@/features/clientes/components/MascotaModal";

/**
 * Vista Pacientes: lista TODAS las mascotas de la veterinaria con búsqueda.
 * Requiere el endpoint GET /mascotas (backend); mientras no exista, muestra un estado
 * elegante de "próximamente" (fallback). Cada paciente lleva a su Perfil de Paciente.
 */
export function PacientesPage() {
  const [texto, setTexto] = useState("");
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  const textoBuscado = useDebounce(texto);
  const { data, isLoading, isError } = usePacientes(textoBuscado);

  const pacientes = data?.items ?? [];
  const noDisponible = data?.noDisponible;

  return (
    <PantallaConHeader
      titulo="Pacientes"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <PawPrint className="h-4 w-4 text-primary-container" aria-hidden />
          {pacientes.length === 0 ? "Mascotas de la clínica" : `${pacientes.length} paciente${pacientes.length === 1 ? "" : "s"}`}
        </p>
      }
      accion={
        <Button size="icon" onClick={() => setNuevaAbierta(true)} aria-label="Nueva mascota">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            variant="soft"
            aria-label="Buscar pacientes"
            placeholder="Buscar por nombre de mascota"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : noDisponible ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest p-8 text-center shadow-soft">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary-container">
              <Stethoscope className="h-7 w-7" aria-hidden />
            </div>
            <p className="text-headline-sm font-bold text-on-surface">Pacientes en camino</p>
            <p className="max-w-xs text-body-sm text-on-surface-variant">
              El listado global de pacientes estará disponible muy pronto. Por ahora puedes
              ver las mascotas desde cada cliente.
            </p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar los pacientes. Intenta de nuevo.
          </div>
        ) : pacientes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pacientes.map((m) => (
              <PacienteCard key={m.id} mascota={m} />
            ))}
          </div>
        ) : (
          <EmptyState
            titulo="Sin pacientes"
            descripcion={
              textoBuscado
                ? "No hay resultados para tu búsqueda."
                : "Aún no hay mascotas registradas."
            }
          />
        )}
      </div>

      {/* Alta de mascota (con selector de cliente dentro del modal). */}
      <MascotaModal open={nuevaAbierta} onClose={() => setNuevaAbierta(false)} />
    </PantallaConHeader>
  );
}

/** Tono de badge por especie (para dar color y distinguir de un vistazo). */
function toneEspecie(especie: EspecieMascota): "primary" | "info" | "warning" | "success" | "neutral" {
  switch (especie) {
    case EspecieMascota.Perro:
      return "primary";
    case EspecieMascota.Gato:
      return "warning";
    case EspecieMascota.Ave:
      return "info";
    case EspecieMascota.Conejo:
      return "success";
    default:
      return "neutral";
  }
}

function PacienteCard({ mascota }: { mascota: MascotaConDueno }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() =>
        navigate(`/app/mascotas/${mascota.id}`, {
          state: {
            mascota: {
              id: mascota.id,
              nombre: mascota.nombre,
              especie: mascota.especie,
              raza: mascota.raza,
              sexo: mascota.sexo,
              fechaNacimiento: mascota.fechaNacimiento,
              pesoKg: mascota.pesoKg,
              padecimientos: mascota.padecimientos,
              esterilizado: mascota.esterilizado,
              activo: mascota.activo,
              fotoPerfilUrl: mascota.fotoPerfilUrl,
              clienteId: mascota.clienteId,
            },
          },
        })
      }
      className="group flex w-full items-center gap-3.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 text-left shadow-soft transition-colors active:bg-surface-container"
    >
      {/* Avatar de la mascota */}
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-fixed/40 text-tertiary">
        {mascota.fotoPerfilUrl ? (
          <img src={mascota.fotoPerfilUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <PawPrint className="h-7 w-7" aria-hidden />
        )}
      </div>

      {/* Identidad: nombre grande + badge especie + dueño */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-headline-sm font-bold leading-tight text-on-surface">
            {mascota.nombre}
          </span>
          <Badge tone={toneEspecie(mascota.especie)}>{especieLabel[mascota.especie]}</Badge>
          {!mascota.activo && <Badge tone="danger">Inactivo</Badge>}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-body-sm text-on-surface-variant">
          <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{mascota.clienteNombre}</span>
          {mascota.raza && <span className="truncate text-outline">· {mascota.raza}</span>}
        </p>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-on-surface-variant/50 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </button>
  );
}
