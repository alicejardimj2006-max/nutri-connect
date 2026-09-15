import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, MessageSquare, User, Settings, Sparkles, Compass, Salad, BookOpen } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { getUser } from "@/lib/auth";

const items: NavItem[] = [
  { to: "/nutricionista/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/espaco", label: "Espaço de Hoje", icon: Compass },
  { to: "/comunidades", label: "Comunidades", icon: Users },
  { to: "/receitas", label: "Receitas", icon: Salad },
  { to: "/tema-da-semana", label: "Tema da Semana", icon: BookOpen },
  { to: "/nutricionista/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/nutricionista/agenda", label: "Consultas", icon: CalendarDays },
  { to: "/nutricionista/perfil", label: "Perfil", icon: User },
  { to: "/nutricionista/configuracoes", label: "Configurações", icon: Settings },
];

const titles: Record<string, string> = {
  "/nutricionista/dashboard": "Rede Social",
  "/espaco": "Espaço de Hoje",
  "/comunidades": "Comunidades",
  "/receitas": "Receitas",
  "/tema-da-semana": "Tema da Semana",
  "/nutricionista/mensagens": "Mensagens",
  "/nutricionista/agenda": "Consultas",
  "/nutricionista/perfil": "Perfil Profissional",
  "/nutricionista/configuracoes": "Configurações",
};

export const Route = createFileRoute("/nutricionista")({
  beforeLoad: () => {
    const user = getUser();
    if (!user) throw redirect({ to: "/login" });
    if (user.role === "paciente") throw redirect({ to: "/paciente/dashboard" });
  },
  component: NutriLayout,
});

function NutriLayout() {
  const { user, hydrated } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!hydrated || !user) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>;

  return (
    <DashboardShell 
      items={items} 
      title={titles[pathname] ?? "Profissional da Rede"} 
      userName={user.name} 
      userRole="Profissional"
    >
      <Outlet />
    </DashboardShell>
  );
}
