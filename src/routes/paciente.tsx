import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Salad, MessageSquare, User, Sparkles, Compass, Users, Flame, Award, BookOpen } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { getUser } from "@/lib/auth";

const items: NavItem[] = [
  { to: "/paciente/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/espaco", label: "Espaço de Hoje", icon: Compass },
  { to: "/comunidades", label: "Comunidades", icon: Users },
  { to: "/receitas", label: "Receitas", icon: Salad },
  { to: "/tema-da-semana", label: "Tema da Semana", icon: BookOpen },
  { to: "/desafios", label: "Desafios", icon: Award },
  { to: "/profissionais", label: "Profissionais", icon: User },
  { to: "/minha-jornada", label: "Minha Jornada", icon: Flame },
  { to: "/paciente/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/paciente/agendamentos", label: "Consultas", icon: Calendar },
  { to: "/paciente/perfil", label: "Perfil", icon: User },
];

const titles: Record<string, string> = {
  "/paciente/dashboard": "Rede Social",
  "/espaco": "Espaço de Hoje",
  "/comunidades": "Comunidades",
  "/receitas": "Receitas",
  "/tema-da-semana": "Tema da Semana",
  "/desafios": "Desafios",
  "/profissionais": "Profissionais",
  "/minha-jornada": "Minha Jornada",
  "/paciente/mensagens": "Mensagens",
  "/paciente/agendamentos": "Consultas",
  "/paciente/perfil": "Perfil",
};

export const Route = createFileRoute("/paciente")({
  beforeLoad: () => {
    const user = getUser();
    if (!user) throw redirect({ to: "/login" });
    if (user.role === "nutricionista") throw redirect({ to: "/nutricionista/dashboard" });
  },
  component: PacienteLayout,
});

function PacienteLayout() {
  const { user, hydrated } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!hydrated || !user) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>;

  return (
    <DashboardShell
      items={items}
      title={titles[pathname] ?? "Rede"}
      userName={user.name}
      userRole="Membro"
    >
      <Outlet />
    </DashboardShell>
  );
}
