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

/** Filtro de estado para listados (coincide con el backend). */
export enum FiltroEstado {
  Activos = 0,
  Inactivos = 1,
  Todos = 2,
}

/** Método de pago de una venta (coincide con el backend). */
export enum MetodoPago {
  Efectivo = 1,
  Tarjeta = 2,
  Transferencia = 3,
}

/** Resultado paginado genérico que devuelve el backend. */
export interface ResultadoPaginado<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
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
  adminOperativo: boolean;
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

/** Plan de suscripción de la veterinaria (coincide con el enum del backend). */
export enum PlanSuscripcion {
  Mensual = 1,
  Anual = 2,
}

/** Sucursal = unidad de cobro (cada una paga su renta). */
export interface Sucursal {
  id: string;
  veterinariaId: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  esMatriz: boolean;
  activa: boolean;
  fechaAlta: string;
  plan: PlanSuscripcion;
  /** Renta por periodo del plan (MXN). */
  precio: number;
  /** Fecha de vencimiento/renovación (YYYY-MM-DD). */
  fechaRenovacion: string;
}

/**
 * Veterinaria (tenant) con sus sucursales. `direccion`, `plan` y `fechaRenovacion`
 * son los de su Matriz (compatibilidad).
 */
export interface Veterinaria {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string | null;
  activa: boolean;
  fechaAlta: string;
  plan: PlanSuscripcion;
  /** Fecha de vencimiento/renovación de la Matriz (YYYY-MM-DD). */
  fechaRenovacion: string;
  /** Matriz primero. */
  sucursales: Sucursal[];
}

/** Alta/edición de sucursal. */
export interface SucursalRequest {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  plan: PlanSuscripcion;
  precio: number;
}

export interface Cliente {
  id: string;
  veterinariaId: string;
  nombre: string;
  telefono: string;
  fechaRegistro: string;
  origen: OrigenCliente;
  aceptaWhatsApp: boolean;
  activo: boolean;
  /** Conteo de mascotas del cliente. Opcional: lo envía el backend al listar (feature). */
  totalMascotas?: number;
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
  activo: boolean;
  /** URL de la foto de perfil (avatar). Null si no tiene. */
  fotoPerfilUrl?: string | null;
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
  atendidoPorId: string | null;
}

export interface Cita {
  id: string;
  veterinariaId: string;
  mascotaId: string;
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
  veterinarioId: string | null;
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
export interface VentaCargoHistorial {
  cargoId: string;
  concepto: string;
  monto: number;
}

export interface VentaHistorial {
  id: string;
  clienteId: string | null;
  fechaHora: string;
  total: number;
  metodoPago: MetodoPago;
  montoRecibido: number | null;
  cambio: number | null;
  lineas: LineaVentaHistorial[];
  cargos: VentaCargoHistorial[];
}

/** Resumen de ventas de un período. */
export interface ResumenVentas {
  total: number;
  numeroVentas: number;
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  totalProductos: number;
  totalConsultas: number;
}

/** Métricas del dashboard. */
export interface MetricasDashboard {
  ventasHoy: number;
  ventasMes: number;
  numeroVentasMes: number;
  citasProximas: number;
  clientesActivos: number;
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
  direccion?: string | null;
  plan?: PlanSuscripcion;
  /** Renta de la Matriz; si no viene, el backend usa el precio base del plan. */
  precio?: number | null;
}

/** Alta del Administrador (HU-SA4). El nombre de usuario lo genera el backend. */
export interface CrearAdminRequest {
  veterinariaId: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefono: string;
  curp?: string | null;
  pin: string;
}

/** Respuesta del alta de staff/admin: usuario generado (nombre.apellidopaterno) para entregarlo. */
export interface UsuarioCreado {
  id: string;
  nombreUsuario: string;
  nombreCompleto: string;
}

/** Alta de staff (Vet/Recep) con datos personales; el usuario lo genera el backend. */
export interface CrearStaffRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefono: string;
  curp?: string | null;
  pin: string;
  rol: RolUsuario.Veterinario | RolUsuario.Recepcionista;
}

/** Detalle de un usuario para el drawer de gestión (CURP enmascarada). */
export interface UsuarioDetalle {
  id: string;
  nombreUsuario: string;
  /** Nombre completo para mostrar. */
  nombre: string;
  /** Solo nombre(s) de pila (para editar). */
  nombres: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  telefono: string | null;
  curpEnmascarada: string | null;
  rol: RolUsuario;
  activo: boolean;
  veterinariaId: string;
}

/** Edición de datos personales. curp: null = conservar, "" = quitar, valor = reemplazar. */
export interface EditarDatosUsuarioRequest {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefono: string;
  curp?: string | null;
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
  atendidoPorId?: string | null;
}

export interface AgendarCitaRequest {
  veterinariaId: string;
  mascotaId: string;
  fechaHora: string;
  motivo: string;
  veterinarioId?: string | null;
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
  metodoPago: MetodoPago;
  montoRecibido?: number | null;
  /** Cargos pendientes (cuentas por cobrar) a cobrar en esta venta. */
  cargoIds?: string[];
}

export interface VentaResponse {
  ventaId: string;
  total: number;
  cambio: number | null;
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
  /** Teléfono de contacto del staff (solo usuarios con datos personales). */
  telefono?: string | null;
  /** Veterinaria a la que pertenece (opcional si el backend aún no lo envía). */
  veterinariaId?: string;
}

/** Sucursal con renovación próxima o vencida (dashboard SuperAdmin). id/nombre = veterinaria. */
export interface RenovacionProxima {
  id: string;
  nombre: string;
  plan: PlanSuscripcion;
  fechaRenovacion: string;
  diasRestantes: number;
  activa: boolean;
  sucursalId: string;
  sucursalNombre: string;
  esMatriz: boolean;
  precio: number;
}

/** Panorama general de la plataforma (GET /api/admin/metricas). Suscripciones por sucursal. */
export interface MetricasSuperAdmin {
  totalVeterinarias: number;
  veterinariasActivas: number;
  veterinariasInactivas: number;
  porVencer: number;
  vencidas: number;
  planMensual: number;
  planAnual: number;
  altasMes: number;
  administradoresActivos: number;
  veterinariasSinAdmin: number;
  proximasRenovaciones: RenovacionProxima[];
  totalSucursales: number;
  sucursalesActivas: number;
}
