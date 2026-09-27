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
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.01em", fontWeight: "700" }],
        h2: ["1.375rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        metric: ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.03em", fontWeight: "700" }],
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
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 280ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
