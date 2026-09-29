# Rediseño "Clínico" (base Stitch) — reglas de negocio, historias de usuario y pendientes de backend

> Documento vivo. Registra el rediseño total del frontend basado en el design system
> generado por Stitch (paleta clínica teal+terracota, Plus Jakarta Sans, layout tipo
> "Refined Modern Clinical"). Además captura las **reglas de negocio** e **historias de
> usuario** nuevas que el rediseño destapa, y qué necesita el **backend** para hacerlas
> reales. Sirve de insumo para planear los próximos PRs del backend (`chiron`).
>
> Convención: los elementos marcados **[MOCK]** están diseñados en la UI con datos
> quemados; **no existen aún en backend**. Los marcados **[REAL]** ya funcionan.

---

## 0. Alcance oficial del MVP (acordado)

Foco: el **ciclo de valor** que hace que una veterinaria LATAM adopte el sistema →
`Cliente → Paciente (expediente/foto) → Cita → Consulta/Cobro → Recordatorio → regresa`.

### Contexto de negocio — cliente ancla (Morelos)
Primer cliente potencial: **veterinaria mediana-grande en Morelos** (2+ veterinarios — el
principal descansa domingos —, un ayudante que hace de cajero, **inventario/caja** donde
venden alimento y accesorios, y posible **2ª sucursal** a futuro).

**Dolor identificado (el "gancho" de venta):** llegan **clientes nuevos** (desparasitación,
baño, etc.) y **no vuelven** porque se pierde el contacto ("perdí el número"). Cliente que
no regresa = **ingreso perdido**. Chiron lo resuelve: registrar cliente/paciente desde la
1ª visita + **recordatorios** (próxima vacuna/desparasitación) que los hacen volver. Este
dolor es **universal** (chicas y grandes), por eso el MVP sirve a este cliente Y al mercado
general — no es "a la medida".

**Estrategia:** el cliente ancla da **feedback real**, pero el producto se mantiene
**general**. Features "de clínica grande" (sala de espera, hospitalización, varios
consultorios) serán **opcionales/activables por veterinaria**, no obligatorias, para
adaptarse a todo el mercado. Multi-sucursal ya previsto aunque hoy tengan una.

**Prioridad para enganchar (cliente ancla + mercado):**
1. Clientes/Pacientes/Expediente [casi listo].
2. **Recordatorios + notificaciones in-app** ← el gancho ("que vuelvan"). ALTA.
3. Citas (modelo cita/consulta) — agenda con varios vets.
4. POS simple — su caja/inventario.
5. Panel SuperAdmin + multi-sucursal — para su 2ª sucursal.

### SÍ entra al MVP
- **Clientes + Pacientes + Expediente + galería de fotos** [REAL, hecho].
- **Foto de perfil del paciente** (avatar) separada de la galería [REAL].
- **Citas** con estados simples: Programada / En proceso / Atendida / No asistió / Cancelada.
  (SIN "Quirófano".)
- **POS simple:** seleccionar producto + método de pago (efectivo/tarjeta/transferencia) +
  cobrar/recibo. SIN SPEI/CLABE/QR.
- **Recordatorios** de vacunas/desparasitación + **notificaciones in-app** al portal del
  dueño (el "gancho" de valor en LATAM). NO WhatsApp/Meta.
- **Alertas médicas** (alergias/padecimientos del paciente) [REAL].
- **Multi-sucursal** (modelo definido, ver §1): el SuperAdmin crea/asigna veterinarias a un
  Admin; el Admin cambia de contexto entre sus sucursales (cada una es un tenant aislado).

### NO entra al MVP (pospuesto / descartado)
- **Sala de espera / triage:** POSPUESTA. Poco valor para clínicas pequeñas (1 consultorio,
  el vet ve quién llegó). Se queda como mock visual en el dashboard; se construye solo si un
  cliente con flujo alto lo pide.
- **SPEI con CLABE/QR:** fricción alta, valor bajo para la mayoría. Pospuesto.
- **Turnos** (matutino/vespertino): descartado (poco valor).
- **"En línea · Sincronizado" / offline sync:** descartado del MVP.
- **Inventario con lotes/caducidad/alerta farmacéutica compleja:** over-engineering para
  clínicas pequeñas. Pospuesto (el stock simple del POS basta).
- **WhatsApp/Meta:** descartado (reglas/costos) → notificaciones in-app en su lugar.

---

## 1. Roles y alcance (multi-sucursal)

### Estado actual del backend
- Un usuario pertenece a **una** veterinaria (`veterinariaId` viaja en el token JWT).
- Roles: SuperAdmin, Administrador, Veterinario, Recepcionista, DueñoMascota.

### Modelo multi-sucursal (DEFINITIVO, MVP)
- **Cada sucursal = una veterinaria independiente** (tenant aislado por `veterinariaId`,
  como ya funciona: pacientes, empleados, citas, POS separados).
