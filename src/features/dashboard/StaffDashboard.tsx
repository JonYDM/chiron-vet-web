import { Calendar, ShoppingCart, Users, Bell } from "lucide-react";
import { useAuth } from "@/features/auth";
import { PageHeader } from "@/components/molecules/PageHeader";
import { QuickCard } from "@/components/molecules/QuickCard";
import { RolUsuario } from "@/types/api";

/** Dashboard inicial del staff. Muestra accesos rápidos según el rol. */
export function StaffDashboard() {
  const { sesion } = useAuth();
  const rol = sesion?.rol;
  const esAdmin = rol === RolUsuario.Administrador;
  const esRecepcion = rol === RolUsuario.Recepcionista;

  const nombreCorto = sesion?.nombre?.split(" ")[0] ?? "";

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${nombreCorto} 🐾`}
        descripcion="¿Qué quieres hacer hoy?"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickCard
          titulo="Clientes y mascotas"
          descripcion="Registra y busca dueños y pacientes"
          icon={Users}
          to="/app/clientes"
        />
        <QuickCard
          titulo="Citas"
          descripcion="Agenda y consulta las próximas citas"
          icon={Calendar}
          to="/app/citas"
          tone="accent"
        />
        {(esAdmin || esRecepcion) && (
          <QuickCard
            titulo="Ventas"
            descripcion="Punto de venta y catálogo"
            icon={ShoppingCart}
            to="/app/pos"
            tone="success"
          />
        )}
        {esAdmin && (
          <QuickCard
            titulo="Recordatorios"
            descripcion="Vacunas y citas próximas de tus clientes"
            icon={Bell}
            to="/app/recordatorios"
          />
        )}
      </div>
    </div>
  );
}
