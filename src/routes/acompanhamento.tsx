import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  CalendarDays,
  FolderOpen,
  Home,
  LineChart,
  MessageCircle,
  NotebookPen,
  Stethoscope,
  Target,
  Utensils,
} from "lucide-react";
import { AuthGateLoading } from "@/components/site-chrome";
import { ClinicalLayout, type ClinicalNavItem } from "@/components/clinical/layout";
import { useRequireAuth } from "@/hooks/use-auth";
import { useClinicalRealtime, useConversations } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento")({
  head: () => ({ meta: [{ title: "Meu acompanhamento — NutriConnect" }] }),
  component: PatientAreaLayout,
});

function PatientAreaLayout() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useClinicalI18n();
  useClinicalRealtime(user?.id);
  const conversations = useConversations(!!user);
  const unread = (conversations.data ?? [])
    .filter((c) => c.patientId === user?.id)
    .reduce((a, c) => a + c.unread, 0);

  if (!hydrated || !user) return <AuthGateLoading />;

  const items: ClinicalNavItem[] = [
    { to: "/acompanhamento", label: t("patientNav.home"), icon: Home, exact: true },
    { to: "/acompanhamento/plano", label: t("patientNav.plan"), icon: Utensils },
    { to: "/acompanhamento/diario", label: t("patientNav.diary"), icon: NotebookPen },
    { to: "/acompanhamento/metas", label: t("patientNav.goals"), icon: Target },
    { to: "/acompanhamento/evolucao", label: t("patientNav.evolution"), icon: LineChart },
    { to: "/acompanhamento/consultas", label: t("patientNav.appointments"), icon: CalendarDays },
    {
      to: "/acompanhamento/mensagens",
      label: t("patientNav.messages"),
      icon: MessageCircle,
      badge: unread,
    },
    { to: "/acompanhamento/exames", label: t("patientNav.documents"), icon: FolderOpen },
    { to: "/profissionais", label: t("patientNav.findProfessional"), icon: Stethoscope },
  ];

  return (
    <ClinicalLayout title={t("patientNav.title")} subtitle={t("patientNav.subtitle")} items={items}>
      <Outlet />
    </ClinicalLayout>
  );
}
