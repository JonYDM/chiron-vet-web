import { lazy, Suspense, type ReactNode } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { RolUsuario } from "@/types/api";
import { ProtectedRoute, useAuth, rutaInicialPorRol } from "@/features/auth";
import { Spinner } from "@/components/ui";
import { EnConstruccion } from "@/components/organisms/EnConstruccion";

// Lazy loading por área (code-splitting por rol).
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const StaffLayout = lazy(() =>
  import("@/app/layouts/StaffLayout").then((m) => ({ default: m.StaffLayout })),
);
const PortalLayout = lazy(() =>
  import("@/app/layouts/PortalLayout").then((m) => ({ default: m.PortalLayout })),
);
const AdminLayout = lazy(() =>
  import("@/app/layouts/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const StaffDashboard = lazy(() =>
  import("@/features/dashboard/StaffDashboard").then((m) => ({
    default: m.StaffDashboard,
  })),
);
const ClientesPage = lazy(() =>
  import("@/features/clientes").then((m) => ({ default: m.ClientesPage })),
);

const STAFF_ROLES = [
  RolUsuario.Administrador,
  RolUsuario.Veterinario,
  RolUsuario.Recepcionista,
];

/** Redirige la raíz "/" al home del rol actual (o al login si no hay sesión). */
function RootRedirect() {
  const { sesion, cargando } = useAuth();
  if (cargando) return <FullSpinner label="Cargando…" />;
  if (!sesion) return <Navigate to="/login" replace />;
  return <Navigate to={rutaInicialPorRol(sesion.rol)} replace />;
}

function FullSpinner({ label }: { label?: string }) {
  return (
    <div className="grid min-h-full place-items-center">
      <Spinner label={label} />
    </div>
  );
}

/** Envuelve un elemento en Suspense + guarda de roles. */
function Protegida({ roles, children }: { roles?: RolUsuario[]; children: ReactNode }) {
  return (
    <ProtectedRoute roles={roles}>
      <Suspense fallback={<FullSpinner />}>{children}</Suspense>
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  {
    path: "/login",
    element: (
      <Suspense fallback={<FullSpinner />}>
        <LoginPage />
      </Suspense>
    ),
  },

  // ── Área de staff ──
  {
    path: "/app",
    element: <Protegida roles={STAFF_ROLES}><StaffLayout /></Protegida>,
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: "clientes", element: <ClientesPage /> },
      { path: "citas", element: <EnConstruccion titulo="Citas" /> },
      { path: "pos", element: <EnConstruccion titulo="Ventas" /> },
      { path: "recordatorios", element: <EnConstruccion titulo="Recordatorios" /> },
    ],
  },

  // ── Portal del dueño ──
  {
    path: "/portal",
    element: <Protegida roles={[RolUsuario.DuenoMascota]}><PortalLayout /></Protegida>,
    children: [
      { index: true, element: <EnConstruccion titulo="Mis mascotas" /> },
      { path: "recordatorios", element: <EnConstruccion titulo="Mis recordatorios" /> },
    ],
  },

  // ── Panel SuperAdmin ──
  {
    path: "/admin",
    element: <Protegida roles={[RolUsuario.SuperAdmin]}><AdminLayout /></Protegida>,
    children: [
      { index: true, element: <Navigate to="/admin/veterinarias" replace /> },
      { path: "veterinarias", element: <EnConstruccion titulo="Veterinarias" /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