- **Proceso comercial:** el Admin contacta al SuperAdmin pidiendo otra sucursal → el
  **SuperAdmin crea otra veterinaria y se la asigna a ese mismo Admin**.
- El Admin, si tiene varias, **cambia de contexto** con el selector de sucursal del header
  y alimenta cada una por separado. NO hay vista consolidada.
- **SuperAdmin:** su panel se centra en gestión de veterinarias (alta, activar/desactivar,
  crear admin, **asignar veterinaria a un admin existente**). (El flag AdminOperativo quedó
  obsoleto — ver decisiones.)

### Historia de usuario
> Como **SuperAdmin**, cuando un Admin me pide otra sucursal, creo una nueva veterinaria y
> se la asigno, para que le aparezca en su rol y la administre por separado.
>
> Como **Administrador con varias sucursales**, cambio de veterinaria activa desde la barra
> superior, para operar cada sucursal (sus pacientes, empleados, citas, POS) sin cerrar sesión.

### Pendiente de backend (multi-sucursal)
- Relación **usuario ↔ N veterinarias** (hoy es 1↔1 vía token). Ej. tabla `UsuarioVeterinaria`.
- Endpoint **listar "mis veterinarias"** (las del admin logueado).
- **Cambiar de contexto:** al elegir sucursal, reemitir el token con el nuevo `veterinariaId`
  (lo más limpio, ya que el tenant viaja en el token).
- **SuperAdmin:** endpoint para **asignar** una veterinaria (nueva o existente) a un Admin.

---

## 2. Design System (base Stitch) — [REAL, ya aplicado]
- Paleta: primary teal `#0D6E6E`, accent terracota `#D97736`, semánticos, surfaces claros.
- Tipografía: **Plus Jakarta Sans** + cifras tabulares (`tnum`) para métricas/dinero.
- Radios 8/16/24, sombras por nivel, touch targets 48px, modo oscuro con tokens listos.
- Archivos: `src/styles/index.css`, `tailwind.config.js`, componentes en `src/components/ui`.

---

## 3. Bitácora de vistas rediseñadas
_(se irá llenando vista por vista)_

| Vista | Estado | Elementos MOCK que implican backend |
|---|---|---|
| Design System (tokens) | [REAL] paleta teal/terracota, Plus Jakarta Sans, tnum, dark mode | — |
| Panel Operativo (dashboard) | Calcado de Stitch (mobile-first) | Desglose caja SPEI, alerta farmacéutica, sala de espera/triage, agenda; solo venta del día y nombre son [REAL]. Turno DESCARTADO. |
| Login | Rediseñado estilo Nubank (sin bordes, saludo por hora, difuminado) | Validación de identificador [REAL] (endpoint /auth/identificar mergeado) |
| Clientes | Calcado de Stitch (buscador soft, chips pill, tarjetas con avatar) | Chips "Con cita hoy" / "Con adeudo" son [MOCK] (marcan pero no filtran) |

### Decisiones de esta iteración
- **AdminOperativo obsoleto (todos los Admin ven lo mismo):** se elimina la distinción
  "Admin operativo / supervisor" que recortaba módulos. Ahora **todos los Administradores
  tienen acceso completo** a los módulos; lo único que el SuperAdmin controla del Admin es
  el **alcance de veterinarias/sucursales** (multi-sucursal, §1). Frontend: `lib/permisos.ts`
  ya da acceso completo al Admin sin depender de `sesion.adminOperativo`.
  - Pendiente UI: quitar el toggle "Admin operativo/supervisor" y su badge de
    `VeterinariasPage` (panel SuperAdmin) cuando se rediseñe esa vista.
  - Pendiente backend: el flag `AdminOperativo` (token/dominio/endpoint
    `/admin/veterinarias/{id}/admin-operativo`) queda sin efecto para módulos. Decidir si
    se elimina o se deja inerte. Documentado en PENDIENTES-TECNICOS.md.
- **Avisos a dueños (no WhatsApp):** se descarta integrar WhatsApp/Meta (reglas, plantillas
  aprobadas, costo por mensaje). En su lugar, avisos **in-app** al rol **DuenoMascota** vía
  su portal. En el dashboard, la acción "WhatsApp Masivo" se renombró a **"Avisos a dueños"**.
  (Feature de backend anotada en `PENDIENTES-TECNICOS.md`.)
- **Sidebar vs bottom-nav:** el AppShell ya separa por breakpoint (sidebar solo escritorio
  `md:flex`, bottom-nav solo móvil `md:hidden`) — no coexisten. Al rehacer el AppShell
  calcando Stitch, móvil = topbar Stitch + bottom-nav (sin drawer redundante); escritorio
  se adapta después. Enfoque **mobile-first**.
- **Íconos:** se usan lucide (equivalentes a los Material Symbols de Stitch) para no cargar
  otra fuente de íconos.
