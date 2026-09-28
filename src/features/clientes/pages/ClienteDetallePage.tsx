import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, PawPrint, Pencil, Phone, Plus, Power } from "lucide-react";
import { Avatar, Badge, Button, Spinner } from "@/components/ui";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { especieLabel } from "@/lib/enums";
import { usePermisos } from "@/lib/usePermisos";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/useToast";
import { useUsuarioDeCliente } from "@/features/usuarios/hooks";
import { ResetearPinModal } from "@/features/usuarios";
import type { Cliente, Mascota } from "@/types/api";
import { useMascotas, useCambiarEstadoCliente } from "../hooks";
import { EditarClienteModal } from "../components/EditarClienteModal";
import { MascotaModal } from "../components/MascotaModal";
import { DarAccesoModal } from "../components/DarAccesoModal";

/**
 * Detalle de cliente (reemplaza el acordeón): datos, sus mascotas y acceso al portal.
 * El cliente llega por router state (desde la lista); si se entra directo por URL, se
 * degrada mostrando lo esencial (falta endpoint GET /clientes/{id}).
 */
export function ClienteDetallePage() {
  const { clienteId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cliente = (location.state as { cliente?: Cliente } | null)?.cliente ?? null;
  const p = usePermisos();
  const puedeAcceso = p("gestionar_acceso_portal");

  const [editarAbierto, setEditarAbierto] = useState(false);
  const [mascotaNueva, setMascotaNueva] = useState(false);
  const [mascotaEditar, setMascotaEditar] = useState<Mascota | null>(null);
  const [accesoAbierto, setAccesoAbierto] = useState(false);
  const [resetAbierto, setResetAbierto] = useState(false);

  const { data: mascotas, isLoading } = useMascotas(clienteId);
  const { data: usuario, isLoading: cargandoUsuario } = useUsuarioDeCliente(
    clienteId,
    puedeAcceso,
  );
  const cambiarEstado = useCambiarEstadoCliente();
  const confirmar = useConfirm();
  const toast = useToast();

  async function alternarEstado() {
    if (!cliente) return;
    const desactivar = cliente.activo;
    const ok = await confirmar({
      titulo: desactivar ? "Desactivar cliente" : "Reactivar cliente",
      mensaje: desactivar
        ? `¿Dar de baja a ${cliente.nombre}? Su historial se conserva.`
        : `¿Reactivar a ${cliente.nombre}?`,
      textoConfirmar: desactivar ? "Desactivar" : "Reactivar",
      peligroso: desactivar,
    });
    if (!ok) return;
    try {
      await cambiarEstado.mutateAsync({ clienteId, activar: !cliente.activo });
      toast.exito(desactivar ? "Cliente desactivado." : "Cliente reactivado.");
    } catch {
      toast.error("No se pudo cambiar el estado.");
    }
  }

  return (
    <PantallaConHeader
      titulo="Detalles del cliente"
      volverA={-1}
      tituloSuave
    >
      <div className="flex flex-col gap-4">
        {/* Tarjeta del cliente */}
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar nombre={cliente?.nombre ?? "?"} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-headline-md font-bold leading-tight text-on-surface">
                  {cliente?.nombre ?? "Cliente"}
                </h2>
                {/* Estado de acceso al portal, junto al nombre */}
                {puedeAcceso && usuario && (
                  <Badge tone="success">Portal ✓</Badge>
                )}
                {cliente && !cliente.activo && <Badge tone="danger">Inactivo</Badge>}
              </div>
              {cliente && (
                <p className="mt-1.5 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {cliente.telefono}
                </p>
              )}
            </div>
          </div>

          {cliente && (
            <div className="mt-4 flex gap-2">
              <Button variant="soft" size="sm" fullWidth onClick={() => setEditarAbierto(true)}>
                <Pencil className="h-4 w-4" aria-hidden />
                Editar
              </Button>
              <Button
                variant={cliente.activo ? "warning" : "secondary"}
                size="sm"
                fullWidth
                onClick={alternarEstado}
                loading={cambiarEstado.isPending}
              >
                <Power className="h-4 w-4" aria-hidden />
                {cliente.activo ? "Desactivar" : "Reactivar"}
              </Button>
            </div>
          )}
        </div>

        {/* Acceso al portal */}
        {puedeAcceso && (
          <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
            {cargandoUsuario ? (
              <Spinner label="Verificando acceso…" />
            ) : usuario ? (
              <Button variant="soft" fullWidth onClick={() => setResetAbierto(true)}>
                <KeyRound className="h-4 w-4" aria-hidden />
                Resetear PIN del portal
              </Button>
            ) : (
              <Button variant="secondary" fullWidth onClick={() => setAccesoAbierto(true)}>
                <KeyRound className="h-4 w-4" aria-hidden />
                Dar acceso al portal
              </Button>
            )}
          </div>
        )}

        {/* Mascotas */}
        <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-primary-container" aria-hidden />
              <h2 className="text-headline-sm font-bold text-on-surface">Mascotas</h2>
              {mascotas && mascotas.length > 0 && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-label-sm font-semibold text-primary-container">
                  {mascotas.length}
                </span>
              )}
            </div>
            <Button size="icon" onClick={() => setMascotaNueva(true)} aria-label="Agregar mascota">
              <Plus className="h-5 w-5" aria-hidden />
            </Button>
          </div>

          {isLoading ? (
            <Spinner label="Cargando mascotas…" />
          ) : mascotas && mascotas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {mascotas.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container p-3">
                  <button
                    onClick={() => navigate(`/app/mascotas/${m.id}`, { state: { mascota: m } })}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary text-primary-container">
                      {m.fotoPerfilUrl ? (
                        <img src={m.fotoPerfilUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PawPrint className="h-5 w-5" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-label-md font-semibold text-on-surface">
                        {m.nombre}
                      </span>
                      <span className="block text-body-sm text-on-surface-variant">
                        {especieLabel[m.especie]}
                        {m.raza ? ` · ${m.raza}` : ""}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setMascotaEditar(m)}
                    aria-label={`Editar ${m.nombre}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-body-sm text-on-surface-variant">
                Este cliente no tiene mascotas registradas.
              </p>
              <Button size="sm" onClick={() => setMascotaNueva(true)}>
                <Plus className="h-4 w-4" aria-hidden />
                Agregar mascota
              </Button>
            </div>
          )}
        </section>

        {!cliente && (
          <EmptyState
            titulo="Abre el cliente desde la lista"
            descripcion="Recarga desde la lista de clientes para ver todos los datos."
          />
        )}
      </div>

      {/* Modales */}
      {cliente && (
        <EditarClienteModal
          open={editarAbierto}
          onClose={() => setEditarAbierto(false)}
          cliente={cliente}
        />
      )}
      <MascotaModal open={mascotaNueva} onClose={() => setMascotaNueva(false)} clienteId={clienteId} />
      {mascotaEditar && (
        <MascotaModal
          open={!!mascotaEditar}
          onClose={() => setMascotaEditar(null)}
          clienteId={clienteId}
          mascota={mascotaEditar}
        />
      )}
      {cliente && (
        <DarAccesoModal
          open={accesoAbierto}
          onClose={() => setAccesoAbierto(false)}
          clienteId={clienteId}
          clienteNombre={cliente.nombre}
          clienteTelefono={cliente.telefono}
        />
      )}
      {usuario && (
        <ResetearPinModal
          open={resetAbierto}
          onClose={() => setResetAbierto(false)}
          usuarioId={usuario.id}
          nombre={cliente?.nombre ?? ""}
        />
      )}
    </PantallaConHeader>
  );
}
