import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  setTokenAccessor,
  setUnauthorizedHandler,
} from "@/lib/http";
import { decodeJwt, getClienteId, getVeterinariaId, isExpired } from "@/lib/jwt";
import { login as loginApi } from "./api";
import type { Sesion } from "./types";
import type { LoginResponse } from "@/types/api";

const STORAGE_KEY = "chiron.sesion";

interface AuthContextValue {
  sesion: Sesion | null;
  cargando: boolean;
  iniciarSesion: (identificador: string, pin: string) => Promise<Sesion>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Construye la sesión a partir de la respuesta del login + claims del JWT. */
function construirSesion(resp: LoginResponse): Sesion {
  const claims = decodeJwt(resp.token);
  return {
    token: resp.token,
    nombre: resp.nombre,
    rol: resp.rol,
    expiraEn: resp.expiraEn,
    veterinariaId: getVeterinariaId(claims),
    clienteId: getClienteId(claims),
  };
}

/** Lee la sesión persistida (si existe y no expiró). */
function leerSesionPersistida(): Sesion | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const sesion = JSON.parse(raw) as Sesion;
    if (isExpired(decodeJwt(sesion.token))) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  // Ref para que el token accessor lea siempre el valor actual sin recrearse.
  const sesionRef = useRef<Sesion | null>(null);
  sesionRef.current = sesion;

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSesion(null);
  }, []);

  // Conecta el cliente HTTP con la sesión (token + manejo de 401). Una sola vez.
  useEffect(() => {
    setTokenAccessor(() => sesionRef.current?.token ?? null);
    setUnauthorizedHandler(() => cerrarSesion());
  }, [cerrarSesion]);

  // Hidrata la sesión persistida al montar.
  useEffect(() => {
    setSesion(leerSesionPersistida());
    setCargando(false);
  }, []);

  const iniciarSesion = useCallback(
    async (identificador: string, pin: string) => {
      const resp = await loginApi({ identificador, pin });
      const nueva = construirSesion(resp);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva));
      setSesion(nueva);
      return nueva;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ sesion, cargando, iniciarSesion, cerrarSesion }),
    [sesion, cargando, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
