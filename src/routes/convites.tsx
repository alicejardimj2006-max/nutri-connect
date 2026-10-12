import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, Inbox, Users } from "lucide-react";
import { AuthGateLoading } from "@/components/site-chrome";
import { AdminPerson } from "@/components/person-chip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import type { RemoteCommunity } from "@/lib/social/communities";
import {
  useAcceptInvite,
  useCommunities,
  useCommunityInvites,
} from "@/lib/social/communities-queries";
import { AppScreen } from "@/components/app-screen";

export const Route = createFileRoute("/convites")({
  head: () => ({ meta: [{ title: "Convites de comunidades — NutriConnect" }] }),
  component: InvitesPage,
});

function InvitesPage() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useI18n();
  const isPro = !!user?.professional;
  // Convites calculados no banco (até 5 profissionais por comunidade) e a comunidade que já administro.
  const invitesQuery = useCommunityInvites(!!user && isPro);
  const mine = useCommunities(true, !!user);

  if (!hydrated || !user) return <AuthGateLoading />;

  const info = user.professional;
  const administered = (mine.data ?? []).find(
    (c) => c.adminUserId === user.id || c.professionalId === user.id,
  );
  const invites = invitesQuery.data ?? [];
  const loading = mine.isLoading || (isPro && invitesQuery.isLoading);

  return (
    <AppScreen>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/perfil/$userId"
          params={{ userId: user.id }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("edit.back")}</span>
        </Link>

        <h1 className="sr-only">{t("invites.title")}</h1>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : !isPro ? (
          <section className="mt-8 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-xs">
            <BadgeCheck className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-2 text-sm font-semibold text-foreground">{t("invites.onlyPros")}</p>
            <Link
              to="/verificacao"
              className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              {t("invites.verifyMe")}
            </Link>
          </section>
        ) : (
          <>
            {info && (
              <p className="mt-4 text-xs text-muted-foreground">
                {t("invites.yourArea")} {info.specialties.map((s) => td(s)).join(", ")}.
              </p>
            )}

            {administered && (
              <section className="mt-6 rounded-2xl border border-accent/30 bg-card p-5 shadow-xs">
                <p className="text-sm text-foreground">
                  {t("invites.youAreAdmin")}{" "}
                  <Link
                    to="/comunidades/$slug"
                    params={{ slug: administered.slug }}
                    className="font-semibold text-accent hover:underline"
                  >
                    {administered.name}
                  </Link>
                  . {t("invites.oneAtATime")}
                </p>
              </section>
            )}

            {invites.length === 0 ? (
              <section className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
                <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold text-foreground">{t("invites.none")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("invites.noneHint")}</p>
              </section>
            ) : (
              <ul className="mt-6 space-y-4">
                {invites.map((c) => (
                  <li key={c.id}>
                    <InviteCard
                      community={c}
                      matchesTopic={!!info?.specialties.includes(c.category)}
                      blocked={!!administered}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AppScreen>
  );
}

function InviteCard({
  community: c,
  matchesTopic,
  blocked,
}: {
  community: RemoteCommunity;
  matchesTopic: boolean;
  blocked: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const accept = useAcceptInvite();

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          {td(c.category)}
        </span>
        {matchesTopic && (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            {t("invites.matches")}
          </span>
        )}
        <span className="rounded-full bg-warning/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          {c.status === "pendente" ? t("invites.newCommunity") : t("invites.vacancy")}
        </span>
      </div>

      <h2 className="mt-3 font-display text-xl font-bold text-foreground">{c.name}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
      {c.objective && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">{t("invites.objective")} </span>
          {c.objective}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <AdminPerson
            label={t("comunidades.adminUser")}
            userId={c.adminUserId}
            name={c.adminName}
            vacantText={t("comunidades.awaitingNomination")}
          />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-4 w-4 text-accent" /> {c.memberCount} {t("comunidades.members")}
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              disabled={blocked}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("invites.accept")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("invites.confirmTitle")} {c.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("invites.confirmText1")} {c.adminName ?? t("invites.theUserAdmin")}.{" "}
                {t("invites.confirmText2")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("invites.notNow")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await accept.mutateAsync(c.id);
                  } catch {
                    return; // o aviso de erro já é mostrado pelo hook
                  }
                  toast.success(t("invites.acceptedToast"));
                  navigate({ to: "/comunidades/$slug", params: { slug: c.slug } });
                }}
              >
                {t("invites.accept")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
