import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, PawPrint, Plus, Search, Stethoscope } from "lucide-react";
import { Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { especieLabel } from "@/lib/enums";
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
              activo: mascota.activo,
              clienteId: mascota.clienteId,
            },
          },
        })
      }
      className="group flex w-full items-center gap-3.5 rounded-xl bg-surface-container-lowest p-3.5 text-left shadow-soft transition-colors active:bg-surface-container"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary-container">
        <PawPrint className="h-6 w-6" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-label-lg font-bold text-on-surface">{mascota.nombre}</span>
          {!mascota.activo && <Badge tone="danger">Inactivo</Badge>}
        </div>
        <p className="truncate text-body-sm text-on-surface-variant">
          {especieLabel[mascota.especie]}
          {mascota.raza ? ` · ${mascota.raza}` : ""} · {mascota.clienteNombre}
        </p>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-on-surface-variant/50 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </button>
  );
}
