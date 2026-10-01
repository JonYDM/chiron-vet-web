import { useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, ChevronRight, PawPrint } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { BarraBusqueda } from "@/components/molecules/BarraBusqueda";
import { useDebounce } from "@/lib/useDebounce";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { Badge, SkeletonFila } from "@/components/ui";
import { especieLabel, sexoLabel } from "@/lib/enums";
import { edadEnAnios } from "@/lib/format";
import { diasHasta, textoRelativo, toneEspecie } from "@/lib/mascotas";
import { SexoMascota, type Mascota } from "@/types/api";
import { useMisMascotas, useMisRecordatorios } from "../hooks";

/** Portal del dueño: sus mascotas + el próximo recordatorio destacado. */
export function MisMascotasPage() {
  const { data: mascotas, isLoading, isError } = useMisMascotas();
  const { data: recordatorios } = useMisRecordatorios();
  const [texto, setTexto] = useState("");
  const q = useDebounce(texto).trim().toLowerCase();
  const filtradas = (mascotas ?? []).filter(
    (m) => !q || m.nombre.toLowerCase().includes(q) || (m.raza ?? "").toLowerCase().includes(q),
  );

  // El recordatorio más cercano que aún no pasa (lo más útil para el dueño al entrar).
  const proximo = (recordatorios ?? [])
    .filter((r) => diasHasta(r.fecha) >= 0)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const total = mascotas?.length ?? 0;

  return (
    <PantallaConHeader
      titulo="Mis mascotas"
      subtitulo={
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <PawPrint className="h-4 w-4 text-primary-container" aria-hidden />
          {total > 0 ? `${total} mascota${total === 1 ? "" : "s"} · toca una para ver su historial` : "Tus peludos"}
        </p>
      }
    >
      <div className="flex flex-col gap-4">
        {proximo && (
          <Link
            to="/portal/citas"
            className="flex items-center gap-3 rounded-2xl bg-primary-container p-4 text-on-primary shadow-soft transition-transform active:scale-[0.99]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20">
              <BellRing className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-label-sm font-semibold opacity-90">{textoRelativo(proximo.fecha)}</span>
              <span className="block truncate text-label-lg font-bold">
                {proximo.nombreMascota}: {proximo.detalle}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          </Link>
        )}

        <BarraBusqueda valor={texto} onChange={setTexto} placeholder="Buscar por nombre o raza" />

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar tus mascotas.
          </div>
        ) : filtradas.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtradas.map((m) => (
              <MascotaCard key={m.id} mascota={m} />
            ))}
          </div>
        ) : total > 0 ? (
          <EmptyState titulo="Sin resultados" descripcion="Ninguna mascota coincide con la búsqueda." />
        ) : (
          <EmptyState
            titulo="Sin mascotas"
            descripcion="Aún no tienes mascotas registradas. Pídele a tu veterinaria que las agregue."
          />
        )}
      </div>
    </PantallaConHeader>
  );
}

function MascotaCard({ mascota: m }: { mascota: Mascota }) {
  const edad = edadEnAnios(m.fechaNacimiento);
  const detalle = [m.raza, edad !== null ? `${edad} ${edad === 1 ? "año" : "años"}` : null].filter(Boolean).join(" · ");
  return (
    <Link
      to={`/portal/mascotas/${m.id}`}
      className="flex items-center gap-3.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft transition-colors active:bg-surface-container"
    >
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-fixed/40 text-tertiary">
        {m.fotoPerfilUrl ? (
          <img src={m.fotoPerfilUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <PawPrint className="h-7 w-7" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-label-lg font-bold text-on-surface">{m.nombre}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone={toneEspecie(m.especie)}>{especieLabel[m.especie]}</Badge>
          {m.sexo !== SexoMascota.NoEspecificado && <Badge tone="neutral">{sexoLabel[m.sexo]}</Badge>}
        </div>
        {detalle && <p className="mt-1 truncate text-body-sm text-on-surface-variant">{detalle}</p>}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant/50" aria-hidden />
    </Link>
  );
}
