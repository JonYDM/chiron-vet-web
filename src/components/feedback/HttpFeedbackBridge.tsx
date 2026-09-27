import { useEffect } from "react";
import { setForbiddenHandler } from "@/lib/http";
import { useToast } from "./ToastProvider";

/**
 * Conecta el handler global de 403 del cliente HTTP con el sistema de toasts.
 * Se monta una vez dentro de los providers. Así cualquier 403 muestra un toast
 * consistente sin que cada pantalla lo maneje.
 */
export function HttpFeedbackBridge() {
  const toast = useToast();
  useEffect(() => {
    setForbiddenHandler((mensaje) => toast.error(mensaje));
  }, [toast]);
  return null;
}
