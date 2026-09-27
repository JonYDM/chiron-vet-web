import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Receipt, Settings2, ShoppingCart, Trash2, Package } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Select,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { useClientes } from "@/features/clientes/hooks";
import { ApiError } from "@/lib/http";
import { categoriaProductoLabel } from "@/lib/enums";
import { formatCurrency } from "@/lib/format";
import { RolUsuario, MetodoPago, type Producto } from "@/types/api";
import { useToast } from "@/components/feedback/ToastProvider";
import { useCatalogo, useRegistrarVenta } from "../hooks";
import { AgregarProductoModal } from "../components/AgregarProductoModal";
import { EditarProductoModal } from "../components/EditarProductoModal";

interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

/** Página del punto de venta (F3.5): catálogo + carrito de venta. */
export function PosPage() {
  const { sesion } = useAuth();
  const veterinariaId = useVeterinariaId();
  const { data: productos, isLoading, isError } = useCatalogo();
  const registrarVenta = useRegistrarVenta();
  const toast = useToast();

  const [carrito, setCarrito] = useState<Record<string, LineaCarrito>>({});
  const [modalProducto, setModalProducto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [clienteId, setClienteId] = useState<string>("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.Efectivo);
  const [montoRecibido, setMontoRecibido] = useState<string>("");
  const [recibo, setRecibo] = useState<{ total: number; cambio: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const esAdmin = sesion?.rol === RolUsuario.Administrador;
  const { data: clientesPag } = useClientes({ tamano: 100 });
  const clientes = clientesPag?.items ?? [];

  const lineas = Object.values(carrito);
  const total = useMemo(
    () => lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0),
    [lineas],
  );

  function agregar(p: Producto) {
    setCarrito((prev) => {
      const actual = prev[p.id]?.cantidad ?? 0;
      if (actual >= p.stock) return prev;
      return { ...prev, [p.id]: { producto: p, cantidad: actual + 1 } };
    });
  }

  function quitar(id: string) {
    setCarrito((prev) => {
      const actual = prev[id]?.cantidad ?? 0;
      if (actual <= 1) {
        const copia = { ...prev };
        delete copia[id];
        return copia;
      }
      return { ...prev, [id]: { ...prev[id], cantidad: actual - 1 } };
    });
  }

  async function cobrar() {
    setError(null);
    // Validación de efectivo: si se indicó monto recibido, debe cubrir el total.
    const recibido = montoRecibido ? Number(montoRecibido) : null;
    if (
      metodoPago === MetodoPago.Efectivo &&
      recibido != null &&
      recibido < total
    ) {
      setError("El monto recibido no cubre el total.");
      return;
    }
    try {
      const resp = await registrarVenta.mutateAsync({
        veterinariaId,
        clienteId: clienteId || null,
        items: lineas.map((l) => ({
          productoId: l.producto.id,
          cantidad: l.cantidad,
        })),
        metodoPago,
        montoRecibido: metodoPago === MetodoPago.Efectivo ? recibido : null,
      });
      toast.exito(`Venta registrada por ${formatCurrency(resp.total)} 🎉`);
      setRecibo({ total: resp.total, cambio: resp.cambio });
      setCarrito({});
      setClienteId("");
      setMontoRecibido("");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "No se pudo registrar la venta.";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Punto de venta"
        descripcion="Selecciona productos y registra la venta"
        accion={
          esAdmin ? (
            <div className="flex gap-2">
              <Link to="/app/ventas">
                <Button variant="ghost">
                  <Receipt className="h-4 w-4" aria-hidden />
                  Historial
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => setModalProducto(true)}>
                <Plus className="h-4 w-4" aria-hidden />
                Producto
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Catálogo */}
        <section>
          {isLoading ? (
            <div className="grid place-items-center py-12">
              <Spinner label="Cargando catálogo…" />
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-danger">
                No se pudo cargar el catálogo.
              </CardContent>
            </Card>
          ) : productos && productos.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {productos.map((p) => {
                const agotado = p.stock <= 0;
                return (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-ink">{p.nombre}</p>
                        <Badge tone={agotado ? "danger" : "neutral"}>
                          {agotado ? "Agotado" : `Stock ${p.stock}`}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {categoriaProductoLabel[p.categoria]}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-ink">
                          {formatCurrency(p.precio)}
                        </span>
                        <div className="flex gap-1.5">
                          {esAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditando(p)}
                              aria-label={`Editar ${p.nombre}`}
                            >
                              <Settings2 className="h-4 w-4" aria-hidden />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => agregar(p)}
                            disabled={agotado}
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-hairline text-ink-soft">
                  <Package className="h-7 w-7" aria-hidden />
                </div>
                <p className="font-semibold text-ink">Catálogo vacío</p>
                <p className="max-w-xs text-sm text-ink-soft">
                  {esAdmin
                    ? "Agrega tu primer producto."
                    : "Aún no hay productos en el catálogo."}
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Carrito */}
        <aside>
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
                <ShoppingCart className="h-5 w-5 text-primary" aria-hidden />
                Venta actual
              </h2>

              {lineas.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-soft">
                  Agrega productos del catálogo.
                </p>
              ) : (
                <ul className="space-y-2">
                  {lineas.map((l) => (
                    <li
                      key={l.producto.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-canvas p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {l.producto.nombre}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {formatCurrency(l.producto.precio)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => quitar(l.producto.id)}
                          aria-label="Quitar uno"
                          className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-ink-soft hover:text-ink"
                        >
                          {l.cantidad <= 1 ? (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          ) : (
                            <Minus className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">
                          {l.cantidad}
                        </span>
                        <button
                          onClick={() => agregar(l.producto)}
                          aria-label="Agregar uno"
                          disabled={l.cantidad >= l.producto.stock}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-ink-soft hover:text-ink disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4">
                <Select
                  label="Cliente (opcional)"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  options={[
                    { value: "", label: "Público en general" },
                    ...(clientes ?? []).map((c) => ({ value: c.id, label: c.nombre })),
                  ]}
                />
              </div>

              <div className="mt-3">
                <Select
                  label="Método de pago"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(Number(e.target.value))}
                  options={[
                    { value: MetodoPago.Efectivo, label: "Efectivo" },
                    { value: MetodoPago.Tarjeta, label: "Tarjeta" },
                    { value: MetodoPago.Transferencia, label: "Transferencia" },
                  ]}
                />
              </div>

              {metodoPago === MetodoPago.Efectivo && (
                <div className="mt-3">
                  <Input
                    label="Monto recibido (opcional)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                  />
                  {montoRecibido && Number(montoRecibido) >= total && (
                    <p className="mt-1.5 text-sm text-ink-soft">
                      Cambio:{" "}
                      <span className="font-semibold text-ink">
                        {formatCurrency(Number(montoRecibido) - total)}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                <span className="text-ink-soft">Total</span>
                <span className="text-xl font-bold text-ink">
                  {formatCurrency(total)}
                </span>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl bg-danger/10 px-4 py-2.5 text-center text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <Button
                fullWidth
                size="lg"
                className="mt-3"
                onClick={cobrar}
                loading={registrarVenta.isPending}
                disabled={lineas.length === 0}
              >
                Cobrar
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {esAdmin && (
        <AgregarProductoModal
          open={modalProducto}
          onClose={() => setModalProducto(false)}
        />
      )}
      {esAdmin && editando && (
        <EditarProductoModal
          open={!!editando}
          onClose={() => setEditando(null)}
          producto={editando}
        />
      )}

      {/* Recibo tras cobrar */}
      <Modal
        open={!!recibo}
        onClose={() => setRecibo(null)}
        title="Venta registrada ✓"
      >
        {recibo && (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
              <Receipt className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-ink-soft">Total cobrado</p>
              <p className="text-2xl font-bold text-ink">
                {formatCurrency(recibo.total)}
              </p>
            </div>
            {recibo.cambio != null && recibo.cambio > 0 && (
              <div className="rounded-xl bg-accent/15 px-4 py-3">
                <p className="text-sm text-[#9A6A00]">Cambio a entregar</p>
                <p className="text-xl font-bold text-[#9A6A00]">
                  {formatCurrency(recibo.cambio)}
                </p>
              </div>
            )}
            <Button fullWidth onClick={() => setRecibo(null)}>
              Listo
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
