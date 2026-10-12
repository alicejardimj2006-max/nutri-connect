import { createFileRoute } from "@tanstack/react-router";
import { Conversations } from "@/components/clinical/conversations";
import { PageHeader } from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento/mensagens")({
  validateSearch: (search: Record<string, unknown>): { com?: string; texto?: string } => ({
    com: typeof search.com === "string" ? search.com : undefined,
    texto: typeof search.texto === "string" ? search.texto.slice(0, 2000) : undefined,
  }),
  component: PatientMessagesPage,
});

function PatientMessagesPage() {
  const { user } = useAuth();
  const { com, texto } = Route.useSearch();
  const { t } = useClinicalI18n();
  if (!user) return null;
  return (
    <>
      <PageHeader title={t("chat.title")} subtitle={t("chat.subtitlePatient")} />
      <Conversations role="patient" meId={user.id} initialOtherId={com} initialDraft={texto} />
    </>
  );
}
