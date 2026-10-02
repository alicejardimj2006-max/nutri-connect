import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { PAGE_CONTAINER, PageColumns } from "@/components/page-layout";
import {
  FriendsPanel,
  ProfileSummaryCard,
  ShortcutsPanel,
  SuggestedCommunitiesPanel,
  WeeklyThemePanel,
} from "@/components/side-panels";
import { initials } from "@/lib/community";
import {
  useIncomingRequests,
  useRemoveFriendship,
  useRespondFriendship,
} from "@/lib/social/queries";

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
  const requests = useIncomingRequests();
  const respond = useRespondFriendship();
  const decline = useRemoveFriendship();

  if (!authHydrated || !user) return <AuthGateLoading />;

  const pending = requests.data ?? [];
  const busy = respond.isPending || decline.isPending;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className={`${PAGE_CONTAINER} flex-1 py-8`}>
        <PageColumns
          left={
            <>
              <ProfileSummaryCard />
              <ShortcutsPanel />
            </>
          }
          right={
            <>
              <FriendsPanel />
              <SuggestedCommunitiesPanel />
              <WeeklyThemePanel />
            </>
          }
        >
          <div className="mx-auto w-full max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground mb-8">
              {t("notif.title")}
            </h1>

            {pending.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-bold font-display text-foreground">
                  {t("notif.friendRequests.title")} ({pending.length})
                </h2>
                <ul className="space-y-2">
                  {pending.map((req) => (
                    <li
                      key={req.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs"
                    >
                      <Link
                        to="/perfil/$userId"
                        params={{ userId: req.from.id }}
                        className="flex min-w-0 items-center gap-3"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground">
                          {req.from.avatarUrl ? (
                            <img
                              src={req.from.avatarUrl}
                              alt={req.from.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials(req.from.name)
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {req.from.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            @{req.from.username} · {t("notif.friendRequests.wants")}
                          </span>
                        </span>
                      </Link>
                      <span className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            respond.mutate(
                              { friendshipId: req.id, accept: true },
                              { onSuccess: () => toast.success(t("profile.friendAcceptedToast")) },
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-60 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> {t("profile.acceptRequest")}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={t("profile.declineRequest")}
                          title={t("profile.declineRequest")}
                          onClick={() =>
                            decline.mutate(req.from.id, {
                              onSuccess: () => toast.success(t("notif.friendRequests.declined")),
                            })
                          }
                          className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary disabled:opacity-60 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {pending.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-base text-muted-foreground font-medium">{t("notif.empty")}</p>
              </div>
            )}
          </div>
        </PageColumns>
      </main>
    </div>
  );
}
