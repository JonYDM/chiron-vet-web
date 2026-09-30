import { useMemo, useState } from "react";
import { Ban, Building2, CalendarDays, Receipt, Search, Store, Wallet } from "lucide-react";
import { Badge, Button, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { useToast } from "@/components/feedback/useToast";
import { formatCurrency } from "@/lib/format";
import { useDebounce } from "@/lib/useDebounce";
import type { PagoSuscripcion } from "@/types/api";
import { useAnularPago, usePagos } from "../hooks";
import { fechaCorta, mesActual, planLabel, rangoMes } from "../suscripcion";

/** Historial de cobros de suscripción (HU-SU5): filtro por mes, total y anulación. */
export function CobrosPage() {
  const [mes, setMes] = useState(mesActual());
  const [texto, setTexto] = useState("");
  const textoBuscado = useDebounce(texto);
  const { desde, hasta } = useMemo(() => rangoMes(mes), [mes]);
  const { data: pagos, isLoading, isError } = usePagos(desde, hasta);

  const lista = useMemo(() => {
    const q = textoBuscado.trim().toLowerCase();
    return (pagos ?? []).filter(
      (p) => !q || p.veterinariaNombre.toLowerCase().includes(q) || p.sucursalNombre.toLowerCase().includes(q),
    );
  }, [pagos, textoBuscado]);

  const validos = (pagos ?? []).filter((p) => !p.anulado);
  const total = validos.reduce((suma, p) => suma + p.monto, 0);

  return (
    <PantallaConHeader
      titulo="Cobros"
      volverA="/admin"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Receipt className="h-4 w-4 text-primary-container" aria-hidden />
          Pagos de suscripción registrados
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Filtro por mes — mismo patrón que el Historial de ventas */}
        <label className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-soft">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body-sm text-on-surface-variant">Mostrando cobros de</span>
            <input
              type="month"
              aria-label="Mes"
              value={mes}
              onChange={(e) => e.target.value && setMes(e.target.value)}
              className="w-full bg-transparent text-headline-sm font-bold text-on-surface outline-none"
            />
          </span>
        </label>

        {/* Total del mes */}
        <div className="flex items-center justify-between rounded-2xl bg-primary-container p-4 text-on-primary shadow-soft">
          <span className="flex flex-col">
            <span className="flex items-center gap-1.5 text-label-md font-bold">
              <Wallet className="h-[18px] w-[18px]" aria-hidden />
              Cobrado en el mes
            </span>
            <span className="text-body-sm opacity-85">
              {validos.length} cobro{validos.length === 1 ? "" : "s"}
            </span>
          </span>
          <span className="tabular text-headline-md font-bold">{formatCurrency(total)}</span>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            variant="soft"
            aria-label="Buscar cobros"
            placeholder="Buscar por veterinaria o sucursal"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar los cobros.
          </div>
        ) : lista.length === 0 ? (
          <EmptyState
            titulo="Sin cobros"
            descripcion={
              (pagos ?? []).length === 0
                ? "Aún no hay cobros registrados en este mes. Se registran al renovar una sucursal."
                : "Ningún cobro coincide con la búsqueda."
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {lista.map((p) => (
              <FilaPago key={p.id} pago={p} />
            ))}
          </div>
        )}
      </div>
    </PantallaConHeader>
  );
}

/** Un cobro: quién, cuándo, qué periodo cubre y cuánto. Anular pide confirmación. */
function FilaPago({ pago: p }: { pago: PagoSuscripcion }) {
  const anular = useAnularPago();
  const toast = useToast();
  const [confirmar, setConfirmar] = useState(false);
  const Icono = p.esMatriz ? Building2 : Store;

  function onAnular() {
    anular.mutate(p.id, {
      onSuccess: () => toast.exito("Cobro anulado"),
      onError: () => toast.error("No se pudo anular el cobro."),
      onSettled: () => setConfirmar(false),
    });
  }

  return (
    <div
      className={
        "flex flex-col gap-2.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3.5 shadow-soft " +
        (p.anulado ? "opacity-70" : "")
      }
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
          <Icono className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-lg font-bold text-on-surface">
            {p.esMatriz ? p.veterinariaNombre : `${p.veterinariaNombre} · ${p.sucursalNombre}`}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {fechaCorta(p.fechaPago)} · {planLabel[p.plan] ?? "Mensual"} · cubre hasta {fechaCorta(p.periodoHasta)}
          </p>
          {p.nota && <p className="mt-0.5 truncate text-body-sm italic text-on-surface-variant">{p.nota}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={"tabular text-label-lg font-bold " + (p.anulado ? "text-on-surface-variant line-through" : "text-on-surface")}>
            {formatCurrency(p.monto)}
          </span>
          {p.anulado && <Badge tone="danger">Anulado</Badge>}
        </div>
      </div>

      {!p.anulado &&
        (confirmar ? (
          <div className="flex items-center gap-2 border-t border-outline-variant/20 pt-2.5">
            <span className="flex-1 text-body-sm text-on-surface-variant">¿Anular este cobro? La fecha de renovación no cambia.</span>
            <Button variant="ghost" size="sm" onClick={() => setConfirmar(false)}>
              No
            </Button>
            <Button variant="danger" size="sm" loading={anular.isPending} onClick={onAnular}>
              Anular
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmar(true)}
            className="flex items-center gap-1 self-end text-label-sm font-semibold text-on-surface-variant hover:text-error-st"
          >
            <Ban className="h-3.5 w-3.5" aria-hidden />
            Anular
          </button>
        ))}
    </div>
  );
}
