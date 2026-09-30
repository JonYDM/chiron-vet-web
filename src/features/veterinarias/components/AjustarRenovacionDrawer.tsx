import { useState } from "react";
import { Button, Drawer, Input } from "@/components/ui";
import { useToast } from "@/components/feedback/useToast";
import type { Sucursal } from "@/types/api";
import { useAjustarRenovacionSucursal } from "../hooks";

interface Props {
  sucursal: Sucursal;
  /** Para el texto: "Matriz de Temixco Vet". */
  veterinariaNombre: string;
  onClose: () => void;
}

/** Ajuste manual de la fecha de renovación de una sucursal (pagos irregulares, prórrogas). */
export function AjustarRenovacionDrawer({ sucursal, veterinariaNombre, onClose }: Props) {
  const ajustar = useAjustarRenovacionSucursal();
  const toast = useToast();
  const [fecha, setFecha] = useState((sucursal.fechaRenovacion ?? "").slice(0, 10));

  function guardar() {
    ajustar.mutate(
      { id: sucursal.id, fecha },
      {
        onSuccess: () => {
          toast.exito("Fecha de renovación actualizada");
          onClose();
        },
        onError: () => toast.error("No se pudo actualizar la fecha."),
      },
    );
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Ajustar renovación"
      descripcion={`${sucursal.nombre} de ${veterinariaNombre}`}
    >
      <div className="flex flex-col gap-4">
        <Input label="Nueva fecha de renovación" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <Button fullWidth size="lg" onClick={guardar} loading={ajustar.isPending} disabled={!fecha}>
          Guardar fecha
        </Button>
      </div>
    </Drawer>
  );
}
