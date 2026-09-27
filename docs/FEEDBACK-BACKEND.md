# 🐾 Chiron — Feedback para el Backend (mejoras solicitadas)

> Documento de **especificación de cambios pendientes en el backend** (repo `chiron`),
> recopilados durante el desarrollo del frontend. Sirve para alimentar la API con las
> funcionalidades que el frontend necesita pero que hoy no existen.
>
> Creado: 2026-09-27 · Estado: PENDIENTE (backend)

---

## Contexto

El frontend (repo `chiron-web`) ya consume la API. Al construir el MVP surgieron necesidades
que el backend actual **no cubre todavía**. Aquí se documentan de forma accionable para
implementarlas en la capa de dominio + API del backend .NET.

> Convención del proyecto: no se toca el backend sin confirmación explícita. Este `.md`
> es la lista priorizada para cuando se trabaje esa sesión.

---

## 1. Más campos en el registro de la mascota

**Necesidad:** al registrar/editar una mascota, capturar más información clínica útil.

### Estado actual (entidad `Mascota` en `Chiron.Domain/Mascotas/Mascota.cs`)
Campos existentes: `VeterinariaId`, `ClienteId`, `Nombre`, `Especie`, `Raza` (opcional),
`Sexo`, `FechaNacimiento` (opcional). Ya calcula `EdadEnAnios()` a partir de la fecha de nacimiento.

### Campos nuevos solicitados
| Campo | Tipo sugerido | Notas |
|---|---|---|
| `Peso` | `decimal?` (kg) | Peso actual; puede cambiar en el tiempo (ver nota abajo). |
| `Padecimientos` / `CondicionesPrevias` | `string?` | Texto libre: alergias, enfermedades crónicas, condiciones relevantes. |
| `Esterilizado` | `bool?` | Relevante para tratamientos y recordatorios. |
| `Color` / `Señas` | `string?` (opcional) | Identificación física. |

> **Nota sobre edad:** la edad ya se deriva de `FechaNacimiento` (no se guarda aparte).
> En el frontend conviene **pedir fecha de nacimiento** y mostrar la edad calculada. Si el
> dueño no sabe la fecha exacta, permitir capturar edad aproximada → convertir a fecha estimada.

> **Nota sobre peso:** el peso cambia con el tiempo. Dos opciones de diseño:
> - **Simple (MVP):** un campo `Peso` en la mascota (último peso conocido).
> - **Mejor (futuro):** registrar el peso como parte de cada consulta en el expediente
>   (histórico de peso), que es clínicamente más correcto. Ver sección 2.

### Cambios en backend
- `Mascota`: agregar propiedades + parámetros opcionales en la fábrica `Crear(...)` con validación
  (ej: peso > 0 si se indica).
- Método `ActualizarDatos(...)` en la entidad (hoy no existe edición de mascota).
- DTO `RegistrarClienteConMascotaComando` y `RegistroRapido`: agregar los campos opcionales.
- Endpoint de edición de mascota: `PUT /api/mascotas/{id}` (nuevo).

---

## 2. Más detalle en la consulta / registro médico

**Necesidad:** durante una consulta, registrar con detalle qué se hizo y qué se administró.
Ejemplo del usuario: *"durante la consulta tal, se le administró tal medicamento, etc."*

### Estado actual (entidad `RegistroMedico` en `Chiron.Domain/Expedientes/RegistroMedico.cs`)
Campos existentes: `VeterinariaId`, `MascotaId`, `Tipo` (Consulta/Vacuna/Desparasitación/Cirugía/Otro),
`Fecha`, `Descripcion`, `FechaProximaAplicacion` (opcional). Solo hay una `Descripcion` de texto libre.

