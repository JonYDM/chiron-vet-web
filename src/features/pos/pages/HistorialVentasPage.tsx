import { useMemo, useState } from "react";
import { Banknote, CalendarDays, CreditCard, Download, Package, Receipt, Smartphone, Stethoscope, Store } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Button, SkeletonFila } from "@/components/ui";
import { descargarCsv } from "@/lib/csv";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { metodoPagoLabel } from "@/lib/enums";
import { MetodoPago } from "@/types/api";
import { useResumenVentas, useVentas } from "../hooks";

/** Mes actual en formato YYYY-MM para el input. */
function mesActual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Convierte "YYYY-MM" en rango ISO [desde, hasta] del mes completo. */
function rangoDelMes(mes: string): { desde: string; hasta: string } {
  const [y, m] = mes.split("-").map(Number);
  const desde = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const hasta = new Date(Date.UTC(y, m, 0, 23, 59, 59));
  return { desde: desde.toISOString(), hasta: hasta.toISOString() };
}

const ICONO_METODO = {
  [MetodoPago.Efectivo]: Banknote,
  [MetodoPago.Tarjeta]: CreditCard,
  [MetodoPago.Transferencia]: Smartphone,
} as const;

/** Historial de ventas (Admin): filtro por mes, resumen y export CSV. */
export function HistorialVentasPage() {
  const [mes, setMes] = useState(mesActual());
  const [metodo, setMetodo] = useState<MetodoPago | null>(null);
  const { desde, hasta } = useMemo(() => rangoDelMes(mes), [mes]);

  const { data: ventas, isLoading, isError } = useVentas(desde, hasta);
  const { data: resumen } = useResumenVentas(desde, hasta);

  // Filtro por método de pago (en cliente, sobre las ventas del mes ya cargadas).
  const ventasFiltradas = useMemo(
    () => (metodo === null ? ventas ?? [] : (ventas ?? []).filter((v) => v.metodoPago === metodo)),
    [ventas, metodo],
  );

  function exportar() {
    if (!ventas) return;
    const filas = ventas.map((v) => [
      formatDateTime(v.fechaHora),
      metodoPagoLabel[v.metodoPago],
      v.lineas.map((l) => `${l.cantidad}x ${l.nombreProducto}`).join(" | "),
      v.total,
    ]);
    descargarCsv(`ventas-${mes}.csv`, ["Fecha", "Método", "Productos", "Total (MXN)"], filas);
  }

  return (
    <PantallaConHeader
      titulo="Historial de ventas"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Receipt className="h-4 w-4 text-primary-container" aria-hidden />
          {ventas ? `${ventas.length} venta${ventas.length === 1 ? "" : "s"} en el mes` : "Ventas del negocio"}
        </p>
      }
      accion={
        <Button
          variant="soft"
          size="sm"
          onClick={exportar}
          disabled={!ventas || ventas.length === 0}
        >
          <Download className="h-4 w-4" aria-hidden />
          CSV
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Filtro por mes — control destacado con feedback */}
        <label className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-soft">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body-sm text-on-surface-variant">Mostrando ventas de</span>
            <input
              type="month"
              aria-label="Mes"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full bg-transparent text-headline-sm font-bold text-on-surface outline-none"
            />
          </span>
        </label>

        {/* Resumen del período (bento con color, estilo acciones rápidas) */}
        {resumen && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex items-center justify-between rounded-2xl bg-primary-container p-4 text-on-primary shadow-soft">
              <span className="flex items-center gap-1.5 text-label-md font-bold">
                <Store className="h-[18px] w-[18px]" aria-hidden />
                Total del mes
              </span>
              <span className="tabular text-headline-md font-bold">
                {formatCurrency(resumen.total)}
              </span>
            </div>
            <ResumenChip
              icon={Banknote}
              label="Efectivo"
              valor={resumen.efectivo}
              className="bg-tertiary-fixed text-on-tertiary-fixed-variant"
              iconWrap="bg-tertiary/15 text-tertiary"
            />
            <ResumenChip
              icon={CreditCard}
              label="Tarjeta"
              valor={resumen.tarjeta}
              className="bg-secondary-fixed text-on-secondary-fixed"
              iconWrap="bg-st-secondary/15 text-st-secondary"
            />
            <ResumenChip
              icon={Smartphone}
              label="Transferencia"
              valor={resumen.transferencia}
              className="bg-primary-fixed/50 text-on-tertiary-fixed-variant"
              iconWrap="bg-tertiary/15 text-tertiary"
            />
            {/* Desglose por tipo: productos vs consultas (para conocer el negocio) */}
            <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-surface-container p-3.5">
              <div className="flex-1">
                <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                  <Package className="h-3.5 w-3.5" aria-hidden /> Productos
                </span>
                <span className="tabular text-label-lg font-bold text-on-surface">
                  {formatCurrency(resumen.totalProductos)}
                </span>
              </div>
              <div className="h-8 w-px bg-outline-variant/40" />
              <div className="flex-1">
                <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                  <Stethoscope className="h-3.5 w-3.5" aria-hidden /> Consultas
                </span>
                <span className="tabular text-label-lg font-bold text-tertiary">
                  {formatCurrency(resumen.totalConsultas)}
                </span>
              </div>
              <div className="h-8 w-px bg-outline-variant/40" />
              <div className="flex-1">
                <span className="text-body-sm text-on-surface-variant">N.º ventas</span>
                <span className="tabular text-label-lg font-bold text-on-surface">
                  {resumen.numeroVentas}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chips de filtro por método de pago */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { valor: null, label: "Todos" },
            { valor: MetodoPago.Efectivo, label: "Efectivo" },
            { valor: MetodoPago.Tarjeta, label: "Tarjeta" },
            { valor: MetodoPago.Transferencia, label: "Transferencia" },
          ].map((chip) => {
            const activo = metodo === chip.valor;
            return (
              <button
                key={chip.label}
                onClick={() => setMetodo(chip.valor)}
                className={
                  "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-label-md font-semibold transition-colors " +
                  (activo
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface")
                }
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Lista de ventas */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar las ventas.
          </div>
        ) : ventasFiltradas.length > 0 ? (
          <div className="flex flex-col gap-3">
            {ventasFiltradas.map((v) => {
              const IconoMetodo = ICONO_METODO[v.metodoPago] ?? Receipt;
              return (
                <div
                  key={v.id}
                  className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                >
                  {/* Cabecera: método (con ícono) + fecha · total */}
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
                      <IconoMetodo className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-label-lg font-bold text-on-surface">
                        {metodoPagoLabel[v.metodoPago]}
                      </p>
                      <p className="truncate text-body-sm text-on-surface-variant">
                        {formatDateTime(v.fechaHora)}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-headline-sm font-bold text-primary-container">
                      {formatCurrency(v.total)}
                    </span>
                  </div>

                  {/* Conceptos */}
                  <ul className="flex flex-col gap-1 rounded-xl bg-surface-container-low px-3 py-2.5">
                    {v.lineas.map((l, i) => (
                      <li key={i} className="flex justify-between gap-2 text-body-md">
                        <span className="min-w-0 truncate text-on-surface">
                          {l.cantidad}× {l.nombreProducto}
                        </span>
                        <span className="tabular shrink-0 text-on-surface-variant">
                          {formatCurrency(l.subtotal)}
                        </span>
                      </li>
                    ))}
                    {v.cargos.map((c) => (
                      <li key={c.cargoId} className="flex justify-between gap-2 text-body-md">
                        <span className="min-w-0 truncate text-tertiary">
                          🩺 {c.concepto}
                        </span>
                        <span className="tabular shrink-0 text-on-surface-variant">
                          {formatCurrency(c.monto)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            titulo={metodo !== null ? "Sin ventas con ese método" : "Sin ventas"}
            descripcion={
              metodo !== null
                ? "No hay ventas con ese método de pago en el mes."
                : "No hay ventas registradas en el mes seleccionado."
            }
          />
        )}
      </div>
    </PantallaConHeader>
  );
}

function ResumenChip({
  icon: Icon,
  label,
  valor,
  className,
  iconWrap,
}: {
  icon: typeof Banknote;
  label: string;
  valor: number;
  className: string;
  iconWrap: string;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-2xl p-3.5 shadow-soft ${className}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${iconWrap}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="tabular mt-1 text-label-lg font-bold leading-none">
        {formatCurrency(valor)}
      </span>
      <span className="text-body-sm opacity-80">{label}</span>
    </div>
  );
}
