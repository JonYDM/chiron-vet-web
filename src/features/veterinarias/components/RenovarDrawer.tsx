import { useState } from "react";
import { CalendarCheck, Receipt } from "lucide-react";
import { Button, Drawer, Input } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/feedback/useToast";
import type { Sucursal } from "@/types/api";
import { useRenovarSucursal } from "../hooks";
import { aISO, fechaCorta, montoValido, planLabel, textoPrecio, vencimientoTrasRenovar } from "../suscripcion";

/** Lo mínimo de la sucursal para cobrarle (sirve también desde "Por cobrar" del dashboard). */
export type SucursalACobrar = Pick<Sucursal, "id" | "nombre" | "precio" | "plan" | "fechaRenovacion" | "esMatriz">;

interface Props {
  sucursal: SucursalACobrar;
  veterinariaNombre: string;
  onClose: () => void;
}

/**
 * Renovar = registrar el cobro (HU-SU3). El monto viene precargado con la renta de la
 * sucursal y se puede cambiar SOLO para este pago (descuento, prórroga). Muestra hasta
 * cuándo queda cubierta antes de confirmar.
 */
export function RenovarDrawer({ sucursal, veterinariaNombre, onClose }: Props) {
  const renovar = useRenovarSucursal();
  const toast = useToast();
  const hoy = aISO(new Date());
  const [monto, setMonto] = useState(String(sucursal.precio));
  const [fechaPago, setFechaPago] = useState(hoy);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const valor = montoValido(monto);
  const cubreHasta = vencimientoTrasRenovar(sucursal.fechaRenovacion, sucursal.plan);
  const titulo = sucursal.esMatriz ? veterinariaNombre : `${veterinariaNombre} · ${sucursal.nombre}`;

  function registrar() {
    if (valor === null) return;
    setError(null);
    renovar.mutate(
      { id: sucursal.id, body: { monto: valor, fechaPago, nota: nota.trim() || null } },
      {
        onSuccess: () => {
          toast.exito(`Cobro de ${formatCurrency(valor)} registrado`);
          onClose();
        },
        onError: (err) => setError(err instanceof ApiError ? err.message : "No se pudo registrar el cobro."),
      },
    );
  }

  return (
    <Drawer open onClose={onClose} title="Registrar cobro" descripcion={titulo}>
      <div className="flex flex-col gap-4">
        {/* Qué se está cobrando */}
        <div className="flex items-center gap-3 rounded-2xl bg-surface-container p-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
            <Receipt className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body-sm text-on-surface-variant">
              Plan {planLabel[sucursal.plan] ?? "Mensual"}
            </span>
            <span className="tabular block text-label-lg font-bold text-on-surface">{textoPrecio(sucursal)}</span>
          </span>
        </div>

        <Input
          label="Monto cobrado"
          inputMode="decimal"
          value={monto}
          onChange={(e) => setMonto(e.target.value.replace(/[^\d.]/g, "").slice(0, 11))}
          hint="Cámbialo solo si esta vez cobraste distinto (no cambia la renta de la sucursal)."
          error={valor === null ? "Captura un monto válido." : undefined}
        />
        <Input
          label="Fecha del pago"
          type="date"
          max={hoy}
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
        />
        <Input
          label="Nota (opcional)"
          value={nota}
          onChange={(e) => setNota(e.target.value.slice(0, 250))}
          placeholder="Ej. Transferencia, descuento por pronto pago"
        />

        {/* Resultado de la renovación */}
        <p className="flex items-center gap-2 rounded-xl bg-primary-container/10 px-4 py-3 text-body-sm text-on-surface">
          <CalendarCheck className="h-4 w-4 shrink-0 text-primary-container" aria-hidden />
          <span>
            Quedará cubierta hasta el <strong className="font-bold">{fechaCorta(cubreHasta)}</strong>
          </span>
        </p>

        {error && (
          <p role="alert" className="rounded-xl bg-error-container/60 px-4 py-3 text-body-sm font-medium text-on-error-container">
            {error}
          </p>
        )}

        <Button fullWidth size="lg" onClick={registrar} loading={renovar.isPending} disabled={valor === null || !fechaPago}>
          Registrar {valor !== null ? formatCurrency(valor) : "cobro"}
        </Button>
      </div>
    </Drawer>
  );
}
