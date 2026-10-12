import { createFileRoute } from "@tanstack/react-router";
import { GoalProgress } from "@/components/clinical/goal-progress";
import { TodayGoals } from "@/components/clinical/goals-today";
import { Card, PageHeader } from "@/components/clinical/ui";
import { WaterTracker } from "@/components/water-tracker";
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
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <TodayGoals patientId={user.id} />
        <Card title={t("patientHome.water")}>
          <WaterTracker />
        </Card>
      </div>
      <GoalProgress patientId={user.id} />
    </>
  );
}
