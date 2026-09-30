import { createFileRoute } from "@tanstack/react-router";
import { Conversations } from "@/components/clinical/conversations";
import { PageHeader } from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/painel/mensagens")({
  validateSearch: (search: Record<string, unknown>): { com?: string } => ({
    com: typeof search.com === "string" ? search.com : undefined,
  }),
  component: ProfessionalMessagesPage,
});

function ProfessionalMessagesPage() {
  const { user } = useAuth();
  const { com } = Route.useSearch();
  const { t } = useClinicalI18n();
  if (!user) return null;
  return (
    <>
      <PageHeader title={t("chat.title")} subtitle={t("chat.subtitlePro")} />
      <Conversations role="professional" meId={user.id} initialOtherId={com} />
    </>
  );
}