- **Header colapsable (estilo Spotify/Nubank):** header de dos alturas. Arriba: barra
  (marca/sucursal + estado + notificaciones + avatar) + título grande de la pantalla con
  subtítulo. Al hacer scroll, el título se encoge a la barra (con fecha corta). Componente
  reutilizable `PantallaConHeader` + contexto `headerTitulo`. Colapso por scroll de ventana
  con histéresis (48/24px) para no parpadear.
- **Fecha:** local del dispositivo (`Intl`, offline-friendly para PWA) — `fechaHoyLarga`
  en el título, `fechaHoyCorta` en el header colapsado.
- **[REGLA UI] Sucursal/veterinaria solo en el header:** el nombre de la sucursal/veterinaria
  aparece ÚNICAMENTE en el header (arriba), nunca en el content de las vistas (ni normal ni
  colapsado). Evita duplicar el dato.

---

## 3b. AppShell, animaciones y transiciones (estado actual)

**AppShell (`src/components/organisms/AppShell.tsx`) — mobile-first:**
- **Header de dos alturas** con blur natural (`bg-surface/80 backdrop-blur-xl`):
  barra (marca + selector de sucursal por rol + estado sincronizado + notificaciones +
  menú de perfil) y zona de título grande que colapsa al scrollear.
- **Main** scrolleable con padding que se ajusta (expandido/colapsado) con transición.
- **Bottom-nav flotante tipo isla:** píldora (`rounded-full`) al ~90% del ancho, con
  **efecto 3D** (inset shadow teal) + blur + `safe-area` (PWA/iPhone). Compacta.
- Fondo general **no-blanco** (gris-azulado suave) para que las tarjetas blancas resalten
  por elevación, no por líneas (buena práctica UX).

**Animaciones / transiciones:**
- **Collapsing header** estilo Spotify/Nubank (ver arriba) — `PantallaConHeader` + contexto.
- **anime.js** (`src/lib/anim.tsx`) para reveals/microinteracciones (respeta reduce-motion).
- **View Transitions API** entre rutas (`lib/useNavegarConTransicion.ts`).
- Transiciones de estado con `transition-all` + tokens de easing (`out-expo`).

## 3c. Roadmap de pantallas (rediseño total, base Stitch)

Meta: producto por encima de la competencia, "cosas bien hechas". Orden sugerido:

1. **AppShell + Panel Operativo** — HECHO (esta iteración).
2. **Perfil de Paciente** — pantalla estrella: alerta médica crítica, datos del paciente,
   tutor, acciones (consulta/agendar/prescribir/cobro), **galería de fotos [REAL]** (R2),
   próxima cita. Aplicar `PantallaConHeader`.
3. **Clientes & Pets** — lista con buscador/filtros, tarjeta con avatar y chips.
4. **Citas** — timeline por día, estados con nodos de color.
5. **POS / Caja** — catálogo + carrito + método de pago + recibo.
6. **Expediente** (staff y portal) — timeline clínico refinado.
7. **Portal del dueño** — mis mascotas, historial, recordatorios/avisos in-app.
8. **Panel SuperAdmin** — gestión de veterinarias.

Cada pantalla: mobile-first, `PantallaConHeader`, tokens Stitch, estados
vacío/carga/error, y lo que sea mock queda documentado aquí + en `PENDIENTES-TECNICOS.md`.

---

## 4. Elementos MOCK detectados en las referencias de Stitch (features futuras)
Cada uno es una posible historia de usuario / feature de backend:

- **Sucursal / multi-tenant por admin** (ver §1).
- **Estado "En línea · Sincronizado"** → sugiere modo offline/PWA con sincronización.
- **Notificaciones** (campana con badge) → sistema de notificaciones in-app.
- **Turno activo** ("Turno matutino activo") → control de turnos del personal.
- **Sala de espera / triage** ("En espera", "Urgencia leve", "Consultorio 2") → gestión
  de cola de atención y triage.
- **Venta en caja desglosada** (Efectivo / Terminal TPV / SPEI directo) → método SPEI
  con CLABE/QR (hoy el POS tiene efectivo/tarjeta/transferencia simple).
- **Alerta farmacéutica** (lote por agotarse en refrigerador) → inventario con lotes,
  caducidad y alertas de stock.
- **Alerta médica crítica** (alergias/contraindicaciones) → campo de alergias en la
  mascota + su despliegue prioritario.
- **WhatsApp** (botón "Aviso" al tutor) → integración de mensajería (ya hay doc de
  WhatsApp en el backend; conectar).
- **Cédula profesional del veterinario** → dato del usuario staff.
- **Microchip, cartilla de vacunación** → campos/documentos del paciente.
- **Galería de fotos del paciente** → **[REAL]** backend R2 ya implementado (PR fotos).



---

## 5. Rediseño de la sección Clientes / Pacientes (CRUDs relacionados e independientes)

