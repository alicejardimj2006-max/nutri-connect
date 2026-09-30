import { createFileRoute } from "@tanstack/react-router";
import { DiaryComposer, DiaryFeed } from "@/components/clinical/diary";
import { PageHeader } from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento/diario")({
  component: PatientDiaryPage,
});

function PatientDiaryPage() {
  const { user } = useAuth();
  const { t } = useClinicalI18n();
  if (!user) return null;
  return (
    <>
      <PageHeader title={t("diary.title")} subtitle={t("diary.subtitle")} />
      <div className="space-y-6">
        <DiaryComposer patientId={user.id} />
        <DiaryFeed patientId={user.id} meId={user.id} canComment isOwner />
      </div>
    </>
  );
}
