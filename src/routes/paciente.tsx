import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  Salad,
  Activity,
  MessageSquare,
  User,
  Sparkles,
  Compass,
} from "lucide-react";
import { useEffect } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { getUser } from "@/lib/auth";

const items: NavItem[] = [
  { to: "/minha-jornada", label: "Minha Jornada", icon: Sparkles },
  { to: "/espaco", label: "Espaço de Hoje", icon: Compass },
  { to: "/paciente/dashboard", label: "Clínico & Metas", icon: LayoutDashboard },
  { to: "/paciente/agendamentos", label: "Agendamentos", icon: Calendar },
  { to: "/paciente/plano-alimentar", label: "Plano Alimentar", icon: Salad },
  { to: "/paciente/ia-nutricional", label: "IA Nutricional", icon: Sparkles },
  { to: "/paciente/evolucao", label: "Evolução", icon: Activity },
  { to: "/paciente/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/paciente/perfil", label: "Perfil", icon: User },
];

const titles: Record<string, string> = {
  "/paciente/dashboard": "Acompanhamento Clínico & Metas",
  "/paciente/agendamentos": "Agendamentos",
  "/paciente/plano-alimentar": "Plano Alimentar",
  "/paciente/ia-nutricional": "IA Nutricional",
  "/paciente/evolucao": "Evolução",
  "/paciente/mensagens": "Mensagens",
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

  if (!hydrated || !user)
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>
    );

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
