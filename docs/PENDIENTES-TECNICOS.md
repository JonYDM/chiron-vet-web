# Pendientes técnicos — backlog de ingeniería

> Cuestiones técnicas detectadas durante el rediseño (base Stitch) para iterar con
> contexto general: librerías/componentes que faltan en el frontend y features/lógica
> que requiere el backend. Complementa a `REDISENO-STITCH.md` (bitácora de UI) y
> `DESIGN-SYSTEM.md` (sistema visual estable).

## Frontend — librerías / componentes a incorporar
- **Gráficas / charts (métricas):** el dashboard muestra métricas (ventas, citas) que
  pedirían gráficas de barras/líneas. Evaluar **Recharts** (o visx / Chart.js). Recharts
  es el más simple para React + buen encaje con tokens. Uso: barra de ventas por día,
  distribución por método de pago, tendencia de citas.
- **Barras de progreso / medidores:** hoy la barra tricolor de "Citas del Día" está hecha
  con divs. Si se vuelve recurrente, extraer un componente `ProgressBar`/`Meter`.
- **Galería / lightbox de fotos:** el perfil de paciente tiene collage; para verlas en
  grande evaluar un lightbox ligero (o construirlo con el Modal existente).
- **Carga/compresión de imagen en cliente:** al subir foto de mascota, comprimir con
  `<canvas>` antes de mandar (reduce datos del celular). Ver PR backend de fotos (R2).

