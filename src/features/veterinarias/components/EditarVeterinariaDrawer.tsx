import { useState } from "react";
import { Drawer, Input, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { useToast } from "@/components/feedback/useToast";
import type { PlanSuscripcion, Veterinaria } from "@/types/api";
import { useEditarVeterinaria } from "../hooks";
import { SelectorPlan } from "./SelectorPlan";

interface Props {
  veterinaria: Veterinaria;
  onClose: () => void;
}

/**
 * Edición de veterinaria = EditarVeterinariaDto (nombre, teléfono, dirección, plan).
 * Mismos pasos que el alta, pero libres (se puede saltar directo a cualquiera).
 * La fecha de renovación NO se edita aquí: tiene su propio ajuste manual.
 */
export function EditarVeterinariaDrawer({ veterinaria, onClose }: Props) {
  const editar = useEditarVeterinaria();
  const toast = useToast();
  const [nombre, setNombre] = useState(veterinaria.nombre);
  const [telefono, setTelefono] = useState(veterinaria.telefono);
  const [direccion, setDireccion] = useState(veterinaria.direccion ?? "");
  const [plan, setPlan] = useState<PlanSuscripcion>(veterinaria.plan);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    try {
      await editar.mutateAsync({
        id: veterinaria.id,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim() || null,
        plan,
      });
      toast.exito("Veterinaria actualizada");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron guardar los cambios.");
      throw err;
    }
  }

  const alertaError = error && (
    <p role="alert" className="rounded-xl bg-error-container/60 px-4 py-3 text-body-sm font-medium text-on-error-container">
      {error}
    </p>
  );

  return (
    <Drawer open onClose={onClose} title="Editar veterinaria" descripcion={veterinaria.nombre}>
      <Pasos
        libre
        guardando={editar.isPending}
        textoFinal="Guardar cambios"
        textoCompletado="¡Cambios guardados!"
        onFinalizar={guardar}
        onCompletado={onClose}
        pasos={[
          {
            valido: nombre.trim().length > 0 && telefono.trim().length >= 10,
            contenido: (
              <div className="space-y-4">
                <Input label="Nombre de la veterinaria" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <Input
                  label="Teléfono de contacto"
                  inputMode="numeric"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  hint="10 dígitos"
                  required
                />
              </div>
            ),
          },
          {
            contenido: (
              <Input
                label="Dirección (opcional)"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value.slice(0, 250))}
                placeholder="Calle, número, colonia, ciudad"
              />
            ),
          },
          {
            contenido: (
              <div className="space-y-4">
                <SelectorPlan plan={plan} onChange={setPlan} />
                <p className="text-body-sm text-on-surface-variant">
                  Cambiar el plan aplica desde la próxima renovación; no mueve la fecha actual.
                </p>
                {alertaError}
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
