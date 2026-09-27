import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, PawPrint, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge, Card, Spinner } from "@/components/ui";
import { especieLabel } from "@/lib/enums";
import { useMascotas } from "../hooks";
import type { Cliente } from "@/types/api";

/** Tarjeta de cliente: al expandir, carga y muestra sus mascotas (lazy). */
export function ClienteCard({ cliente }: { cliente: Cliente }) {
  const [abierto, setAbierto] = useState(false);
  const { data: mascotas, isLoading } = useMascotas(abierto ? cliente.id : null);

  return (
    <Card>
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{cliente.nombre}</p>
          <p className="flex items-center gap-1.5 text-sm text-ink-soft">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {cliente.telefono}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-ink-soft transition-transform",
            abierto && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {abierto && (
        <div className="border-t border-hairline p-4">
          {isLoading ? (
            <Spinner label="Cargando mascotas…" />
          ) : mascotas && mascotas.length > 0 ? (
            <ul className="space-y-2">
              {mascotas.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/app/mascotas/${m.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-3 transition-colors hover:bg-primary-50"
                  >
                    <span className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-primary" aria-hidden />
                      <span className="font-medium text-ink">{m.nombre}</span>
                    </span>
                    <Badge tone="neutral">{especieLabel[m.especie]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">
              Este cliente no tiene mascotas registradas.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
