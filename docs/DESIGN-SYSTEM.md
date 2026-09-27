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
2. **Ligereza.** Tokens sin runtime (Tailwind), componentes propios. La única dependencia
   "de peso" es Framer Motion (~36KB gzip, en chunk lazy) para el movimiento.
3. **Movimiento con propósito.** Microanimaciones que confirman acciones y guían la vista,
   nunca decorativas de más. Siempre respetando `prefers-reduced-motion`.
4. **Accesibilidad.** Focus visible (halo de marca), contraste, touch targets ≥ 44px,
   `aria-*` en componentes interactivos.

---

## Tokens (en `tailwind.config.js`)

### Color — "Visión Canina" (azules + amarillos que las mascotas perciben)
- **primary** (índigo `#4C6FFF`) con escala 50–900.
- **accent** (ámbar `#FFB020`) con escala 50–700.
- **Neutros:** `canvas` (fondo), `surface` (tarjetas), `hairline` (bordes), `ink`/`ink-soft`/`ink-muted` (texto).
- **Semánticos:** `success`, `warning`, `danger`, `info`.

### Tipografía
- Fuente **Inter** (400–800).
- Escala con jerarquía: `text-display`, `text-h1`, `text-h2`, `text-h3` (con line-height y tracking cuidados).

### Forma y elevación
- Radios: `lg`, `xl`, `2xl`, `3xl` (generosos).
- Sombras multicapa: `xs`, `soft`, `lift`, `float`, `focus` (halo), `primary-glow`.

### Movimiento
- Easings: `out-expo`, `out-back`, `in-out-soft`.
- Duraciones: `fast` (120ms), default (180ms), `slow` (280ms).
- Animaciones CSS: `fade-in`, `fade-in-up`, `scale-in`. Shimmer para skeletons.
- Variantes Framer Motion en `src/lib/motion.ts`: `fadeInUp`, `fadeIn`, `listaStagger` + `itemStagger`.

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

## Movimiento (Framer Motion + View Transitions)

- **Framer Motion** para entradas y microinteracciones. Helpers en `lib/motion.ts`
  (`fadeInUp`, `listaStagger`/`itemStagger` para cascadas en listas y grids).
- **View Transitions API** para transiciones entre rutas: `lib/useNavegarConTransicion.ts`
  usa `document.startViewTransition` si existe, con **fallback** a navegación normal.
- Todo se degrada con `prefers-reduced-motion: reduce` (definido en `styles/index.css`).

### Ejemplo de lista con stagger
```tsx
<motion.div variants={listaStagger} initial="hidden" animate="visible">
  {items.map((x) => (
    <motion.div key={x.id} variants={itemStagger}>...</motion.div>
  ))}
</motion.div>
```

---

## Pantallas insignia (referencia de estilo)
- **LoginPage:** flujo en 2 pasos con transición horizontal, fondo con halos de marca (blur),
  logo con `scale-in`, feedback animado.
- **StaffDashboard:** métricas y accesos rápidos con entrada en cascada; skeletons durante la carga.

Estas dos sirven de referencia para pulir el resto de pantallas con el mismo lenguaje.

---

## Pendientes / evolución
- Aplicar el sistema a las pantallas restantes (clientes, POS, citas, portal, superadmin).
- Evaluar **anime.js** como alternativa más ligera a Framer Motion (~9KB vs ~36KB) si el peso importa.
- Tooltips y toasts con transiciones de entrada/salida.
- Modo oscuro (los tokens ya están listos para extenderse).
