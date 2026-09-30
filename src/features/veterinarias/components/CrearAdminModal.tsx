import { useState } from "react";
import { AtSign, Check, Copy } from "lucide-react";
import { Button, Drawer, Input, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { useToast } from "@/components/feedback/useToast";
import type { AdministradorCreado } from "@/types/api";
import { useCrearAdmin } from "../hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  veterinariaId: string;
  veterinariaNombre: string;
}

/** Formato oficial de CURP (18 caracteres; sexo H, M o X). Igual que en el backend. */
const PATRON_CURP = /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/;

/** Minúsculas, sin acentos (ñ→n) y solo letras. Espejo de GeneradorNombreUsuario del backend. */
function limpiar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z]/g, "");
}

/** Vista previa del usuario: primer nombre + apellido paterno. El backend resuelve choques. */
function usuarioSugerido(nombre: string, paterno: string): string | null {
  const primerNombre = limpiar(nombre.trim().split(/\s+/)[0] ?? "");
  const ap = limpiar(paterno);
  return primerNombre && ap ? `${primerNombre}.${ap}` : null;
}

/**
 * Alta del Administrador de una veterinaria (HU-SA4) en 3 pasos:
 * nombre y apellidos → contacto (teléfono + CURP opcional) → PIN.
 * El usuario se genera solo (nombre.apellidopaterno) y se muestra al final para entregarlo.
 */
export function CrearAdminModal({ open, onClose, veterinariaId, veterinariaNombre }: Props) {
  const crear = useCrearAdmin();
  const toast = useToast();
  const [nombre, setNombre] = useState("");
  const [paterno, setPaterno] = useState("");
  const [materno, setMaterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [curp, setCurp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<AdministradorCreado | null>(null);

  const sugerido = usuarioSugerido(nombre, paterno);
  const curpInvalida = curp.length > 0 && !PATRON_CURP.test(curp);

  async function guardar() {
    setError(null);
    try {
      const res = await crear.mutateAsync({
        veterinariaId,
        nombre: nombre.trim(),
        apellidoPaterno: paterno.trim(),
        apellidoMaterno: materno.trim() || null,
        telefono,
        curp: curp || null,
        pin,
      });
      // Al guardar, se reemplaza el wizard por la pantalla con el usuario generado.
      setCreado(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el administrador.");
      throw err;
    }
  }

  async function copiarUsuario() {
    if (!creado) return;
    try {
      await navigator.clipboard.writeText(creado.nombreUsuario);
      toast.exito("Usuario copiado");
    } catch {
      toast.error("No se pudo copiar; anótalo a mano.");
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={creado ? "Administrador creado" : "Nuevo administrador"}
      descripcion={veterinariaNombre}
    >
      {creado ? (
        <div className="flex flex-col items-center gap-5 pt-2 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
            <Check className="h-9 w-9" strokeWidth={3} aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="text-headline-sm font-bold text-on-surface">{creado.nombreCompleto}</p>
            <p className="text-body-md text-on-surface-variant">
              Entrégale su usuario y el PIN que capturaste para que entre a Patwi.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 rounded-2xl bg-primary-container/10 p-4 text-left">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary">
              <AtSign className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-label-md font-semibold text-on-surface-variant">Usuario</span>
              <span className="block truncate text-headline-sm font-bold text-primary-container">
                {creado.nombreUsuario}
              </span>
            </span>
            <Button variant="soft" size="icon" onClick={copiarUsuario} aria-label="Copiar usuario">
              <Copy className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          <Button fullWidth onClick={onClose}>
            Listo
          </Button>
        </div>
      ) : (
        <Pasos
          guardando={crear.isPending}
          textoFinal="Crear administrador"
          onFinalizar={guardar}
          pasos={[
            {
              valido: nombre.trim().length > 0 && paterno.trim().length > 0,
              contenido: (
                <div className="space-y-4">
                  <Input
                    label="Nombre(s)"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value.slice(0, 80))}
                    autoComplete="given-name"
                    autoFocus
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Apellido paterno"
                      value={paterno}
                      onChange={(e) => setPaterno(e.target.value.slice(0, 80))}
                      autoComplete="family-name"
                      required
                    />
                    <Input
                      label="Materno (opcional)"
                      value={materno}
                      onChange={(e) => setMaterno(e.target.value.slice(0, 80))}
                    />
                  </div>
                  {sugerido && (
                    <p className="flex items-center gap-2 rounded-xl bg-surface-container px-4 py-3 text-body-sm text-on-surface-variant">
                      <AtSign className="h-4 w-4 shrink-0 text-primary-container" aria-hidden />
                      <span>
                        Su usuario será <strong className="font-bold text-on-surface">{sugerido}</strong>
                      </span>
                    </p>
                  )}
                </div>
              ),
            },
            {
              valido: telefono.length === 10 && !curpInvalida,
              contenido: (
                <div className="space-y-4">
                  <Input
                    label="Teléfono"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    hint="10 dígitos"
                    required
                  />
                  <Input
                    label="CURP (opcional)"
                    value={curp}
                    onChange={(e) => setCurp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 18))}
                    autoCapitalize="characters"
                    spellCheck={false}
                    error={curpInvalida ? "Revisa el formato (18 caracteres)." : undefined}
                    hint={curpInvalida ? undefined : "18 caracteres"}
                  />
                </div>
              ),
            },
            {
              valido: pin.length === 6,
              contenido: (
                <div className="space-y-4">
                  <Input
                    label="PIN de acceso"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    hint="6 dígitos. Si lo olvida, se lo reseteas desde aquí."
                    required
                  />
                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl bg-error-container/60 px-4 py-3 text-body-sm font-medium text-on-error-container"
                    >
                      {error}
                    </p>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
}
