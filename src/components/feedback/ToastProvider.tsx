import { type ReactNode } from "react";
import { Toaster } from "react-hot-toast";

/**
 * Provider de toasts basado en react-hot-toast. Monta el <Toaster> global con
 * estilos alineados a nuestros tokens (tarjeta, borde, sombra). El acceso a la
 * API se hace vía el hook useToast (envuelve react-hot-toast).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "hsl(0 0% 100%)",
            color: "hsl(230 28% 14%)",
            border: "1px solid hsl(230 24% 92%)",
            borderRadius: "0.75rem",
            boxShadow:
              "0 4px 12px rgba(26,29,46,0.08), 0 12px 32px rgba(26,29,46,0.10)",
            fontSize: "0.875rem",
            fontWeight: 500,
            padding: "0.75rem 1rem",
          },
          success: { iconTheme: { primary: "hsl(160 76% 37%)", secondary: "#fff" } },
          error: { iconTheme: { primary: "hsl(350 84% 63%)", secondary: "#fff" } },
        }}
      />
    </>
  );
}
