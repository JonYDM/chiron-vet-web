import { lazy, Suspense, type ReactNode } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { RolUsuario } from "@/types/api";
import { ProtectedRoute, useAuth, rutaInicialPorRol } from "@/features/auth";
import { Spinner } from "@/components/ui";
import { PaginaError } from "@/components/organisms/PaginaError";

/** 404: página no encontrada. Lleva al inicio del rol actual (o al login). */
function PaginaNoEncontrada() {
  const { sesion } = useAuth();
  const inicio = sesion ? rutaInicialPorRol(sesion.rol) : "/login";
  return (
    <PaginaError
      codigo="404"
      titulo="Página no encontrada"
      descripcion="La página que buscas no existe o se movió de lugar."
      irA={inicio}
    />
  );
}
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
const ClienteDetallePage = lazy(() =>
  import("@/features/clientes").then((m) => ({ default: m.ClienteDetallePage })),
);
const PerfilPacientePage = lazy(() =>
  import("@/features/mascotas").then((m) => ({ default: m.PerfilPacientePage })),
);
const PacientesPage = lazy(() =>
  import("@/features/mascotas").then((m) => ({ default: m.PacientesPage })),
);
const CitasPage = lazy(() =>
  import("@/features/citas").then((m) => ({ default: m.CitasPage })),
);
const PosPage = lazy(() =>
  import("@/features/pos").then((m) => ({ default: m.PosPage })),
);
const HistorialVentasPage = lazy(() =>
  import("@/features/pos").then((m) => ({ default: m.HistorialVentasPage })),
);
const MisMascotasPage = lazy(() =>
  import("@/features/portal").then((m) => ({ default: m.MisMascotasPage })),
);
const MiExpedientePage = lazy(() =>
  import("@/features/portal").then((m) => ({ default: m.MiExpedientePage })),
);
const MisRecordatoriosPage = lazy(() =>
  import("@/features/portal").then((m) => ({ default: m.MisRecordatoriosPage })),
);
const MisComprasPage = lazy(() =>
  import("@/features/portal").then((m) => ({ default: m.MisComprasPage })),
);
const RecordatoriosPage = lazy(() =>
  import("@/features/recordatorios").then((m) => ({ default: m.RecordatoriosPage })),
);
const VeterinariasPage = lazy(() =>
  import("@/features/veterinarias").then((m) => ({
    default: m.VeterinariasPage,
  })),
);
const ResumenSuperAdminPage = lazy(() =>
  import("@/features/veterinarias").then((m) => ({ default: m.ResumenSuperAdminPage })),
);
const AdministradoresPage = lazy(() =>
  import("@/features/veterinarias").then((m) => ({ default: m.AdministradoresPage })),
);
const VeterinariaDetallePage = lazy(() =>
  import("@/features/veterinarias").then((m) => ({ default: m.VeterinariaDetallePage })),
);
const CobrosPage = lazy(() =>
  import("@/features/veterinarias").then((m) => ({ default: m.CobrosPage })),
);
const EquipoPage = lazy(() =>
  import("@/features/usuarios").then((m) => ({ default: m.StaffPage })),
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
      { path: "clientes/:clienteId", element: <ClienteDetallePage /> },
      { path: "pacientes", element: <PacientesPage /> },
      { path: "mascotas/:mascotaId", element: <PerfilPacientePage /> },
      { path: "citas", element: <CitasPage /> },
      { path: "pos", element: <PosPage /> },
      {
        path: "ventas",
        element: (
          <ProtectedRoute roles={[RolUsuario.Administrador]}>
            <HistorialVentasPage />
          </ProtectedRoute>
        ),
      },
      { path: "recordatorios", element: <RecordatoriosPage /> },
      {
        path: "equipo",
        element: (
          <ProtectedRoute roles={[RolUsuario.Administrador]}>
            <EquipoPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ── Portal del dueño ──
  {
    path: "/portal",
    element: <Protegida roles={[RolUsuario.DuenoMascota]}><PortalLayout /></Protegida>,
    children: [
      { index: true, element: <MisMascotasPage /> },
      { path: "mascotas/:mascotaId", element: <MiExpedientePage /> },
      { path: "recordatorios", element: <MisRecordatoriosPage /> },
      { path: "compras", element: <MisComprasPage /> },
    ],
  },

  // ── Panel SuperAdmin ──
  {
    path: "/admin",
    element: <Protegida roles={[RolUsuario.SuperAdmin]}><AdminLayout /></Protegida>,
    children: [
      { index: true, element: <ResumenSuperAdminPage /> },
      { path: "veterinarias", element: <VeterinariasPage /> },
      { path: "veterinarias/:id", element: <VeterinariaDetallePage /> },
      { path: "cobros", element: <CobrosPage /> },
      { path: "administradores", element: <AdministradoresPage /> },
    ],
  },

  { path: "*", element: <PaginaNoEncontrada /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
