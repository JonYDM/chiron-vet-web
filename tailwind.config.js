/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "Visión Canina": azules y amarillos (colores que las mascotas perciben).
        primary: {
          DEFAULT: "#4C6FFF",
          dark: "#2A3EB1",
          50: "#EEF2FF",
          100: "#E0E7FF",
        },
        accent: {
          DEFAULT: "#FFB020",
          warm: "#FFC94D",
        },
        // Neutros
        surface: "#FFFFFF",
        canvas: "#F7F8FC",
        hairline: "#E6E8F0",
        ink: {
          DEFAULT: "#1A1D2E",
          soft: "#6B7089",
        },
        // Semánticos (feedback para el humano que opera)
        success: "#22B07D",
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
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,29,46,0.04), 0 4px 16px rgba(26,29,46,0.06)",
        lift: "0 4px 12px rgba(26,29,46,0.08), 0 12px 32px rgba(26,29,46,0.10)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 180ms ease-out",
      },
    },
  },
  plugins: [],
};
