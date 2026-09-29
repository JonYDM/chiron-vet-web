import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Badge, SkeletonFila } from "@/components/ui";
import { metodoPagoLabel } from "@/lib/enums";
import { formatCurrency, formatDate } from "@/lib/format";
import { useMisCompras } from "../hooks";

/** Portal del dueño: lo que pagó (consultas, artículos), con su desglose. */
export function MisComprasPage() {
  const { data: compras, isLoading, isError } = useMisCompras();

  return (
    <PantallaConHeader
      titulo="Mis pagos"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Receipt className="h-4 w-4 text-primary-container" aria-hidden />
          Consultas y compras
        </p>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
          No se pudieron cargar tus pagos.
        </div>
      ) : compras && compras.length > 0 ? (
        <div className="flex flex-col gap-3">
          {compras.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
            >
              {/* Cabecera: fecha + total */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-label-lg font-bold text-on-surface">{formatDate(v.fechaHora)}</p>
                  <p className="text-body-sm text-on-surface-variant">{metodoPagoLabel[v.metodoPago]}</p>
                </div>
                <span className="tabular text-headline-sm font-bold text-primary-container">
                  {formatCurrency(v.total)}
                </span>
              </div>

              {/* Conceptos */}
              <div className="flex flex-col gap-1.5 rounded-xl bg-surface-container-low px-3 py-2.5">
                {v.lineas.map((l) => (
                  <div key={l.productoId} className="flex items-center justify-between gap-2 text-body-md">
                    <span className="min-w-0 truncate text-on-surface">
                      {l.cantidad}× {l.nombreProducto}
                    </span>
                    <span className="tabular shrink-0 text-on-surface-variant">
                      {formatCurrency(l.subtotal)}
                    </span>
                  </div>
                ))}
                {v.cargos.map((c) => (
                  <div key={c.cargoId} className="flex items-center justify-between gap-2 text-body-md">
                    <span className="min-w-0 truncate text-tertiary">🩺 {c.concepto}</span>
                    <span className="tabular shrink-0 text-on-surface-variant">
                      {formatCurrency(c.monto)}
                    </span>
                  </div>
                ))}
              </div>

              {v.cambio != null && v.cambio > 0 && (
                <div className="flex justify-end">
                  <Badge tone="info">Cambio: {formatCurrency(v.cambio)}</Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          titulo="Sin pagos aún"
          descripcion="Aquí verás lo que pagues por consultas y productos."
        />
      )}
    </PantallaConHeader>
  );
}
