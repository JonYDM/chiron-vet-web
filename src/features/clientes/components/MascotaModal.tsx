import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Input, Drawer, Select, Pasos } from "@/components/ui";
import { ApiError } from "@/lib/http";
import { opcionesDeEnum } from "@/lib/opciones";
import { especieLabel, sexoLabel } from "@/lib/enums";
import { EspecieMascota, SexoMascota, FiltroEstado, type Mascota } from "@/types/api";
import { useToast } from "@/components/feedback/useToast";
import { subirFotoPerfil } from "@/features/mascotas/api";
import { comprimirImagen } from "@/lib/imagen";
import { useAgregarMascota, useEditarMascota, useClientes } from "../hooks";
import type { DatosMascota } from "../api";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Cliente dueño. Si no se pasa (alta desde Pacientes), se muestra un selector. */
  clienteId?: string;
  /** Si se pasa, el modal edita esa mascota; si no, crea una nueva. */
  mascota?: Mascota;
  /** Abre directamente en el paso de la foto (para el lápiz del avatar). */
  abrirEnFoto?: boolean;
}

/** Drawer para agregar/editar una mascota, en pasos cortos (sin scroll). */
export function MascotaModal({ open, onClose, clienteId, mascota, abrirEnFoto }: Props) {
  const esEdicion = !!mascota;
  const agregar = useAgregarMascota();
  const editar = useEditarMascota();
  const toast = useToast();
  const necesitaSelector = !esEdicion && !clienteId;
  const { data: clientesData } = useClientes({ estado: FiltroEstado.Activos, tamano: 100 });

  const [clienteSel, setClienteSel] = useState("");
  const [nombre, setNombre] = useState(mascota?.nombre ?? "");
  const [especie, setEspecie] = useState<number>(mascota?.especie ?? EspecieMascota.Perro);
  const [sexo, setSexo] = useState<number>(mascota?.sexo ?? SexoMascota.NoEspecificado);
  const [raza, setRaza] = useState(mascota?.raza ?? "");
  const [nacimiento, setNacimiento] = useState(mascota?.fechaNacimiento?.slice(0, 10) ?? "");
  const [peso, setPeso] = useState(mascota?.pesoKg != null ? String(mascota.pesoKg) : "");
  const [padecimientos, setPadecimientos] = useState(mascota?.padecimientos ?? "");
  const [esterilizado, setEsterilizado] = useState<string>(
    mascota?.esterilizado == null ? "" : mascota.esterilizado ? "si" : "no",
  );
  const [error, setError] = useState<string | null>(null);
  // Foto opcional (solo al crear). Preview local hasta subir.
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFoto(f);
    setFotoPreview(f ? URL.createObjectURL(f) : null);
  }

  async function guardar() {
    setError(null);
    const clienteFinal = clienteId ?? clienteSel;
    if (!esEdicion && !clienteFinal) {
      setError("Selecciona el dueño de la mascota.");
      return;
    }
    const datos: DatosMascota = {
      nombre: nombre.trim(),
      especie,
      sexo,
      raza: raza.trim() || null,
      fechaNacimiento: nacimiento || null,
      pesoKg: peso ? Number(peso) : null,
      padecimientos: padecimientos.trim() || null,
      esterilizado: esterilizado === "" ? null : esterilizado === "si",
    };
    try {
      if (esEdicion) {
        await editar.mutateAsync({ mascotaId: mascota!.id, datos });
        toast.exito("Mascota actualizada");
      } else {
        const nuevoId = await agregar.mutateAsync({ clienteId: clienteFinal, datos });
        // La foto del alta se usa como foto de PERFIL (avatar) del nuevo paciente.
        if (foto && typeof nuevoId === "string") {
          try {
            const blob = await comprimirImagen(foto);
            await subirFotoPerfil(nuevoId, blob);
          } catch {
            toast.error("La mascota se creó, pero la foto no se pudo subir.");
          }
        }
        toast.exito("Mascota registrada 🐾");
      }
      // El cierre lo maneja Pasos tras mostrar "¡Listo!" (onCompletado).
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la mascota.");
      throw err; // que Pasos vuelva a "form" y muestre el error
    }
  }

  // Pasos cortos (1-2 campos cada uno) para que ninguno haga scroll.
  const paso1Valido = (esEdicion || !!(clienteId ?? clienteSel)) && nombre.trim().length > 0;

  const pasos = [
    {
      valido: paso1Valido,
      contenido: (
        <div className="space-y-4">
          {necesitaSelector && (
            <Select
              label="Dueño"
              value={clienteSel}
              onChange={(e) => setClienteSel(e.target.value)}
              options={[
                { value: "", label: "Selecciona un cliente…" },
                ...(clientesData?.items ?? []).map((c) => ({ value: c.id, label: c.nombre })),
              ]}
            />
          )}
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
      ),
    },
    {
      contenido: (
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Especie"
            value={especie}
            onChange={(e) => setEspecie(Number(e.target.value))}
            options={opcionesDeEnum(especieLabel)}
          />
          <Select
            label="Sexo"
            value={sexo}
            onChange={(e) => setSexo(Number(e.target.value))}
            options={opcionesDeEnum(sexoLabel)}
          />
        </div>
      ),
    },
    {
      contenido: (
        <div className="space-y-4">
          <Input label="Raza (opcional)" value={raza} onChange={(e) => setRaza(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nacimiento"
              type="date"
              value={nacimiento}
              onChange={(e) => setNacimiento(e.target.value)}
            />
            <Input
              label="Peso (kg)"
              type="number"
              step="0.01"
              min="0"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      contenido: (
        <div className="space-y-4">
          <Input
            label="Padecimientos (opcional)"
            value={padecimientos}
            onChange={(e) => setPadecimientos(e.target.value)}
            placeholder="Alergias, condiciones crónicas…"
          />
          <Select
            label="¿Esterilizado?"
            value={esterilizado}
            onChange={(e) => setEsterilizado(e.target.value)}
            options={[
              { value: "", label: "No especificado" },
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ]}
          />
          {error && (
            <p role="alert" className="rounded-xl bg-error-container/60 px-4 py-3 text-body-sm font-medium text-on-error-container">
              {error}
            </p>
          )}
        </div>
      ),
    },
  ];

  // Paso de foto (último) solo en alta: será la foto de perfil del nuevo paciente.
  if (!esEdicion) {
    pasos.push({
      contenido: (
        <div className="flex flex-col items-center gap-3">
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={elegirFoto}
          />
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            className="grid h-32 w-32 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant/50 text-on-surface-variant transition-colors hover:border-primary-container hover:text-primary-container"
          >
            {fotoPreview ? (
              <img src={fotoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1">
                <Camera className="h-7 w-7" aria-hidden />
                <span className="text-label-sm font-semibold">Tomar foto</span>
              </span>
            )}
          </button>
          <p className="text-center text-body-sm text-on-surface-variant">
            Foto del paciente (opcional). Puedes agregarla ahora o después.
          </p>
        </div>
      ),
    });
  }

  return (
    <Drawer open={open} onClose={onClose} title={esEdicion ? "Editar mascota" : "Nueva mascota"}>
      <Pasos
        pasos={pasos}
        libre={esEdicion}
        pasoInicial={abrirEnFoto ? pasos.length - 1 : 0}
        onCompletado={onClose}
        guardando={agregar.isPending || editar.isPending}
        textoFinal={esEdicion ? "Guardar" : "Registrar"}
        onFinalizar={guardar}
      />
    </Drawer>
  );
}