### Campos nuevos solicitados
| Campo | Tipo sugerido | Notas |
|---|---|---|
| `Diagnostico` | `string?` | Qué se detectó/diagnosticó en la consulta. |
| `Tratamiento` | `string?` | Qué se administró/recetó (medicamentos, dosis, indicaciones). |
| `PesoEnConsulta` | `decimal?` (kg) | Peso registrado ese día → histórico de peso. |
| `Temperatura` | `decimal?` (°C) | Signo vital opcional. |
| `Notas` / `Observaciones` | `string?` | Notas adicionales del veterinario. |
| `VeterinarioNombre` o `UsuarioId` | `string?`/`Guid?` | Quién atendió (trazabilidad). |

> **Diseño sugerido:** mantener `Descripcion` como resumen corto y agregar los campos
> detallados como opcionales. Así el registro rápido sigue siendo simple, pero una consulta
> completa puede documentarse a fondo.

> **Histórico de peso:** si se agrega `PesoEnConsulta` a cada registro médico, se puede
> graficar la evolución del peso de la mascota en el tiempo (feature valiosa para el portal
> del dueño y para el veterinario). Esto resuelve mejor la "nota sobre peso" de la sección 1.

### Cambios en backend
- `RegistroMedico`: agregar propiedades + parámetros opcionales en `Crear(...)`.
- DTO `AgregarRegistroMedicoComando`: agregar los campos.
- (Opcional) Endpoint para listar histórico de peso de una mascota, o derivarlo del expediente.

---

## 3. Resetear PIN (recuperación de acceso) — YA detectado

**Necesidad:** un dueño o un admin olvida su PIN y necesita recuperar el acceso.

### Estado actual
- La entidad `Usuario` **ya tiene** el método `CambiarHashPin(nuevoHash)`.
- **NO existe endpoint** que lo exponga (no hay reset de PIN en `Program.cs`).

### Cambios en backend
- `POST /api/usuarios/{id}/resetear-pin` con body `{ nuevoPin }`:
  - **Administrador** puede resetear el PIN de su staff (Veterinario/Recepcionista) y de los
    dueños de su veterinaria.
  - **SuperAdmin** puede resetear el PIN de los Administradores.
  - Validar el PIN (6 dígitos) y el aislamiento multi-tenant (no resetear usuarios de otra vet).
- Reutiliza `Usuario.CambiarHashPin` + `IHasheadorContrasena.Hashear`.

> **Frontend (cuando exista el endpoint):** botón "Resetear PIN" en la gestión de usuarios/staff
> y en la tarjeta de cliente con acceso; para admins, en el panel SuperAdmin.

---

## 4. Editar cliente — YA detectado

**Necesidad:** corregir/actualizar datos de un cliente (nombre, teléfono).

### Estado actual
- La entidad `Cliente` **no tiene** métodos de edición (solo `Crear`, y toggles de consentimiento
  WhatsApp). No hay endpoint de actualización.

### Cambios en backend
- Método `ActualizarDatos(nombre, telefono, origen)` en la entidad `Cliente` con validación.
- `PUT /api/clientes/{id}` (Admin/Recepcionista, respetando multi-tenant).

> **Frontend (cuando exista):** botón "Editar" en la tarjeta de cliente que abre un modal
> prellenado con los datos actuales.

---

## 5. Historial de ventas + exportación

**Necesidad:** ver las ventas que se han registrado (histórico) y poder **exportarlas**
(ej: a CSV/Excel) para contabilidad o reportes.

### Estado actual
- Existe `POST /api/ventas` (registrar venta) y la entidad `Venta` con `LineaVenta` y `Total`.
- **NO existe** endpoint para **listar** las ventas de una veterinaria. Solo se pueden crear.

### Cambios en backend
- `GET /api/veterinarias/{veterinariaId}/ventas?desde=...&hasta=...` → lista de ventas con
  fecha, total, líneas (producto, cantidad, precio) y cliente opcional. Filtro por rango de fechas.
- (Opcional) `GET /api/veterinarias/{veterinariaId}/ventas/resumen` → totales por día/mes,
  producto más vendido, etc. (métricas para el dashboard del Admin).
