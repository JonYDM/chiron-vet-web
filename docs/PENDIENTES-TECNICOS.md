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
    en el header del Panel Operativo), `public/empty.png` (ilustración global de estado
    vacío / "sin resultados" en todas las listas) y `public/pet-store.png` (identidad del
    header del Punto de venta). Su **uso comercial requiere licencia de pago**.
  - Estado: NO pagado aún (todavía sin cliente). **Compromiso: pagar la licencia ANTES de
    salir a producción / cobrar al primer cliente.** No olvidar: es un tema legal.
  - Nota técnica: `vet.png` pesa ~1.6 MB (muy grande para un ícono). **Optimizar** ambos
    antes de prod (redimensionar a ~96–256px y convertir a WebP) para no penalizar la carga
    de la PWA.


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
  - **Veterinaria** (hoy: Nombre, Telefono, Activa, FechaAlta). Agregar:
    - `Direccion` (texto).
    - `Plan` (enum: Mensual / Anual) — para el modelo de cobro/renovación.
    - `FechaRenovacion` (calculada: FechaAlta/último pago + 1 mes o 1 año según Plan).
      El panel muestra "Renueva el [fecha]" y resalta las próximas a vencer.
  - **Administrador** (Usuario staff rol Administrador). Agregar:
    - `Curp` — se **PIDE** al usuario (NO se genera) + validar formato (18 chars, patrón
      CURP). Dato personal sensible: validar y no exponer de más en UI.
    - `Telefono` de contacto.
    - **Usuario de login autogenerado** a partir de nombre + parte de la CURP
      (ej. `mariana.hegm`), para que sea único y no lo escriban a mano. El PIN se crea
      como ya se hace.
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
