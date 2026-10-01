# Patwi — Design System

> Fuente de verdad visual: el `DESIGN.md` de Stitch y los tokens de `tailwind.config.js`.
> Este documento resume **cómo se usan** en Patwi. Si algo aquí contradice al código, manda el
> código; actualiza este archivo. (Reemplaza la versión anterior: índigo, Inter y anime.js ya
> no aplican.)

## Principios
- **Clínico moderno con calidez**: superficies suaves, sin blanco estéril ni monocromo frío.
- **Mobile-first real**: pantallas de 360 px, pulgar, teclado en pantalla y safe-areas.
- **Jerarquía antes que decoración**: cada card tiene carácter (icono o avatar, título fuerte,
  badge), nunca plana. Nada de "AI slop".
- **Emojis mínimos**: se usan íconos de lucide.

## Marca
- Producto **Patwi**, mascota **Wipo**. Wordmark en **Nunito 800** (`font-marca`).
- UI en **Plus Jakarta Sans** (`font-sans`).
- No cambiar `STORAGE_KEY = "chiron.sesion"`, porque desloguea a todos.

## Color (jerarquía)
| Rol | Tokens | Cuándo |
|---|---|---|
| **Principal / marca** | `primary-container` (#0d6e6e), `on-primary`, `tertiary`, `primary-fixed` | Acción principal, activo, cifras clave |
| **Acento puntual** | `st-secondary` (terracota), `secondary-fixed`, `on-secondary-fixed(-variant)` | Un toque por pantalla (una acción rápida, un aviso). **No abusar** |
| **Neutro / informativo** | `surface-container(-low/-high)`, `on-surface-variant`, `outline(-variant)` | Datos, filtros, chips inactivos |
| **Superficies** | `surface-container-lowest` (blanco) sobre fondo `surface` | Cards, drawers, inputs |
| **Texto** | `on-surface` (principal), `on-surface-variant` (secundario), `outline` (placeholder) | — |
| **Error** | `error-st`, `error-container`, `on-error-container` | Validación y alertas |
| **Estados** | `success`, `warning` (ámbar, texto `#B45309`) | Éxito y "por vencer" o desactivar |

- **Filtros**: cards o chips **neutros**; el activo va en teal (`bg-primary-container text-on-primary`).
- **Métricas tipo bento**: color de fondo "acciones rápidas" (`primary-fixed/40`,
  `tertiary-fixed/50`, `secondary-fixed/60`, `error-container/70`) con `shadow-inset-up`.
  La métrica más importante va en teal sólido.
- **Prohibido en código nuevo**: los alias heredados de shadcn (`text-ink`, `bg-muted`, `bg-card`,
  `text-foreground`, `bg-danger`, `bg-secondary`, `bg-accent`). Siguen definidos solo por
  compatibilidad (`bg-surface` aún se usa en el shell).

## Tipografía (escala Stitch)
`headline-xl/lg/md/sm`, `headline-lg-mobile` (títulos de pantalla), `body-lg/md/sm`,
`label-lg/md/sm`, `metric-display` (cifras). Cifras con `tabular`.
- Inputs a **16 px** (`text-base`) para que iOS no haga zoom.

## Forma y profundidad
- Radios: cards y bloques `rounded-2xl`; inputs y botones `rounded-xl`; chips `rounded-full`.
- Sombras: `shadow-soft` (cards), `shadow-lift` (popovers), `shadow-inset-up` (métricas),
  `shadow-primary-glow` (Inicio activo).
- Bordes suaves: `border-outline-variant/40`.

## Componentes (usar estos, no reinventar)
- **Button**: variantes semánticas.
  - `primary` (teal): agregar o acción principal.
  - `warning` (ámbar): desactivar.
  - `danger` (rojo): anular o eliminar.
  - `soft` y `ghost`: acciones neutras.
  - `outline` + `text-primary`: reactivar.
- **Input / Select**: `outline` por defecto (formularios) y `soft` para buscadores.
  Label `label-md`; `hint` y `error` debajo.
- **Drawer** (Vaul): todos los formularios. `Modal` es un alias del Drawer.
- **Pasos**: wizard dentro del Drawer, con 1-3 campos por paso. En edición usar `libre`.
  Termina con "¡Listo!".
- **Badge**: tonos `neutral`, `primary`, `success`, `warning`, `danger`, `info`.
- **Avatar** (iniciales o foto), **EmptyState** (ilustración `empty.webp`),
  **SkeletonFila** (misma forma que la card real), **CheckExito** (pantallas de éxito),
  **PaginaError** (404 y 403).

## Patrones
- **Listas**: searchbar `soft` + chips de filtro (patrón Clientes). Cards con icono o avatar,
  título, dato secundario, badge y acciones al pie (`border-t`). **Sin animación de entrada.**
- **Filtros navegables**: si otra vista enlaza a un filtro, el filtro vive en la URL
  (`?filtro=`).
- **Formularios**: Drawer + `Pasos` cortos; alta y edición comparten los mismos componentes de
  campos (p. ej. `CamposNombre`, `CamposContacto`, `SelectorPlan`, `CampoPrecio`).
- **Éxito**: check animado (`CheckExito` o el "¡Listo!" de `Pasos`); para cobros, la
  animación `CobroExitoso`.
- **Destructivo**: confirmación en línea o `useConfirm`. Anular no borra.
- **Dashboard**: saludo por hora + fecha, acciones rápidas en tiles de color y métricas
  clicables que llevan a su módulo.

## Layout y shell
- Header sólido y claro (sin blur, que causaba vibración), avatar de Wipo con saludo y sin
  ícono de notificaciones.
- Bottom-nav docked edge-to-edge (`rounded-t-3xl`, `surface-nav` con blur) e "Inicio" con
  pastilla teal.
- `min-h-dvh` (teclado), `env(safe-area-inset-*)` y `scrollbar-gutter: stable`.

## Animación
- **CSS plano en `src/styles/index.css`** (p. ej. `cobro-*`, `shimmer`), no en
  `tailwind.config`, porque el dev server no recarga el config en caliente.
- Micro y funcional: feedback de éxito y press (`active:scale-[0.97]`). Nada decorativo en
  listas.

## Accesibilidad
- `aria-label` en botones de solo ícono; `role="alert"` en errores; íconos decorativos con
  `aria-hidden`.
- Contraste: texto secundario siempre con `on-surface-variant` (no con `outline`).
