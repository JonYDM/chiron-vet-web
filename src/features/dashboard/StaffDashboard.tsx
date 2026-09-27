import { Calendar, ShoppingCart, Users, TrendingUp, CalendarClock, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth";
import { PageHeader } from "@/components/molecules/PageHeader";
import { QuickCard } from "@/components/molecules/QuickCard";
import { Card, CardContent, Skeleton } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { usePermisos } from "@/lib/usePermisos";
import { listaStagger, itemStagger } from "@/lib/motion";
import { useMetricas } from "./hooks";

/** Dashboard inicial del staff: métricas + accesos rápidos según permisos. */
export function StaffDashboard() {
  const { sesion } = useAuth();
  const p = usePermisos();
  const nombreCorto = sesion?.nombre?.split(" ")[0] ?? "";

  const accesos = [
    p("operar_clientes") && {
      titulo: "Clientes y mascotas",
      descripcion: "Registra y busca dueños y pacientes",
      icon: Users,
      to: "/app/clientes",
      tone: "primary" as const,
    },
    p("gestionar_citas") && {
      titulo: "Citas",
      descripcion: "Agenda y consulta las próximas citas",
      icon: Calendar,
      to: "/app/citas",
      tone: "accent" as const,
    },
    p("usar_pos") && {
      titulo: "Ventas",
      descripcion: "Punto de venta y catálogo",
      icon: ShoppingCart,
      to: "/app/pos",
      tone: "success" as const,
    },
    p("gestionar_equipo") && {
      titulo: "Equipo",
      descripcion: "Gestiona a tu personal",
      icon: Users,
      to: "/app/equipo",
      tone: "primary" as const,
    },
  ].filter(Boolean) as {
    titulo: string;
    descripcion: string;
    icon: typeof Users;
    to: string;
    tone: "primary" | "accent" | "success";
  }[];

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${nombreCorto} 🐾`}
        descripcion="¿Qué quieres hacer hoy?"
      />

      {p("ver_metricas") && <Metricas />}

      <motion.div
        variants={listaStagger}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2"
      >
        {accesos.map((a) => (
          <motion.div key={a.to} variants={itemStagger}>
            <QuickCard
              titulo={a.titulo}
              descripcion={a.descripcion}
              icon={a.icon}
              to={a.to}
              tone={a.tone}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/** Tarjetas de métricas del negocio (Admin). */
function Metricas() {
  const { data, isLoading } = useMetricas();

  if (isLoading) {
    return (
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const tarjetas = [
    { titulo: "Ventas de hoy", valor: formatCurrency(data.ventasHoy), icon: TrendingUp },
    { titulo: "Ventas del mes", valor: formatCurrency(data.ventasMes), icon: TrendingUp },
    { titulo: "Citas próximas", valor: String(data.citasProximas), icon: CalendarClock },
    { titulo: "Clientes activos", valor: String(data.clientesActivos), icon: PawPrint },
  ];

  return (
    <motion.div
      variants={listaStagger}
      initial="hidden"
      animate="visible"
      className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {tarjetas.map((t) => (
        <motion.div key={t.titulo} variants={itemStagger}>
          <Card className="transition-shadow duration-200 hover:shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-ink-soft">
                <t.icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm">{t.titulo}</span>
              </div>
              <p className="mt-1 text-h3 text-ink">{t.valor}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
