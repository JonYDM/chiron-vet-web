import { useMemo, useState } from "react";
import { Download, Receipt } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Button, Card, CardContent, Input, Spinner } from "@/components/ui";
import { descargarCsv } from "@/lib/csv";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { metodoPagoLabel } from "@/lib/enums";
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

/** Página de historial de ventas (Admin): filtro por mes, resumen y export CSV. */
export function HistorialVentasPage() {
  const [mes, setMes] = useState(mesActual());
  const { desde, hasta } = useMemo(() => rangoDelMes(mes), [mes]);

  const { data: ventas, isLoading, isError } = useVentas(desde, hasta);
  const { data: resumen } = useResumenVentas(desde, hasta);

  function exportar() {
    if (!ventas) return;
    const filas = ventas.map((v) => [
      formatDateTime(v.fechaHora),
      metodoPagoLabel[v.metodoPago],
      v.lineas.map((l) => `${l.cantidad}x ${l.nombreProducto}`).join(" | "),
      v.total,
    ]);
    descargarCsv(
      `ventas-${mes}.csv`,
      ["Fecha", "Método", "Productos", "Total (MXN)"],
      filas,
    );
  }

  return (
    <div>
      <PageHeader
        titulo="Historial de ventas"
        descripcion="Filtra por mes y exporta"
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

      <div className="mb-4 max-w-xs">
        <Input
          label="Mes"
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
      </div>

      {/* Resumen del período */}
      {resumen && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResumenCard titulo="Total" valor={formatCurrency(resumen.total)} destacado />
          <ResumenCard titulo="Efectivo" valor={formatCurrency(resumen.efectivo)} />
          <ResumenCard titulo="Tarjeta" valor={formatCurrency(resumen.tarjeta)} />
          <ResumenCard
            titulo="Transferencia"
            valor={formatCurrency(resumen.transferencia)}
          />
        </div>
      )}

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
        <ul className="space-y-3">
          {ventas.map((v) => (
            <li key={v.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink-soft">
                      {formatDateTime(v.fechaHora)} · {metodoPagoLabel[v.metodoPago]}
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-hairline text-ink-soft">
              <Receipt className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-semibold text-ink">Sin ventas</p>
            <p className="max-w-xs text-sm text-ink-soft">
              No hay ventas registradas en el mes seleccionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResumenCard({
  titulo,
  valor,
  destacado,
}: {
  titulo: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-ink-soft">{titulo}</p>
        <p
          className={
            destacado
              ? "text-xl font-bold text-primary"
              : "text-lg font-semibold text-ink"
          }
        >
          {valor}
        </p>
      </CardContent>
    </Card>
  );
}
