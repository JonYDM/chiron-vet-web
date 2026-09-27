import { useState } from "react";
import { Select } from "@/components/ui";
import { useClientes, useMascotas } from "@/features/clientes/hooks";

interface Props {
  /** Notifica la mascota seleccionada (o null). */
  onSelect: (mascotaId: string | null) => void;
}

/**
 * Selector encadenado: primero cliente, luego una de sus mascotas.
 * Reutiliza los hooks de datos de clientes. Útil para agendar citas.
 */
export function SelectorMascota({ onSelect }: Props) {
  const [clienteId, setClienteId] = useState<string>("");
  const { data: clientesPag } = useClientes({ tamano: 100 });
  const clientes = clientesPag?.items ?? [];
  const { data: mascotas } = useMascotas(clienteId || null);

  return (
    <div className="space-y-4">
      <Select
        label="Cliente"
        value={clienteId}
        onChange={(e) => {
          setClienteId(e.target.value);
          onSelect(null);
        }}
        options={[
          { value: "", label: "Selecciona un cliente…" },
          ...(clientes ?? []).map((c) => ({ value: c.id, label: c.nombre })),
        ]}
      />
      {clienteId && (
        <Select
          label="Mascota"
          onChange={(e) => onSelect(e.target.value || null)}
          options={[
            { value: "", label: "Selecciona una mascota…" },
            ...(mascotas ?? []).map((m) => ({ value: m.id, label: m.nombre })),
          ]}
        />
      )}
    </div>
  );
}
