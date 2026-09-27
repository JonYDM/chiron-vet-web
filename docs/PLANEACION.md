# 🐾 Chiron Web — Planeación y Arquitectura del Frontend

> Documento maestro del frontend. Se lee al inicio de cada sesión para retomar el contexto.
> Proyecto: SPA + PWA que consume la API REST de Chiron (backend .NET en Railway).
> Creado: 2026-09-27

---

## 1. Contexto

**Chiron** es un SaaS multi-tenant de gestión para veterinarias (mercado LATAM, inicio en Morelos, México). El backend ya está completo y desplegado; este repo es el **frontend** desacoplado.

- **Backend (repo `chiron-vet`)**: https://chiron-vet-production.up.railway.app
- **Frontend (este repo)**: React + Vite + TypeScript (PWA), desplegable en Vercel/Netlify.
- **Autenticación**: identificador (usuario o teléfono) + **PIN de 6 dígitos** (sin correo, decisión anti-fricción LATAM).

---

## 2. Filosofía de ingeniería

- **Ligereza sobre conveniencia**: dependencias mínimas; preferir nativo o código propio antes que librerías pesadas.
- **Diseño atómico** para organizar la UI (átomos → moléculas → organismos).
- **Ciclo de vida de React como parámetro de rendimiento**: minimizar re-renders, efectos y trabajo del árbol.
- **Accesibilidad** desde el día 1 (primitivos accesibles, contraste, touch targets ≥44px).
- **Multiplataforma**: móvil y escritorio (móvil-first).

---

## 3. Stack técnico

| Capa | Elección | Justificación (peso / razón) |
|---|---|---|
| Build | Vite + React 18 + TypeScript | Dev server instantáneo, tree-shaking agresivo. |
| Routing | React Router v6 (`react-router-dom`) | ~10KB gzip. Lazy routes para code-splitting. |
| Estilos | Tailwind CSS | Cero runtime JS; genera solo el CSS usado. |
| Componentes | shadcn/ui | No es dependencia: **copia el código** al repo. Peso = solo lo que usas; control total del estilo. |
| Primitivos accesibles | Radix UI (vía shadcn) | Headless, tree-shakeable; se importa solo el primitivo usado. |
| Estado servidor | **TanStack Query** | Caché, deduplicación, estados async. Excepción justificada (~12KB) porque reduce código propio y renders. |
| Estado cliente | Context API + useReducer | Nativo, cero KB extra. Para auth/sesión. |
| HTTP | `fetch` nativo envuelto | Cero deps (evita axios ~13KB). |
| Iconos | lucide-react | Tree-shakeable, ~1KB por ícono usado. |
| JWT decode | Función propia (~15 líneas) | Evita `jwt-decode`; solo `atob` del payload. |
| Fechas | `Intl` nativo | Evita moment/dayjs. |

---

## 4. Arquitectura: Feature-based + Atomic Design

Separa *qué hace la app* (features de dominio) de *con qué se construye* (átomos de UI).

```
src/
├── app/                      # Composición raíz
│   ├── App.tsx               # Providers + Router
│   ├── router.tsx            # Rutas con lazy loading por rol
│   └── providers.tsx         # Auth, Query, Theme
│
├── components/               # ATOMIC DESIGN (UI pura, sin lógica de negocio)
│   ├── ui/                   # ÁTOMOS (shadcn: Button, Input, Card, Badge...)
│   ├── molecules/            # PinPad, SearchBar, StatCard, PetCard...
│   └── organisms/            # AppShell, BottomNav, Sidebar, DataList...
│
├── features/                 # LÓGICA POR DOMINIO (mapea al backend)
│   ├── auth/                 # login, sesión, guardas de ruta
│   ├── veterinarias/         # SuperAdmin
│   ├── clientes/
│   ├── mascotas/
│   ├── expedientes/
│   ├── citas/
│   ├── pos/                  # punto de venta
│   ├── recordatorios/
│   └── portal/               # dueño de mascota
│       └── (por feature): components/ hooks/ api.ts types.ts
│
├── lib/                      # utilidades transversales
│   ├── http.ts               # cliente fetch + Bearer
│   ├── jwt.ts                # decode de claims (veterinariaId/clienteId)
│   ├── enums.ts              # enums numéricos → etiquetas ES
│   └── format.ts             # fechas, moneda MXN
│
├── types/                    # contratos de la API
└── styles/                   # tokens Tailwind, tema
```

- **Atomic Design** vive en `components/`: UI reutilizable, sin conocimiento del dominio.
- **Features** encapsulan cada módulo del backend (API + hooks + tipos propios) → permite **code-splitting por rol** (un Dueño no descarga el POS).
- **Pages/Templates** = composición de organismos dentro de cada feature (mapeadas a rutas).

---

## 5. Ciclo de vida de React como parámetro de rendimiento

