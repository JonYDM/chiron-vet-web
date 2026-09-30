import { useState } from "react";
import { Drawer, Input, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { useToast } from "@/components/feedback/useToast";
import { PlanSuscripcion, type Sucursal } from "@/types/api";
import { useCrearSucursal, useEditarSucursal } from "../hooks";
import { montoValido, PRECIO_BASE } from "../suscripcion";
import { SelectorPlan } from "./SelectorPlan";
import { CampoPrecio } from "./CampoPrecio";

interface Props {
  veterinariaId: string;
  veterinariaNombre: string;
  /** Si viene, edita esa sucursal; si no, da de alta una nueva. */
  sucursal?: Sucursal;
  onClose: () => void;
}

/**
 * Alta/edición de sucursal (= SucursalRequest) en 2 pasos: datos → plan y renta.
 * En el alta, mientras no toquen el precio, cambiar el plan pone el precio base de ese plan.
 * Editar no mueve la fecha de renovación.
 */
export function SucursalDrawer({ veterinariaId, veterinariaNombre, sucursal, onClose }: Props) {
  const crear = useCrearSucursal();
  const editar = useEditarSucursal();
  const toast = useToast();
  const esEdicion = !!sucursal;
  const [nombre, setNombre] = useState(sucursal?.nombre ?? "");
  const [telefono, setTelefono] = useState(sucursal?.telefono ?? "");
  const [direccion, setDireccion] = useState(sucursal?.direccion ?? "");
  const [plan, setPlan] = useState<PlanSuscripcion>(sucursal?.plan ?? PlanSuscripcion.Mensual);
  const [precio, setPrecio] = useState(String(sucursal?.precio ?? PRECIO_BASE[PlanSuscripcion.Mensual]));
  const [precioTocado, setPrecioTocado] = useState(esEdicion);
  const [error, setError] = useState<string | null>(null);
  const monto = montoValido(precio);

  function cambiarPlan(p: PlanSuscripcion) {
    setPlan(p);
    if (!precioTocado) setPrecio(String(PRECIO_BASE[p]));
  }

  async function guardar() {
    setError(null);
    const body = {
      nombre: nombre.trim(),
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
      plan,
      precio: monto ?? 0,
    };
    try {
      if (sucursal) await editar.mutateAsync({ id: sucursal.id, body });
      else await crear.mutateAsync({ veterinariaId, body });
      toast.exito(esEdicion ? "Sucursal actualizada" : "Sucursal creada");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la sucursal.");
      throw err;
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={esEdicion ? "Editar sucursal" : "Nueva sucursal"}
      descripcion={veterinariaNombre}
    >
      <Pasos
        libre={esEdicion}
        guardando={crear.isPending || editar.isPending}
        textoFinal={esEdicion ? "Guardar cambios" : "Crear sucursal"}
        onFinalizar={guardar}
        onCompletado={onClose}
        pasos={[
          {
            valido: nombre.trim().length > 0 && (telefono.length === 0 || telefono.length === 10),
            contenido: (
              <div className="space-y-4">
                <Input
                  label="Nombre de la sucursal"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.slice(0, 120))}
                  placeholder="Ej. Sucursal Centro"
                  autoFocus
                  required
                />
                <Input
                  label="Teléfono (opcional)"
                  inputMode="numeric"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  hint="10 dígitos"
                />
                <Input
                  label="Dirección (opcional)"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value.slice(0, 250))}
                  placeholder="Calle, número, colonia, ciudad"
                />
              </div>
            ),
          },
          {
            valido: monto !== null,
            contenido: (
              <div className="space-y-4">
                <SelectorPlan plan={plan} onChange={cambiarPlan} />
                <CampoPrecio
                  plan={plan}
                  valor={precio}
                  onChange={(v) => {
                    setPrecio(v);
                    setPrecioTocado(true);
                  }}
                />
                {esEdicion && (
                  <p className="text-body-sm text-on-surface-variant">
                    El cambio de plan o de renta aplica desde la próxima renovación.
                  </p>
                )}
                {error && (
                  <p role="alert" className="rounded-xl bg-error-container/60 px-4 py-3 text-body-sm font-medium text-on-error-container">
                    {error}
                  </p>
                )}
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
