/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "Visión Canina": azules y amarillos (los colores que las mascotas perciben).
        // Escalas completas para dar profundidad y estados consistentes.
        primary: {
          DEFAULT: "#4C6FFF",
          dark: "#2A3EB1",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FF",
          400: "#7C93FF",
          500: "#4C6FFF",
          600: "#3B57E0",
          700: "#2A3EB1",
          800: "#1E2C82",
          900: "#141d57",
        },
        accent: {
          DEFAULT: "#FFB020",
          warm: "#FFC94D",
          50: "#FFF8EB",
          100: "#FFEFC7",
          200: "#FFE08A",
          300: "#FFC94D",
          400: "#FFB020",
          500: "#F59E0B",
          600: "#D97706",
          700: "#9A6A00",
        },
        // Neutros
        surface: "#FFFFFF",
        canvas: "#F6F7FB",
        hairline: "#E6E8F0",
        ink: {
          DEFAULT: "#1A1D2E",
          soft: "#6B7089",
          muted: "#9AA0B4",
        },
        // Semánticos
        success: "#16A97F",
        warning: "#FFB020",
        danger: "#F0526B",
        info: "#4C6FFF",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        // Escala tipográfica con line-height y tracking cuidados.
        "display": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h1": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        "h2": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        "h3": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Sombras multicapa suaves (estética Apple/Material limpia).
        xs: "0 1px 2px rgba(26,29,46,0.05)",
        soft: "0 1px 2px rgba(26,29,46,0.04), 0 4px 16px rgba(26,29,46,0.06)",
        lift: "0 4px 12px rgba(26,29,46,0.08), 0 12px 32px rgba(26,29,46,0.10)",
        float: "0 8px 24px rgba(26,29,46,0.10), 0 24px 48px rgba(26,29,46,0.12)",
        // Halo de foco con el color de marca.
        focus: "0 0 0 3px rgba(76,111,255,0.28)",
        "primary-glow": "0 6px 20px rgba(76,111,255,0.35)",
      },
      transitionTimingFunction: {
        // Easings expresivos (tokens de movimiento).
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "in-out-soft": "cubic-bezier(0.45, 0, 0.15, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "180ms",
        slow: "280ms",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