### Patrones de UI (animación / movimiento)
- **Collapsing header (estilo iOS "large title"):** el título grande de la pantalla se
  encoge y se funde con el header fijo al hacer scroll. Técnicas:
  - **Scroll-driven animations** CSS puro (`animation-timeline: scroll()` / `view()`) —
    elegante, sin JS, pero soporte parcial (Chrome/Edge sí; Safari/Firefox aún no del todo).
  - **IntersectionObserver** (JS) — soporte universal; detecta cuándo el título grande sale
    de vista y lo muestra en el header. **Elegido** por compatibilidad.
  - Implementado como componente reutilizable `<PantallaConHeader titulo="...">`.
  - NO confundir con **View Transitions API** (transición entre rutas/estados, "shared
    element"), que la app ya usa en `lib/useNavegarConTransicion.ts`.

## Backend — features / lógica pendiente (para próximos PRs de `chiron`)

- **[DEMO — camino feliz] Checklist para el primer despliegue del front (mostrar al cliente):**
  Flujo objetivo (sin enfocarse en permisos finos de vet/cajero por ahora):
  1. **SuperAdmin** crea **veterinaria** (wizard) → en su card, botón "Administrador" crea el
     **admin** (usuario + PIN). Ambos usan hooks reales (`useCrearVeterinaria`, `useCrearAdmin`). ✅
  2. **Admin** inicia sesión y hace TODO (acceso completo, ya resuelto). ✅
  3. **Dueño de mascota** ve en su portal **"Mis pagos"** (`GET /api/portal/mis-compras`) lo
     que se le cobró (consultas/artículos con desglose). ✅ (front + backend nuevos)
  - Backend del camino feliz va en rama `fix/metricas-por-rol` (incluye métricas por rol +
    `mis-compras`). MERGEAR antes de la demo.
  - Para que el dueño vea pagos: el cobro en el POS debe **asociar el clienteId** (ya se puede
    elegir cliente en el cobro). Recordar seleccionar al cliente al cobrar en la demo.


- **[DEFINIDO] Permisos y métricas por rol (Fase 1 — HECHO backend `fix/metricas-por-rol` + front):**
  - **Admin:** hace TODO (veterinario + cajero + gestión de equipo) — puede atender la
    veterinaria él solo. Métricas COMPLETAS (ventas día + mes + negocio).
  - **Recepcionista:** citas, clientes, POS/cobrar. NO consultas (expediente). Métricas:
    solo **venta del DÍA** (su caja), sin desglose acumulado del negocio.
  - **Veterinario:** citas, clientes, consultas (expediente). NO POS/ventas. Métricas: solo
    **operativas** (citas del día, clientes activos), CERO dinero.
  - Backend: `MetricasDashboard` recibe `AlcanceMetricas` (Completo/SoloHoy/Ninguno) según
    rol; `/metricas` permite los 3 roles y filtra el dinero. Catálogo POS y ResumenVentas =
    Admin+Recepcionista. Expediente = Admin+Veterinario. RegistrarVenta = Admin+Recepcionista.
  - PENDIENTE: mergear `fix/metricas-por-rol`.

- **[ÉPICA — Fase 2, PLANEADA] Flujo de cobros (veterinario genera cargo → caja cobra):**
  - Idea del usuario (validada, patrón de la industria: separar quién genera el cargo de
    quién lo cobra):
    `Veterinario hace consulta/servicio → genera un CARGO (concepto + monto) → queda
     PENDIENTE DE COBRO → aparece en la caja de Recepcionista/Admin → cobran con el POS →
     se cierra la venta → nota/recibo le llega al cliente en su portal (notificación).`
  - Modelo nuevo: **Cargo / Cuenta por cobrar** (veterinariaId, mascotaId/clienteId,
    concepto, monto, estado pendiente/cobrado, origen consulta, quién lo generó/cobró).
  - Nueva sección "Cobros pendientes" en el POS/caja. Se conecta con el POS existente y con
    las notificaciones (épica §8) para avisar al cliente.
  - Es un módulo mediano; construir después de cerrar las restricciones de rol.


- **[MEJORA] Agenda de citas con nombre de paciente/dueño:**
  - Hoy `VerAgenda` (`GET /citas/proximas`) devuelve `Cita` con `mascotaId` pero SIN el
    nombre de la mascota ni del dueño. El frontend (CitasPage y el widget del dashboard)
    resuelve el nombre **cruzando en cliente** con la lista de pacientes (`usePacientes`).
    Funciona, pero depende de que esa lista esté cargada y no es lo ideal.
  - **Backend a crear:** un DTO `CitaAgenda` (o ampliar la respuesta) con `mascotaNombre`,
    `mascotaEspecie` y `clienteNombre`, resueltos en el servidor. Así la agenda no depende
    del cruce en el front. Aplica también al timeline del dashboard.


- **[LEGAL / PENDIENTE] Licencia de íconos 3D (things.co):**
  - Íconos 3D de **things.co** usados en la app: `public/vet.png` (identidad del rol clínico
    en el header del Panel Operativo), `public/empty.png` (estado vacío / "sin resultados"),
    `public/pet-store.png` (header del Punto de venta) y `public/no-load.png` (monito de las
    páginas de error 404/403). Su **uso comercial requiere licencia de pago**.
  - Estado: NO pagado aún (todavía sin cliente). **Compromiso: pagar la licencia ANTES de
    salir a producción / cobrar al primer cliente.** No olvidar: es un tema legal.
  - Nota técnica: [HECHO] los íconos se convirtieron a WebP redimensionado
    (`scripts/optimizar-imagenes.mjs` con sharp). Bajaron de ~7 MB (PNG) a ~74 KB (WebP).
    Los .png grandes se eliminaron de public/; se conservan solo .webp y los PNG de
    PWA/favicon. Re-ejecutar el script si se cambian los assets.


- **Recordatorios del STAFF (el "gancho" — FRONTEND HECHO, backend PENDIENTE de merge):**
  - Estado actual: el DUEÑO ya ve sus recordatorios (`GET /api/portal/mis-recordatorios`
    conectado y funcional).
  - **Backend (rama `feature/listar-recordatorios` en `chiron`, PENDIENTE de merge por el
    usuario):** `GET /api/recordatorios` (veterinariaId del token; roles Admin/Veterinario/
    Recepcionista) + método `DetectarParaStaffAsync` en `GenerarRecordatorios` (todos los
    pendientes de la clínica, sin filtrar por consentimiento de WhatsApp). El POST
    `/recordatorios/enviar` ya existía.
  - **Frontend (HECHO en `feature/rediseno-clinico`):** feature `features/recordatorios`
    (api + hooks `useRecordatorios`/`useEnviarRecordatorios`), vista `RecordatoriosPage`
    (métricas + lista agrupada por fecha con teléfono copiable + botón "Avisar"),
    ruta `/app/recordatorios` conectada (ya no es `EnConstruccion`), y el widget del
    dashboard ahora muestra el conteo REAL y enlaza a la vista.
  - Es el gancho de negocio del cliente ancla: que la clínica vea a quién recordar para
    que el cliente vuelva.
  - PENDIENTE: que el usuario mergee `feature/listar-recordatorios` (backend) para que el
    GET responda en vivo.


- **Panel SuperAdmin — ampliar modelos (Veterinaria + Administrador):**
  - **DECISIONES FINALES (acordadas con el usuario):**
    - **Renovación:** se CALCULA sola (FechaAlta/última renovación + 1 mes o 1 año según el
      Plan) y el SuperAdmin puede AJUSTARLA a mano (pagos irregulares, prórrogas).
    - **CURP:** OPCIONAL. Si se captura, se valida el formato (18 caracteres, patrón CURP).
      No se usa para el usuario.
    - **Usuario autogenerado:** `nombre.apellidopaterno` normalizado (minúsculas, sin
      acentos, ñ→n, solo el primer nombre). Si ya existe → + inicial del materno
      (`mariana.hernandezg`) → + número (`mariana.hernandez2`). Se muestra al final del wizard.
    - El Admin se captura con Nombre / Apellido paterno / Apellido materno (opcional) por separado.
  - **Historias de usuario:**
    > **HU-SA1** — Como **SuperAdmin**, quiero registrar una veterinaria con nombre, teléfono,
    > dirección y plan (mensual/anual), para tener el control de mis clientes y su cobro.
    >
    > **HU-SA2** — Como **SuperAdmin**, quiero ver cuándo renueva cada veterinaria y cuáles
    > están por vencer o vencidas, para saber a quién cobrarle.
    >
    > **HU-SA3** — Como **SuperAdmin**, quiero renovar una veterinaria (extender según su
    > plan) o ajustar la fecha a mano, para registrar pagos y prórrogas.
    >
    > **HU-SA4** — Como **SuperAdmin**, quiero crear el administrador de una veterinaria con
    > nombre, apellidos, teléfono y CURP opcional, y que el usuario de acceso se genere solo,
    > para no inventar usuarios a mano ni duplicarlos.
  - **Fases:** (1) Backend Veterinaria ampliada → (2) Frontend Veterinaria (wizard + renovación)
    → (3) Backend Admin ampliado (apellidos, teléfono, CURP, usuario autogenerado) →
    (4) Frontend Admin (wizard) + panel separado por módulos.
  - **Veterinaria** (hoy: Nombre, Telefono, Activa, FechaAlta). Agregar:
    - `Direccion` (texto).
    - `Plan` (enum: Mensual / Anual) — para el modelo de cobro/renovación.
    - `FechaRenovacion` (calculada: FechaAlta/último pago + 1 mes o 1 año según Plan).
      El panel muestra "Renueva el [fecha]" y resalta las próximas a vencer.
  - **Administrador** (Usuario staff rol Administrador) — **HECHO (HU-SA4)**:
    - Nuevas columnas en `Usuario` (nullable, los usuarios antiguos quedan en null):
      `ApellidoPaterno`, `ApellidoMaterno`, `Telefono` (10 dígitos) y `Curp`.
    - `Curp` **opcional**; si se captura se valida el formato (18 chars, sexo H/M/X) en
      back y front, y se guarda en mayúsculas. No se expone en `UsuarioDto`.
    - `Nombre` guarda el nombre completo (para no romper las vistas que lo muestran).
    - **Usuario autogenerado** `nombre.apellidopaterno` (primer nombre, minúsculas, sin
      acentos, ñ→n, apellidos compuestos juntos). Si choca: + inicial del materno
      (`juan.floresg`), luego número (`juan.flores2`…). Lo genera `GeneradorNombreUsuario`.
    - Caso de uso `CrearAdministrador`; `POST /api/admin/usuarios-admin` recibe
      `{ veterinariaId, nombre, apellidoPaterno, apellidoMaterno?, telefono, curp?, pin }`
      y devuelve `{ id, nombreUsuario, nombreCompleto }`.
    - Front: wizard de 3 pasos (nombre y apellidos con vista previa del usuario →
      teléfono + CURP → PIN) y pantalla final con el usuario y botón Copiar.
    - Migración `AdminDatosPersonales`.
  - Migraciones EF para ambos + DTOs + endpoints (crear/editar) + validación de CURP.
  - Nota: la CURP NO se autogenera (la homoclave la asigna RENAPO y no es calculable);
    se pide y se valida. Opcional: validar coherencia con nombre/fecha de nacimiento.


- **Identificar usuario antes del PIN (login estilo Nubank):** endpoint público
  `POST /auth/identificar { identificador }` → `{ existe: bool, nombre?: string }`.
  Permite validar el usuario y saludarlo por su nombre real antes de pedir el PIN.
  - **Nota de seguridad:** habilita enumeración de usuarios. Mitigar con **rate-limiting**
    y devolviendo solo el primer nombre (no datos sensibles). Para app interna es
    aceptable, pero decidir a conciencia.
  - El frontend YA está preparado: si el endpoint no existe (404/405), hace fallback y
    continúa al PIN sin validar (`identificar()` en `features/auth/api.ts`).

- **Notificaciones in-app (avisos a dueños):** en lugar de integrar WhatsApp/Meta
  (reglas, plantillas aprobadas, costo por mensaje), usar el rol **DuenoMascota** y
  enviarle avisos **dentro del portal**. Requiere:
  - Entidad `Notificacion` (destinatarioUsuarioId, tipo, mensaje, leída, fecha).
  - Endpoint para emitir (individual o masivo/"spam" propio) y para listar/marcar leída.
  - El portal del dueño las muestra (campana + lista).
- **Recordatorios por fecha + enum de tipo:** generar recordatorios automáticos según
  fechas clínicas (próxima vacuna/desparasitación/cita). Requiere:
  - Lógica que calcule "vence en X días" a partir de `fechaProximaAplicacion`.
  - **Enum `TipoRecordatorio`** (Vacuna, Desparasitación, Cita, Revisión…).
  - Job/consulta que liste los pendientes del día (ya existe `GenerarRecordatorios` en
    backend — revisar y conectar con notificaciones in-app).
- **Métricas reales para gráficas:** endpoints que devuelvan series temporales (ventas
  por día del mes, citas por día) para alimentar Recharts, no solo totales.
- **Multi-sucursal:** relación usuario ↔ N veterinarias + cambio de contexto (ver
  REDISENO-STITCH.md §1).
- **AdminOperativo obsoleto:** el flag `AdminOperativo` ya no controla módulos (todos los
  Admin ven lo mismo). Decidir en backend si se elimina del dominio/token/endpoint
  `/admin/veterinarias/{id}/admin-operativo` o se deja inerte. El front ya no lo usa para
  permisos.
- **Filtros de clientes "Con cita hoy" / "Con adeudo":** hoy son chips [MOCK] en la vista
  Clientes (marcan pero no filtran). Requieren: consulta de clientes con cita en el día
  y un concepto de adeudo/saldo (cuentas por cobrar) que hoy no existe en el POS.
- **Obtener mascota por id (`GET /mascotas/{id}`):** el Perfil de Paciente recibe la mascota
  por router state (al entrar desde Clientes). Al recargar (F5) se pierde el state y falta
  un endpoint para recuperar los datos del paciente por id. La galería y el expediente sí
  cargan por id.
- **Listar mascotas de la veterinaria (`GET /mascotas`):** para la nueva vista Pacientes
  (todas las mascotas con búsqueda/paginación). El dominio ya tiene
  `IMascotaRepository.ListarPorVeterinariaAsync`; falta exponer el endpoint en Program.cs
  tomando el veterinariaId del token. Mientras, la vista usa fallback.
- **Conteo de mascotas en el listado de clientes (`totalMascotas`):** agregar el campo al
  DTO de cliente al listar (query eficiente, evitar N+1) para mostrarlo en la fila de la
  lista de Clientes. El frontend ya lee `cliente.totalMascotas` (opcional): si no viene,
  no lo muestra.
- **Nombre de la veterinaria en la sesión:** hoy el token/login solo trae `veterinariaId`,
  no el nombre. El header muestra la sucursal quemada ("Roma Norte"). Falta incluir el
  nombre de la veterinaria en `LoginResponse`/claims para mostrarlo real.
- **Inventario con lotes/caducidad:** para la "alerta farmacéutica" (stock por agotarse,
  lote, refrigerador). Hoy el POS tiene stock simple.
- **Triage / sala de espera:** estado de atención (en espera, en consultorio, urgencia),
  tiempo de espera, asignación de consultorio.
- **Método de pago SPEI:** el desglose de caja muestra SPEI; hoy el POS tiene
  efectivo/tarjeta/transferencia. SPEI con CLABE/QR sería una extensión.
- **Campos clínicos del paciente:** alergias/contraindicaciones (para la "alerta médica
  crítica"), microchip, cédula del veterinario. Algunos ya existen (padecimientos).

## Notas de implementación
- Cualquier dependencia nueva: versión pineada, revisar peso (bundle) y encaje con tokens.
- Priorizar componentes propios sobre librerías pesadas salvo que aporten mucho (charts).

## Conceptos detectados en los mock (features candidatas) — con filtro LATAM

> Criterio: anotar lo útil que aparece en los datos mock, PERO filtrar por contexto LATAM.
> Descartar lo que no sea determinante para que una veterinaria adopte el sistema (evitar
> features "de más" que no mueven la aguja aquí).

### Sala de espera / triage
- **Enum de urgencia/triage:** `Normal`, `Urgencia leve`, `Urgencia mayor` (o similar).
  Útil para priorizar atención. → CONSERVAR (simple y aporta).
- **Tiempo de espera** del paciente en sala. → CONSERVAR (dato operativo real).
- **Dueño** visible en la tarjeta de sala. → CONSERVAR.
- **"Ver ficha"** (acceso rápido al perfil desde la sala). → CONSERVAR.
- **Consultorio asignado** ("Consultorio 2"). → EVALUAR: útil solo si la clínica tiene
  varios consultorios; muchas LATAM son de 1 consultorio. Hacerlo opcional/configurable.
- Requiere módulo backend de **cola de atención** (entidad con estado, urgencia, tiempo,
  consultorio opcional).

### Citas — enum de estado
- Estados observados: **Atendido / Por confirmar / En proceso / (Quirófano)**.
  - CONSERVAR: `Programada`, `Atendida`, `No asistió`, `Cancelada` (ya existen en el enum
    `EstadoCita` del backend) + posiblemente **`En proceso`** y **`Por confirmar`**.
  - EVALUAR/DESCARTAR: **"Quirófano"** — muchas veterinarias LATAM pequeñas no operan o no
    manejan estados de quirófano. No hacerlo determinante; dejarlo fuera del MVP o como
    etiqueta opcional.

### Filtro LATAM — qué probablemente DESCARTAR (no determinante para adopción)
- **SPEI con CLABE/QR** en el POS: útil pero no crítico; muchas cobran efectivo/tarjeta.
  Mantener método de pago simple (efectivo/tarjeta/transferencia) que ya existe.
- **Turno matutino/vespertino activo:** poco valor real; candidato a descartar.
- **"En línea · Sincronizado":** solo si se hace PWA offline de verdad; si no, quitar.
- **Alerta farmacéutica con lotes/refrigerador:** valioso para clínicas grandes; para el
  grueso LATAM (pequeñas) puede ser over-engineering al inicio. Priorizar bajo.

### Qué SÍ es determinante (priorizar)
- Expediente + galería de fotos (ya hecho), clientes/pacientes, citas con estados simples,
  POS simple, recordatorios de vacunas/desparasitación (muy valorado en LATAM).

## Planeación: Sucursales + cobro de suscripción + ingresos + drawers alineados

> Estado: **planeado (2026-09-30)**. Objetivo: cobrar renta **por sucursal**, registrar
> cada pago, ver en `/admin` cuánto se ha ganado y dejar todos los drawers de alta/edición
> alineados 1:1 con su entidad y su DTO.

### Decisiones de negocio
- **La Veterinaria** sigue siendo el tenant: es dueña de la marca, del admin, de los
  clientes y de las mascotas. Se desactiva completa solo en casos extremos.
- **La Sucursal** es lo que se cobra. Cada una tiene su propio plan, precio, renovación y estado.
  - Toda veterinaria tiene al menos una sucursal, la **Matriz**.
  - Si una sucursal vence o se desactiva, solo esa sucursal deja de operar.
- **Precio por sucursal:**
  - Default: **$250/mes**.
  - El SuperAdmin lo ajusta por sucursal (p. ej. $400 una grande, $200 una chica). El
    sistema no calcula precios, solo los guarda.
  - `Precio` es el monto **por periodo del plan**.
- **Cada renovación genera un pago** (`PagoSuscripcion`). Las ganancias salen de los pagos
  registrados. Honestidad: las renovaciones anteriores a esta feature no se registraron,
  así que el histórico empieza en cero.
- Los clientes, las mascotas y el expediente **se comparten** entre sucursales. Citas,
  ventas, cargos, caja y stock son **por sucursal**.

**Pendientes de confirmar** (van con la propuesta por default):
1. **Precio del plan anual.** Propuesta: 10 × mensual ($2,500), es decir, 2 meses gratis.
2. **Monto al renovar.** Propuesta: se precarga el precio de la sucursal y se puede
   editar en ese pago (descuento o prórroga) sin cambiar el precio base.
3. **Plan por sucursal.** Propuesta: cada sucursal tiene su propio plan (una puede ir
   mensual y otra anual).
4. **Alta de sucursales.** Propuesta: **solo el SuperAdmin**, porque cada sucursal
   implica cobro. El admin de la veterinaria las ve, pero no las crea.

### Modelo (backend)
- **`Sucursal`** (nueva, `Chiron.Domain.Sucursales`):
  - `VeterinariaId`, `Nombre`, `Direccion?`, `Telefono?`, `EsMatriz`, `Activa`,
    `FechaAlta`, `Plan`, `Precio` (decimal, precisión 10,2) y `FechaRenovacion` (DateOnly).
  - Métodos: `Crear`, `Editar`, `CambiarPrecio`, `Renovar(hoy)` (la misma regla que hoy
    tiene Veterinaria), `AjustarRenovacion`, `Activar` y `Desactivar`.
  - Regla: la Matriz no se puede desactivar mientras la veterinaria esté activa.
- **`PagoSuscripcion`** (nueva, `Chiron.Domain.Suscripciones`):
  - `VeterinariaId`, `SucursalId`, `Monto`, `FechaPago` (DateOnly), `Plan`,
    `PeriodoDesde`, `PeriodoHasta`, `Nota?`, `Anulado` y `FechaRegistro`.
  - Un pago mal capturado **se anula, no se borra**, para no perder el rastro.
- **`Veterinaria`**:
  - `Plan` y `FechaRenovacion` pasan a la Matriz. Se quitan de Veterinaria en una
    migración posterior, cuando nada las lea.
  - Se queda con `Nombre`, `Telefono` (contacto del dueño), `Activa`, `FechaAlta` y
    `AdminOperativo`.
  - `Direccion` se muda a la Sucursal.
- **Migración de datos** (`Sucursales`): por cada veterinaria existente se crea su
  Matriz. Copia nombre ("Matriz"), dirección, teléfono, plan, `FechaRenovacion` y
  `Activa`, con `Precio` = 250 (mensual) o 2500 (anual). Se hace con `INSERT ... SELECT`
  dentro de la migración.
- **Operación por sucursal** (fase posterior):
  - `SucursalId` en `Cita`, `Venta`, `Cargo` y en el stock.
  - Stock: el catálogo de productos se comparte y el inventario vive en `StockSucursal`
    (ProductoId, SucursalId, Cantidad).
  - Staff: `Usuario.SucursalId?`. El admin queda en null (ve todas); vet y recepción
    tienen una fija.
  - Token: claim `sucursalId`. El admin cambia de sucursal con
    `POST /api/auth/cambiar-sucursal`, que reemite el token validando que la sucursal
    sea de su veterinaria.
  - Los registros existentes quedan asignados a la Matriz en la migración.

### Endpoints (SuperAdmin)
- `GET /api/admin/veterinarias`: cada veterinaria incluye su resumen de sucursales
  (total, activas, por vencer/vencidas).
- `GET /api/admin/veterinarias/{id}/sucursales`, `POST .../sucursales` y
  `PUT /api/admin/sucursales/{id}` (nombre, dirección, teléfono, plan, precio).
- `POST /api/admin/sucursales/{id}/renovar` `{ monto?, fechaPago?, nota? }`: extiende el
  periodo, crea el pago y devuelve `{ fechaRenovacion, pago }`. Si no viene `monto`, usa
  `Precio`.
- `POST /api/admin/sucursales/{id}/renovacion` (ajuste manual, sin pago) y
  `.../activar|desactivar`.
- `GET /api/admin/pagos?desde&hasta&veterinariaId`: historial de cobros.
- `POST /api/admin/pagos/{id}/anular`.
- `GET /api/admin/metricas` se amplía con un bloque **Ingresos**:
  - `GanadoMes`: suma de pagos no anulados cuya `FechaPago` cae en el mes en curso.
  - `GanadoMesAnterior`, para comparar (% de variación).
  - `GanadoHistorico`.
  - `IngresoMensualEsperado` (MRR): suma de `Precio` de las sucursales activas. Las
    anuales cuentan como `Precio / 12`.
  - `MontoPorCobrar`: suma de `Precio` de las sucursales vencidas y por vencer (7 días).
  - Los conteos de suscripción (por vencer, vencidas, planes) pasan a contar **sucursales**.

### Drawers alineados con entidad y DTO
| Entidad | Drawer | Campos (= DTO) | Hoy | Cambio |
|---|---|---|---|---|
| Veterinaria | Alta | nombre, teléfono (+ la Matriz: dirección, plan, precio) | 3 pasos sin precio | Paso "Matriz" con dirección, plan y precio (default $250) |
| Veterinaria | Editar | nombre, teléfono | DTO y hook existen, **sin UI** | Drawer `libre` desde la card |
| Sucursal | Alta/Editar | nombre, dirección, teléfono, plan, precio | no existe | Wizard de 2 pasos: datos → plan y precio |
| Sucursal | Renovar | monto (precargado), fecha de pago, nota | Renovar directo, sin pago | Drawer de confirmación con monto editable y nuevo vencimiento calculado |
| Administrador | Detalle/Editar | usuario (copiable), nombre, apellidos, teléfono, CURP | "Gestionar" solo edita el nombre | Drawer de detalle + edición, resetear PIN y desactivar (warning). Requiere endpoint nuevo |
| Staff (vet/recep) | Alta | igual que admin + rol (+ sucursal en la fase de operación) | Usuario escrito a mano | Reusar el wizard de HU-SA4 (usuario autogenerado, apellidos, teléfono) |
| Staff | Gestionar | mismos campos que admin | solo nombre | El mismo componente de detalle/edición |

Backend necesario para los drawers — **HECHO (fase 1, rama `feature/drawers-alineados`)**:
- `Usuario.EditarDatosPersonales(nombres, paterno, materno?, tel, curp?)` recompone
  `Nombre`. `ObtenerNombres()` deriva los nombres de pila (quita los apellidos del final).
- Endpoints **unificados** para ambos roles (en lugar de rutas separadas por rol). La regla
  de quién gestiona a quién es la de `GestionarUsuario.Autorizar`: el SuperAdmin gestiona
  admins; el Admin, su staff.
  - `GET /api/usuarios/{id}` → `UsuarioDetalleDto`, con la CURP **enmascarada**
    (`HEGM••••••••••••01`). La CURP completa nunca sale de la API.
  - `PUT /api/usuarios/{id}/datos` `{ nombres, apellidoPaterno, apellidoMaterno?, telefono, curp? }`.
    Para la CURP: `null` = conservar, `""` = quitar, valor = reemplazar. El usuario de login no
    cambia al editar.
- `AltaStaff` (antes `CrearAdministrador`) da de alta admin y staff con el generador
  `nombre.apellidopaterno`. **Cambio de contrato:** `POST /api/usuarios/staff` ya no recibe
  `nombreUsuario`; recibe `nombre, apellidoPaterno, apellidoMaterno?, telefono, curp?, pin, rol`
  y devuelve `{ id, nombreUsuario, nombreCompleto }`.
- Front:
  - `AltaStaffDrawer` compartido: [rol] → nombre → contacto → PIN → usuario generado.
  - `DetalleUsuarioDrawer` (reemplaza a `GestionarUsuarioModal`): usuario copiable,
    teléfono, CURP enmascarada, veterinaria, editar en 2 pasos, resetear PIN y
    desactivar (warning). Avisa cuando a un usuario antiguo le faltan apellidos o teléfono.
  - `EditarVeterinariaDrawer` (ícono ⚙ en la card) con `SelectorPlan` compartido con el alta.
- **Limpieza:** `configurarAdminOperativo` (front) y el endpoint `admin-operativo`
  ya no se usan. Falta decidir si se exponen en el detalle de la veterinaria o se eliminan.

### Fase 2 — HECHO (rama `feature/sucursales`, migración `SucursalesCobro`)
- **Decisiones tomadas con la propuesta por default:** anual = 10 × mensual ($2,500), plan
  por sucursal y alta de sucursales solo por el SuperAdmin. El monto editable al renovar
  llega en la fase 3.
- **Backend:**
  - Entidad `Sucursal` (`Chiron.Domain.Sucursales`).
  - Servicio `GestionSucursales` (Application), que concentra todas las reglas:
    - Si una veterinaria no tiene Matriz, se crea al vuelo con su plan, fecha y estado
      (cubre el modo en memoria y datos viejos).
    - La Matriz sigue el estado de la veterinaria: se activa o desactiva junto con ella,
      y renovarla reactiva a la veterinaria. Por eso no se puede desactivar sola.
    - Las demás sucursales se activan o desactivan por separado.
- **Compatibilidad:**
  - `GET /api/admin/veterinarias` devuelve `VeterinariaConSucursalesDto`; sus `direccion`,
    `plan` y `fechaRenovacion` salen de la Matriz.
  - Los endpoints viejos `.../veterinarias/{id}/renovar|renovacion` actúan sobre la Matriz.
  - Así el front anterior sigue funcionando hasta que se despliega el nuevo.
- **Métricas:**
  - Por vencer, vencidas y planes cuentan **sucursales de veterinarias activas**.
  - Se agregan `totalSucursales` y `sucursalesActivas`.
  - `proximasRenovaciones` trae `sucursalId`, `sucursalNombre`, `esMatriz` y `precio`.
- **Migración:** crea la tabla `Sucursales` más un `INSERT ... SELECT` que da de alta la Matriz
  de cada veterinaria con su plan, fecha y estado, y precio 250/2500. Usa `gen_random_uuid()`,
  que requiere PostgreSQL 13 o superior.
- **Front:**
  - `/admin/veterinarias/:id` (`VeterinariaDetallePage`):
    - Datos del tenant, renta mensual de las sucursales activas y conteo de activas.
    - Lista de sucursales, cada una con plan · renta, badge de vencimiento, ajustar fecha,
      Renovar, ⚙ Editar y Desactivar (salvo la Matriz).
    - "Desactivar veterinaria completa" en ámbar.
  - Card de la lista:
    - Con 1 sucursal muestra plan · renta y "Renovar".
    - Con varias muestra "N sucursales · $X/mes" y el botón "Sucursales".
    - El orden y los filtros usan la sucursal más urgente.
  - Componentes compartidos: `SucursalDrawer` (datos → plan y renta), `CampoPrecio` y
    `AjustarRenovacionDrawer` por sucursal. El alta de veterinaria pide la renta de la
    Matriz; mientras no la toquen, cambiar el plan pone el precio base.
  - Dashboard: "Por cobrar" renueva por sucursal y muestra "Veterinaria · Sucursal" y la renta.

### Fase 3 — HECHO (rama `feature/cobros-suscripcion`, migración `PagosSuscripcion`)
- **Backend:**
  - Entidad `PagoSuscripcion`: sucursal, monto, fecha de pago, plan, periodo que cubre,
    nota y anulado.
  - `Sucursal.Renovar` ahora devuelve el periodo que cubre.
  - `GestionSucursales.RenovarAsync` renueva **y registra el pago**. El monto por default es
    el precio de la sucursal y la fecha por default es hoy; no acepta fechas futuras. Si el
    pago es inválido, la fecha de renovación no se mueve.
  - Los endpoints viejos de renovar la Matriz también registran el pago.
  - Endpoints:
    - `POST /api/admin/sucursales/{id}/renovar` con body opcional `{ monto?, fechaPago?, nota? }`.
    - `GET /api/admin/pagos?desde&hasta`.
    - `POST /api/admin/pagos/{id}/anular`. Un pago anulado no se borra y no revierte la fecha.
  - Métricas: `ganadoMes`, `ganadoMesAnterior`, `ganadoHistorico`, `pagosMes`,
    `ingresoMensualEsperado` (renta de las activas; las anuales se cuentan como precio / 12)
    y `montoPorCobrar` (renta de las sucursales vencidas o que vencen en 7 días).
  - Los meses se calculan en **UTC**. Un pago registrado de noche en México puede caer en
    el día siguiente; pendiente de mover a hora de México si llega a importar.
  - **Honestidad:** las renovaciones anteriores no se registraron, así que el histórico
    empieza en cero.
- **Front:**
  - `RenovarDrawer`: todo botón "Renovar" o "Cobrar" abre este drawer, con monto precargado
    y editable solo para ese pago, fecha, nota y "Quedará cubierta hasta…" calculado con la
    misma regla del backend.
  - Dashboard `/admin`: bloque **Ingresos** arriba.
    - Card teal "Ganado este mes" con la variación contra el mes anterior, que lleva a Cobros.
    - "Esperado al mes" y "Por cobrar", ambos en monto.
  - `/admin/cobros`: selector de mes (patrón del Historial de ventas), total cobrado,
    buscador y lista de cobros. Anular pide confirmación en línea con el botón danger.

### Panel `/admin` — bloque "Ingresos"
- Va arriba del "Estado de la plataforma":
  - Card grande teal con **Ganado este mes** y variación contra el mes anterior
    (flecha + %).
  - 2 cards: **Ingreso mensual esperado** y **Por cobrar** (monto + nº de sucursales).
  - Enlace "Ver cobros", que lleva al historial de pagos (lista con searchbar y chips
    por mes, mismo patrón que el Historial de ventas).
- "Por cobrar" lista sucursales (veterinaria · sucursal · precio), y su botón Renovar
  abre el drawer con el monto.

### Fases (una rama backend por fase, migración commiteada antes del PR)
| # | Fase | Back | Front | Migración | Tamaño |
|---|---|---|---|---|---|
| 1 | Drawers alineados | Editar datos personales, detalle con CURP enmascarada, staff con usuario autogenerado | Editar veterinaria, detalle/editar admin y staff, alta de staff en wizard | No (las columnas ya existen) | M |
| 2 | Sucursal para cobro | Entidad Sucursal, Matriz automática, endpoints, métricas por sucursal | Sucursales en el detalle de la veterinaria, alta/edición, precio, renovar por sucursal | `Sucursales` (+ datos de la Matriz) | L |
| 3 | Cobros e ingresos | `PagoSuscripcion`, renovar con pago, anular, historial, métricas de ingresos | Drawer Renovar con monto, bloque Ingresos, historial de cobros | `PagosSuscripcion` | M |
| 4 | Limpieza | Quitar `Plan`/`FechaRenovacion`/`Direccion` de Veterinaria | Ajustar tipos | `LimpiezaVeterinaria` | S |
| 5 | Operación por sucursal | `SucursalId` en Cita/Venta/Cargo, StockSucursal, staff asignado, claim + cambiar sucursal | Selector real (sustituye el mock), filtros por sucursal en el dashboard y el historial | `OperacionPorSucursal` | XL |

- Las fases 2 y 3 son las que habilitan cobrar por sucursal y ver ganancias. La 5 se puede
  posponer: mientras tanto, cada sucursal se cobra, pero la operación sigue unificada.
- **Regla de despliegue** (aprendida el 2026-09-30): si el front depende de un contrato
  nuevo, **primero** se mergea y despliega el back (con su migración) y **después** se
  pushea el front.

### HUs
- **HU-SU1:** Como SuperAdmin, quiero dar de alta sucursales de una veterinaria con su
  propio plan y precio, para cobrar renta por cada una.
- **HU-SU2:** Como SuperAdmin, quiero ajustar el precio de una sucursal, para cobrar más
  a las grandes y menos a las chicas.
- **HU-SU3:** Como SuperAdmin, quiero renovar una sucursal registrando el monto cobrado,
  para llevar el control de pagos.
- **HU-SU4:** Como SuperAdmin, quiero ver cuánto he ganado este mes, el ingreso mensual
  esperado y cuánto tengo por cobrar, para conocer la salud del negocio.
- **HU-SU5:** Como SuperAdmin, quiero ver el historial de cobros y anular un pago mal
  capturado, para corregir errores sin perder el rastro.
- **HU-SU6:** Como SuperAdmin/Admin, quiero ver y editar los datos completos de un usuario
  (apellidos, teléfono, CURP), para mantenerlos al día.
- **HU-SU7:** Como Admin, quiero cambiar de sucursal y ver citas, ventas y stock de cada
  una, para operar varias sedes.
