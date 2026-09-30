import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  MapPin,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Settings2,
  Store,
  UserCog,
} from "lucide-react";
import { Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { formatCurrency } from "@/lib/format";
import { useDebounce } from "@/lib/useDebounce";
import { useAdministradores } from "@/features/usuarios/hooks";
import type { Sucursal, Veterinaria } from "@/types/api";
import { useCambiarEstadoVeterinaria, useVeterinarias } from "../hooks";
import {
  diasParaRenovar,
  estadoSuscripcion,
  fechaCobroVeterinaria,
  planLabel,
  rentaMensual,
  sucursalMasUrgente,
  textoPrecio,
  textoSuscripcion,
} from "../suscripcion";
import { CrearVeterinariaModal } from "../components/CrearVeterinariaModal";
import { EditarVeterinariaDrawer } from "../components/EditarVeterinariaDrawer";
import { AjustarRenovacionDrawer } from "../components/AjustarRenovacionDrawer";
import { RenovarDrawer } from "../components/RenovarDrawer";

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
  const navigate = useNavigate();
  const [modalCrear, setModalCrear] = useState(false);
  const [ajustarDe, setAjustarDe] = useState<{ sucursal: Sucursal; vet: Veterinaria } | null>(null);
  const [cobrarA, setCobrarA] = useState<{ sucursal: Sucursal; vet: Veterinaria } | null>(null);
  const [editarDe, setEditarDe] = useState<Veterinaria | null>(null);
  const [texto, setTexto] = useState("");
  const [params, setParams] = useSearchParams();
  const filtroUrl = params.get("filtro");
  const filtro: Filtro = FILTROS.some((f) => f.valor === filtroUrl) ? (filtroUrl as Filtro) : "todas";
  // El filtro vive en la URL: el dashboard puede mandar directo a "Vencidas" o "Por vencer".
  const setFiltro = (f: Filtro) => setParams(f === "todas" ? {} : { filtro: f }, { replace: true });
  const textoBuscado = useDebounce(texto);
  const { data: admins } = useAdministradores();

  // Admin activo de cada veterinaria (para mostrarlo en su card).
  const adminPorVet = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const a of admins ?? []) if (a.activo && a.veterinariaId) mapa.set(a.veterinariaId, a.nombre);
    return mapa;
  }, [admins]);

  // Orden: primero las que requieren cobro (según su sucursal más urgente), después el resto.
  const ordenadas = useMemo(
    () =>
      [...(veterinarias ?? [])].sort((a, b) => {
        const da = diasParaRenovar(fechaCobroVeterinaria(a));
        const db = diasParaRenovar(fechaCobroVeterinaria(b));
        if (da === db) return a.nombre.localeCompare(b.nombre);
        return da < db ? -1 : 1;
      }),
    [veterinarias],
  );

  const lista = useMemo(() => {
    const q = textoBuscado.trim().toLowerCase();
    return ordenadas.filter((v) => {
      const estado = estadoSuscripcion(fechaCobroVeterinaria(v));
      if (filtro === "porVencer" && estado !== "porVencer") return false;
      if (filtro === "vencidas" && estado !== "vencida") return false;
      if (filtro === "inactivas" && v.activa) return false;
      if (!q) return true;
      return (
        v.nombre.toLowerCase().includes(q) ||
        v.telefono.includes(q) ||
        (v.sucursales ?? []).some((s) => s.nombre.toLowerCase().includes(q))
      );
    });
  }, [ordenadas, filtro, textoBuscado]);

  const total = ordenadas.length;

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
                const sucursales = v.sucursales ?? [];
                const urgente = sucursalMasUrgente(v);
                const unica = sucursales.length === 1 ? sucursales[0] : null;
                const estado = estadoSuscripcion(fechaCobroVeterinaria(v));
                const toneSusc = estado === "vencida" ? "danger" : estado === "porVencer" ? "warning" : "neutral";
                const renta = sucursales.filter((s) => s.activa).reduce((suma, s) => suma + rentaMensual(s), 0);
                return (
                  <div
                    key={v.id}
                    className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                  >
                    {/* Cabecera (lleva al detalle) */}
                    <div className="flex items-start gap-3">
                      <Link to={`/admin/veterinarias/${v.id}`} className="flex min-w-0 flex-1 items-start gap-3">
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
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mr-2 -mt-2 shrink-0"
                        onClick={() => setEditarDe(v)}
                        aria-label={`Editar datos de ${v.nombre}`}
                      >
                        <Settings2 className="h-5 w-5" aria-hidden />
                      </Button>
                    </div>

                    {/* Suscripción: con 1 sucursal se ve su plan y renta; con varias, el resumen */}
                    {unica ? (
                      <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2">
                        <span className="flex min-w-0 items-center gap-2 text-body-md text-on-surface">
                          <Store className="h-4 w-4 shrink-0 text-primary-container" aria-hidden />
                          <span className="truncate">
                            {planLabel[unica.plan] ?? "Mensual"} ·{" "}
                            <span className="tabular font-semibold">{textoPrecio(unica)}</span>
                          </span>
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Badge tone={toneSusc}>{textoSuscripcion(unica.fechaRenovacion)}</Badge>
                          <button
                            type="button"
                            onClick={() => setAjustarDe({ sucursal: unica, vet: v })}
                            aria-label={`Ajustar fecha de renovación de ${v.nombre}`}
                            className="grid h-7 w-7 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={`/admin/veterinarias/${v.id}`}
                        className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-body-md text-on-surface">
                          <Store className="h-4 w-4 shrink-0 text-primary-container" aria-hidden />
                          <span className="truncate">
                            {sucursales.length} sucursales ·{" "}
                            <span className="tabular font-semibold">{formatCurrency(renta)}/mes</span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          {urgente && <Badge tone={toneSusc}>{textoSuscripcion(urgente.fechaRenovacion)}</Badge>}
                          <ChevronRight className="h-4 w-4 text-on-surface-variant/60" aria-hidden />
                        </span>
                      </Link>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
                      {unica ? (
                        <Button variant="primary" size="sm" fullWidth onClick={() => setCobrarA({ sucursal: unica, vet: v })}>
                          <RefreshCw className="h-4 w-4" aria-hidden />
                          Renovar
                        </Button>
                      ) : (
                        <Button variant="primary" size="sm" fullWidth onClick={() => navigate(`/admin/veterinarias/${v.id}`)}>
                          <Store className="h-4 w-4" aria-hidden />
                          Sucursales
                        </Button>
                      )}
                      <Button
                        variant={v.activa ? "warning" : "outline"}
                        size="sm"
                        fullWidth
                        className={v.activa ? undefined : "text-primary"}
                        loading={cambiarEstado.isPending && cambiarEstado.variables?.id === v.id}
                        onClick={() => cambiarEstado.mutate({ id: v.id, activar: !v.activa })}
                      >
                        <Power className="h-4 w-4" aria-hidden />
                        {v.activa ? "Desactivar" : "Activar"}
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
      {editarDe && <EditarVeterinariaDrawer veterinaria={editarDe} onClose={() => setEditarDe(null)} />}
      {cobrarA && (
        <RenovarDrawer sucursal={cobrarA.sucursal} veterinariaNombre={cobrarA.vet.nombre} onClose={() => setCobrarA(null)} />
      )}
      {ajustarDe && (
        <AjustarRenovacionDrawer
          sucursal={ajustarDe.sucursal}
          veterinariaNombre={ajustarDe.vet.nombre}
          onClose={() => setAjustarDe(null)}
        />
      )}
    </PantallaConHeader>
  );
}


