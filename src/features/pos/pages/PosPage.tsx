import { useMemo, useState } from "react";
import {
  Banknote,
  Check,
  ClipboardList,
  CreditCard,
  Minus,
  Package,
  Plus,
  Receipt,
  Search,
  Settings2,
  Smartphone,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import {
  Badge,
  Button,
  Drawer,
  Input,
  Select,
  SkeletonFila,
} from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useVeterinariaId } from "@/features/auth/useVeterinariaId";
import { useClientes } from "@/features/clientes/hooks";
import { useToast } from "@/components/feedback/useToast";
import { ApiError } from "@/lib/http";
import { cn } from "@/lib/cn";
import { categoriaProductoLabel } from "@/lib/enums";
import { formatCurrency } from "@/lib/format";
import { CategoriaProducto, MetodoPago, RolUsuario, type Producto } from "@/types/api";
import { useCatalogo, useRegistrarVenta } from "../hooks";
import { useCargosPendientes } from "@/features/cobros/hooks";
import type { CargoPendiente } from "@/features/cobros/api";
import { AgregarProductoModal } from "../components/AgregarProductoModal";
import { EditarProductoModal } from "../components/EditarProductoModal";

interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

const CATEGORIAS: { valor: CategoriaProducto | null; label: string }[] = [
  { valor: null, label: "Todos" },
  { valor: CategoriaProducto.Alimento, label: "Alimento" },
  { valor: CategoriaProducto.Medicina, label: "Medicina" },
  { valor: CategoriaProducto.Accesorio, label: "Accesorio" },
  { valor: CategoriaProducto.Higiene, label: "Higiene" },
  { valor: CategoriaProducto.Otro, label: "Otro" },
];

/** Métodos de pago como recuadros (con ícono) para el cobro. */
const METODOS: { valor: MetodoPago; label: string; icon: typeof Banknote }[] = [
  { valor: MetodoPago.Efectivo, label: "Efectivo", icon: Banknote },
  { valor: MetodoPago.Tarjeta, label: "Tarjeta", icon: CreditCard },
  { valor: MetodoPago.Transferencia, label: "Transfer.", icon: Smartphone },
];

