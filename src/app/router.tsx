import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { RolUsuario } from "@/types/api";
import { ProtectedRoute, useAuth, rutaInicialPorRol } from "@/features/auth";
import { Spinner } from "@/components/ui";
import { HomePlaceholder } from "./HomePlaceholder";

// Login con lazy loading (no se descarga hasta que se necesita).
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);

/** Redirige la raíz "/" al home del rol actual (o al login si no hay sesión). */
function RootRedirect() {
  const { sesion, cargando } = useAuth();
  if (cargando) {
    return (
      <div className="grid min-h-full place-items-center">
        <Spinner label="Cargando…" />
      </div>
    );
  }
  if (!sesion) return <Navigate to="/login" replace />;
  return <Navigate to={rutaInicialPorRol(sesion.rol)} replace />;
}

function Fallback() {
  return (
    <div className="grid min-h-full place-items-center">
      <Spinner />
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Fallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute
        roles={[
          RolUsuario.Administrador,
          RolUsuario.Veterinario,
          RolUsuario.Recepcionista,
        ]}
      >
        <HomePlaceholder area="Staff" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/veterinarias",
    element: (
      <ProtectedRoute roles={[RolUsuario.SuperAdmin]}>
        <HomePlaceholder area="SuperAdmin" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/portal",
    element: (
      <ProtectedRoute roles={[RolUsuario.DuenoMascota]}>
        <HomePlaceholder area="Portal del dueño" />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
