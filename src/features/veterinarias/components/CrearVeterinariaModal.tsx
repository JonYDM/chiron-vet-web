import { useState } from "react";
import { Input, Drawer, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { useToast } from "@/components/feedback/useToast";
import { useCrearVeterinaria } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Drawer para dar de alta una veterinaria, en pasos cortos. */
export function CrearVeterinariaModal({ open, onClose }: Props) {
  const crear = useCrearVeterinaria();
  const toast = useToast();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    try {
      await crear.mutateAsync({ nombre: nombre.trim(), telefono: telefono.trim() });
      toast.exito("Veterinaria creada 🏥");
      setNombre("");
      setTelefono("");
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
            valido: nombre.trim().length > 0,
            contenido: (
              <Input
                label="Nombre de la veterinaria"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoFocus
              />
            ),
          },
          {
            valido: telefono.trim().length > 0,
            contenido: (
              <div className="space-y-4">
                <Input
                  label="Teléfono de contacto"
                  inputMode="numeric"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
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
