# 🔐 Chiron — Modelo de Permisos y Roles

> Documento de referencia del sistema de permisos. Fuente de verdad en el frontend:
> `src/lib/permisos.ts`. En el backend: los `RequireRole` de cada endpoint en `Program.cs`.
> Creado: 2026-09-27

---

## Roles

| Rol | Enfoque |
|---|---|
| **SuperAdmin** (99) | Dueño de Chiron. Gestiona veterinarias y suscripciones. |
| **Administrador** (1) | Dueño/gerente de la veterinaria. Métricas + equipo (+ operar, según flag). |
| **Veterinario** (2) | Clínico: expedientes, consultas, tratamientos, agenda. |
| **Recepcionista** (3) | Front-desk: onboarding, agenda, cobro (POS), consulta de expediente. |
| **DueñoMascota** (4) | Portal: sus mascotas, historial y recordatorios. |

---

## Flag `AdminOperativo` (por veterinaria)

Configurable por el **SuperAdmin** desde su panel (toggle por veterinaria):

- **`true` (default) — "Admin operativo":** el Administrador, además de métricas y equipo,
  puede hacer todo lo operativo (clientes, expediente, citas, POS). Ideal para veterinarias
  chicas donde el dueño también atiende/cobra.
- **`false` — "Admin supervisor":** el Administrador solo ve métricas y gestiona el equipo.
  No opera. Para veterinarias donde el dueño solo supervisa el negocio.

El flag viaja en el **JWT** (claim `adminOperativo`) y en la respuesta del login. La UI lo
respeta al instante; si el SuperAdmin lo cambia, el Admin lo ve reflejado en su **próximo login**.

---

## Matriz de permisos

| Acción (`Accion`) | SuperAdmin | Admin (operativo) | Admin (supervisor) | Veterinario | Recepcionista |
|---|:---:|:---:|:---:|:---:|:---:|
| `gestionar_veterinarias` | ✅ | — | — | — | — |
| `ver_metricas` | — | ✅ | ✅ | — | — |
| `gestionar_equipo` | — | ✅ | ✅ | — | — |
| `operar_clientes` (registrar/editar/baja) | — | ✅ | — | ✅ | ✅ |
| `ver_expediente` | — | ✅ | — | ✅ | ✅ (solo lectura) |
| `editar_expediente` (consultas/tratamientos) | — | ✅ | — | ✅ | — |
| `gestionar_citas` | — | ✅ | — | ✅ | ✅ |
| `usar_pos` (cobrar) | — | ✅ | — | — | ✅ |
| `gestionar_acceso_portal` (dar acceso / reset PIN dueño) | — | ✅ | — | ✅ | ✅ |

---

## Cómo se aplica

### Frontend (`src/lib/permisos.ts`)
- Función única `puede(sesion, accion)` — **fuente de verdad** de la UI.
- Hook `usePermisos()` → `const p = usePermisos(); if (p("usar_pos")) {...}`.
- La navegación (`app/navigation.ts`) declara el `permiso` de cada ítem; el `AppShell` lo filtra.
- Los botones/acciones se **ocultan** si el rol no los tiene (no se muestran botones que fallarían).

### Backend (`Program.cs`)
- Cada endpoint declara `RequireRole(...)` con los roles permitidos.
- El aislamiento multi-tenant (veterinariaId del token) se valida en los casos de uso.
- **Decisión MVP:** el flag `AdminOperativo` controla la **UI**; el backend permite al Admin
  los endpoints operativos (confía en el Admin dentro de su tenant). Endurecer el backend para
  rechazar al admin supervisor por endpoint es una mejora futura.

### Manejo de 403
- El cliente HTTP (`lib/http.ts`) detecta 403 y dispara un **toast** ("No tienes permiso")
  vía `HttpFeedbackBridge`. Así, si algo se escapa de la UI, el usuario recibe feedback claro.

---

## Correcciones incluidas (bug del 403)

Se alinearon roles inconsistentes que causaban un 403 al gestionar el acceso al portal:
- `GET /api/clientes/{id}/usuario` (ver si tiene acceso) → ahora **Admin, Veterinario, Recepcionista**.
- `POST /api/usuarios/dueno` (dar acceso) → ahora **Admin, Veterinario, Recepcionista**.
- `GET /api/mascotas/{id}/expediente` (ver expediente) → ahora incluye **Recepcionista** (solo lectura).

---

## Pendientes / mejoras futuras
- Reset de PIN de **dueños** por Veterinario/Recepcionista (hoy solo Admin/SuperAdmin).
- Endurecer el backend para respetar `AdminOperativo` por endpoint (hoy solo en la UI).
- Mostrar el **nombre** del responsable (veterinario) en cita/expediente (hoy se guarda el id).
