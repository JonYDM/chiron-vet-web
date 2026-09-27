import { useState } from "react";
import { Plus, Search, UserX } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Button, Card, CardContent, Input, Spinner } from "@/components/ui";
import { useDebounce } from "@/lib/useDebounce";
import { useClientes } from "../hooks";
import { ClienteCard } from "../components/ClienteCard";
import { RegistroRapidoModal } from "../components/RegistroRapidoModal";

/** Página de clientes y mascotas (F3.2): buscar, listar y registrar. */
export function ClientesPage() {
  const [texto, setTexto] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const textoBuscado = useDebounce(texto);
  const { data: clientes, isLoading, isError } = useClientes(textoBuscado);

  return (
    <div>
      <PageHeader
        titulo="Clientes y mascotas"
        descripcion="Busca dueños o registra uno nuevo"
        accion={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo
          </Button>
        }
      />

      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
        <Input
          aria-label="Buscar clientes"
          placeholder="Buscar por nombre…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="pl-11"
        />
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando clientes…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar los clientes. Intenta de nuevo.
          </CardContent>
        </Card>
      ) : clientes && clientes.length > 0 ? (
        <div className="space-y-3">
          {clientes.map((c) => (
            <ClienteCard key={c.id} cliente={c} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-hairline text-ink-soft">
              <UserX className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-semibold text-ink">Sin clientes</p>
            <p className="max-w-xs text-sm text-ink-soft">
              {textoBuscado
                ? "No hay resultados para tu búsqueda."
                : "Aún no hay clientes. Registra el primero."}
            </p>
          </CardContent>
        </Card>
      )}

      <RegistroRapidoModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </div>
  );
}
