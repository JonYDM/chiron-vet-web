/**
 * Tipos de la API de Chiron. Reflejan los contratos reales del backend .NET.
 *
 * IMPORTANTE: el backend serializa los enums como NÚMEROS (no strings).
 * Aquí se modelan como enums numéricos para que coincidan 1:1.
 */

// ─────────────────────────── Enums (valores numéricos del backend) ───────────

export enum RolUsuario {
  Administrador = 1,
  Veterinario = 2,
  Recepcionista = 3,
  DuenoMascota = 4,
  SuperAdmin = 99,
}

export enum EspecieMascota {
  NoEspecificada = 0,
  Perro = 1,
  Gato = 2,
  Ave = 3,
  Conejo = 4,
  Otro = 5,
}

export enum SexoMascota {
  NoEspecificado = 0,
  Macho = 1,
  Hembra = 2,
}

export enum TipoRegistroMedico {
  Consulta = 1,
  Vacuna = 2,
  Desparasitacion = 3,
  Cirugia = 4,
  Otro = 5,
}

export enum EstadoCita {
  Programada = 1,
  Atendida = 2,
  Cancelada = 3,
  NoAsistio = 4,
}

export enum OrigenCliente {
  NoEspecificado = 0,
  Recomendacion = 1,
  RedesSociales = 2,
  PasoPorLocal = 3,
  Google = 4,
  Otro = 5,
}

export enum CategoriaProducto {
  Alimento = 1,
  Medicina = 2,
  Accesorio = 3,
  Higiene = 4,
  Otro = 5,
}

export enum TipoRecordatorio {
  ProximaAplicacion = 1,
  Cita = 2,
}

// ─────────────────────────── Auth ───────────────────────────────────────────

export interface LoginRequest {
  identificador: string;
  pin: string;
}

export interface LoginResponse {
  token: string;
  expiraEn: string; // ISO 8601
  nombre: string;
  rol: RolUsuario;
}

/** Claims contenidos en el JWT (se extraen con lib/jwt). */
export interface JwtClaims {
  /** Id del usuario. */
  sub?: string;
  /** Id de la veterinaria (tenant). Vacío/ausente para SuperAdmin. */
  veterinariaId?: string;
  /** Id del cliente asociado (solo para rol DuenoMascota). */
  clienteId?: string;
  /** Rol (puede venir como nombre en el claim de rol estándar). */
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

// ─────────────────────────── Entidades ──────────────────────────────────────

export interface Veterinaria {
  id: string;
  nombre: string;
  telefono: string;
  activa: boolean;
  fechaAlta: string;
}

export interface Cliente {
  id: string;
  veterinariaId: string;
  nombre: string;
  telefono: string;
  fechaRegistro: string;
  origen: OrigenCliente;
  aceptaWhatsApp: boolean;
}

export interface Mascota {
  id: string;
  veterinariaId: string;
  clienteId: string;
  nombre: string;
  especie: EspecieMascota;
  raza: string | null;
  sexo: SexoMascota;
  fechaNacimiento: string | null;
  pesoKg: number | null;
  padecimientos: string | null;
  esterilizado: boolean | null;
}

export interface RegistroMedico {
  id: string;
  veterinariaId: string;
  mascotaId: string;
  tipo: TipoRegistroMedico;
  fecha: string;
  descripcion: string;
  fechaProximaAplicacion: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  pesoKg: number | null;
  temperaturaC: number | null;
  notas: string | null;
}

export interface Cita {
  id: string;
  veterinariaId: string;
  mascotaId: string;
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
}

export interface Producto {
  id: string;
  veterinariaId: string;
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  stock: number;
  activo: boolean;
}

/** Línea de una venta del historial. */
export interface LineaVentaHistorial {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** Venta del historial (con sus líneas). */
export interface VentaHistorial {
  id: string;
  clienteId: string | null;
  fechaHora: string;
  total: number;
  lineas: LineaVentaHistorial[];
}

export interface RecordatorioDetectado {
  tipo: TipoRecordatorio;
  clienteId: string;
  nombreCliente: string;
  telefonoCliente: string;
  nombreMascota: string;
  detalle: string;
  fecha: string;
}

// ─────────────────────────── Requests (comandos/DTOs) ───────────────────────

export interface CrearVeterinariaRequest {
  nombre: string;
  telefono: string;
}

export interface CrearAdminRequest {
  veterinariaId: string;
  nombreUsuario: string;
  nombre: string;
  pin: string;
  rol: RolUsuario;
}

export interface CrearStaffRequest {
  nombreUsuario: string;
  nombre: string;
  pin: string;
  rol: RolUsuario.Veterinario | RolUsuario.Recepcionista;
}

export interface CrearDuenoRequest {
  clienteId: string;
  pin: string;
}

export interface RegistroRapidoRequest {
  veterinariaId: string;
  nombreCliente: string;
  telefonoCliente: string;
  origenCliente: OrigenCliente;
  nombreMascota: string;
  especie: EspecieMascota;
  sexo?: SexoMascota;
  raza?: string | null;
  fechaNacimiento?: string | null;
}

export interface RegistroRapidoResponse {
  clienteId: string;
  mascotaId: string;
}

export interface AgregarRegistroMedicoRequest {
  veterinariaId: string;
  mascotaId: string;
  tipo: TipoRegistroMedico;
  fecha: string;
  descripcion: string;
  fechaProximaAplicacion?: string | null;
  diagnostico?: string | null;
  tratamiento?: string | null;
  pesoKg?: number | null;
  temperaturaC?: number | null;
  notas?: string | null;
}

export interface AgendarCitaRequest {
  veterinariaId: string;
  mascotaId: string;
  fechaHora: string;
  motivo: string;
}

export interface AgregarProductoRequest {
  veterinariaId: string;
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  stock: number;
}

export interface ItemVenta {
  productoId: string;
  cantidad: number;
}

export interface RegistrarVentaRequest {
  veterinariaId: string;
  clienteId?: string | null;
  items: ItemVenta[];
}

export interface VentaResponse {
  ventaId: string;
  total: number;
}

/** Forma del error que devuelve el backend: { error: "mensaje" }. */
export interface ApiErrorBody {
  error: string;
}

/** DTO seguro de usuario (sin hash de PIN) que devuelve la API. */
export interface UsuarioDto {
  id: string;
  nombreUsuario: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  clienteId: string | null;
}
