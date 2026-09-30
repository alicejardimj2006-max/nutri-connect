import { createFileRoute } from "@tanstack/react-router";
import { DocumentsPanel } from "@/components/clinical/documents-panel";
import { PageHeader } from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento/exames")({
  component: PatientDocumentsPage,
});

function PatientDocumentsPage() {
  const { user } = useAuth();
  const { t } = useClinicalI18n();
  if (!user) return null;
  return (
    <>
      <PageHeader title={t("docs.title")} subtitle={t("docs.subtitle")} />
      <DocumentsPanel patientId={user.id} meId={user.id} canUpload />
    </>
  );
}
