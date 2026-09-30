import { useState } from "react";
import { Input, Drawer, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { useToast } from "@/components/feedback/useToast";
import { PlanSuscripcion } from "@/types/api";
import { useCrearVeterinaria } from "../hooks";
import { SelectorPlan } from "./SelectorPlan";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Alta de veterinaria en 3 pasos: datos de contacto → dirección → plan de suscripción. */
export function CrearVeterinariaModal({ open, onClose }: Props) {
  const crear = useCrearVeterinaria();
  const toast = useToast();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [plan, setPlan] = useState<PlanSuscripcion>(PlanSuscripcion.Mensual);
  const [error, setError] = useState<string | null>(null);

  function limpiar() {
    setNombre("");
    setTelefono("");
    setDireccion("");
    setPlan(PlanSuscripcion.Mensual);
    setError(null);
  }

  async function guardar() {
    setError(null);
    try {
      await crear.mutateAsync({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim() || null,
        plan,
      });
      toast.exito("Veterinaria creada");
      limpiar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la veterinaria.");
      throw err;
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Nueva veterinaria" descripcion="Da de alta una clínica cliente.">
      <Pasos
        guardando={crear.isPending}
        textoFinal="Crear"
        onCompletado={onClose}
        onFinalizar={guardar}
        pasos={[
          {
            valido: nombre.trim().length > 0 && telefono.trim().length >= 10,
            contenido: (
              <div className="space-y-4">
                <Input
                  label="Nombre de la veterinaria"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  autoFocus
                />
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
