# 🎨 Chiron — Design System

> Dirección visual y sistema de componentes del frontend. Inspiración: lenguaje de
> feedback de Nubank, limpieza de Apple/Material, patrones de Mobbin/Skiper UI
> (reconstruidos con tokens propios, no copiados). Identidad: paleta "Visión Canina".
> Creado: 2026-09-27

---

## Principios

1. **Consistencia por variantes.** Los componentes se definen con **CVA**
   (class-variance-authority): ejes tipados de `variant` (color/estilo), `size` (tamaño)
   y estado. Nada de clases sueltas duplicadas → se elimina el look "genérico".
2. **Ligereza.** Tokens sin runtime (Tailwind), componentes propios estilo **shadcn/ui**
   (CVA + tokens semánticos vía CSS variables). El motor de animación es **anime.js**
   (~ligero), no Framer Motion.
3. **Movimiento con propósito.** Microanimaciones que confirman acciones y guían la vista,
   nunca decorativas de más. Siempre respetando `prefers-reduced-motion`.
4. **Accesibilidad.** Focus visible (halo de marca), contraste, touch targets ≥ 44px,
   `aria-*` en componentes interactivos.

---

## Tokens semánticos (shadcn) — `src/styles/index.css` + `tailwind.config.js`

El sistema sigue el patrón de **shadcn/ui**: los colores se declaran como **CSS variables
en HSL** dentro de `:root` (en `src/styles/index.css`) y Tailwind los mapea a nombres
semánticos. Esto permite temizar (p. ej. modo oscuro) sin tocar componentes.

### Variables base (`:root`)
`--background` · `--foreground` · `--card` · `--card-foreground` · `--primary` ·
`--primary-foreground` · `--secondary` · `--accent` · `--muted` · `--muted-foreground` ·
`--destructive` · `--success` · `--border` · `--input` · `--ring` · `--radius`.

Identidad **"Visión Canina"** (colores que perros y gatos perciben):
- `--primary: 227 100% 65%` → índigo **#4C6FFF**
- `--accent: 39 100% 56%` → ámbar **#FFB020**

### Nombres semánticos en Tailwind
`bg-background`, `text-foreground`, `bg-card`, `bg-primary/text-primary-foreground`,
`bg-secondary`, `bg-accent`, `bg-muted/text-muted-foreground`, `bg-destructive`,
`border-border`, `ring-ring`, etc.

### Alias de compatibilidad
Para no romper clases previas hay alias mapeados a los tokens semánticos:
`canvas`→background, `surface`→card, `hairline`→border, `ink`/`ink-soft`/`ink-muted`→
foreground/muted-foreground, `danger`→destructive, `primary-50/100`→secondary.

### Tipografía
- Fuente **Inter** (400–800).
- Escala con jerarquía: `text-display`, `text-h1`, `text-h2`, `text-h3`.

### Forma y elevación
- Radios basados en `var(--radius)`: `lg`, `xl`, `2xl`, `3xl` (generosos).
- Sombras multicapa: `xs`, `soft`, `lift`, `float`, `focus` (halo), `primary-glow`.
- Gradientes de marca: `bg-brand`, `bg-brand-mesh`, `bg-accent-grad`.

### Movimiento
- Easings: `out-expo`, `out-back`, `in-out-soft`.
- Duraciones: `fast` (120ms), default (180ms), `slow` (280ms).
- Animaciones CSS: `fade-in`, `fade-in-up`, `scale-in`. Shimmer para skeletons.
- Entradas y microinteracciones con **anime.js** (ver sección Movimiento).

---

## Componentes base (`src/components/ui`)

Definidos con CVA (variantes tipadas):

| Componente | Variantes principales |
|---|---|
| **Button** | `variant`: primary, secondary, soft, ghost, danger, outline · `size`: sm, md, lg, icon · `loading`, `fullWidth` |
| **Badge** | `tone`: neutral, primary, success, warning, danger · `size`: sm, md |
| **Avatar** | `size`: sm, md, lg · `tone`: primary, accent, neutral (iniciales) |
| **Input / Select** | label, error, hint (con aria) |
| **Card** | Header/Title/Content/Footer |
| **Modal** | accesible (Escape, overlay, focus) |
| **Skeleton / SkeletonFila** | placeholders con shimmer para carga |
| **Spinner** | carga accesible (`role=status`) |

---

## Movimiento (anime.js + View Transitions)

- **anime.js** (~ligero) para entradas y microinteracciones. Helpers en:
  - `src/lib/anim.tsx` → componente `<Reveal>` (fade+subida; `stagger` para cascadas).
  - `src/lib/useContador.ts` → hook `useContador` (efecto "count up" de números, tipo Nubank).
- **View Transitions API** para transiciones entre rutas: `lib/useNavegarConTransicion.ts`
  (con fallback a navegación normal).
- Todo respeta `prefers-reduced-motion: reduce`.

> Nota: se migró de Framer Motion a **anime.js** para reducir peso (~36KB → ~1KB de helpers +
> anime.js). El `<Reveal>` reemplaza a `motion.div`.

## Estética "Chiron × Nubank"

- **Bloques de color generosos:** gradientes de marca (`bg-brand`, `bg-brand-mesh`,
  `bg-accent-grad`) en heros y zonas clave, no solo botones.
- **Ilustraciones propias (SVG, sin equipo gráfico):** en `components/ilustraciones`
  (`Blob`, `Huella`, `MascotaVacio`). `EmptyState` las usa para estados vacíos con carácter.
- **Radios grandes** (rounded-3xl), sombras suaves, mucho aire, tipografía grande y amigable.

---

## Pantallas insignia (referencia de estilo)
- **LoginPage:** flujo en 2 pasos con transición horizontal, fondo con halos de marca (blur),
  logo con `scale-in`, feedback animado.
- **StaffDashboard:** métricas y accesos rápidos con entrada en cascada; skeletons durante la carga.

Estas dos sirven de referencia para pulir el resto de pantallas con el mismo lenguaje.

---

## Feedback (toasts y confirmaciones)

- **Toasts:** se usa **`react-hot-toast`** estilizado con nuestros tokens (tarjeta, borde,
  sombra) y montado en `ToastProvider` (`<Toaster position="top-center">`). La app consume
  siempre la fachada `useToast()` (`src/components/feedback/useToast.ts`) que expone
  `exito` / `error` / `info`, de modo que la librería se puede cambiar sin tocar consumidores.
- **Errores HTTP:** `HttpFeedbackBridge` observa el cache de **mutaciones** de TanStack Query
  y muestra un toast ante 403 (sin permiso) u otros errores de negocio. Las **queries** de
  fondo no generan toast (ruido evitado).
- **Confirmaciones:** `ConfirmProvider` con API imperativa (`useConfirm`) para acciones
  destructivas.

---

## Pendientes / evolución
- ~~Aplicar `EmptyState` + `Reveal` al resto de pantallas~~ ✅ hecho en toda la app
  (clientes, mis-mascotas, citas, POS, expediente, historial de ventas, recordatorios,
  mi-expediente, equipo y veterinarias).
- ~~Refactor de componentes base a variantes CVA con tokens semánticos~~ ✅ hecho
  (Button/Input/Select/Card/Modal/Badge/Avatar/Skeleton).
- ~~Toasts con librería madura~~ ✅ migrado a `react-hot-toast`.
- Tooltips accesibles reutilizables.
- Modo oscuro (los tokens semánticos ya están listos: basta un bloque `.dark` en `:root`).
