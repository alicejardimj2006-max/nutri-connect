import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  CalendarDays,
  Crown,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Wallet,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { ClinicalLayout, type ClinicalNavItem } from "@/components/clinical/layout";
import { EmptyState, buttonPrimary } from "@/components/clinical/ui";
import { useRequireAuth } from "@/hooks/use-auth";
import { useClinicalDemo } from "@/lib/clinical/demo";
import { useClinicalRealtime, useConversations, useLinks } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { useTr } from "@/components/appearance-editor";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [{ title: "Painel clínico — NutriConnect" }] }),
  component: ProfessionalPanelLayout,
});

function ProfessionalPanelLayout() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useClinicalI18n();
  const tr = useTr();
  // No modo demonstração o administrador entra no painel como a profissional de exemplo.
  const demo = useClinicalDemo();
  const isPro = !!user?.professional || demo;
  const pro = user?.professional ?? { council: "CRN", registration: "DEMO-0000", uf: "SP" };
  useClinicalRealtime(isPro ? user?.id : undefined);
  const links = useLinks("professional", isPro);
  const conversations = useConversations(isPro);

  if (!hydrated || !user) return <AuthGateLoading />;

  if (!isPro) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
          <EmptyState
            icon={ShieldCheck}
            title={t("panel.onlyProfessionals")}
            text={t("panel.onlyProfessionalsText")}
            action={
              <Link to="/verificacao" className={buttonPrimary}>
                {t("panel.verify")}
              </Link>
            }
          />
        </main>
      </div>
    );
  }

  const pending = (links.data ?? []).filter((l) => l.status === "pendente").length;
  const items: ClinicalNavItem[] = [
    { to: "/painel", label: t("panelNav.overview"), icon: LayoutDashboard, exact: true },
    { to: "/painel/agenda", label: t("panelNav.schedule"), icon: CalendarDays },
    { to: "/painel/pacientes", label: t("panelNav.patients"), icon: Users, badge: pending },
    {
      to: "/painel/mensagens",
      label: t("panelNav.messages"),
      icon: MessageCircle,
      badge: (conversations.data ?? [])
        .filter((c) => c.professionalId === user.id)
        .reduce((a, c) => a + c.unread, 0),
    },
    { to: "/painel/financeiro", label: t("panelNav.finance"), icon: Wallet },
    {
      to: "/painel/membros",
      label: tr(["Membros", "Members", "Miembros", "Membres"]),
      icon: Crown,
    },
    { to: "/painel/configuracoes", label: t("panelNav.settings"), icon: Settings },
  ];

  return (
    <ClinicalLayout
      title={t("panelNav.title")}
      subtitle={`${pro.council} ${pro.registration}/${pro.uf}`}
      items={items}
    >
      <Outlet />
    </ClinicalLayout>
  );
}
