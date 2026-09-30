import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  CalendarDays,
  LayoutDashboard,
  MessageCircle,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { ClinicalLayout, type ClinicalNavItem } from "@/components/clinical/layout";
import { EmptyState, buttonPrimary } from "@/components/clinical/ui";
import { useRequireAuth } from "@/hooks/use-auth";
import { useClinicalRealtime, useConversations, useLinks } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [{ title: "Painel clínico — NutriConnect" }] }),
  component: ProfessionalPanelLayout,
});

function ProfessionalPanelLayout() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useClinicalI18n();
  const isPro = !!user?.professional;
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
    { to: "/painel/configuracoes", label: t("panelNav.settings"), icon: Settings },
  ];

  return (
    <ClinicalLayout
      title={t("panelNav.title")}
      subtitle={`${user.professional!.council} ${user.professional!.registration}/${user.professional!.uf}`}
      items={items}
    >
      <Outlet />
    </ClinicalLayout>
  );
}
