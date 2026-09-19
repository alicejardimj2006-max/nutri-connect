import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, Inbox, Users } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
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
import { useCommunity } from "@/hooks/use-community";
import { type Community } from "@/lib/community";
import {
  acceptProfessionalInvite,
  getAdministeredCommunity,
  getProfessionalInfo,
  getProfessionalInvites,
  isVerifiedProfessional,
} from "@/lib/community-admin";

export const Route = createFileRoute("/convites")({
  head: () => ({ meta: [{ title: "Convites de comunidades — NutriConnect" }] }),
  component: InvitesPage,
});

function InvitesPage() {
  const { user, hydrated } = useRequireAuth();
  const state = useCommunity();

  if (!hydrated || !user) return <AuthGateLoading />;

  const isPro = isVerifiedProfessional(state.profiles, user.id);
  const info = getProfessionalInfo(state.profiles, user.id);
  const administered = getAdministeredCommunity(user.id, state.communities);
  const invites = isPro ? getProfessionalInvites(user.id, state) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          to="/perfil/$userId"
          params={{ userId: user.id }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para o perfil</span>
        </Link>

        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Convites de comunidades
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Novas comunidades só passam a existir quando um profissional aceita ser o admin
          profissional. A plataforma convida os profissionais mais habilitados para o tema de cada
          uma.
        </p>

        {!state.hydrated ? (
          <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>
        ) : !isPro ? (
          <section className="mt-8 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-xs">
            <BadgeCheck className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Os convites são para profissionais verificados.
            </p>
            <Link
              to="/verificacao"
              className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              Verificar meu perfil
            </Link>
          </section>
        ) : (
          <>
            {info && (
              <p className="mt-4 text-xs text-muted-foreground">
                Sua área de atuação: {info.specialties.join(", ")}.
              </p>
            )}

            {administered && (
              <section className="mt-6 rounded-2xl border border-accent/30 bg-card p-5 shadow-xs">
                <p className="text-sm text-foreground">
                  Você é admin profissional de{" "}
                  <Link
                    to="/comunidades/$slug"
                    params={{ slug: administered.slug }}
                    className="font-semibold text-accent hover:underline"
                  >
                    {administered.name}
                  </Link>
                  . Cada profissional administra uma comunidade por vez; para aceitar outro convite,
                  deixe a administração dessa comunidade primeiro.
                </p>
              </section>
            )}

            {invites.length === 0 ? (
              <section className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
                <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold text-foreground">Nenhum convite agora.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quando uma comunidade combinar com a sua área, ela aparece aqui.
                </p>
              </section>
            ) : (
              <ul className="mt-6 space-y-4">
                {invites.map((c) => (
                  <li key={c.id}>
                    <InviteCard
                      community={c}
                      matchesTopic={!!info?.specialties.includes(c.category)}
                      blocked={!!administered}
                      actor={{ id: user.id, name: user.name }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function InviteCard({
  community: c,
  matchesTopic,
  blocked,
  actor,
}: {
  community: Community;
  matchesTopic: boolean;
  blocked: boolean;
  actor: { id: string; name: string };
}) {
  const navigate = useNavigate();

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          {c.category}
        </span>
        {matchesTopic && (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            Combina com a sua área
          </span>
        )}
        <span className="rounded-full bg-warning/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          {c.status === "pendente" ? "Nova comunidade" : "Vaga de profissional"}
        </span>
      </div>

      <h2 className="mt-3 font-display text-xl font-bold text-foreground">{c.name}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
      {c.objective && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Objetivo: </span>
          {c.objective}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <AdminPerson
            label="Admin usuário"
            userId={c.adminUserId}
            name={c.adminUserName}
            vacantText="Aguardando indicação"
          />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-4 w-4 text-accent" /> {c.members.length} membros
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              disabled={blocked}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Aceitar ser admin
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ser admin profissional de {c.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Você passa a administrar esta comunidade junto com{" "}
                {c.adminUserName ?? "o admin usuário"}. Cada profissional administra uma comunidade
                por vez, e ao deixar a administração você sai da comunidade e ela fica suspensa até
                outro profissional aceitar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Agora não</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  try {
                    acceptProfessionalInvite(c.id, actor);
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Não foi possível aceitar o convite.",
                    );
                    return;
                  }
                  toast.success("Você agora é admin profissional desta comunidade!");
                  navigate({ to: "/comunidades/$slug", params: { slug: c.slug } });
                }}
              >
                Aceitar ser admin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
