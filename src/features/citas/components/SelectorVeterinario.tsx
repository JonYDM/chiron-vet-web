import { Select } from "@/components/ui";
import { useStaff } from "@/features/usuarios/hooks";
import { RolUsuario } from "@/types/api";

interface Props {
  value: string;
  onChange: (usuarioId: string) => void;
  label?: string;
}

/**
 * Selector de veterinario (para asignar responsable de una cita o consulta).
 * Lista el staff con rol Veterinario (y Administrador, que también atiende).
 */
export function SelectorVeterinario({ value, onChange, label = "Responsable (opcional)" }: Props) {
  const { data: staff } = useStaff();
  const veterinarios = (staff ?? []).filter(
    (u) => u.rol === RolUsuario.Veterinario || u.rol === RolUsuario.Administrador,
  );

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={[
        { value: "", label: "Sin asignar" },
        ...veterinarios.map((v) => ({ value: v.id, label: v.nombre })),
      ]}
    />
  );
}
