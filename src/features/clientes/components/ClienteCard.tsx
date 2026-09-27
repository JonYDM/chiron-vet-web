import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  KeyRound,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  Power,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { especieLabel } from "@/lib/enums";
import { useUsuarioDeCliente } from "@/features/usuarios/hooks";
import { usePermisos } from "@/lib/usePermisos";
import { ResetearPinModal } from "@/features/usuarios";
import { useMascotas, useCambiarEstadoCliente } from "../hooks";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/useToast";
import { DarAccesoModal } from "./DarAccesoModal";
import { EditarClienteModal } from "./EditarClienteModal";
import { MascotaModal } from "./MascotaModal";
import type { Cliente, Mascota } from "@/types/api";

/** Tarjeta de cliente con acciones: editar, mascotas (agregar/editar), acceso al portal. */
export function ClienteCard({ cliente }: { cliente: Cliente }) {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [accesoAbierto, setAccesoAbierto] = useState(false);
  const [resetAbierto, setResetAbierto] = useState(false);
  const [editarClienteAbierto, setEditarClienteAbierto] = useState(false);
  const [mascotaNueva, setMascotaNueva] = useState(false);
  const [mascotaEditar, setMascotaEditar] = useState<Mascota | null>(null);

  const { data: mascotas, isLoading } = useMascotas(abierto ? cliente.id : null);
  const cambiarEstado = useCambiarEstadoCliente();
  const confirmar = useConfirm();
  const toast = useToast();
  const p = usePermisos();

  async function alternarEstado() {
    const desactivar = cliente.activo;
    const ok = await confirmar({
      titulo: desactivar ? "Desactivar cliente" : "Reactivar cliente",
      mensaje: desactivar
        ? `¿Dar de baja a ${cliente.nombre}? Su historial se conserva y podrás reactivarlo después.`
        : `¿Reactivar a ${cliente.nombre}?`,
      textoConfirmar: desactivar ? "Desactivar" : "Reactivar",
      peligroso: desactivar,
    });
    if (!ok) return;
    try {
      await cambiarEstado.mutateAsync({ clienteId: cliente.id, activar: !cliente.activo });
      toast.exito(desactivar ? "Cliente desactivado." : "Cliente reactivado.");
    } catch {
      toast.error("No se pudo cambiar el estado del cliente.");
    }
  }
  const puedeAcceso = p("gestionar_acceso_portal");
  const { data: usuario, isLoading: cargandoUsuario } = useUsuarioDeCliente(
    abierto ? cliente.id : null,
    puedeAcceso,
  );

  return (
    <Card>
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-semibold text-ink">
              {cliente.nombre}
              {!cliente.activo && <Badge tone="danger">Inactivo</Badge>}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {cliente.telefono}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-ink-soft transition-transform",
              abierto && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={alternarEstado}
          aria-label={cliente.activo ? "Desactivar cliente" : "Reactivar cliente"}
          loading={cambiarEstado.isPending}
        >
          <Power className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditarClienteAbierto(true)}
          aria-label="Editar cliente"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {abierto && (
        <div className="space-y-3 border-t border-hairline p-4">
          {isLoading ? (
            <Spinner label="Cargando mascotas…" />
          ) : mascotas && mascotas.length > 0 ? (
            <ul className="space-y-2">
              {mascotas.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-3"
                >
                  <button
                    onClick={() => navigate(`/app/mascotas/${m.id}`)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <PawPrint className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="truncate font-medium text-ink">{m.nombre}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{especieLabel[m.especie]}</Badge>
                    <button
                      onClick={() => setMascotaEditar(m)}
                      aria-label={`Editar ${m.nombre}`}
                      className="text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">
              Este cliente no tiene mascotas registradas.
            </p>
          )}

          <Button variant="ghost" size="sm" fullWidth onClick={() => setMascotaNueva(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Agregar mascota
          </Button>

          {/* Acceso al portal */}
          {puedeAcceso &&
            (cargandoUsuario ? (
              <Spinner label="Verificando acceso…" />
            ) : usuario ? (
              <div className="flex items-center gap-2">
                <Badge tone="success">Con acceso al portal</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setResetAbierto(true)}
                >
                  <KeyRound className="h-4 w-4" aria-hidden />
                  Resetear PIN
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => setAccesoAbierto(true)}
              >
                <KeyRound className="h-4 w-4" aria-hidden />
                Dar acceso al portal
              </Button>
            ))}
        </div>
      )}

      {/* Modales */}
      <EditarClienteModal
        open={editarClienteAbierto}
        onClose={() => setEditarClienteAbierto(false)}
        cliente={cliente}
      />
      <MascotaModal
        open={mascotaNueva}
        onClose={() => setMascotaNueva(false)}
        clienteId={cliente.id}
      />
      {mascotaEditar && (
        <MascotaModal
          open={!!mascotaEditar}
          onClose={() => setMascotaEditar(null)}
          clienteId={cliente.id}
          mascota={mascotaEditar}
        />
      )}
      <DarAccesoModal
        open={accesoAbierto}
        onClose={() => setAccesoAbierto(false)}
        clienteId={cliente.id}
        clienteNombre={cliente.nombre}
        clienteTelefono={cliente.telefono}
      />
      {usuario && (
        <ResetearPinModal
          open={resetAbierto}
          onClose={() => setResetAbierto(false)}
          usuarioId={usuario.id}
          nombre={cliente.nombre}
        />
      )}
    </Card>
  );
}
