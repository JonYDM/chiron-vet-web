import { useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/useToast";
import { useFotos, useSubirFoto, useEliminarFoto } from "../hooks";

/**
 * Galería de fotos del paciente (collage). Sube a Cloudflare R2 vía backend.
 * Comprime en cliente antes de subir. Si el backend/tabla no está listo, muestra
 * un estado de error/vacío sin romper la pantalla.
 */
export function GaleriaFotos({ mascotaId, puedeEditar }: { mascotaId: string; puedeEditar: boolean }) {
  const { data: fotos, isLoading, isError } = useFotos(mascotaId);
  const subir = useSubirFoto(mascotaId);
  const eliminar = useEliminarFoto(mascotaId);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmar = useConfirm();
  const toast = useToast();
  const [visor, setVisor] = useState<string | null>(null);

  async function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite re-seleccionar el mismo archivo
    if (!archivo) return;
    try {
      await subir.mutateAsync({ archivo });
      toast.exito("Foto agregada 📸");
    } catch {
      toast.error("No se pudo subir la foto.");
    }
  }

  async function borrar(id: string) {
    const ok = await confirmar({
      titulo: "Eliminar foto",
      mensaje: "¿Seguro que quieres eliminar esta foto? No se puede deshacer.",
      textoConfirmar: "Eliminar",
      peligroso: true,
    });
    if (!ok) return;
    try {
      await eliminar.mutateAsync(id);
      toast.exito("Foto eliminada.");
    } catch {
      toast.error("No se pudo eliminar la foto.");
    }
  }

  const totalFotos = fotos?.length ?? 0;

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-sm font-bold text-on-surface">Registro fotográfico</h2>
          {totalFotos > 0 && (
            <span className="rounded-full bg-primary-fixed/40 px-2 py-0.5 text-label-sm font-semibold text-primary-container">
              {totalFotos}
            </span>
          )}
        </div>
      </div>
      <p className="mb-3 text-body-sm text-on-surface-variant">Expediente visual comparativo</p>

      {/* Input oculto: sin 'capture' → el móvil deja elegir cámara O galería. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onArchivo}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-surface-container" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-surface-container p-6 text-center text-body-sm text-on-surface-variant">
          No se pudieron cargar las fotos.
          {puedeEditar && " Verifica tu conexión e intenta de nuevo."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {fotos?.map((f) => (
            <div key={f.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container">
              <button onClick={() => setVisor(f.url)} className="h-full w-full" aria-label="Ver foto">
                <img src={f.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
              <span className="absolute bottom-1 left-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {formatDate(f.fechaSubida)}
              </span>
              {puedeEditar && (
                <button
                  onClick={() => borrar(f.id)}
                  aria-label="Eliminar foto"
                  className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-lg bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          ))}

          {/* Botón subir (última celda) */}
          {puedeEditar && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={subir.isPending}
              className={cn(
                "grid aspect-[4/3] place-items-center rounded-xl border-2 border-dashed border-outline-variant/50 text-on-surface-variant transition-colors hover:border-primary-container hover:text-primary-container",
                subir.isPending && "opacity-60",
              )}
            >
              <span className="flex flex-col items-center gap-1">
                {subir.isPending ? (
                  <ImagePlus className="h-6 w-6 animate-pulse" aria-hidden />
                ) : (
                  <Camera className="h-6 w-6" aria-hidden />
                )}
                <span className="text-label-sm font-semibold">
                  {subir.isPending ? "Subiendo…" : "Subir foto"}
                </span>
              </span>
            </button>
          )}

          {/* Vacío total */}
          {totalFotos === 0 && !puedeEditar && (
            <div className="col-span-2 rounded-xl bg-surface-container p-6 text-center text-body-sm text-on-surface-variant">
              Aún no hay fotos de esta mascota.
            </div>
          )}
        </div>
      )}

      {/* Visor simple */}
      {visor && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setVisor(null)}
        >
          <button
            aria-label="Cerrar"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <img src={visor} alt="" className="max-h-full max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </section>
  );
}