- **Montaje bajo demanda**: rutas con `React.lazy` + `Suspense` → menos JS inicial.
- **Efectos mínimos**: `useEffect` solo para sincronización con sistemas externos, no para derivar estado.
- **Evitar re-renders**:
  - Contextos estrechos (un `AuthContext` estable, no un mega-store).
  - `memo`/`useMemo`/`useCallback` solo donde el profiler lo justifique.
  - Listas con `key` estable (nunca índices).
- **Limpieza**: `AbortController` para cancelar fetches al desmontar.
- **Derivar en render**, no duplicar en estado + efecto.

---

## 6. Rendimiento y presupuesto de bundle

- **Code-splitting** por ruta y por rol.
- **Tree-shaking** estricto (imports nombrados, nada de `import * as`).
- **Presupuesto**: bundle inicial objetivo < ~150KB gzip; verificado con `vite build`.
- **Iconos SVG** vía lucide; sin sprites pesados.

---

## 7. Contratos reales de la API (verificados en el backend)

### Roles (valores numéricos en JWT y en el login)
`Administrador=1`, `Veterinario=2`, `Recepcionista=3`, `DuenoMascota=4`, `SuperAdmin=99`

### Detalles clave
- **Enums serializados como números** (rol, especie, estado de cita, categoría de producto...). El frontend mapea número → etiqueta ES en `lib/enums.ts`.
- **`veterinariaId` y `clienteId` NO vienen en el body del login**: van como *claims* dentro del JWT. `lib/jwt.ts` los extrae para armar URLs de staff (`/api/veterinarias/{veterinariaId}/...`).
- **PIN de 6 dígitos** → login con teclado numérico (PinPad), móvil-first.
- **CORS pendiente en backend**: en desarrollo se usa proxy de Vite; en producción hay que habilitar CORS en `Program.cs` del backend para el dominio del frontend.

### Endpoints (base: `https://chiron-vet-production.up.railway.app`)

**Auth (público)**
- `POST /api/auth/login` → `{ identificador, pin }` → `{ token, expiraEn, nombre, rol }`

**SuperAdmin (rol 99)**
- `POST /api/admin/veterinarias` → `{ nombre, telefono }`
- `POST /api/admin/usuarios-admin` → `{ veterinariaId, nombreUsuario, nombre, pin, rol }`
- `POST /api/admin/veterinarias/{id}/activar`
- `POST /api/admin/veterinarias/{id}/desactivar`
- `GET  /api/admin/veterinarias`

**Gestión de usuarios (Administrador)**
- `POST /api/usuarios/staff` → `{ nombreUsuario, nombre, pin, rol }` (Veterinario=2 o Recepcionista=3)
- `POST /api/usuarios/dueno` → `{ clienteId, pin }` (Admin/Recepcionista)

**Staff (Admin/Veterinario/Recepcionista)**
- `POST /api/registro-rapido` → cliente + mascota
- `GET  /api/veterinarias/{veterinariaId}/clientes?texto=...`
- `GET  /api/clientes/{clienteId}/mascotas`
- `POST /api/expediente` (Admin/Veterinario) · `GET /api/mascotas/{mascotaId}/expediente`
- `POST /api/citas` · `GET /api/veterinarias/{veterinariaId}/citas/proximas`
- `POST /api/productos` (Admin) · `GET /api/veterinarias/{veterinariaId}/catalogo` · `POST /api/ventas` (Admin/Recepcionista)
- `POST /api/veterinarias/{veterinariaId}/recordatorios/enviar` (Admin)

**Portal del dueño (rol 4)**
- `GET /api/portal/mis-mascotas`
- `GET /api/portal/mascotas/{mascotaId}/expediente`
- `GET /api/portal/mis-recordatorios`

> Todos (excepto login) requieren `Authorization: Bearer <token>`.

### Enums del dominio (número → significado)
- **EspecieMascota**: 0 NoEspecificada, 1 Perro, 2 Gato, 3 Ave, 4 Conejo, 5 Otro
- **SexoMascota**: 0 NoEspecificado, 1 Macho, 2 Hembra
- **TipoRegistroMedico**: 1 Consulta, 2 Vacuna, 3 Desparasitación, 4 Cirugía, 5 Otro
- **EstadoCita**: 1 Programada, 2 Atendida, 3 Cancelada, 4 NoAsistió
- **OrigenCliente**: 0 NoEspecificado, 1 Recomendación, 2 RedesSociales, 3 PasoPorLocal, 4 Google, 5 Otro
- **CategoriaProducto**: 1 Alimento, 2 Medicina, 3 Accesorio, 4 Higiene, 5 Otro
- **TipoRecordatorio**: 1 ProximaAplicacion, 2 Cita

### Credenciales de prueba (solo backend en memoria / local)
- SuperAdmin: `superadmin` / `123456`
- Admin: `admindemo` / `654321`
- Dueño: `7771234567` / `111222`