/** Punto de venta mobile-first: catálogo tocable + barra de carrito + cobro en Drawer. */
export function PosPage() {
  const { sesion } = useAuth();
  const veterinariaId = useVeterinariaId();
  const { data: productos, isLoading, isError } = useCatalogo();
  const registrarVenta = useRegistrarVenta();
  const toast = useToast();

  const [carrito, setCarrito] = useState<Record<string, LineaCarrito>>({});
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProducto | null>(null);
  const [modalProducto, setModalProducto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.Efectivo);
  const [montoRecibido, setMontoRecibido] = useState("");
  const [recibo, setRecibo] = useState<{ total: number; cambio: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const esAdmin = sesion?.rol === RolUsuario.Administrador;
  const { data: clientesPag } = useClientes({ tamano: 100 });
  const clientes = clientesPag?.items ?? [];

  // Cargos pendientes (cuentas por cobrar de consultas) + selección para cobrar.
  const { data: cargosPendientes } = useCargosPendientes();
  const [cargosSel, setCargosSel] = useState<Record<string, CargoPendiente>>({});
  const cargosElegidos = Object.values(cargosSel);

  const lineas = Object.values(carrito);
  const totalArticulos = lineas.reduce((s, l) => s + l.cantidad, 0) + cargosElegidos.length;
  const total = useMemo(
    () =>
      lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0) +
      cargosElegidos.reduce((s, c) => s + c.monto, 0),
    [lineas, cargosElegidos],
  );

  function toggleCargo(c: CargoPendiente) {
    setCargosSel((prev) => {
      const copia = { ...prev };
      if (copia[c.id]) delete copia[c.id];
      else copia[c.id] = c;
      return copia;
    });
  }

  const visibles = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return (productos ?? []).filter((p) => {
      if (categoria !== null && p.categoria !== categoria) return false;
      if (q && !p.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [productos, categoria, texto]);

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
    const recibido = montoRecibido ? Number(montoRecibido) : null;
    if (metodoPago === MetodoPago.Efectivo && recibido != null && recibido < total) {
      setError("El monto recibido no cubre el total.");
      return;
    }
    try {
      const resp = await registrarVenta.mutateAsync({
        veterinariaId,
        clienteId: clienteId || null,
        items: lineas.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad })),
        metodoPago,
        montoRecibido: metodoPago === MetodoPago.Efectivo ? recibido : null,
        cargoIds: cargosElegidos.map((c) => c.id),
      });
      toast.exito(`Venta registrada por ${formatCurrency(resp.total)} 🎉`);
      setRecibo({ total: resp.total, cambio: resp.cambio });
      setCarrito({});
      setCargosSel({});
      setClienteId("");
      setMontoRecibido("");
      setCobroAbierto(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No se pudo registrar la venta.";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <PantallaConHeader
      titulo="Punto de venta"
      subtitulo={
        <p className="text-body-sm text-on-surface-variant">Cobro y catálogo</p>
      }
      accion={
        <div className="flex items-center gap-2">
          <img
            src="/pet-store.webp"
            alt=""
            aria-hidden
            className="-my-3 h-16 w-16 shrink-0 object-contain drop-shadow-sm"
          />
          {esAdmin && (
            <Button size="icon" onClick={() => setModalProducto(true)} aria-label="Nuevo producto">
              <Plus className="h-5 w-5" aria-hidden />
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-20">
        {/* Buscador */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            variant="soft"
            aria-label="Buscar productos"
            placeholder="Buscar producto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {/* Cobros pendientes (cargos de consultas generados por el veterinario) */}
        {cargosPendientes && cargosPendientes.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="flex items-center gap-1.5 text-label-lg font-bold text-on-surface">
              <ClipboardList className="h-4 w-4 text-primary-container" aria-hidden />
              Cobros pendientes
            </h2>
            <div className="flex flex-col gap-2">
              {cargosPendientes.map((c) => {
                const sel = !!cargosSel[c.id];
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCargo(c)}
                    className={
                      "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors " +
                      (sel
                        ? "border-primary-container bg-primary-container/10"
                        : "border-outline-variant/40 bg-surface-container-lowest")
                    }
                  >
                    <span
                      className={
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg " +
                        (sel ? "bg-primary-container text-on-primary" : "bg-primary-fixed/40 text-tertiary")
                      }
                    >
                      {sel ? <Check className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label-md font-bold text-on-surface">{c.concepto}</span>
                      <span className="block truncate text-body-sm text-on-surface-variant">
                        {c.mascotaNombre} · {c.clienteNombre}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-label-lg font-bold text-primary-container">
                      {formatCurrency(c.monto)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Chips de categoría */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIAS.map((cat) => {
            const activo = categoria === cat.valor;
            return (
              <button
                key={cat.label}
                onClick={() => setCategoria(cat.valor)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-label-md font-semibold transition-colors",
                  activo
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface",
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Catálogo */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudo cargar el catálogo.
          </div>
        ) : visibles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {visibles.map((p) => (
              <ProductoCard
                key={p.id}
                producto={p}
                enCarrito={carrito[p.id]?.cantidad ?? 0}
                esAdmin={esAdmin}
                onAgregar={() => agregar(p)}
                onQuitar={() => quitar(p.id)}
                onEditar={() => setEditando(p)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            titulo={texto || categoria !== null ? "Sin resultados" : "Catálogo vacío"}
            descripcion={
              texto || categoria !== null
                ? "No hay productos que coincidan."
                : esAdmin
                  ? "Agrega tu primer producto para empezar a vender."
                  : "Aún no hay productos en el catálogo."
            }
          />
        )}
      </div>

      {/* Barra flotante del carrito (encima del bottom-nav) */}
      {totalArticulos > 0 && (
        <div
          className="fixed inset-x-0 z-30 px-[5%]"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
        >
          <button
            onClick={() => setCobroAbierto(true)}
            className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-full bg-primary-container px-5 py-3.5 text-on-primary shadow-primary-glow transition-transform active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-label-md font-bold">
                {totalArticulos}
              </span>
              <span className="text-label-lg font-bold">Ver carrito</span>
            </span>
            <span className="tabular text-label-lg font-bold">{formatCurrency(total)}</span>
          </button>
        </div>
      )}

      {/* Drawer de cobro (una sola vista) */}
      <Drawer
        open={cobroAbierto}
        onClose={() => setCobroAbierto(false)}
        title="Cobrar venta"
        descripcion="Revisa los productos y registra el cobro."
      >
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {lineas.map((l) => (
              <li
                key={l.producto.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-label-md font-semibold text-on-surface">{l.producto.nombre}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatCurrency(l.producto.precio)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => quitar(l.producto.id)}
                    aria-label="Quitar uno"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-surface-container text-on-surface-variant"
                  >
                    {l.cantidad <= 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </button>
                  <span className="w-5 text-center text-label-md font-bold">{l.cantidad}</span>
                  <button
                    onClick={() => agregar(l.producto)}
                    aria-label="Agregar uno"
                    disabled={l.cantidad >= l.producto.stock}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-surface-container text-on-surface-variant disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {cargosElegidos.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-primary-fixed/30 p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-label-md font-semibold text-on-surface">{c.concepto}</p>
                  <p className="truncate text-body-sm text-on-surface-variant">
                    {c.mascotaNombre} · consulta
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular text-label-md font-bold text-on-surface">{formatCurrency(c.monto)}</span>
                  <button
                    onClick={() => toggleCargo(c)}
                    aria-label="Quitar cargo"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-surface-container text-on-surface-variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Select
            label="Cliente (opcional)"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            options={[
              { value: "", label: "Público en general" },
              ...clientes.map((c) => ({ value: c.id, label: c.nombre })),
            ]}
          />

          {/* Método de pago: 3 recuadros en una fila */}
          <div>
            <p className="mb-1.5 text-label-md font-semibold text-on-surface-variant">Método de pago</p>
            <div className="grid grid-cols-3 gap-2">
              {METODOS.map((m) => {
                const activo = metodoPago === m.valor;
                return (
                  <button
                    key={m.valor}
                    type="button"
                    onClick={() => setMetodoPago(m.valor)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors",
                      activo
                        ? "border-primary-container bg-primary-container/10 text-primary-container"
                        : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant",
                    )}
                  >
                    <m.icon className="h-5 w-5" aria-hidden />
                    <span className="text-label-sm font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {metodoPago === MetodoPago.Efectivo && (
            <div>
              <Input
                label="Monto recibido (opcional)"
                type="number"
                min="0"
                step="0.01"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
              />
              {montoRecibido && Number(montoRecibido) >= total && (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-secondary-fixed/60 px-4 py-2.5">
                  <span className="text-label-md font-semibold text-on-secondary-fixed">Cambio a entregar</span>
                  <span className="tabular text-headline-sm font-bold text-on-secondary-fixed">
                    {formatCurrency(Number(montoRecibido) - total)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
            <span className="text-on-surface-variant">Total</span>
            <span className="tabular text-headline-md font-bold text-on-surface">{formatCurrency(total)}</span>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-error-container/60 px-4 py-2.5 text-center text-body-sm font-medium text-on-error-container">
              {error}
            </p>
          )}

          <Button
            fullWidth
            size="lg"
            onClick={cobrar}
            loading={registrarVenta.isPending}
            disabled={lineas.length === 0}
          >
            Cobrar {formatCurrency(total)}
          </Button>
        </div>
      </Drawer>

      {esAdmin && (
        <AgregarProductoModal open={modalProducto} onClose={() => setModalProducto(false)} />
      )}
      {esAdmin && editando && (
        <EditarProductoModal open={!!editando} onClose={() => setEditando(null)} producto={editando} />
      )}

      {/* Recibo tras cobrar */}
      <Drawer open={!!recibo} onClose={() => setRecibo(null)} title="Venta registrada ✓">
        {recibo && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-container/15 text-primary-container">
              <Receipt className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <p className="text-body-sm text-on-surface-variant">Total cobrado</p>
              <p className="tabular text-headline-lg font-bold text-on-surface">
                {formatCurrency(recibo.total)}
              </p>
            </div>
            {recibo.cambio != null && recibo.cambio > 0 && (
              <div className="w-full rounded-xl bg-secondary-fixed/60 px-4 py-3">
                <p className="text-body-sm text-on-secondary-fixed">Cambio a entregar</p>
                <p className="tabular text-headline-sm font-bold text-on-secondary-fixed">
                  {formatCurrency(recibo.cambio)}
                </p>
              </div>
            )}
            <Button fullWidth onClick={() => setRecibo(null)}>
              Listo
            </Button>
          </div>
        )}
      </Drawer>
    </PantallaConHeader>
  );
}

/** Card de producto tocable: tap para agregar; control +/− si ya está en el carrito. */
function ProductoCard({
  producto,
  enCarrito,
  esAdmin,
  onAgregar,
  onQuitar,
  onEditar,
}: {
  producto: Producto;
  enCarrito: number;
  esAdmin: boolean;
  onAgregar: () => void;
  onQuitar: () => void;
  onEditar: () => void;
}) {
  const agotado = producto.stock <= 0;
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-2xl border bg-surface-container-lowest p-3.5 shadow-soft transition-transform",
        enCarrito > 0 ? "border-primary-container" : "border-outline-variant/40",
      )}
    >
      <button
        onClick={onAgregar}
        disabled={agotado || enCarrito >= producto.stock}
        className="flex flex-1 flex-col items-start text-left disabled:opacity-50"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
          <Package className="h-5 w-5" aria-hidden />
        </div>
        <p className="mt-2 line-clamp-2 text-label-lg font-bold text-on-surface">{producto.nombre}</p>
        <p className="text-body-sm text-on-surface-variant">{categoriaProductoLabel[producto.categoria]}</p>
        <p className="mt-1 tabular text-headline-sm font-bold text-primary-container">
          {formatCurrency(producto.precio)}
        </p>
      </button>

      <div className="mt-2.5">
        {enCarrito > 0 ? (
          // Control +/− para corregir la cantidad sin abrir el carrito.
          <div className="flex items-center justify-between rounded-xl bg-primary-container/10 p-1">
            <button
              onClick={onQuitar}
              aria-label={`Quitar uno de ${producto.nombre}`}
              className="grid h-8 w-8 place-items-center rounded-lg bg-surface-container-lowest text-primary-container shadow-soft active:scale-95"
            >
              {enCarrito <= 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            </button>
            <span className="tabular text-label-lg font-bold text-primary-container">{enCarrito}</span>
            <button
              onClick={onAgregar}
              disabled={enCarrito >= producto.stock}
              aria-label={`Agregar uno de ${producto.nombre}`}
              className="grid h-8 w-8 place-items-center rounded-lg bg-surface-container-lowest text-primary-container shadow-soft active:scale-95 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Badge tone={agotado ? "danger" : "neutral"}>
              {agotado ? "Agotado" : `Stock ${producto.stock}`}
            </Badge>
            {esAdmin && (
              <button
                onClick={onEditar}
                aria-label={`Editar ${producto.nombre}`}
                className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <Settings2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
