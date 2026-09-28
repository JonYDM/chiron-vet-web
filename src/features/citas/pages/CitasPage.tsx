import { useMemo, useState } from "react";
import { CalendarClock, Check, Plus, Search, X, UserX } from "lucide-react";
import { Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { cn } from "@/lib/cn";
import { estadoCitaLabel, estadoCitaTone, especieLabel } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { useDebounce } from "@/lib/useDebounce";
import { EstadoCita, type Cita } from "@/types/api";
import { usePacientes } from "@/features/mascotas/hooks";
import type { MascotaConDueno } from "@/features/mascotas/api";
import { useCambiarEstadoCita, useProximasCitas } from "../hooks";
import { AgendarCitaModal } from "../components/AgendarCitaModal";

/** Chips de filtro por estado (null = todas). */
const CHIPS: { valor: EstadoCita | null; label: string }[] = [
  { valor: null, label: "Todas" },
  { valor: EstadoCita.Programada, label: "Programadas" },
  { valor: EstadoCita.Atendida, label: "Atendidas" },
  { valor: EstadoCita.NoAsistio, label: "No asistió" },
  { valor: EstadoCita.Cancelada, label: "Canceladas" },
];

function agruparPorDia(citas: Cita[]) {
  const grupos = new Map<string, Cita[]>();
  for (const c of citas) {
    const dia = c.fechaHora.slice(0, 10);
    const arr = grupos.get(dia) ?? [];
    arr.push(c);
    grupos.set(dia, arr);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

/** Página de agenda: próximas citas con búsqueda, filtro por estado y acciones. */
export function CitasPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<EstadoCita | null>(null);
  const textoBuscado = useDebounce(texto);

  const { data: citas, isLoading, isError } = useProximasCitas();
  const { data: pacientesData } = usePacientes();
  const cambiar = useCambiarEstadoCita();

  const porId = useMemo(() => {
    const mapa = new Map<string, MascotaConDueno>();
    for (const m of pacientesData?.items ?? []) mapa.set(m.id, m);
    return mapa;
  }, [pacientesData]);

  // Filtro por estado + búsqueda (motivo / paciente / dueño).
  const filtradas = useMemo(() => {
    const q = textoBuscado.trim().toLowerCase();
    return (citas ?? []).filter((c) => {
      if (filtro !== null && c.estado !== filtro) return false;
      if (!q) return true;
      const m = porId.get(c.mascotaId);
      return (
        c.motivo.toLowerCase().includes(q) ||
        (m?.nombre.toLowerCase().includes(q) ?? false) ||
        (m?.clienteNombre.toLowerCase().includes(q) ?? false)
      );
    });
  }, [citas, filtro, textoBuscado, porId]);

  const grupos = useMemo(() => agruparPorDia(filtradas), [filtradas]);
  const total = citas?.length ?? 0;

  return (
    <PantallaConHeader
      titulo="Citas"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <CalendarClock className="h-4 w-4 text-primary-container" aria-hidden />
          {total === 0 ? "Agenda de la clínica" : `${total} cita${total === 1 ? "" : "s"} próxima${total === 1 ? "" : "s"}`}
        </p>
      }
      accion={
        <Button size="icon" onClick={() => setModalAbierto(true)} aria-label="Agendar cita">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Buscador */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            variant="soft"
            aria-label="Buscar citas"
            placeholder="Buscar por paciente, dueño o motivo"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {/* Chips de filtro por estado */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((chip) => {
            const activo = filtro === chip.valor;
            return (
              <button
                key={chip.label}
                onClick={() => setFiltro(chip.valor)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-label-md font-semibold transition-colors",
                  activo
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar las citas.
          </div>
        ) : filtradas.length > 0 ? (
          <div className="flex flex-col gap-5">
            {grupos.map(([dia, delDia]) => (
              <section key={dia} className="flex flex-col gap-3">
                <h2 className="text-label-lg font-bold text-on-surface-variant">{formatDate(dia)}</h2>
                <div className="flex flex-col gap-3">
                  {delDia.map((c) => (
                    <CitaCard
                      key={c.id}
                      cita={c}
                      mascota={porId.get(c.mascotaId)}
                      cambiando={cambiar.isPending && cambiar.variables?.citaId === c.id}
                      onAccion={(accion) => cambiar.mutate({ citaId: c.id, accion })}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            titulo={textoBuscado || filtro !== null ? "Sin resultados" : "Sin citas próximas"}
            descripcion={
              textoBuscado || filtro !== null
                ? "No hay citas que coincidan con el filtro."
                : "Agenda la primera cita con el botón de arriba 🐾"
            }
          />
        )}
      </div>

      <AgendarCitaModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </PantallaConHeader>
  );
}

/** Card de una cita: cabecera clara (hora + estado), paciente/dueño, motivo y acciones. */
function CitaCard({
  cita,
  mascota,
  cambiando,
  onAccion,
}: {
  cita: Cita;
  mascota?: MascotaConDueno;
  cambiando: boolean;
  onAccion: (accion: 1 | 2 | 3) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft">
      {/* Cabecera: hora + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/40 px-3 py-1 text-tertiary">
          <CalendarClock className="h-4 w-4" aria-hidden />
          <span className="tabular whitespace-nowrap text-label-md font-bold">{horaCorta(cita.fechaHora)}</span>
        </span>
        <Badge tone={estadoCitaTone(cita.estado)}>{estadoCitaLabel[cita.estado]}</Badge>
      </div>

      {/* Paciente + dueño */}
      <div>
        <p className="text-headline-sm font-bold leading-tight text-on-surface">
          {mascota ? mascota.nombre : "Cita"}
          {mascota && (
            <span className="ml-1.5 text-body-md font-normal text-on-surface-variant">
              {especieLabel[mascota.especie]}
            </span>
          )}
        </p>
        {mascota && (
          <p className="mt-0.5 truncate text-body-md text-on-surface-variant">
            Dueño: {mascota.clienteNombre}
          </p>
        )}
      </div>

      {/* Motivo */}
      <div className="rounded-xl bg-surface-container-low px-3 py-2">
        <p className="truncate text-body-md text-on-surface">{cita.motivo}</p>
      </div>

      {/* Acciones en UNA sola fila */}
      {cita.estado === EstadoCita.Programada && (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" fullWidth loading={cambiando} onClick={() => onAccion(1)}>
            <Check className="h-4 w-4" aria-hidden />
            Atender
          </Button>
          <Button size="sm" variant="warning" onClick={() => onAccion(3)} aria-label="No asistió">
            <UserX className="h-4 w-4" aria-hidden />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onAccion(2)} aria-label="Cancelar">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
