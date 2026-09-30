import { ConciergeBell, Stethoscope } from "lucide-react";
import { RolUsuario } from "@/types/api";
import { useCrearStaff } from "../hooks";
import { AltaStaffDrawer, type OpcionRol } from "./AltaStaffDrawer";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROLES: OpcionRol[] = [
  { valor: RolUsuario.Veterinario, label: "Veterinario", detalle: "Consultas y expedientes", icon: Stethoscope },
  { valor: RolUsuario.Recepcionista, label: "Recepción", detalle: "Citas, clientes y caja", icon: ConciergeBell },
];

/** Alta de Veterinario o Recepcionista: rol → nombre → contacto → PIN (usuario autogenerado). */
export function CrearStaffModal({ open, onClose }: Props) {
  const crear = useCrearStaff();
  return (
    <AltaStaffDrawer
      open={open}
      onClose={onClose}
      titulo="Nuevo integrante"
      descripcion="Dale acceso a alguien de tu equipo."
      roles={ROLES}
      guardando={crear.isPending}
      onCrear={({ datos, pin, rol }) =>
        crear.mutateAsync({
          nombre: datos.nombre.trim(),
          apellidoPaterno: datos.paterno.trim(),
          apellidoMaterno: datos.materno.trim() || null,
          telefono: datos.telefono,
          curp: datos.curp || null,
          pin,
          rol: (rol ?? RolUsuario.Veterinario) as RolUsuario.Veterinario | RolUsuario.Recepcionista,
        })
      }
    />
  );
}
