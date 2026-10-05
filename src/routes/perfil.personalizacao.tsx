import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { CARD_IDS, PersonalizationPanel, type CardId } from "@/components/personalization-panel";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/perfil/personalizacao")({
  validateSearch: (search: Record<string, unknown>): { cartao?: CardId } => ({
    cartao: CARD_IDS.includes(search.cartao as CardId) ? (search.cartao as CardId) : undefined,
  }),
  head: () => ({ meta: [{ title: "Personalização — NutriConnect" }] }),
  component: PersonalizationPage,
});

function PersonalizationPage() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useI18n();
  const { cartao } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  if (!hydrated || !user) return <AuthGateLoading />;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Link
          to="/perfil/configuracoes"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("custom.back")}</span>
        </Link>

        <h1 className="sr-only">{t("custom.title")}</h1>

        <PersonalizationPanel
          card={cartao}
          onSelect={(id) => navigate({ search: id ? { cartao: id } : {} })}
        />
      </main>
    </div>
  );
}
