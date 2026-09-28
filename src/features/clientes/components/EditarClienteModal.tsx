import { useState } from "react";
import { Input, Drawer, Select, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { origenClienteLabel } from "@/lib/enums";
import { useToast } from "@/components/feedback/useToast";
import type { Cliente } from "@/types/api";
import { useEditarCliente } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  cliente: Cliente;
}

/** Drawer para editar los datos de un cliente, en pasos cortos. */
export function EditarClienteModal({ open, onClose, cliente }: Props) {
  const editar = useEditarCliente();
  const toast = useToast();
  const [nombre, setNombre] = useState(cliente.nombre);
  const [telefono, setTelefono] = useState(cliente.telefono);
  const [origen, setOrigen] = useState<number>(cliente.origen);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    try {
      await editar.mutateAsync({
        clienteId: cliente.id,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        origen,
      });
      toast.exito("Cliente actualizado");
      // El cierre lo maneja Pasos tras "¡Listo!" (onCompletado).
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
      throw err;
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Editar cliente" descripcion="Actualiza los datos del dueño.">
      <Pasos
        guardando={editar.isPending}
        textoFinal="Guardar"
        libre
        onCompletado={onClose}
        onFinalizar={guardar}
        pasos={[
          {
            valido: nombre.trim().length > 0 && telefono.trim().length > 0,
            contenido: (
              <div className="space-y-4">
                <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <Input
                  label="Teléfono"
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
              <div className="space-y-4">
                <Select
                  label="¿Cómo nos conoció?"
                  value={origen}
                  onChange={(e) => setOrigen(Number(e.target.value))}
                  options={opcionesDeEnum(origenClienteLabel)}
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
