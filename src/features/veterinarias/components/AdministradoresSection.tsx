import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, CardContent, Spinner } from "@/components/ui";
import { useAdministradores } from "@/features/usuarios/hooks";
import { ResetearPinModal } from "@/features/usuarios";
import type { UsuarioDto } from "@/types/api";

/** Lista de Administradores con acción de resetear PIN (para el SuperAdmin). */
export function AdministradoresSection() {
  const { data: admins, isLoading, isError } = useAdministradores();
  const [reset, setReset] = useState<UsuarioDto | null>(null);

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold text-ink">Administradores</h2>

      {isLoading ? (
        <Spinner label="Cargando administradores…" />
      ) : isError ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-danger">
            No se pudieron cargar los administradores.
          </CardContent>
        </Card>
      ) : admins && admins.length > 0 ? (
        <div className="space-y-3">
          {admins.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{a.nombre}</p>
                  <p className="text-sm text-ink-soft">@{a.nombreUsuario}</p>
                </div>
                <Badge tone={a.activo ? "primary" : "neutral"}>
                  {a.activo ? "Activo" : "Inactivo"}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => setReset(a)}>
                  <KeyRound className="h-4 w-4" aria-hidden />
                  PIN
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-sm text-ink-soft">
            Aún no hay administradores. Crea uno desde una veterinaria.
          </CardContent>
        </Card>
      )}

      {reset && (
        <ResetearPinModal
          open={!!reset}
          onClose={() => setReset(null)}
          usuarioId={reset.id}
          nombre={reset.nombre}
        />
      )}
    </section>
  );
}
