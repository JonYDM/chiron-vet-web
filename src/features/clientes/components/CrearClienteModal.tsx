import { useState } from "react";
import { Input, Select, Drawer, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { useToast } from "@/components/feedback/useToast";
import { opcionesDeEnum } from "@/lib/opciones";
import { origenClienteLabel } from "@/lib/enums";
import { OrigenCliente } from "@/types/api";
import { useCrearCliente } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Drawer para dar de alta SOLO un cliente (dueño). La mascota se agrega por separado. */
export function CrearClienteModal({ open, onClose }: Props) {
  const crear = useCrearCliente();
  const toast = useToast();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [origen, setOrigen] = useState<OrigenCliente>(OrigenCliente.NoEspecificado);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    try {
      await crear.mutateAsync({ nombre: nombre.trim(), telefono: telefono.trim(), origen });
      toast.exito("Cliente registrado 🎉");
      setNombre("");
      setTelefono("");
      setOrigen(OrigenCliente.NoEspecificado);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el cliente.");
      throw err;
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Nuevo cliente" descripcion="Da de alta al dueño. Luego podrás agregarle sus mascotas.">
      <Pasos
        guardando={crear.isPending}
        textoFinal="Registrar"
        onCompletado={onClose}
        onFinalizar={guardar}
        pasos={[
          {
            valido: nombre.trim().length > 0 && telefono.trim().length >= 10,
            contenido: (
              <div className="space-y-4">
                <Input
                  label="Nombre del dueño"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  autoFocus
                />
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
