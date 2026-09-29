import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  MapPin,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  UserCog,
} from "lucide-react";
import { Badge, Button, Drawer, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { useToast } from "@/components/feedback/useToast";
import { useDebounce } from "@/lib/useDebounce";
import { useAdministradores } from "@/features/usuarios/hooks";
import type { Veterinaria } from "@/types/api";
import {
  useAjustarRenovacion,
  useCambiarEstadoVeterinaria,
  useRenovarVeterinaria,
  useVeterinarias,
} from "../hooks";
import { diasParaRenovar, estadoSuscripcion, planLabel, textoSuscripcion } from "../suscripcion";
import { CrearVeterinariaModal } from "../components/CrearVeterinariaModal";
import { CrearAdminModal } from "../components/CrearAdminModal";

type Filtro = "todas" | "porVencer" | "vencidas" | "inactivas";

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "porVencer", label: "Por vencer" },
  { valor: "vencidas", label: "Vencidas" },
  { valor: "inactivas", label: "Inactivas" },
];

/** Vista de Veterinarias (SuperAdmin): búsqueda, filtros de suscripción y gestión. */
export function VeterinariasPage() {
  const { data: veterinarias, isLoading, isError } = useVeterinarias();
  const cambiarEstado = useCambiarEstadoVeterinaria();
  const renovar = useRenovarVeterinaria();
  const toast = useToast();
  const [modalCrear, setModalCrear] = useState(false);
  const [adminDe, setAdminDe] = useState<Veterinaria | null>(null);
  const [ajustarDe, setAjustarDe] = useState<Veterinaria | null>(null);
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const textoBuscado = useDebounce(texto);
  const { data: admins } = useAdministradores();

  // Admin activo de cada veterinaria (para mostrarlo en su card).
  const adminPorVet = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const a of admins ?? []) if (a.activo && a.veterinariaId) mapa.set(a.veterinariaId, a.nombre);
    return mapa;
  }, [admins]);

  // Orden: primero las que requieren cobro (vencidas, luego por vencer), después el resto.
  const ordenadas = useMemo(
    () =>
      [...(veterinarias ?? [])].sort((a, b) => {
        const da = diasParaRenovar(a.fechaRenovacion);
        const db = diasParaRenovar(b.fechaRenovacion);
        if (da === db) return a.nombre.localeCompare(b.nombre);
        return da < db ? -1 : 1;
      }),
    [veterinarias],
  );

  const lista = useMemo(() => {
    const q = textoBuscado.trim().toLowerCase();
    return ordenadas.filter((v) => {
      const estado = estadoSuscripcion(v.fechaRenovacion);
      if (filtro === "porVencer" && estado !== "porVencer") return false;
      if (filtro === "vencidas" && estado !== "vencida") return false;
      if (filtro === "inactivas" && v.activa) return false;
      if (!q) return true;
      return v.nombre.toLowerCase().includes(q) || v.telefono.includes(q);
    });
  }, [ordenadas, filtro, textoBuscado]);

  const total = ordenadas.length;

  function onRenovar(v: Veterinaria) {
    renovar.mutate(v.id, {
      onSuccess: (r) => toast.exito(`${v.nombre}: ${textoSuscripcion(r.fechaRenovacion)}`),
      onError: () => toast.error("No se pudo renovar la veterinaria."),
    });
  }

  return (
    <PantallaConHeader
      titulo="Veterinarias"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Building2 className="h-4 w-4 text-primary-container" aria-hidden />
          {total === 0 ? "Clientes de Patwi" : `${total} veterinaria${total === 1 ? "" : "s"}`}
        </p>
      }
      accion={
        <Button size="icon" onClick={() => setModalCrear(true)} aria-label="Nueva veterinaria">
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
            aria-label="Buscar veterinarias"
            placeholder="Buscar por nombre o teléfono"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {/* Chips de filtro por estado de suscripción */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-label-md font-semibold transition-colors " +
                (filtro === f.valor
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface")
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <section className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonFila key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
              No se pudieron cargar las veterinarias.
            </div>
          ) : lista.length > 0 ? (
            <div className="flex flex-col gap-3">
              {lista.map((v) => {
                const estado = estadoSuscripcion(v.fechaRenovacion);
                const toneSusc = estado === "vencida" ? "danger" : estado === "porVencer" ? "warning" : "neutral";
                return (
                  <div
                    key={v.id}
                    className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                  >
                    {/* Cabecera */}
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
                        <Building2 className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-label-lg font-bold text-on-surface">{v.nombre}</span>
                          {!v.activa && <Badge tone="danger">Inactiva</Badge>}
                        </div>
                        <p className="text-body-sm text-on-surface-variant">{v.telefono}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-body-sm">
                          <UserCog className="h-3.5 w-3.5 shrink-0 text-on-surface-variant" aria-hidden />
                          {adminPorVet.get(v.id) ? (
                            <span className="truncate text-on-surface-variant">{adminPorVet.get(v.id)}</span>
                          ) : (
                            <span className="font-semibold text-[#B45309]">Sin administrador</span>
                          )}
                        </p>
                        {v.direccion && (
                          <p className="mt-0.5 flex items-center gap-1 truncate text-body-sm text-on-surface-variant">
                            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <span className="truncate">{v.direccion}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Suscripción */}
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2">
                      <span className="flex items-center gap-2 text-body-md text-on-surface">
                        <CalendarClock className="h-4 w-4 text-primary-container" aria-hidden />
                        Plan {planLabel[v.plan] ?? "Mensual"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={toneSusc}>{textoSuscripcion(v.fechaRenovacion)}</Badge>
                        <button
                          type="button"
                          onClick={() => setAjustarDe(v)}
                          aria-label={`Ajustar fecha de renovación de ${v.nombre}`}
                          className="grid h-7 w-7 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        loading={renovar.isPending && renovar.variables === v.id}
                        onClick={() => onRenovar(v)}
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                        Renovar
                      </Button>
                      <Button variant="soft" size="sm" fullWidth onClick={() => setAdminDe(v)}>
                        <UserCog className="h-4 w-4" aria-hidden />
                        Admin
                      </Button>
                      <Button
                        variant={v.activa ? "warning" : "soft"}
                        size="icon"
                        loading={cambiarEstado.isPending && cambiarEstado.variables?.id === v.id}
                        onClick={() => cambiarEstado.mutate({ id: v.id, activar: !v.activa })}
                        aria-label={v.activa ? `Desactivar ${v.nombre}` : `Activar ${v.nombre}`}
                      >
                        <Power className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              titulo={total === 0 ? "Sin veterinarias" : "Sin resultados"}
              descripcion={
                total === 0
                  ? "Da de alta la primera veterinaria cliente."
                  : "No hay veterinarias que coincidan con el filtro."
              }
            />
          )}
        </section>
      </div>

      <CrearVeterinariaModal open={modalCrear} onClose={() => setModalCrear(false)} />
      {adminDe && (
        <CrearAdminModal
          open={!!adminDe}
          onClose={() => setAdminDe(null)}
          veterinariaId={adminDe.id}
          veterinariaNombre={adminDe.nombre}
        />
      )}
      {ajustarDe && (
        <AjustarRenovacionDrawer veterinaria={ajustarDe} onClose={() => setAjustarDe(null)} />
      )}
    </PantallaConHeader>
  );
}

/** Ajuste manual de la fecha de renovación (pagos irregulares, prórrogas). */
function AjustarRenovacionDrawer({ veterinaria, onClose }: { veterinaria: Veterinaria; onClose: () => void }) {
  const ajustar = useAjustarRenovacion();
  const toast = useToast();
  const [fecha, setFecha] = useState((veterinaria.fechaRenovacion ?? "").slice(0, 10));

  function guardar() {
    ajustar.mutate(
      { id: veterinaria.id, fecha },
      {
        onSuccess: () => {
          toast.exito("Fecha de renovación actualizada");
          onClose();
        },
        onError: () => toast.error("No se pudo actualizar la fecha."),
      },
    );
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Ajustar renovación"
      descripcion={`Cambia a mano la fecha de vencimiento de ${veterinaria.nombre}.`}
    >
      <div className="flex flex-col gap-4">
        <Input label="Nueva fecha de renovación" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <Button fullWidth size="lg" onClick={guardar} loading={ajustar.isPending} disabled={!fecha}>
          Guardar fecha
        </Button>
      </div>
    </Drawer>
  );
}


