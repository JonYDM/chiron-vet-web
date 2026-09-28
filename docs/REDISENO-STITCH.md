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

## 1. Roles y alcance (multi-sucursal)

### Estado actual del backend
- Un usuario pertenece a **una** veterinaria (`veterinariaId` viaja en el token JWT).
- Roles: SuperAdmin, Administrador, Veterinario, Recepcionista, DueñoMascota.

### Regla de negocio nueva (a diseñar como MOCK, implementar después)
- **SuperAdmin (dueño de Chiron):** da de alta veterinarias y sus administradores.
  Su panel se centra en la **gestión de veterinarias** (alta, activar/desactivar,
  asignar admin, configurar admin operativo), no en la operación clínica diaria.
- **Administrador de veterinaria:** administra **su** clínica. Por defecto **una sola**
  veterinaria.
- **[REGLA NUEVA] Multi-sucursal por permiso:** un Administrador puede gestionar
  **más de una veterinaria** SOLO si el SuperAdmin se lo permite explícitamente.
  - Si tiene 1 → la topbar muestra el nombre de la clínica fijo.
  - Si tiene varias → la topbar muestra un **selector de sucursal** (dropdown) para
    cambiar de contexto. **[MOCK]** en esta etapa.

### Historia de usuario
> Como **SuperAdmin**, quiero poder autorizar a un Administrador a gestionar varias
> veterinarias, para soportar clínicas con múltiples sucursales bajo una misma
> administración.
>
> Como **Administrador con varias sucursales**, quiero cambiar de veterinaria activa
> desde la barra superior, para operar cada sucursal sin cerrar sesión.

### Pendiente de backend
- Relación **usuario ↔ N veterinarias** (hoy es 1↔1 vía token).
- Endpoint para **listar las veterinarias del usuario** y **cambiar la veterinaria
  activa** (emitir token con el nuevo `veterinariaId`, o manejar contexto por request).
- Permiso/flag en el Administrador que el SuperAdmin activa ("multi-sucursal").

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
