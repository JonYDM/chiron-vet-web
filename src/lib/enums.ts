import {
  CategoriaProducto,
  EspecieMascota,
  EstadoCita,
  MetodoPago,
  OrigenCliente,
  RolUsuario,
  SexoMascota,
  TipoRegistroMedico,
  TipoRecordatorio,
} from "@/types/api";

/** Etiquetas en español para cada enum del backend (para mostrar en la UI). */

export const rolLabel: Record<RolUsuario, string> = {
  [RolUsuario.Administrador]: "Administrador",
  [RolUsuario.Veterinario]: "Veterinario",
  [RolUsuario.Recepcionista]: "Recepcionista",
  [RolUsuario.DuenoMascota]: "Dueño de mascota",
  [RolUsuario.SuperAdmin]: "SuperAdmin",
};

export const especieLabel: Record<EspecieMascota, string> = {
  [EspecieMascota.NoEspecificada]: "No especificada",
  [EspecieMascota.Perro]: "Perro",
  [EspecieMascota.Gato]: "Gato",
  [EspecieMascota.Ave]: "Ave",
  [EspecieMascota.Conejo]: "Conejo",
  [EspecieMascota.Otro]: "Otro",
};

export const sexoLabel: Record<SexoMascota, string> = {
  [SexoMascota.NoEspecificado]: "No especificado",
  [SexoMascota.Macho]: "Macho",
  [SexoMascota.Hembra]: "Hembra",
};

export const tipoRegistroLabel: Record<TipoRegistroMedico, string> = {
  [TipoRegistroMedico.Consulta]: "Consulta",
  [TipoRegistroMedico.Vacuna]: "Vacuna",
  [TipoRegistroMedico.Desparasitacion]: "Desparasitación",
  [TipoRegistroMedico.Cirugia]: "Cirugía",
  [TipoRegistroMedico.Otro]: "Otro",
};

export const estadoCitaLabel: Record<EstadoCita, string> = {
  [EstadoCita.Programada]: "Programada",
  [EstadoCita.Atendida]: "Atendida",
  [EstadoCita.Cancelada]: "Cancelada",
  [EstadoCita.NoAsistio]: "No asistió",
};

export const origenClienteLabel: Record<OrigenCliente, string> = {
  [OrigenCliente.NoEspecificado]: "No especificado",
  [OrigenCliente.Recomendacion]: "Recomendación",
  [OrigenCliente.RedesSociales]: "Redes sociales",
  [OrigenCliente.PasoPorLocal]: "Pasó por el local",
  [OrigenCliente.Google]: "Google",
  [OrigenCliente.Otro]: "Otro",
};

export const categoriaProductoLabel: Record<CategoriaProducto, string> = {
  [CategoriaProducto.Alimento]: "Alimento",
  [CategoriaProducto.Medicina]: "Medicina",
  [CategoriaProducto.Accesorio]: "Accesorio",
  [CategoriaProducto.Higiene]: "Higiene",
  [CategoriaProducto.Otro]: "Otro",
};

export const tipoRecordatorioLabel: Record<TipoRecordatorio, string> = {
  [TipoRecordatorio.ProximaAplicacion]: "Próxima aplicación",
  [TipoRecordatorio.Cita]: "Cita",
};

export const metodoPagoLabel: Record<MetodoPago, string> = {
  [MetodoPago.Efectivo]: "Efectivo",
  [MetodoPago.Tarjeta]: "Tarjeta",
  [MetodoPago.Transferencia]: "Transferencia",
};

/** Mapea el estado de la cita a un tono de Badge para feedback visual. */
export function estadoCitaTone(
  estado: EstadoCita,
): "primary" | "success" | "danger" | "neutral" {
  switch (estado) {
    case EstadoCita.Programada:
      return "primary";
    case EstadoCita.Atendida:
      return "success";
    case EstadoCita.Cancelada:
    case EstadoCita.NoAsistio:
      return "danger";
    default:
      return "neutral";
  }
}
