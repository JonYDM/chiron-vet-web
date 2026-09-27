import { Hammer } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Card, CardContent } from "@/components/ui";

/** Placeholder para módulos que se implementan en próximos sprints. */
export function EnConstruccion({ titulo }: { titulo: string }) {
  return (
    <div>
      <PageHeader titulo={titulo} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-[#9A6A00]">
            <Hammer className="h-7 w-7" aria-hidden />
          </div>
          <p className="font-semibold text-ink">Próximamente</p>
          <p className="max-w-xs text-sm text-ink-soft">
            Este módulo se está construyendo. Muy pronto estará disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
