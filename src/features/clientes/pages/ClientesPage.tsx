import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Paginacion } from "@/components/molecules/Paginacion";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Reveal } from "@/lib/anim";
import { cn } from "@/lib/cn";
import { useDebounce } from "@/lib/useDebounce";
import { FiltroEstado } from "@/types/api";
import { useClientes } from "../hooks";
import { ClienteCard } from "../components/ClienteCard";
import { RegistroRapidoModal } from "../components/RegistroRapidoModal";

/**
 * Clientes & mascotas (calco Stitch): buscador, chips de filtro y tarjetas de cliente.
 * Filtros reales: Activos/Inactivos/Todos. "Con cita hoy" y "Con adeudo" son [MOCK]
 * (features futuras, ver docs). Conserva la logica (buscar, paginar, registrar).
 */

type FiltroChip =
  | { tipo: "estado"; valor: FiltroEstado; label: string }
  | { tipo: "mock"; valor: string; label: string };

const CHIPS: FiltroChip[] = [
  { tipo: "estado", valor: FiltroEstado.Activos, label: "Activos" },
  { tipo: "mock", valor: "cita-hoy", label: "Con cita hoy" }, // [MOCK] pendiente backend
  { tipo: "mock", valor: "adeudo", label: "Con adeudo" }, // [MOCK] pendiente backend
  { tipo: "estado", valor: FiltroEstado.Inactivos, label: "Inactivos" },
  { tipo: "estado", valor: FiltroEstado.Todos, label: "Todos" },
];

export function ClientesPage() {
  const [texto, setTexto] = useState("");
  const [chipActivo, setChipActivo] = useState<string>("estado-0"); // Activos por defecto
  const [estado, setEstado] = useState<FiltroEstado>(FiltroEstado.Activos);
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const textoBuscado = useDebounce(texto);

  const { data, isLoading, isError } = useClientes({ texto: textoBuscado, estado, pagina });
  const clientes = data?.items ?? [];

  function cambiarTexto(v: string) {
    setTexto(v);
    setPagina(1);
  }

  function seleccionarChip(chip: FiltroChip, idx: number) {
    setPagina(1);
    if (chip.tipo === "estado") {
      setChipActivo(`estado-${idx}`);
      setEstado(chip.valor);
    } else {
      // [MOCK] filtros aun sin backend: solo marca visualmente, no filtra.
      setChipActivo(`mock-${chip.valor}`);
    }
  }

  return (
    <PantallaConHeader
      titulo="Clientes"
      accion={
        <Button size="icon" onClick={() => setModalAbierto(true)} aria-label="Nuevo cliente">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Buscador (soft, sin borde) */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            variant="soft"
            aria-label="Buscar clientes"
            placeholder="Buscar por nombre o mascota"
            value={texto}
            onChange={(e) => cambiarTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {/* Chips de filtro (scroll horizontal) */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((chip, idx) => {
            const id = chip.tipo === "estado" ? `estado-${idx}` : `mock-${chip.valor}`;
            const activo = chipActivo === id;
            return (
              <button
                key={id}
                onClick={() => seleccionarChip(chip, idx)}
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
            No se pudieron cargar los clientes. Intenta de nuevo.
          </div>
        ) : clientes.length > 0 ? (
          <>
            <Reveal stagger className="flex flex-col gap-3">
              {clientes.map((c) => (
                <ClienteCard key={c.id} cliente={c} />
              ))}
            </Reveal>
            {data && (
              <Paginacion
                pagina={data.pagina}
                totalPaginas={data.totalPaginas}
                onCambio={setPagina}
              />
            )}
          </>
        ) : (
          <EmptyState
            titulo="Sin clientes"
            descripcion={
              textoBuscado
                ? "No hay resultados para tu búsqueda."
                : "Aún no hay clientes. Registra el primero."
            }
          />
        )}
      </div>

      <RegistroRapidoModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </PantallaConHeader>
  );
}
