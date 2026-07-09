import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Salad, Activity, MessageSquare, User } from "lucide-react";
import { useEffect } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";

const items: NavItem[] = [
  { to: "/paciente/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/paciente/agendamentos", label: "Agendamentos", icon: Calendar },
  { to: "/paciente/plano-alimentar", label: "Plano Alimentar", icon: Salad },
  { to: "/paciente/evolucao", label: "Evolução", icon: Activity },
  { to: "/paciente/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/paciente/perfil", label: "Perfil", icon: User },
];

const titles: Record<string, string> = {
  "/paciente/dashboard": "Dashboard",
  "/paciente/agendamentos": "Agendamentos",
  "/paciente/plano-alimentar": "Plano Alimentar",
  "/paciente/evolucao": "Evolução",
  "/paciente/mensagens": "Mensagens",
  "/paciente/perfil": "Perfil",
};

export const Route = createFileRoute("/paciente")({
  component: PacienteLayout,
});

function PacienteLayout() {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login" });
    if (hydrated && user?.role === "nutricionista") navigate({ to: "/nutricionista/dashboard" });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>;

  return (
    <DashboardShell
      items={items}
      title={titles[pathname] ?? "Paciente"}
      userName={user.name}
      userRole="Paciente"
    >
      <Outlet />
    </DashboardShell>
  );
}