- Solo **Administrador** (ve el dinero, según el modelo de roles).

### Frontend (cuando exista)
- Página "Historial de ventas": tabla con fecha, total y detalle de cada venta.
- **Exportar a CSV/Excel:** se puede hacer 100% en el frontend (generar el CSV desde los datos
  y descargarlo con un `Blob`), sin que el backend genere el archivo. Solo requiere el endpoint
  de listar ventas.

### 5.1. Venta asociada a un cliente → historial de compras en su perfil
**Necesidad:** al registrar una venta, poder **seleccionar opcionalmente el cliente** que compró,
para que en el perfil de ese cliente aparezcan **las compras que ha hecho**.

- **Backend YA lo soporta parcialmente:** `RegistrarVentaComando` ya tiene un campo
  `ClienteId` **opcional** (`Guid?`). Es decir, la venta ya puede guardarse ligada a un cliente.
- **Falta en backend:** un endpoint para **listar las ventas de un cliente**, ej:
  `GET /api/clientes/{clienteId}/ventas` (o incluir las compras en un futuro
  `GET /api/clientes/{clienteId}/resumen`).
- **Falta en frontend:**
  - En el POS, agregar un **selector de cliente opcional** ("Venta a: [cliente] / público en general")
    antes de cobrar, y mandar el `clienteId` en el body (el tipo `RegistrarVentaRequest` ya lo tiene).
  - En el perfil/tarjeta del cliente, una sección **"Compras"** con su historial.

> Esto conecta el POS con el CRM de clientes: saber qué compra cada dueño abre la puerta a
> recomendaciones, recompra de alimento/medicina y recordatorios comerciales.

---

## 6. Código QR por mascota (diferenciador ⭐)

**Necesidad:** cada mascota tiene un **QR**. El dueño llega, el staff escanea el QR y ve al
instante el **perfil completo**: expediente, próximas citas, recordatorios y métricas. Agiliza
la recepción y es un gran diferenciador de producto.

### Diseño propuesto
**El QR NO debe contener datos sensibles** (es público, cualquiera lo puede leer). Codifica una
**URL con un identificador de la mascota**:

```
https://<dominio-frontend>/m/{tokenMascota}
```

Al escanearlo:
- Si quien escanea **es staff autenticado** → abre el perfil completo de la mascota.
- Si **no hay sesión** → pide login primero.

> **Seguridad:** usar un **token opaco** (GUID aleatorio, distinto del id interno) para que el
> QR no exponga ni permita enumerar ids reales. El acceso a los datos SIEMPRE pasa por la API
> con autenticación; el QR solo indica "qué mascota", no "da acceso".

### Cambios en backend
- (Recomendado) Agregar `TokenPublico` (Guid aleatorio) a `Mascota` + endpoint
  `GET /api/mascotas/token/{token}` que resuelve a la mascota (staff autenticado).
- (MVP simple) Usar `mascotaId` en la URL y proteger la vista con login de staff.
- (Opcional) `GET /api/mascotas/{id}/resumen` → métricas: nº de consultas, última visita,
  próxima cita, peso actual, recordatorios pendientes.

### Frontend (cuando exista)
- **Generar QR:** con librería ligera (`qrcode`) o SVG. Botón "Ver/Imprimir QR" en el perfil de
  la mascota → genera el QR de su URL para imprimir/pegar en carnet o collar.
- **Escanear:** cámara del dispositivo (`@zxing/browser` o `html5-qrcode`) en una pantalla
  "Escanear QR". Al leer, navega al perfil.
- **Ruta:** `/m/:idOToken` → perfil de la mascota con expediente + citas + métricas.

> Encaja perfecto con el diferenciador de Chiron (portal + recordatorios): el QR conecta el
> mundo físico (la mascota que llega) con el expediente digital al instante.

---

## 7. Desacoplar el registro de cliente y de mascota

