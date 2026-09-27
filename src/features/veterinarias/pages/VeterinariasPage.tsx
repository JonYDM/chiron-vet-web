import { useState } from "react";
import { Building2, Plus, Power, UserCog } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Badge, Button, Card, CardContent, Spinner } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Veterinaria } from "@/types/api";
import { useCambiarEstadoVeterinaria, useVeterinarias } from "../hooks";
import { CrearVeterinariaModal } from "../components/CrearVeterinariaModal";
import { CrearAdminModal } from "../components/CrearAdminModal";

/** Panel SuperAdmin: gestión de veterinarias y suscripciones (F5). */
export function VeterinariasPage() {
  const { data: veterinarias, isLoading, isError } = useVeterinarias();
  const cambiarEstado = useCambiarEstadoVeterinaria();
  const [modalCrear, setModalCrear] = useState(false);
  const [adminDe, setAdminDe] = useState<Veterinaria | null>(null);

  return (
    <div>
      <PageHeader
        titulo="Veterinarias"
        descripcion="Gestiona los clientes de Chiron y sus suscripciones"
        accion={
          <Button onClick={() => setModalCrear(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Nueva
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid place-items-center py-12">
          <Spinner label="Cargando veterinarias…" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-danger">
            No se pudieron cargar las veterinarias.
          </CardContent>
        </Card>
      ) : veterinarias && veterinarias.length > 0 ? (
        <div className="space-y-3">
          {veterinarias.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">{v.nombre}</p>
                    <Badge tone={v.activa ? "success" : "danger"}>
                      {v.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-soft">
                    {v.telefono} · alta {formatDate(v.fechaAlta)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAdminDe(v)}
                  >
                    <UserCog className="h-4 w-4" aria-hidden />
                    Admin
                  </Button>
                  <Button
                    size="sm"
                    variant={v.activa ? "danger" : "primary"}
                    loading={
                      cambiarEstado.isPending &&
                      cambiarEstado.variables?.id === v.id
                    }
                    onClick={() =>
                      cambiarEstado.mutate({ id: v.id, activar: !v.activa })
                    }
                  >
                    <Power className="h-4 w-4" aria-hidden />
                    {v.activa ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-hairline text-ink-soft">
              <Building2 className="h-7 w-7" aria-hidden />
            </div>
            <p className="font-semibold text-ink">Sin veterinarias</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Da de alta la primera veterinaria cliente.
            </p>
          </CardContent>
        </Card>
      )}

      <CrearVeterinariaModal open={modalCrear} onClose={() => setModalCrear(false)} />
      {adminDe && (
        <CrearAdminModal
          open={!!adminDe}
          onClose={() => setAdminDe(null)}
          veterinariaId={adminDe.id}
          veterinariaNombre={adminDe.nombre}
        />
      )}
    </div>
  );
}
