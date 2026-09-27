import { Download, Receipt } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Button, Card, CardContent, Spinner } from "@/components/ui";
import { descargarCsv } from "@/lib/csv";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useVentas } from "../hooks";

/** Página de historial de ventas (Admin) con exportación a CSV. */
export function HistorialVentasPage() {
  const { data: ventas, isLoading, isError } = useVentas();

  function exportar() {
    if (!ventas) return;
    const filas = ventas.map((v) => [
      formatDateTime(v.fechaHora),
      v.lineas.map((l) => `${l.cantidad}x ${l.nombreProducto}`).join(" | "),
      v.total,
    ]);
    descargarCsv("ventas-chiron.csv", ["Fecha", "Productos", "Total (MXN)"], filas);
  }

  const totalPeriodo = (ventas ?? []).reduce((s, v) => s + v.total, 0);

  return (
    <div>
      <PageHeader
        titulo="Historial de ventas"
        descripcion="Ventas registradas (últimos 90 días)"
        accion={
          <Button
            variant="secondary"
            onClick={exportar}
            disabled={!ventas || ventas.length === 0}
          >
            <Download className="h-4 w-4" aria-hidden />
            Exportar CSV
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando ventas…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar las ventas.
          </CardContent>
        </Card>
      ) : ventas && ventas.length > 0 ? (
        <>
          <Card className="mb-4">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-ink-soft">Total del período</span>
              <span className="text-xl font-bold text-ink">
                {formatCurrency(totalPeriodo)}
              </span>
            </CardContent>
          </Card>
          <ul className="space-y-3">
            {ventas.map((v) => (
              <li key={v.id}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-ink-soft">
                        {formatDateTime(v.fechaHora)}
                      </span>
                      <span className="font-bold text-ink">
                        {formatCurrency(v.total)}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {v.lineas.map((l, i) => (
                        <li key={i} className="flex justify-between text-sm text-ink-soft">
                          <span>
                            {l.cantidad}× {l.nombreProducto}
                          </span>
                          <span>{formatCurrency(l.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-hairline text-ink-soft">
              <Receipt className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-semibold text-ink">Sin ventas</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Aún no hay ventas registradas en el período.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
