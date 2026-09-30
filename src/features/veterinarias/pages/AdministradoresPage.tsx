import { useMemo, useState } from "react";
import { Building2, ChevronRight, KeyRound, Plus, Search, Settings2 } from "lucide-react";
import { Avatar, Badge, Button, Drawer, Input, SkeletonFila } from "@/components/ui";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PantallaConHeader } from "@/components/organisms/PantallaConHeader";
import { useDebounce } from "@/lib/useDebounce";
import { useAdministradores } from "@/features/usuarios/hooks";
import { ResetearPinModal } from "@/features/usuarios";
import { DetalleUsuarioDrawer } from "@/features/usuarios/components/DetalleUsuarioDrawer";
import type { UsuarioDto, Veterinaria } from "@/types/api";
import { useVeterinarias } from "../hooks";
import { CrearAdminModal } from "../components/CrearAdminModal";

/** Vista de Administradores (SuperAdmin): búsqueda, veterinaria de cada admin y alta. */
export function AdministradoresPage() {
  const { data: admins, isLoading, isError } = useAdministradores();
  const { data: veterinarias } = useVeterinarias();
  const [texto, setTexto] = useState("");
  const textoBuscado = useDebounce(texto);
  const [reset, setReset] = useState<UsuarioDto | null>(null);
  const [gestion, setGestion] = useState<UsuarioDto | null>(null);
  const [elegirVet, setElegirVet] = useState(false);
  const [crearPara, setCrearPara] = useState<Veterinaria | null>(null);

  const vetPorId = useMemo(() => {
    const mapa = new Map<string, Veterinaria>();
    for (const v of veterinarias ?? []) mapa.set(v.id, v);
    return mapa;
  }, [veterinarias]);

  const lista = useMemo(() => {
    const q = textoBuscado.trim().toLowerCase();
    return (admins ?? []).filter((a) => {
      if (!q) return true;
      const vet = a.veterinariaId ? vetPorId.get(a.veterinariaId)?.nombre ?? "" : "";
      return (
        a.nombre.toLowerCase().includes(q) ||
        a.nombreUsuario.toLowerCase().includes(q) ||
        vet.toLowerCase().includes(q)
      );
    });
  }, [admins, textoBuscado, vetPorId]);

  // Para el alta: primero las veterinarias activas sin administrador.
  const opcionesVet = useMemo(() => {
    const conAdmin = new Set((admins ?? []).filter((a) => a.activo).map((a) => a.veterinariaId));
    return [...(veterinarias ?? [])]
      .filter((v) => v.activa)
      .map((v) => ({ vet: v, tieneAdmin: conAdmin.has(v.id) }))
      .sort((a, b) => Number(a.tieneAdmin) - Number(b.tieneAdmin) || a.vet.nombre.localeCompare(b.vet.nombre));
  }, [admins, veterinarias]);

  return (
    <PantallaConHeader
      titulo="Administradores"
      subtitulo={<p className="text-body-sm text-on-surface-variant">Accesos de cada veterinaria</p>}
      accion={
        <Button size="icon" onClick={() => setElegirVet(true)} aria-label="Nuevo administrador">
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Buscador */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            variant="soft"
            aria-label="Buscar administradores"
            placeholder="Buscar por nombre, usuario o veterinaria"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="h-12 pl-12"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-body-sm text-error-st shadow-soft">
            No se pudieron cargar los administradores.
          </div>
        ) : lista.length > 0 ? (
          <div className="flex flex-col gap-3">
            {lista.map((a) => {
              const vet = a.veterinariaId ? vetPorId.get(a.veterinariaId) : undefined;
              return (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <Avatar nombre={a.nombre} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-label-lg font-bold text-on-surface">{a.nombre}</span>
                        {!a.activo && <Badge tone="neutral">Inactivo</Badge>}
                      </div>
                      <p className="truncate text-body-sm text-on-surface-variant">
                        @{a.nombreUsuario}
                        {a.telefono && <span> · {a.telefono}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2">
                    <Building2 className="h-4 w-4 shrink-0 text-primary-container" aria-hidden />
                    <span className="truncate text-body-md text-on-surface">{vet?.nombre ?? "Veterinaria"}</span>
                  </div>

                  <div className="flex gap-2 border-t border-outline-variant/20 pt-3">
                    <Button variant="soft" size="sm" fullWidth onClick={() => setReset(a)}>
                      <KeyRound className="h-4 w-4" aria-hidden />
                      Resetear PIN
                    </Button>
                    <Button variant="soft" size="sm" fullWidth onClick={() => setGestion(a)}>
                      <Settings2 className="h-4 w-4" aria-hidden />
                      Gestionar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            titulo={textoBuscado ? "Sin resultados" : "Sin administradores"}
            descripcion={
              textoBuscado
                ? "No hay administradores que coincidan con la búsqueda."
                : "Crea el administrador de una veterinaria con el botón +."
            }
          />
        )}
      </div>

      {/* Paso previo al alta: elegir la veterinaria */}
      <Drawer
        open={elegirVet}
        onClose={() => setElegirVet(false)}
        title="¿Para qué veterinaria?"
        descripcion="Elige la clínica del nuevo administrador."
      >
        <div className="flex flex-col gap-2">
          {opcionesVet.length === 0 ? (
            <p className="py-6 text-center text-body-sm text-on-surface-variant">
              No hay veterinarias activas. Da de alta una primero.
            </p>
          ) : (
            opcionesVet.map(({ vet, tieneAdmin }) => (
              <button
                key={vet.id}
                onClick={() => {
                  setElegirVet(false);
                  setCrearPara(vet);
                }}
                className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-left transition-colors hover:bg-surface-container"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-fixed/40 text-tertiary">
                  <Building2 className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label-lg font-bold text-on-surface">{vet.nombre}</span>
                  <span className={"block text-body-sm " + (tieneAdmin ? "text-on-surface-variant" : "font-semibold text-[#B45309]")}>
                    {tieneAdmin ? "Ya tiene administrador" : "Sin administrador"}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant/50" aria-hidden />
              </button>
            ))
          )}
        </div>
      </Drawer>

      {crearPara && (
        <CrearAdminModal
          open={!!crearPara}
          onClose={() => setCrearPara(null)}
          veterinariaId={crearPara.id}
          veterinariaNombre={crearPara.nombre}
        />
      )}
      {reset && (
        <ResetearPinModal open={!!reset} onClose={() => setReset(null)} usuarioId={reset.id} nombre={reset.nombre} />
      )}
      {gestion && (
        <DetalleUsuarioDrawer
          open={!!gestion}
          onClose={() => setGestion(null)}
          usuarioId={gestion.id}
          veterinariaNombre={gestion.veterinariaId ? vetPorId.get(gestion.veterinariaId)?.nombre : undefined}
          onResetearPin={() => {
            setReset(gestion);
            setGestion(null);
          }}
        />
      )}
    </PantallaConHeader>
  );
}
