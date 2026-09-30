import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartHandshake, TicketX } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";
import {
  Avatar,
  Card,
  EmptyState,
  Loading,
  buttonPrimary,
  buttonSecondary,
  plainText,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import * as api from "@/lib/clinical/api";
import { useClinicalMutation } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/convite/$code")({
  head: () => ({ meta: [{ title: "Convite de acompanhamento — NutriConnect" }] }),
  component: InvitePage,
});

function InvitePage() {
  const { code } = Route.useParams();
  const { t } = useClinicalI18n();
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  const invite = useQuery({
    queryKey: ["clinical", "invite", code],
    queryFn: () => api.getInvite(code),
  });
  const accept = useClinicalMutation(() => api.acceptInvite(code), {
    success: t("invite.accepted"),
    onSuccess: () => navigate({ to: "/acompanhamento" }),
  });

  return (
    <div className={cn("flex min-h-screen flex-col bg-background text-foreground", plainText)}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        {invite.isLoading || !hydrated ? (
          <Loading />
        ) : !invite.data || !invite.data.valid ? (
          <EmptyState
            icon={TicketX}
            title={t("invite.invalidTitle")}
            text={t("invite.invalidText")}
            action={
              <Link to="/profissionais" className={buttonSecondary}>
                {t("invite.findProfessional")}
              </Link>
            }
          />
        ) : (
          <Card>
            <div className="flex flex-col items-center text-center">
              <Avatar name={invite.data.professional_name} size="lg" />
              <HeartHandshake className="mt-4 h-6 w-6 text-accent" />
              <h1 className="mt-2 font-display text-2xl font-extrabold">
                {t("invite.title", { name: invite.data.professional_name })}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("invite.text")}</p>
              <ul className="mt-4 space-y-1 text-left text-sm text-foreground">
                <li>• {t("invite.benefit1")}</li>
                <li>• {t("invite.benefit2")}</li>
                <li>• {t("invite.benefit3")}</li>
              </ul>
              {user ? (
                user.id === invite.data.professional_id ? (
                  <p className="mt-6 text-sm text-muted-foreground">{t("invite.ownInvite")}</p>
                ) : (
                  <button
                    type="button"
                    className={`${buttonPrimary} mt-6`}
                    disabled={accept.isPending}
                    onClick={() => accept.mutate(undefined)}
                  >
                    {t("invite.accept")}
                  </button>
                )
              ) : (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/cadastro"
                    search={{ redirect: `/convite/${code}` }}
                    className={buttonPrimary}
                  >
                    {t("invite.signup")}
                  </Link>
                  <Link
                    to="/login"
                    search={{ redirect: `/convite/${code}` }}
                    className={buttonSecondary}
                  >
                    {t("invite.login")}
                  </Link>
                </div>
              )}
              {!user && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("invite.afterLogin", { code })}
                </p>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
