import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Copy, PawPrint, Phone, Plus, Search, Users } from "lucide-react";
import { Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Paginacion } from "@/components/molecules/Paginacion";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/feedback/useToast";
import { useDebounce } from "@/lib/useDebounce";
import { FiltroEstado, type Cliente } from "@/types/api";
import { useClientes } from "../hooks";
import { CrearClienteModal } from "../components/CrearClienteModal";

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
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Users className="h-4 w-4 text-primary-container" aria-hidden />
          {clientes.length === 0 ? "Directorio de la clínica" : `${clientes.length} en la lista`}
        </p>
      }
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
            <div className="flex flex-col gap-3">
              {clientes.map((c) => (
                <ClienteFila key={c.id} cliente={c} />
              ))}
            </div>
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

      <CrearClienteModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </PantallaConHeader>
  );
}

/**
 * Card de cliente calcada del patrón "sala de espera" de Stitch:
 * fila superior (avatar cuadrado + nombre + chip de estado + metadatos) y barra
 * inferior (surface-container-low) con el teléfono y acción de copiar.
 */
function ClienteFila({ cliente }: { cliente: Cliente }) {
  const navigate = useNavigate();
  const toast = useToast();
  const iniciales = cliente.nombre.trim().split(/\s+/).slice(0, 2).map((s) => s[0] ?? "").join("");

  function irADetalle() {
    navigate(`/app/clientes/${cliente.id}`, { state: { cliente } });
  }

  async function copiarTelefono() {
    try {
      await navigator.clipboard.writeText(cliente.telefono);
      toast.exito("Teléfono copiado");
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  return (
    <div
      className="flex flex-col gap-2.5 rounded-xl border-t border-white/60 bg-surface-container-lowest p-3.5"
      style={{
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 10px -3px rgba(8,76,76,0.10), inset 0 -1px 1px rgba(15,23,42,0.04)",
      }}
    >
      {/* Fila superior */}
      <button onClick={irADetalle} className="flex items-start gap-3 text-left">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-label-md font-bold uppercase text-primary-container">
          {iniciales}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-headline-sm font-bold text-on-surface">{cliente.nombre}</span>
            <Badge tone={cliente.activo ? "success" : "danger"}>
              {cliente.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-body-sm text-on-surface-variant">
            {cliente.totalMascotas != null && (
              <span className="inline-flex items-center gap-1">
                <PawPrint className="h-3.5 w-3.5" aria-hidden />
                {cliente.totalMascotas} {cliente.totalMascotas === 1 ? "mascota" : "mascotas"}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Registrado: {formatDate(cliente.fechaRegistro)}
            </span>
          </p>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-on-surface-variant/40" aria-hidden />
      </button>

      {/* Barra inferior: teléfono + copiar (toast) */}
      <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-label-md text-on-surface">
          <Phone className="h-4 w-4 text-primary-container" aria-hidden />
          {cliente.telefono}
        </span>
        <button
          onClick={copiarTelefono}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-label-sm font-semibold text-primary-container transition-colors hover:bg-primary-container/10"
          aria-label="Copiar teléfono"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          Copiar
        </button>
      </div>
    </div>
  );
}
