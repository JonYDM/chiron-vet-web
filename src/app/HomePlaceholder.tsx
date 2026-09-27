import { LogOut, PawPrint } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { rolLabel } from "@/lib/enums";

/**
 * Placeholder temporal de "home" tras login. Muestra la sesión activa y permite
 * cerrar sesión. Sirve para verificar el flujo de auth end-to-end (F1).
 * Se reemplaza por el AppShell + dashboards en Sprint 2.
 */
export function HomePlaceholder({ area }: { area: string }) {
  const { sesion, cerrarSesion } = useAuth();

  return (
    <main className="mx-auto grid min-h-full max-w-md place-items-center p-6">
      <Card className="w-full animate-fade-in-up">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
            <PawPrint className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle>Chiron · {area}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sesion && (
            <div className="space-y-2">
              <p className="text-ink">
                Hola, <span className="font-semibold">{sesion.nombre}</span> 🐾
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                <Badge tone="primary">{rolLabel[sesion.rol]}</Badge>
                {sesion.veterinariaId && (
                  <span>Veterinaria: {sesion.veterinariaId.slice(0, 8)}…</span>
                )}
              </div>
            </div>
          )}
          <p className="text-sm text-ink-soft">
            Sesión iniciada correctamente. Aquí irá el dashboard del rol (Sprint 2).
          </p>
          <Button variant="ghost" onClick={cerrarSesion}>
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
