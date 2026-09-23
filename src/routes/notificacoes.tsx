import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — NutriConnect" },
      {
        name: "description",
        content: "Acompanhe as atualizações da sua rede no NutriConnect.",
      },
    ],
  }),
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t } = useI18n();

  if (!authHydrated || !user) return <AuthGateLoading />;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground mb-8">
            {t("notif.title")}
          </h1>

          <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-base text-muted-foreground font-medium">{t("notif.empty")}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
