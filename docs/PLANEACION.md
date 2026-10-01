# Patwi Web — Planeación y arquitectura del frontend

> Documento maestro. Se lee al inicio de cada sesión para retomar el contexto.
> Actualizado: 2026-09-30. Producto **Patwi** (antes "Chiron"); mascota **Wipo**.

## 1. Contexto
- SaaS multi-tenant para veterinarias (LATAM; cliente ancla en Morelos).
- **Frontend (este repo):** React + Vite + TypeScript, PWA, en Netlify (`chiron-web.netlify.app`).
- **Backend (`chiron-vet`):** .NET 8 en capas, minimal API, EF Core + PostgreSQL, en Railway.
- **Auth:** identificador (usuario o teléfono) + **PIN de 6 dígitos**. Sin correo.

## 2. Dónde está cada cosa (fuente de verdad)
| Tema | Documento |
|---|---|
| Alcance del MVP, reglas de negocio, HU, bitácora | `docs/REDISENO-STITCH.md` |
| Backlog técnico, planeaciones (sucursales, cobros, seguridad) | `docs/PENDIENTES-TECNICOS.md` |
| Design system (tokens, componentes, patrones) | `docs/DESIGN-SYSTEM.md` |
| Patrones de código del front | `docs/PATRONES-FRONTEND.md` |
| Permisos por rol | `docs/PERMISOS.md` |
| Contrato real de la API | `Program.cs` del backend (Swagger en `/swagger`) |

## 3. Stack
| Capa | Elección |
|---|---|
| Build | Vite + React 18 + TypeScript (strict) |
| Routing | React Router v6, rutas `lazy` por rol |
| Estilos | Tailwind con tokens de Stitch (`tailwind.config.js`) y CSS plano para animaciones (`src/styles/index.css`) |
| Estado de servidor | TanStack Query (keys por feature, invalidación explícita) |
| Estado de UI | `useState` local; sesión en Context; **filtros navegables en la URL** |
| Overlays | Vaul `Drawer` (todos los formularios), wizard `Pasos` |
| HTTP | `fetch` envuelto (`lib/http.ts`) con Bearer |
| Iconos | lucide-react; imágenes en WebP (`scripts/optimizar-imagenes.mjs`) |
| Fechas y dinero | `Intl` nativo (`lib/format.ts`; las fechas sin hora se toman como día local) |

## 4. Arquitectura: feature-based + atomic design
```
src/
├── app/            router, navegación por rol, layouts (Staff, Portal, Admin)
├── components/     UI sin dominio: ui/ (átomos), molecules/, organisms/, feedback/
├── features/       por dominio: api.ts + hooks.ts + components/ + pages/
│                   auth, clientes, mascotas, expedientes, citas, pos, cargos,
│                   recordatorios, usuarios, veterinarias (SuperAdmin), portal, dashboard
├── lib/            http, format, enums, mascotas, cn, useDebounce, saludo
└── types/api.ts    contratos de la API
```

## 5. Reglas de ingeniería (resumen; detalle en DESIGN-SYSTEM y PATRONES)
- **Multi-tenant:** el front nunca decide el tenant. El backend lo saca del token y valida
  cada recurso por id (404 si es ajeno).
- **Render:** derivar en render en lugar de estado + efecto; `useMemo` solo para listas
  filtradas u ordenadas o cálculos repetidos; keys estables; sin animación de entrada en
  listas.
- **Datos:** un hook por consulta; las mutaciones invalidan todas las keys afectadas.
- **Fechas:** "hoy" y los cortes de mes en **hora de México** (helper `HoraMexico` en el back).
- **Despliegue:** si cambia el contrato, primero backend (con su migración commiteada) y
  después frontend.

## 6. Estado
- El backlog original (sprints F0–F6: fundación, auth, shell, staff, portal, SuperAdmin, PWA)
  está **completo**. Encima se construyeron el rediseño Stitch, los cobros de consultas, el
  panel SuperAdmin con sucursales y cobros, el portal con galería y citas, y el aislamiento
  multi-tenant.
- **Siguiente:** Notificaciones in-app (`REDISENO-STITCH.md` §8, Fase 1) y el estado "En
  proceso" de las citas.

## 7. Metodología
- GitHub Flow: `main` + `feature/*` / `fix/*`. La rama se borra al mergear.
- Conventional Commits en español, atómicos. Backend vía PR (`main` protegida); frontend
  directo a `main` (Netlify autodeploy).
- Antes de entregar: `npm run typecheck`, `npm run lint` (0 warnings) y `npm run build`.
- Documentación viva en `docs/` (actualizarla con cada feature).
