import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  MessageSquare,
  User,
  Settings,
  Sparkles,
  MessageCircleHeart,
} from "lucide-react";
import { useEffect } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { getUser } from "@/lib/auth";

const items: NavItem[] = [
  { to: "/nutricionista/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/nutricionista/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/nutricionista/pacientes", label: "Pacientes", icon: Users },
  { to: "/nutricionista/planos", label: "Planos Alimentares", icon: FileText },
  { to: "/nutricionista/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/espaco", label: "Espaço de Hoje", icon: MessageCircleHeart },
  { to: "/tema-da-semana", label: "Tema da Semana", icon: Sparkles },
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

  if (!hydrated || !user)
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>
    );

  return (
    <DashboardShell
      items={items}
      title={titles[pathname] ?? "Nutricionista"}
      userName={user.name}
      userRole="Nutricionista"
    >
      <Outlet />
    </DashboardShell>
  );
}
