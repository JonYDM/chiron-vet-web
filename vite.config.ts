import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Configuración de Vite.
// - Alias "@" → src (imports limpios).
// - Proxy /api → backend en Railway: evita problemas de CORS en desarrollo
//   (el navegador ve mismo origen; Vite reenvía al backend real).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://chiron-vet-production.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
