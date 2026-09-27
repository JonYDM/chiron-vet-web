import { Link } from "react-router-dom";
import {
  Calendar,
  ShoppingCart,
  Users,
  CalendarClock,
  PawPrint,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Card, CardContent, Skeleton } from "@/components/ui";
import { Huella } from "@/components/ilustraciones";
import { formatCurrency } from "@/lib/format";
import { usePermisos } from "@/lib/usePermisos";
import { Reveal } from "@/lib/anim";
import { useContador } from "@/lib/useContador";
import { useMetricas } from "./hooks";

/** Dashboard estilo Nubank: hero de marca + métricas + accesos como bloques. */
export function StaffDashboard() {
  const { sesion } = useAuth();
  const p = usePermisos();
  const nombreCorto = sesion?.nombre?.split(" ")[0] ?? "";

  const accesos = [
    p("operar_clientes") && {
      titulo: "Clientes",
      descripcion: "Dueños y pacientes",
      icon: Users,
      to: "/app/clientes",
      color: "bg-primary text-white",
    },
    p("gestionar_citas") && {
      titulo: "Citas",
      descripcion: "Agenda del día",
      icon: Calendar,
      to: "/app/citas",
      color: "bg-accent-grad text-[#7a5200]",
    },
    p("usar_pos") && {
      titulo: "Ventas",
      descripcion: "Punto de venta",
      icon: ShoppingCart,
      to: "/app/pos",
      color: "bg-success text-white",
    },
    p("gestionar_equipo") && {
      titulo: "Equipo",
      descripcion: "Tu personal",
      icon: Users,
      to: "/app/equipo",
      color: "bg-ink text-white",
    },
  ].filter(Boolean) as {
    titulo: string;
    descripcion: string;
    icon: typeof Users;
    to: string;
    color: string;
  }[];

  return (
    <div className="space-y-6">
      {/* Hero de marca con saludo */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-lift">
          <Huella className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rotate-12 text-white/10" />
          <p className="text-sm text-white/80">Hola,</p>
          <h1 className="text-display leading-tight">{nombreCorto} 🐾</h1>
          {p("ver_metricas") && <MetricaHero />}
        </div>
      </Reveal>

      {/* Métricas secundarias */}
      {p("ver_metricas") && <MetricasSecundarias />}

      {/* Accesos como bloques de color */}
      <div>
        <h2 className="mb-3 text-h3 text-ink">Accesos rápidos</h2>
        <Reveal stagger className="grid gap-3 sm:grid-cols-2">
          {accesos.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`group flex items-center gap-4 rounded-3xl p-5 shadow-soft transition-transform duration-200 ease-out-expo hover:-translate-y-1 ${a.color}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20">
                <a.icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-bold">{a.titulo}</span>
                <span className="block text-sm opacity-80">{a.descripcion}</span>
              </span>
              <ChevronRight className="h-5 w-5 opacity-60 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </Reveal>
      </div>
    </div>
  );
}

/** Métrica principal (ventas de hoy) con contador animado, dentro del hero. */
function MetricaHero() {
  const { data, isLoading } = useMetricas();
  const ref = useContador(data?.ventasHoy ?? 0, formatCurrency);

  if (isLoading) {
    return <Skeleton className="mt-4 h-10 w-40 bg-white/20" />;
  }
  return (
    <div className="mt-4">
      <p className="text-sm text-white/70">Ventas de hoy</p>
      <span className="block text-display leading-tight" ref={ref}>
        {formatCurrency(data?.ventasHoy ?? 0)}
      </span>
    </div>
  );
}

/** Tarjetas de métricas secundarias. */
function MetricasSecundarias() {
  const { data, isLoading } = useMetricas();

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const tarjetas = [
    { titulo: "Ventas del mes", valor: formatCurrency(data.ventasMes), icon: ShoppingCart },
    { titulo: "Citas próximas", valor: String(data.citasProximas), icon: CalendarClock },
    { titulo: "Clientes activos", valor: String(data.clientesActivos), icon: PawPrint },
  ];

  return (
    <Reveal stagger className="grid gap-3 sm:grid-cols-3">
      {tarjetas.map((t) => (
        <Card key={t.titulo} className="rounded-3xl border-0 shadow-soft">
          <CardContent className="p-5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-50 text-primary">
              <t.icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-3 text-2xl font-bold text-ink">{t.valor}</p>
            <p className="text-sm text-ink-soft">{t.titulo}</p>
          </CardContent>
        </Card>
      ))}
    </Reveal>
  );
}
