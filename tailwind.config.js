/** @type {import('tailwindcss').Config} */
export default {
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
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        h1: ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
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
        xs: "0 1px 2px rgba(26,29,46,0.05)",
        soft: "0 1px 2px rgba(26,29,46,0.04), 0 4px 16px rgba(26,29,46,0.06)",
        lift: "0 4px 12px rgba(26,29,46,0.08), 0 12px 32px rgba(26,29,46,0.10)",
        float: "0 8px 24px rgba(26,29,46,0.10), 0 24px 48px rgba(26,29,46,0.12)",
        "primary-glow": "0 6px 20px hsl(var(--primary) / 0.35)",
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #4C6FFF 0%, #2A3EB1 100%)",
        "brand-mesh":
          "radial-gradient(at 20% 20%, rgba(124,147,255,0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(76,111,255,0.6) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(42,62,177,0.5) 0px, transparent 50%)",
        "accent-grad": "linear-gradient(135deg, #FFC94D 0%, #FFB020 100%)",
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