**Necesidad:** hoy solo existe `registro-rapido` que crea **cliente + mascota juntos**. Pero
un cliente puede llegar **solo a comprar** (sin mascota registrada), o un cliente existente
puede traer **otra mascota** más adelante. Obligar a registrar una mascota para dar de alta a un
cliente es fricción innecesaria.

### Estado actual
- Solo `POST /api/registro-rapido` (cliente + 1 mascota, atados).
- **NO existe** crear solo cliente, ni agregar mascota a un cliente existente.

### Diseño propuesto — 3 flujos
1. **Registro rápido** (cliente + mascota) — ya existe; útil para el caso típico de recepción.
2. **Crear solo cliente** → `POST /api/clientes` con `{ veterinariaId, nombre, telefono, origen }`.
   Para quien viene solo a comprar o aún no registra mascota.
3. **Agregar mascota a cliente existente** → `POST /api/mascotas` con
   `{ veterinariaId, clienteId, nombre, especie, ... }`.

> Regla de negocio: un **cliente puede tener 0..N mascotas**; una mascota siempre pertenece a
> un cliente. Con esto el registro rápido queda como un atajo, no como la única vía.

### Frontend (cuando exista)
- Separar el modal de registro: opción "Solo cliente" / "Cliente + mascota".
- En la tarjeta de cliente: botón "Agregar mascota".
- **Venta a no registrados:** en el POS, permitir venta a "Público en general" (sin cliente) —
  ya soportado por el `ClienteId` opcional (ver 5.1). Así se puede vender sin exigir registro.

---

## 8. Saber si un cliente ya tiene acceso al portal (validación)

**Necesidad:** al ofrecer "Dar acceso al portal" a un cliente, saber si **ya tiene** un usuario
creado, para no intentar crearlo dos veces y mostrar el estado correcto en la UI.

### Estado actual
- El endpoint `POST /api/usuarios/dueno` crea el acceso, pero si ya existe probablemente
  devuelve error (usuario duplicado).
- La entidad `Cliente` **no expone** si tiene un usuario/acceso asociado. El frontend no puede
  saber de antemano si mostrar "Dar acceso" o "Ya tiene acceso".

### Cambios en backend (opciones)
- (Simple) Incluir un flag `tieneAcceso: bool` en el DTO de cliente que devuelven
  `buscar/listar clientes`.
- (Alternativa) `GET /api/clientes/{id}/tiene-acceso` → `{ tieneAcceso: bool }`.
- Asegurar que `POST /api/usuarios/dueno` devuelva un error claro y manejable si ya existe
  (ej: 409/mensaje específico) para que el frontend lo muestre bien.

### Frontend (cuando exista)
- Mostrar en la tarjeta del cliente un badge "Con acceso" y ocultar/deshabilitar el botón
  "Dar acceso" si `tieneAcceso` es true; en su lugar ofrecer "Resetear PIN" (ver sección 3).

---

## Prioridad sugerida

1. **Reset de PIN** (3) — crítico para operación real; la lógica de dominio ya existe.
2. **Desacoplar cliente/mascota + venta a no registrados** (7) — quita fricción de recepción y ventas.
3. **Historial de ventas + export + venta por cliente** (5) — necesario para el Admin.
4. **Detalle de consulta** (2) — diferenciador clínico.
5. **Validar acceso al portal** (8) — mejora UX de gestión de accesos.
6. **Más campos de mascota** (1) — mejora la ficha clínica.
7. **Código QR por mascota** (6) — diferenciador ⭐.
8. **Editar cliente** (4) — corrección de datos.

---

## Impacto en el frontend

Cuando estos endpoints existan, en `chiron-web` se conectan así:
- Nuevos campos → ampliar los tipos en `src/types/api.ts` y los formularios/modales existentes
  (`RegistroRapidoModal`, `AgregarRegistroModal`).
- Reset PIN / editar cliente → nuevos servicios en `features/*/api.ts`, hooks y botones en la UI.

Todo el frontend ya está preparado para extenderse sin reescribir (arquitectura feature-based).
