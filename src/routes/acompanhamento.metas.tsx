import { createFileRoute } from "@tanstack/react-router";
import { TodayGoals } from "@/components/clinical/goals-today";
import { PageHeader } from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento/metas")({
  component: PatientGoalsPage,
});

function PatientGoalsPage() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  if (!user) return null;
  return (
    <>
      <PageHeader
        title={t("patientGoals.title")}
        subtitle={`${t("patientGoals.subtitle")} · ${formatDate(new Date(), locale, { weekday: "long", day: "numeric", month: "long" })}`}
      />
      <TodayGoals patientId={user.id} />
    </>
  );
}