### Motivación
El modelo previo (tarjeta de cliente tipo acordeón que expande sus mascotas + modal de
"registro rápido" que crea cliente y mascota juntos) mezclaba dos entidades y escondía a
las mascotas dentro del cliente. Un veterinario necesita ver **todos los pacientes**
directamente. Se separa en dos secciones relacionadas pero navegables por separado.

### Nueva arquitectura de vistas
- **Clientes** (dueños): lista → **detalle de cliente** (página propia, NO acordeón) con
  sus datos, sus mascotas y el acceso al portal. CRUD de cliente en formulario propio.
- **Pacientes** (mascotas): vista nueva que lista **todas** las mascotas de la veterinaria
  con búsqueda. Cada una → Perfil de Paciente. CRUD de mascota en formulario propio con
  **selector/buscador de cliente** (opción a): la mascota se puede crear desde aquí
  eligiendo a su dueño.
- **Bottom-nav:** se agrega "Pacientes" (junto a Clientes), alineado con Stitch.

### Historias de usuario
> Como **veterinario/recepcionista**, quiero ver una lista de todos los pacientes de la
> clínica con búsqueda, para llegar rápido a un expediente sin pasar por el dueño.
>
> Como **staff**, quiero registrar una mascota eligiendo a su dueño desde un buscador,
> para dar de alta pacientes de forma independiente.
>
> Como **staff**, quiero una página de detalle del cliente (no un acordeón) para ver y
> editar sus datos, sus mascotas y su acceso al portal con más claridad.

### Regla de relación
- Una **mascota** pertenece a **un cliente** (1 cliente → N mascotas). El formulario de
  mascota exige seleccionar el cliente dueño.

### Pendiente de BACKEND (feature nueva)
- **`GET /mascotas`** — listar todas las mascotas de la veterinaria (con búsqueda y
  paginación). Hoy solo existe `GET /clientes/{id}/mascotas` (por cliente). El dominio ya
  tiene `IMascotaRepository.ListarPorVeterinariaAsync`; falta **exponer el endpoint** en
  `Program.cs` (tomando el `veterinariaId` del token, como los demás). Mientras no exista,
  la vista Pacientes usa el hook con fallback (estado de error elegante).
- Opcional: `GET /mascotas/{id}` para recuperar el paciente por id al recargar el perfil
  (ya anotado en PENDIENTES-TECNICOS.md).


---

## 6. Análisis del Dashboard y plan (para retomar)

### Problema: el Panel Operativo se ve comprimido
Tiene ~6 secciones apiladas (acciones, métricas bento, alerta farmacéutica, sala de espera,
agenda, recordatorios) y varias son **[MOCK]**. Se siente denso.

### Mejoras de diseño propuestas
> NOTA (preferencia del usuario): la estructura está BIEN organizada y se CONSERVAN todas
> las secciones. El objetivo NO es quitar cosas, sino dar **más aire** para reducir el
> cansancio visual. Enfoque puramente de espaciado/respiración:
1. **Más separación entre secciones** (subir gap general, ej. gap-4 → gap-6).
2. **Más padding interno** en las tarjetas (el contenido que no toque los bordes).
3. **Margen extra antes de los títulos de sección** para separar grupos visualmente.
4. **Aligerar densidad de texto** dentro de las tarjetas (interlineado, quitar datos muy
   redundantes) sin eliminar secciones.
5. Opcional: reducir un poco el tamaño de bloques muy cargados (ej. desglose de caja) para
   que no compitan, pero manteniéndolos.
(Se descarta ocultar los mock: el usuario quiere mantener las secciones como están.)

### Auditoría del dashboard (qué se conecta, qué se quita) — DECISIÓN
- **Venta en caja (total hoy):** REAL (metricas.ventasHoy). ✅
- **Recordatorios:** REAL (`GET /api/recordatorios`). ✅
- **Desglose de caja (Efectivo/Tarjeta/Transferencia):** conectar `ResumenVentas`
  (`GET /ventas/resumen`) — backend YA existe. → CONECTAR.
- **Agenda de citas (timeline):** conectar `VerAgenda` (`GET /citas/proximas`) — backend
  YA existe. → CONECTAR.
- **Citas del día / métrica:** hoy `metricas.citasProximas` (genérico). Mejora futura:
  ampliar `MetricasDashboard` con conteo por estado del día (backend chico).
- **Sala de espera / triage:** ❌ QUITAR del dashboard. Decisión del usuario: la clínica se
  hace responsable de eso, NO es parte de Chiron. No es "próximamente", se elimina.
- **Alerta farmacéutica / inventario con lotes:** ❌ QUITAR del dashboard. Misma decisión:
  fuera del alcance, la clínica lo maneja aparte.

