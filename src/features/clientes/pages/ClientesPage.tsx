import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { FiltroEstadoTabs } from "@/components/molecules/FiltroEstadoTabs";
import { Paginacion } from "@/components/molecules/Paginacion";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Button, Card, CardContent, Input, SkeletonFila } from "@/components/ui";
import { Reveal } from "@/lib/anim";
import { useDebounce } from "@/lib/useDebounce";
import { FiltroEstado } from "@/types/api";
import { useClientes } from "../hooks";
import { ClienteCard } from "../components/ClienteCard";
import { RegistroRapidoModal } from "../components/RegistroRapidoModal";

/** Página de clientes y mascotas: buscar, filtrar por estado, paginar y registrar. */
export function ClientesPage() {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState<FiltroEstado>(FiltroEstado.Activos);
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const textoBuscado = useDebounce(texto);

  const { data, isLoading, isError } = useClientes({
    texto: textoBuscado,
    estado,
    pagina,
  });

  const clientes = data?.items ?? [];

  // Al cambiar búsqueda o filtro, volver a la página 1.
  function cambiarTexto(v: string) {
    setTexto(v);
    setPagina(1);
  }
  function cambiarEstado(e: FiltroEstado) {
    setEstado(e);
    setPagina(1);
  }

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

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft"
            aria-hidden
          />
          <Input
            aria-label="Buscar clientes"
            placeholder="Buscar por nombre…"
            value={texto}
            onChange={(e) => cambiarTexto(e.target.value)}
            className="pl-11"
          />
        </div>
        <FiltroEstadoTabs value={estado} onChange={cambiarEstado} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonFila key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar los clientes. Intenta de nuevo.
          </CardContent>
        </Card>
      ) : clientes.length > 0 ? (
        <>
          <Reveal stagger className="space-y-3">
            {clientes.map((c) => (
              <ClienteCard key={c.id} cliente={c} />
            ))}
          </Reveal>
          {data && (
            <Paginacion
              pagina={data.pagina}
              totalPaginas={data.totalPaginas}
              onCambio={setPagina}
            />
          )}
        </>
      ) : (
        <EmptyState
          titulo="Sin clientes"
          descripcion={
            textoBuscado
              ? "No hay resultados para tu búsqueda."
              : "Aún no hay clientes. Registra el primero 🐾"
          }
        />
      )}

      <RegistroRapidoModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </div>
  );
}
