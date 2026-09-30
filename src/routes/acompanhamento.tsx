import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CalendarDays, Home, Stethoscope } from "lucide-react";
import { AuthGateLoading } from "@/components/site-chrome";
import { ClinicalLayout, type ClinicalNavItem } from "@/components/clinical/layout";
import { useRequireAuth } from "@/hooks/use-auth";
import { useClinicalRealtime } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento")({
  head: () => ({ meta: [{ title: "Meu acompanhamento — NutriConnect" }] }),
  component: PatientAreaLayout,
});

function PatientAreaLayout() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useClinicalI18n();
  useClinicalRealtime(user?.id);

  if (!hydrated || !user) return <AuthGateLoading />;

  const items: ClinicalNavItem[] = [
    { to: "/acompanhamento", label: t("patientNav.home"), icon: Home, exact: true },
    { to: "/acompanhamento/consultas", label: t("patientNav.appointments"), icon: CalendarDays },
    { to: "/profissionais", label: t("patientNav.findProfessional"), icon: Stethoscope },
  ];

  return (
    <ClinicalLayout title={t("patientNav.title")} subtitle={t("patientNav.subtitle")} items={items}>
      <Outlet />
    </ClinicalLayout>
  );
}