### Conectar lo REAL que ya tiene backend (siguiente paso recomendado)
El dashboard muestra mock, pero varias cosas YA existen en el backend y solo falta conectarlas:
- **MetricasDashboard** → métricas del día (ampliar con citas del día / en espera si se quiere).
- **ResumenVentas** → desglose de caja (Efectivo/Tarjeta/Transferencia) real.
- **VerAgenda** → agenda de citas del día real.
- **GenerarRecordatorios** → recordatorios reales (+ conectar con notificaciones in-app).

### Endpoints/módulos NUEVOS que requieren los elementos mock del dashboard
- Sala de espera / triage → módulo de cola de atención (estado, consultorio, tiempo).
- Alerta farmacéutica → inventario con lotes/caducidad/stock.
- Avisos a dueños → notificaciones in-app (rol DuenoMascota).
- Turno activo → control de turnos (probablemente descartable).

### Orden sugerido al retomar
1. Rediseñar dashboard con más aire (tipografía, menos subtítulos, ocultar mock puro).
2. Conectar lo real (métricas, agenda, resumen ventas, recordatorios).
3. Planear PRs de backend para los módulos nuevos (triage, inventario, notificaciones).


---

## 7. Modelo Citas vs. Consultas (validado contra la industria)

### Referencia de la industria (software veterinario EE.UU.)
Líderes: ezyVet, Cornerstone (IDEXX), Avimark, Provet Cloud, Vetspire, Digitail, Shepherd.
Todos separan 3 conceptos:
- **Cita (Appointment):** espacio en la **agenda**. Logística: fecha/hora, motivo, quién
  atiende, estado. NO tiene contenido clínico todavía.
- **Consulta (Visit/Consultation):** el **encuentro clínico** real. Contenido: motivo,
  exploración, diagnóstico, tratamiento, notas (formato SOAP). Una cita **deriva** en
  consulta cuando el paciente llega y es atendido.
- **Expediente (Medical Record):** el **historial** = suma de todas las consultas/vacunas/
  procedimientos en el tiempo.

Flujo: `Cita (agenda) → paciente llega → Consulta (clínica) → queda en el Expediente`.
Una cita puede no volverse consulta (no-show/cancelada); una consulta siempre queda en el
expediente. Hospitalización/cirugía = módulo aparte en los grandes.

### Modelo acordado para Chiron (aprobado por el usuario)
- **Cita = agenda.** Enums claros:
  - **Estado:** `Programada / Confirmada / En sala / Atendida / No asistió / Cancelada`.
  - **Tipo/motivo:** `Consulta general / Vacunación / Desparasitación / Control / Estética /
    Urgencia / Cirugía` (plantilla con enum, NO texto libre).
  - Campos: fecha/hora, mascota, motivo (enum), veterinario, notas.
- **Consulta = el `RegistroMedico`** que ya existe. Al marcar una cita como **Atendida**,
  se ofrece **crear el registro médico (consulta)** que queda en el expediente → une los
  dos conceptos como en la industria.
- **SOAP:** las consultas usarán formato **SOAP** (Subjetivo, Objetivo, Análisis, Plan)
  como los líderes (aprobado). Se puede introducir gradualmente.
- **Hospitalización / internamiento / cirugía:** módulo FUTURO (tipo hospital: jaulas,
  tratamientos programados, monitoreo). FUERA del MVP.

### Rediseño de la vista Citas (plan)
- **Lista agrupada por día** (Hoy / mañana / fechas), NO texto plano — cards Stitch con
  estados de color (reusar el patrón del timeline de agenda del dashboard).
- **Alta/edición de cita** en Drawer + wizard: fecha/hora → mascota → motivo (enum) →
  veterinario. Con la animación de guardado y toast.
- **Acción "Atender"** en una cita → crea la consulta (RegistroMedico) en el expediente.

### Pendiente de BACKEND (citas/consultas)
- Ampliar `EstadoCita` (agregar Confirmada / En sala si no están) y agregar enum
  **`TipoCita`/motivo**. Migración + DTO + endpoints.
- Enlace **Cita → RegistroMedico** al atender (crear consulta desde la cita).
- (Futuro) Campos SOAP en `RegistroMedico`; módulo de hospitalización.


---

## 8. ÉPICA — Notificaciones in-app + Campañas (planeada, NO construida aún)

### Objetivo
Que el rol **Dueño de mascota** reciba mensajes de la clínica dentro del portal (buzón +
badge de campanita), y que el **staff** pueda mandar **campañas** (promociones, avisos,
prevención) a sus clientes. Motiva el uso del portal del dueño (además de ver sus citas,
mascotas e historial).

### Decisiones de producto (acordadas con el usuario)
- **Canal:** SOLO **in-app** por ahora (buzón dentro del portal + badge de no-leídas).
- **Push real (PWA cerrada):** FASE FUTURA. Requiere Web Push API + service worker +
  suscripción + claves VAPID + envío desde el backend .NET; en iOS solo si la PWA está
  "instalada". NO entra ahora (se documenta como HU futura para no prometer a medias).
