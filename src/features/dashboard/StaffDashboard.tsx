import { Calendar, ShoppingCart, Users, TrendingUp, CalendarClock, PawPrint } from "lucide-react";
import { useAuth } from "@/features/auth";
import { PageHeader } from "@/components/molecules/PageHeader";
import { QuickCard } from "@/components/molecules/QuickCard";
import { Card, CardContent, Spinner } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { usePermisos } from "@/lib/usePermisos";
import { useMetricas } from "./hooks";

/** Dashboard inicial del staff: métricas + accesos rápidos según permisos. */
export function StaffDashboard() {
  const { sesion } = useAuth();
  const p = usePermisos();
  const nombreCorto = sesion?.nombre?.split(" ")[0] ?? "";

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${nombreCorto} 🐾`}
        descripcion="¿Qué quieres hacer hoy?"
      />

      {p("ver_metricas") && <Metricas />}

      <div className="grid gap-4 sm:grid-cols-2">
        {p("operar_clientes") && (
          <QuickCard
            titulo="Clientes y mascotas"
            descripcion="Registra y busca dueños y pacientes"
            icon={Users}
            to="/app/clientes"
          />
        )}
        {p("gestionar_citas") && (
          <QuickCard
            titulo="Citas"
            descripcion="Agenda y consulta las próximas citas"
            icon={Calendar}
            to="/app/citas"
            tone="accent"
          />
        )}
        {p("usar_pos") && (
          <QuickCard
            titulo="Ventas"
            descripcion="Punto de venta y catálogo"
            icon={ShoppingCart}
            to="/app/pos"
            tone="success"
          />
        )}
        {p("gestionar_equipo") && (
          <QuickCard
            titulo="Equipo"
            descripcion="Gestiona a tu personal"
            icon={Users}
            to="/app/equipo"
          />
        )}
      </div>
    </div>
  );
}

/** Tarjetas de métricas del negocio (Admin). */
function Metricas() {
  const { data, isLoading } = useMetricas();

  if (isLoading) {
    return (
      <div className="mb-5 grid place-items-center py-6">
        <Spinner label="Cargando métricas…" />
      </div>
    );
  }
  if (!data) return null;

  const tarjetas = [
    { titulo: "Ventas de hoy", valor: formatCurrency(data.ventasHoy), icon: TrendingUp, tone: "text-success" },
    { titulo: "Ventas del mes", valor: formatCurrency(data.ventasMes), icon: TrendingUp, tone: "text-primary" },
    { titulo: "Citas próximas", valor: String(data.citasProximas), icon: CalendarClock, tone: "text-[#9A6A00]" },
    { titulo: "Clientes activos", valor: String(data.clientesActivos), icon: PawPrint, tone: "text-primary" },
  ];

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tarjetas.map((t) => (
        <Card key={t.titulo}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-ink-soft">
              <t.icon className={`h-4 w-4 ${t.tone}`} aria-hidden />
              <span className="text-sm">{t.titulo}</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ink">{t.valor}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
