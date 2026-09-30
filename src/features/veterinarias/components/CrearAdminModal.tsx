import { AltaStaffDrawer } from "@/features/usuarios/components/AltaStaffDrawer";
import { useCrearAdmin } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  veterinariaId: string;
  veterinariaNombre: string;
}

/** Alta del Administrador de una veterinaria (HU-SA4): nombre → contacto → PIN. */
export function CrearAdminModal({ open, onClose, veterinariaId, veterinariaNombre }: Props) {
  const crear = useCrearAdmin();
  return (
    <AltaStaffDrawer
      open={open}
      onClose={onClose}
      titulo="Nuevo cliente"
      descripcion={veterinariaNombre}
      guardando={crear.isPending}
      onCrear={({ datos, pin }) =>
        crear.mutateAsync({
          veterinariaId,
          nombre: datos.nombre.trim(),
          apellidoPaterno: datos.paterno.trim(),
          apellidoMaterno: datos.materno.trim() || null,
          telefono: datos.telefono,
          curp: datos.curp || null,
          pin,
        })
      }
    />
  );
}
