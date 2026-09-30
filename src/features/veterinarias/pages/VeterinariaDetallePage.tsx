import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  Building2,
  CalendarClock,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Settings2,
  Store,
  UserCog,
} from "lucide-react";
import { Badge, Button, SkeletonFila } from "@/components/ui";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { PaginaError } from "@/components/organisms/PaginaError";
import { useToast } from "@/components/feedback/useToast";
import { formatCurrency } from "@/lib/format";
import { useAdministradores } from "@/features/usuarios/hooks";
import type { Sucursal, Veterinaria } from "@/types/api";
import { useCambiarEstadoSucursal, useCambiarEstadoVeterinaria, useVeterinarias } from "../hooks";
import { estadoSuscripcion, planLabel, rentaMensual, textoPrecio, textoSuscripcion } from "../suscripcion";
import { EditarVeterinariaDrawer } from "../components/EditarVeterinariaDrawer";
import { SucursalDrawer } from "../components/SucursalDrawer";
import { AjustarRenovacionDrawer } from "../components/AjustarRenovacionDrawer";
import { RenovarDrawer } from "../components/RenovarDrawer";

/**
 * Detalle de veterinaria (SuperAdmin): datos del tenant + sus sucursales, que son lo que
 * se cobra. Cada sucursal tiene su plan, renta y renovación.
 */
export function VeterinariaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { data: veterinarias, isLoading } = useVeterinarias();
  const { data: admins } = useAdministradores();
  const cambiarEstadoVet = useCambiarEstadoVeterinaria();
  const [editarVet, setEditarVet] = useState(false);
  const [sucursalDrawer, setSucursalDrawer] = useState<{ sucursal?: Sucursal } | null>(null);
  const [ajustarDe, setAjustarDe] = useState<Sucursal | null>(null);
  const [cobrarA, setCobrarA] = useState<Sucursal | null>(null);

  const vet = veterinarias?.find((v) => v.id === id);
  const admin = admins?.find((a) => a.activo && a.veterinariaId === id);

  // Renta mensual equivalente de las sucursales activas (anuales = precio / 12).
  const rentaTotal = useMemo(
    () => (vet?.sucursales ?? []).filter((s) => s.activa).reduce((suma, s) => suma + rentaMensual(s), 0),
    [vet],
  );

  if (isLoading) {
    return (
      <PantallaConHeader titulo="Veterinaria" volverA="/admin/veterinarias">
        <div className="flex flex-col gap-3">
          <SkeletonFila />
          <SkeletonFila />
        </div>
      </PantallaConHeader>
    );
  }

  if (!vet) {
    return (
      <PaginaError
        codigo="404"
        titulo="Veterinaria no encontrada"
        descripcion="Esta veterinaria no existe o fue eliminada."
        irA="/admin/veterinarias"
        irATexto="Ver veterinarias"
      />
    );
  }

  const sucursales = vet.sucursales ?? [];

  return (
    <PantallaConHeader
      titulo={vet.nombre}
      volverA="/admin/veterinarias"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Store className="h-4 w-4 text-primary-container" aria-hidden />
          {sucursales.length} sucursal{sucursales.length === 1 ? "" : "es"}
          {!vet.activa && <Badge tone="danger" className="ml-1">Inactiva</Badge>}
        </p>
      }
      accion={
        <Button variant="soft" size="icon" onClick={() => setEditarVet(true)} aria-label="Editar datos de la veterinaria">
          <Settings2 className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Datos del tenant + renta total */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2 flex flex-col gap-2 rounded-2xl bg-surface-container p-4">
            <Dato icon={<Phone className="h-4 w-4" aria-hidden />} texto={vet.telefono} />
            <Dato
              icon={<UserCog className="h-4 w-4" aria-hidden />}
              texto={admin?.nombre ?? "Sin administrador"}
              alerta={!admin}
            />
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-primary-container p-3.5 text-on-primary shadow-soft">
            <span className="text-label-sm font-semibold opacity-90">Renta mensual</span>
            <span className="tabular mt-2 text-headline-sm font-bold leading-none">{formatCurrency(rentaTotal)}</span>
            <span className="mt-1 text-body-sm opacity-80">sucursales activas</span>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-primary-fixed/40 p-3.5">
            <span className="text-label-sm font-semibold text-tertiary">Activas</span>
            <span className="tabular mt-2 text-headline-sm font-bold leading-none text-on-surface">
              {sucursales.filter((s) => s.activa).length}
              <span className="text-body-md font-medium text-on-surface-variant"> / {sucursales.length}</span>
            </span>
            <span className="mt-1 text-body-sm text-on-surface-variant">sucursales</span>
          </div>
        </div>

        {/* Sucursales */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-bold text-on-surface">Sucursales</h2>
            <Button size="sm" onClick={() => setSucursalDrawer({})}>
              <Plus className="h-4 w-4" aria-hidden />
              Agregar
            </Button>
          </div>
          {sucursales.map((s) => (
            <SucursalCard
              key={s.id}
              sucursal={s}
              veterinaria={vet}
              onEditar={() => setSucursalDrawer({ sucursal: s })}
              onAjustar={() => setAjustarDe(s)}
              onCobrar={() => setCobrarA(s)}
            />
          ))}
        </section>

        {/* Zona de la veterinaria completa */}
        <Button
          variant={vet.activa ? "warning" : "outline"}
          fullWidth
          className={vet.activa ? undefined : "text-primary"}
          loading={cambiarEstadoVet.isPending}
          onClick={() => cambiarEstadoVet.mutate({ id: vet.id, activar: !vet.activa })}
        >
          <Power className="h-4 w-4" aria-hidden />
          {vet.activa ? "Desactivar veterinaria completa" : "Activar veterinaria"}
        </Button>
      </div>

      {editarVet && <EditarVeterinariaDrawer veterinaria={vet} onClose={() => setEditarVet(false)} />}
      {sucursalDrawer && (
        <SucursalDrawer
          veterinariaId={vet.id}
          veterinariaNombre={vet.nombre}
          sucursal={sucursalDrawer.sucursal}
          onClose={() => setSucursalDrawer(null)}
        />
      )}
      {cobrarA && <RenovarDrawer sucursal={cobrarA} veterinariaNombre={vet.nombre} onClose={() => setCobrarA(null)} />}
      {ajustarDe && (
        <AjustarRenovacionDrawer sucursal={ajustarDe} veterinariaNombre={vet.nombre} onClose={() => setAjustarDe(null)} />
      )}
    </PantallaConHeader>
  );
}

