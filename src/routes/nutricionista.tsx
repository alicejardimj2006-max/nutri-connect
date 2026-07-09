import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, FileText, MessageSquare, User, Settings } from "lucide-react";
import { useEffect } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";

const items: NavItem[] = [
  { to: "/nutricionista/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/nutricionista/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/nutricionista/pacientes", label: "Pacientes", icon: Users },
  { to: "/nutricionista/planos", label: "Planos Alimentares", icon: FileText },
  { to: "/nutricionista/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/nutricionista/perfil", label: "Perfil", icon: User },
  { to: "/nutricionista/configuracoes", label: "Configurações", icon: Settings },
];

const titles: Record<string, string> = {
  "/nutricionista/dashboard": "Dashboard",
  "/nutricionista/agenda": "Agenda",
  "/nutricionista/pacientes": "Pacientes",
  "/nutricionista/planos": "Planos Alimentares",
  "/nutricionista/mensagens": "Mensagens",
  "/nutricionista/perfil": "Perfil",
  "/nutricionista/configuracoes": "Configurações",
};

export const Route = createFileRoute("/nutricionista")({
  component: NutriLayout,
});

function NutriLayout() {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login" });
    if (hydrated && user?.role === "paciente") navigate({ to: "/paciente/dashboard" });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>;

  return (
    <DashboardShell items={items} title={titles[pathname] ?? "Nutricionista"} userName={user.name} userRole="Nutricionista">
      <Outlet />
    </DashboardShell>
  );
}