- **Tipos de campaña:** `Publicidad / Informativo / Prevención / Promoción (oferta)`.
  Solo "Promoción" lleva **producto** asociado.
- **Producto de la oferta:** se elige del **catálogo del POS** existente.
- **Envío:** a **TODOS los dueños** de la veterinaria (sin segmentar). Segmentación = futuro.

### Modelo de datos (propuesto)
- **`Notificacion`** (la "tubería", una por destinatario): Id, VeterinariaId, Destinatario
  (clienteId/usuarioId), Titulo, Cuerpo, Tipo, Leida (bool), FechaCreacion, CampañaId?
  (opcional, si vino de una campaña).
- **`Campaña`**: Id, VeterinariaId, Tipo (enum Publicidad/Informativo/Prevención/Promoción),
  Titulo, Descripcion, ProductoId? (solo Promoción), FechaEnvio, TotalEnviadas.

### Fases de construcción (orden acordado)
1. **Fase 1 — Notificaciones in-app (la tubería):**
   - Backend: entidad `Notificacion` + migración + `GET /api/notificaciones` (del token) +
     `POST /api/notificaciones/{id}/leida` + contador de no-leídas.
   - Frontend: bandeja en el portal del dueño + conectar el **badge de la campanita** del
     header (hoy [MOCK]) a no-leídas reales.
   - Solo con esto ya se pueden entregar los recordatorios como notificación real.
2. **Fase 2 — Campañas (encima de la tubería):**
   - Backend: entidad `Campaña` + endpoint crear campaña (genera N notificaciones, una por
     dueño) + selector de producto del catálogo POS.
   - Frontend (staff): formulario de crear campaña (Drawer+wizard): tipo → título →
     descripción → (si Promoción) producto. Lista de campañas enviadas.
3. **Fase 3 — Futuro:** segmentación (por especie, por inactividad, etc.) y **push real**.

### Historias de usuario
> **HU-N1** — Como **dueño**, quiero ver una bandeja de notificaciones en mi portal con un
> badge de no-leídas, para enterarme de los avisos de la clínica.
>
> **HU-N2** — Como **dueño**, quiero marcar una notificación como leída (y que el badge se
> actualice), para llevar el control de lo que ya vi.
>
> **HU-C1** — Como **staff**, quiero crear una campaña (tipo, título, descripción) y
> enviarla a todos mis clientes, para comunicar avisos/promos/prevención.
>
> **HU-C2** — Como **staff**, quiero que si la campaña es de tipo Promoción pueda asociar un
> **producto del catálogo** (la oferta), para que el dueño sepa qué está en oferta.
>
> **HU-C3 (futuro)** — Como **staff**, quiero **segmentar** a quién envío (perros, gatos,
> clientes inactivos), para campañas más relevantes.
>
> **HU-N3 (futuro)** — Como **dueño**, quiero recibir **push** aunque tenga la app cerrada
> (PWA instalada), para no perderme avisos importantes. Requiere Web Push + VAPID + SW.


---

## 8. Bitácora — Branding, pulido de UX y optimización (sesión reciente)

### Identidad / marca (DEFINITIVO)
- **Producto: Patwi** (se lee "PAT-wee"; evoca "pata"; fácil en español/inglés). Antes se
  barajó Chiron → likni → ikni (dominio `ikni.mx` ocupado) → **Patwi**.
- **Mascota: Wipo** (perrito verde, estilo flat de la lámina de referencia).
- **Dominio:** pendiente registrar (patwi/patwivet). Sitio actual: `chiron-web.netlify.app`.
- **Fuente de marca:** **Nunito** (`@fontsource/nunito`, solo peso 800 latino) → clase
  `font-marca` en tailwind, usada en el wordmark "Patwi" (login + header).
- Rebranding aplicado en toda la UI (header, login, superadmin, sucursales mock). NO se
  tocó `STORAGE_KEY = "chiron.sesion"` (cambiarla desloguea a todos).

### Assets (things.co) — [LEGAL pendiente]
- Íconos 3D de **things.co**: `vet`, `pet-store`, `no-load`, `empty`, `wipo`, `profile-wipo`.
  **Licencia comercial de pago PENDIENTE** (pagar antes de producción/cobrar).
- **Optimizados a WebP** con `scripts/optimizar-imagenes.mjs` (sharp): ~7 MB → ~74 KB.
  Íconos PWA (192/512/maskable/apple-touch) generados desde Wipo con
  `scripts/generar-iconos-pwa.mjs`. Los PNG grandes se eliminaron; solo quedan .webp + PWA.

### Login (rediseño)
- Centrado vertical con **`min-h-dvh`** (se re-centra al abrir el teclado móvil, no lo tapa).
- Fondo blanco, Wipo protagonista + wordmark "Patwi" (Nunito), saludo "¡Buenas noches!"
  con signos, subtexto corto (sin repetir el nombre). `enterKeyHint="go"`.