function Dato({ icon, texto, alerta = false }: { icon: ReactNode; texto: string; alerta?: boolean }) {
  return (
    <p className={"flex items-center gap-2 text-body-md " + (alerta ? "font-semibold text-[#B45309]" : "text-on-surface")}>
      <span className={alerta ? "" : "text-on-surface-variant"}>{icon}</span>
      <span className="truncate">{texto}</span>
    </p>
  );
}

/** Card de una sucursal: plan, renta, renovación y acciones de cobro. */
function SucursalCard({
  sucursal: s,
  veterinaria,
  onEditar,
  onAjustar,
  onCobrar,
}: {
  sucursal: Sucursal;
  veterinaria: Veterinaria;
  onEditar: () => void;
  onAjustar: () => void;
  onCobrar: () => void;
}) {
  const cambiarEstado = useCambiarEstadoSucursal();
  const toast = useToast();
  const estado = estadoSuscripcion(s.fechaRenovacion);
  const toneSusc = estado === "vencida" ? "danger" : estado === "porVencer" ? "warning" : "neutral";

  function onCambiarEstado() {
    cambiarEstado.mutate(
      { id: s.id, activar: !s.activa },
      { onError: () => toast.error("No se pudo cambiar el estado de la sucursal.") },
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
          {s.esMatriz ? <Building2 className="h-5 w-5" aria-hidden /> : <Store className="h-5 w-5" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-label-lg font-bold text-on-surface">{s.nombre}</span>
            {s.esMatriz && <Badge tone="primary">Matriz</Badge>}
            {!s.activa && <Badge tone="danger">Inactiva</Badge>}
          </div>
          {s.direccion && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-body-sm text-on-surface-variant">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{s.direccion}</span>
            </p>
          )}
          {s.telefono && <p className="text-body-sm text-on-surface-variant">{s.telefono}</p>}
        </div>
        <Button variant="ghost" size="icon" className="-mr-2 -mt-2 shrink-0" onClick={onEditar} aria-label={`Editar ${s.nombre}`}>
          <Settings2 className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      {/* Plan, renta y renovación */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2">
        <span className="flex min-w-0 items-center gap-2 text-body-md text-on-surface">
          <CalendarClock className="h-4 w-4 shrink-0 text-primary-container" aria-hidden />
          <span className="truncate">
            {planLabel[s.plan] ?? "Mensual"} · <span className="tabular font-semibold">{textoPrecio(s)}</span>
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge tone={toneSusc}>{textoSuscripcion(s.fechaRenovacion)}</Badge>
          <button
            type="button"
            onClick={onAjustar}
            aria-label={`Ajustar fecha de renovación de ${s.nombre}`}
            className="grid h-7 w-7 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
        <Button size="sm" fullWidth onClick={onCobrar} disabled={!veterinaria.activa && !s.esMatriz}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Renovar
        </Button>
        {!s.esMatriz && (
          <Button
            variant={s.activa ? "warning" : "outline"}
            size="sm"
            fullWidth
            className={s.activa ? undefined : "text-primary"}
            loading={cambiarEstado.isPending}
            onClick={onCambiarEstado}
          >
            <Power className="h-4 w-4" aria-hidden />
            {s.activa ? "Desactivar" : "Activar"}
          </Button>
        )}
      </div>
    </div>
  );
}