> En producción estos usuarios no existen.

---

## 8. Sistema de diseño — Paleta "Visión Canina"

**Concepto de marca:** los colores parten de **cómo perciben el color las mascotas**. Perros y gatos son dicrómatas: ven muy bien **azules y amarillos**, y NO distinguen rojos/verdes (los ven como marrón/gris). Por eso la identidad de Chiron usa azul + amarillo: *el mundo como lo ve tu mascota*.

**Lenguaje de diseño (inspirado en Nubank):** feedback claro del estado/acción, microanimaciones que confirman lo que haces, mensajes con voz humana en español mexicano. El look limpio y espacioso se inspira en Apple/Material.

### Colores primarios (los que las mascotas SÍ ven)
| Rol | Hex |
|---|---|
| Primario (azul índigo) | `#4C6FFF` |
| Primario oscuro | `#2A3EB1` |
| Acento (ámbar) | `#FFB020` |
| Acento cálido (dorado) | `#FFC94D` |

### Neutros
| Rol | Hex |
|---|---|
| Fondo | `#F7F8FC` |
| Superficie/tarjetas | `#FFFFFF` |
| Borde sutil | `#E6E8F0` |
| Texto principal | `#1A1D2E` |
| Texto secundario | `#6B7089` |

### Semánticos (feedback para el humano que opera)
| Estado | Hex |
|---|---|
| Éxito | `#22B07D` |
| Advertencia | `#FFB020` (reusa ámbar) |
| Error | `#F0526B` (coral, no rojo puro) |
| Info | `#4C6FFF` (reusa primario) |

### Forma y movimiento
- Radios generosos (cards 16–20px), sombras suaves multicapa.
- Tipografía **Inter** (fallback system-ui), escala tipográfica de 5–6 tamaños.
- Transiciones 150–200ms; respetar `prefers-reduced-motion`.
- Densidad adaptativa: móvil cómodo (touch ≥44px), escritorio más denso.

---

## 9. Metodología de trabajo

- **Kanban + Scrum**: backlog priorizado → sprints.
- **Git Flow simplificado (GitHub Flow)**: `main` + ramas `feature/*` por historia de usuario.
- **Commit por historia de usuario** (atómico) con **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`...).
- **Push por cada historia de usuario.**
- ⚠️ **Regla de oro**: no se hace `commit`, `push` ni `merge` sin confirmación explícita del usuario.
- **Documentación viva** en `docs/`.

---

## 10. Backlog del Frontend (épicas → historias)

### Sprint 0 — Fundación
- `chore(F0.1)`: Scaffolding React+Vite+TS, estructura feature-based + atomic, Tailwind, ESLint/Prettier.
- `chore(F0.2)`: Design system — tokens "Visión Canina", átomos base (Button, Input, Card, Badge, PinPad).
- `chore(F0.3)`: Capa `lib` — `http.ts`, `jwt.ts`, `enums.ts`, tipos de la API.

### Sprint 1 — Autenticación (Épica F1)
- `feat(F1.1)`: Login con PinPad (identificador + PIN 6 dígitos).
- `feat(F1.2)`: AuthContext, guardado de JWT, decode de claims, cliente HTTP con Bearer.
- `feat(F1.3)`: Rutas protegidas, logout, redirección por rol.

### Sprint 2 — Shell y navegación (Épica F2)
- `feat(F2.1)`: AppShell responsivo (Sidebar escritorio / BottomNav móvil).
- `feat(F2.2)`: Menús por rol.
- `feat(F2.3)`: Dashboard inicial por rol.

### Sprint 3 — Staff core (Épica F3)
- `feat(F3.1)`: Registro rápido (cliente + mascota).
- `feat(F3.2)`: Listado/búsqueda de clientes y mascotas.
- `feat(F3.3)`: Expediente de mascota (ver + agregar).
- `feat(F3.4)`: Agenda de citas.
- `feat(F3.5)`: Punto de venta (catálogo + venta).

### Sprint 4 — Portal del dueño (Épica F4)
- `feat(F4.1)`: Mis mascotas.
- `feat(F4.2)`: Expediente de mi mascota.
- `feat(F4.3)`: Mis recordatorios.

### Sprint 5 — Panel SuperAdmin (Épica F5)
- `feat(F5.1)`: Crear/listar veterinarias.
- `feat(F5.2)`: Crear admin de veterinaria.
- `feat(F5.3)`: Activar/desactivar suscripción.

### Sprint 6 — PWA (Épica F6)
- `feat(F6.1)`: Manifest + service worker, instalable.

---

## 11. Repositorio

- **Remoto**: https://github.com/JonYDM/chiron-vet-web.git
- **Carpeta local**: `C:\Users\jonyo\chiron-web`
- **Backend relacionado**: https://github.com/JonYDM/chiron-vet.git
