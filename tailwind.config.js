/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens semánticos (estilo shadcn, con CSS variables HSL).
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          strong: "hsl(var(--accent-strong))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Alias de compatibilidad con el código existente (mapean a los tokens semánticos).
        canvas: "hsl(var(--background))",
        surface: "hsl(var(--card))",
        hairline: "hsl(var(--border))",
        ink: {
          DEFAULT: "hsl(var(--foreground))",
          soft: "hsl(var(--muted-foreground))",
          muted: "hsl(var(--muted-foreground))",
        },
        danger: "hsl(var(--destructive))",
        // Escalas de primary/accent usadas en algunos lugares.
        "primary-50": "hsl(var(--secondary))",
        "primary-100": "hsl(var(--secondary))",

        // ── Tokens del design system Stitch (calco fiel del markup) ──
        // Superficies en capas
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        "surface-dim": "#cbdbf5",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3e4948",
        outline: "#6e7979",
        "outline-variant": "#bec9c8",
        // Primary (teal) — Stitch
        "st-primary": "#005454",
        "primary-container": "#0d6e6e",
        "on-primary": "#ffffff",
        "on-primary-container": "#9dedec",
        "primary-fixed": "#a0f0f0",
        "primary-fixed-dim": "#84d4d3",
        "on-primary-fixed": "#002020",
        // Secondary (terracota) — Stitch
        "st-secondary": "#994703",
        "secondary-container": "#fc934f",
        "on-secondary": "#ffffff",
        "secondary-fixed": "#ffdbc9",
        "secondary-fixed-dim": "#ffb68c",
        "on-secondary-fixed": "#321200",
        "on-secondary-fixed-variant": "#753400",
        "on-secondary-container": "#6d3000",
        // Tertiary (teal profundo)
        tertiary: "#145353",
        "tertiary-container": "#316b6b",
        "tertiary-fixed": "#b3edec",
        "on-tertiary-fixed-variant": "#0e4f4f",
        "on-tertiary-container": "#afe9e9",
        // Error
        "error-st": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        marca: ["Nunito", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.01em", fontWeight: "700" }],
        h2: ["1.375rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        metric: ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.03em", fontWeight: "700" }],
        // Escala Stitch (calco fiel)
        "headline-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "700" }],
        "metric-display": ["32px", { lineHeight: "38px", letterSpacing: "-0.03em", fontWeight: "700" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(15,23,42,0.05)",
        soft: "0 2px 8px -2px rgba(13,110,110,0.06), 0 1px 4px -1px rgba(15,23,42,0.04)",
        lift: "0 10px 24px -4px rgba(8,76,76,0.10), 0 4px 10px -2px rgba(15,23,42,0.04)",
        float: "0 20px 40px -8px rgba(15,23,42,0.22)",
        "primary-glow": "0 6px 20px hsl(var(--primary) / 0.28)",
        // Profundidad "de abajo hacia arriba": highlight superior + sombra inferior.
        "inset-up":
          "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 8px -3px rgba(13,110,110,0.12), 0 6px 16px -6px rgba(8,76,76,0.14)",
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #0D6E6E 0%, #084C4C 100%)",
        "brand-mesh":
          "radial-gradient(at 20% 20%, rgba(13,110,110,0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(8,76,76,0.45) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(20,83,83,0.35) 0px, transparent 50%)",
        "accent-grad": "linear-gradient(135deg, #F0954E 0%, #D97736 100%)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.6)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "wipo-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-6px) rotate(1deg)" },
        },
        "wipo-hop": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "30%": { transform: "translateY(-14px) scale(1.05)" },
          "55%": { transform: "translateY(0) scale(0.97)" },
          "70%": { transform: "translateY(-5px) scale(1.02)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        "wipo-float": "wipo-float 3.5s ease-in-out infinite",
        "wipo-hop": "wipo-hop 600ms ease-out",
      },
    },
  },
  plugins: [],
};