- Validaciones: teléfono solo dígitos máx 10; peso decimal válido.

### Shell (header + nav)
- **Header simple** (se QUITÓ el collapsing de doble altura), fondo **claro sólido**
  (sin backdrop-blur → causaba vibración/shimmer al scrollear). Sube hasta el notch con
  `safe-area-inset-top`. Sin ícono de notificaciones. El título de la vista va en el
  CONTENIDO (PantallaConHeader sigue registrando titulo/subtitulo/accion).
- **Avatar de Wipo** en el header = botón con **popover** que saluda ("¡Buenas noches! Soy
  Wipo, ¡qué gusto verte!") — compacto, sin nombre (evita nombres largos).
- **Bottom-nav docked edge-to-edge**: pegado abajo, ancho completo, esquinas superiores
  redondeadas (`rounded-t-3xl`), tinte translúcido + blur (token **`surface-nav`**),
  respeta safe-area inferior. (El nav SÍ conserva blur; el header NO.)
- `scrollbar-gutter: stable` en html → evita el reacomodo de ancho al aparecer scrollbar.

### Coherencia de vistas (design system) — módulos alineados
- **Historial de ventas, Recordatorios, Equipo, Pacientes** rehechos con el patrón común:
  `PantallaConHeader` + subtítulo, cards Stitch, bento coherente con el dashboard.
- **Equipo:** patrón de Clientes (searchbar + lista) + 2 cards de filtro por rol (neutras,
  toggle, filtro en cliente sobre el payload — sin endpoint, solo 2 roles).
- **Pacientes:** cards con badge de especie a color + jerarquía.
- **Clientes:** el estado (Activo/Inactivo) ya NO se muestra en la preview, solo en el detalle.

### PREFERENCIAS DE DISEÑO (del usuario) — IMPORTANTE seguir
- **Color con jerarquía, NO abusar del terracota:** teal = principal/marca; terracota
  (`secondary`/`st-secondary`) = acento puntual; **neutro** (`surface-container`) para
  datos informativos. No llenar de color por llenar.
- **Métricas/bento con color** estilo "acciones rápidas del dashboard" cuando aporta;
  pero los **filtros** (cards de rol) en **neutro** con activo destacado en teal.
- **Emojis:** mínimos/no invasivos (se quitaron varios). Sin "AI slop": cards con carácter
  (jerarquía, badge, avatar), no planas.
- **Móvil real:** cuidar teclado (dvh), safe-areas (notch/gestos), evitar shimmer del blur.

### Seguridad / errores
- **404 (PaginaError con Wipo)** en perfil de paciente y detalle de cliente con id
  inexistente. Backend YA valida multi-tenant en `GET /mascotas/{id}` (no expone datos de
  otra veterinaria). El ID en la URL es normal/seguro; el riesgo (IDOR) está cubierto.
- **Subida de fotos:** se quitó `capture="environment"` → en iPhone/Android ahora deja
  elegir cámara O galería O archivos.

### Rendimiento / build
- Lazy loading de rutas (ya existía) + **vendor dividido** (`manualChunks`: react/query/ui)
  para mejor caché. Imágenes WebP. Fuente mínima. PWA con SW.

### Deploy
- **Netlify** (front, rama `main` autodeploy) + **Railway** (backend). CORS por variable
  `Cors__Origenes` en Railway. `VITE_API_URL` en Netlify. `netlify.toml` + `_redirects` (SPA).

### PENDIENTES (features de negocio, ya no diseño)
1. **Fase 2 — Cobro de consultas** (vet genera Cargo → caja cobra en POS → historial +
   "Mis pagos" del dueño). Plan: monto libre desde AgregarRegistroModal → "Cobros
   pendientes" en el POS. Ver §7/notas. El de MÁS valor.
2. **Panel SuperAdmin ampliado** (Veterinaria: dirección/plan/renovación; Admin: CURP/
   teléfono/usuario autogenerado) + separar módulos + UX.
3. **Notificaciones in-app + Campañas** (épica).
4. **Wipo en Lottie** (animación; requiere Claude/MCP o herramienta — pendiente de acceso).
5. **Endpoint `GET /clientes/{id}`** para que el detalle de cliente cargue por id al recargar.
6. **Licencia things.co** antes de producción.



---

## 9. Módulo de Cobro de Consultas (HECHO — front en main, backend en PR)

### Decisión de negocio
- **Monto libre** (no catálogo de precios): el vet escribe el importe al registrar la
  consulta. El catálogo por veterinaria queda como mejora futura (menos fricción de alta).
- **Separación de responsabilidades** (patrón de la industria): el vet GENERA el cargo; la
  CAJA (recepción/admin) lo COBRA. El vet no toca dinero.

### Modelo (backend — rama `feature/cobro-consultas`)
- **Entidad `Cargo`** (cuenta por cobrar): veterinariaId, mascotaId, clienteId, concepto,
  monto, estado (Pendiente/Cobrado/Cancelado), registroMedicoId?, ventaId?, fechaCreacion.
- **`VentaCargo`** (owned de Venta): cargoId, concepto, monto. La Venta guarda sus cargos
  cobrados de forma EXPLÍCITA (NO como LineaVenta con ProductoId vacío — se rehízo para
  evitar ese atajo). `Venta.Total = productos + cargos`; expone `TotalProductos` y
  `TotalConsultas` para métricas.
- Casos de uso: `GenerarCargo` (clienteId derivado de la mascota), `ListarCargosPendientes`
  (con nombre mascota/dueño). `RegistrarVenta` acepta `CargoIds` → crea VentaCargo y marca
  los cargos Cobrado ligados a la venta.
- Endpoints: `POST /api/cargos` (Admin/Veterinario), `GET /api/cargos/pendientes`
  (Admin/Recepcionista). `ResumenVentas` y `VentaDto` incluyen el desglose consultas/productos.
- **Migración EF `Cargos`** (tablas Cargos + VentaCargo con FK a Ventas). PENDIENTE: mergear
  el PR + deploy Railway.

### Frontend (en main)
- **Feature `features/cobros`** (api + hooks: useGenerarCargo, useCargosPendientes).
- **Consulta:** campo "Costo del servicio" en `AgregarRegistroModal` → al guardar, si hay
  costo, genera el cargo (ligado al registro).
- **POS:** sección "Cobros pendientes" (cargos seleccionables) que suman al total y se envían
  como `cargoIds` al cobrar. Historial y "Mis pagos" muestran los cargos (🩺) además de
  productos. Historial: desglose **Productos vs Consultas** en el resumen (métrica de negocio).

### Flujo end-to-end
`Vet registra consulta + costo → Cargo Pendiente → Caja lo ve en el POS y cobra →
VentaCargo + Cargo Cobrado → aparece en Historial + "Mis pagos" del dueño + métricas.`

### Pendiente / mejora futura
- **Métricas de consultas en el DASHBOARD** (ya hay base: ResumenVentas con
  TotalConsultas/TotalProductos). Falta mostrarlo en el panel del Admin.
- **Catálogo de servicios** por veterinaria (evolución del monto libre).
- Cancelar cargos pendientes desde la UI (la entidad ya soporta `Cancelar()`).



---

## 10. Panel SuperAdmin separado por módulos (HU-SA1..SA3 + métricas)

### Estructura (3 vistas, nav propio)
- **`/admin` — Inicio (dashboard):** saludo por hora + fecha; acciones rápidas (Nueva
  veterinaria, Administradores); bento "Estado de la plataforma" (activas/total,
  administradores activos, por vencer 7 días, vencidas) + planes mensual/anual y altas del
  mes; alerta de veterinarias activas **sin administrador**; lista **"Por cobrar"** (top 5
  renovaciones próximas/vencidas) con botón Renovar.
- **`/admin/veterinarias`:** searchbar + chips (Todas / Por vencer / Vencidas / Inactivas),
  lista ordenada por vencimiento; cada card muestra admin asignado (o "Sin administrador"),
  plan, badge de suscripción, Renovar, ajustar fecha, Admin y activar/desactivar.
- **`/admin/administradores`:** searchbar (nombre, usuario o veterinaria), cards con la
  veterinaria de cada admin, Resetear PIN / Gestionar. El "+" pide primero la veterinaria
  (primero las que no tienen admin) y abre el alta.
- El SuperAdmin ahora aterriza en `/admin` (antes `/admin/veterinarias`). "Inicio" va al
  centro del bottom-nav, igual que en el staff. Se eliminó `AdministradoresSection`.

### Backend (rama `feature/superadmin-panel`, sin migración)
- `GET /api/admin/metricas` (solo SuperAdmin) → `MetricasSuperAdmin`: todo calculado en
  servidor (conteos de suscripción, planes, altas del mes, admins activos, veterinarias sin
  admin y top 5 de renovaciones).
- `UsuarioDto` expone `VeterinariaId` (para saber de qué clínica es cada admin).
- Front invalida `["veterinarias"]` + `["metricas-superadmin"]` en cada mutación de
  veterinarias, y `["usuarios","administradores"]` al crear un admin.

### Pendiente
- **Fase 3/4 del Admin:** apellidos separados, teléfono, CURP opcional y usuario
  autogenerado `nombre.apellidopaterno` (HU-SA4) + wizard de alta del admin.
- `docs/DESIGN-SYSTEM.md` está desactualizado (todavía describe la paleta índigo, Inter y
  anime.js). La referencia real es el `DESIGN.md` de Stitch + los tokens de `tailwind.config.js`.
