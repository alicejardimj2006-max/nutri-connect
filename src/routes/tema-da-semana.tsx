import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  HelpCircle,
  ChefHat,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Award,
} from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { PostCard, ChallengeCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";

export const Route = createFileRoute("/tema-da-semana")({
  head: () => ({
    meta: [
      { title: "Tema da Semana — O Pulso da Comunidade | NutriConnect" },
      {
        name: "description",
        content:
          "A cada semana, um assunto central une a comunidade: perguntas, enquetes, receitas e desafios para aprender e experimentar juntos.",
      },
    ],
  }),
  component: TemaDaSemanaPage,
});

function TemaDaSemanaPage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t } = useI18n();
  const { weeklyTheme, posts, challenges, hydrated } = useCommunity();

  if (!authHydrated || !user) return <AuthGateLoading />;

  const themeRecipes = posts.filter((p) => p.type === "receita");
  const linkedChallenge = challenges.find((c) => c.themeId === weeklyTheme?.id) || challenges[0];

  const pastThemes: {
    title: DictKey;
    week: DictKey;
    summary: DictKey;
    recipesCount: number;
    reflectionsCount: number;
  }[] = [
    {
      title: "theme.past1.title",
      week: "theme.past1.week",
      summary: "theme.past1.summary",
      recipesCount: 14,
      reflectionsCount: 86,
    },
    {
      title: "theme.past2.title",
      week: "theme.past2.week",
      summary: "theme.past2.summary",
      recipesCount: 22,
      reflectionsCount: 110,
    },
    {
      title: "theme.past3.title",
      week: "theme.past3.week",
      summary: "theme.past3.summary",
      recipesCount: 9,
      reflectionsCount: 94,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {!hydrated || !weeklyTheme ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t("theme.loading")}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Bloco Principal do Tema - Editorial */}
            <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-card shadow-card flex flex-col">
              <div className="h-64 sm:h-80 w-full relative">
                <img
                  src="/images/challenges/salad-bowl.jpg"
                  alt={weeklyTheme.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 pr-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground uppercase tracking-wider">
                      {weeklyTheme.badge}
                    </span>
                    <span className="text-xs font-medium text-white/90">
                      {weeklyTheme.currentWeek}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white leading-tight">
                    {weeklyTheme.title}
                  </h1>
                </div>
              </div>

              <div className="p-6 sm:p-10 bg-gradient-to-br from-card via-card to-accent-soft/30">
                <p className="text-base sm:text-lg text-foreground/90 leading-relaxed max-w-3xl">
                  {weeklyTheme.description}
                </p>

                {/* Destaque da Pergunta da Semana */}
                <div className="mt-8 rounded-2xl border border-accent/30 bg-card p-6 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HelpCircle className="w-24 h-24 text-accent" />
                  </div>
                  <div className="relative z-10 flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                      <HelpCircle className="h-6 w-6" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                        {t("weekly.questionOfWeek")}
                      </h3>
                      <p className="text-lg font-semibold text-foreground italic">
                        “{weeklyTheme.questionOfTheWeek}”
                      </p>

                      {/* Placeholder for the poll (Enquete) */}
                      {weeklyTheme.poll && (
                        <div className="mt-6 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            {t("theme.vote")}
                          </p>
                          {weeklyTheme.poll.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="relative flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 cursor-pointer transition"
                            >
                              <span className="text-sm font-medium text-foreground relative z-10">
                                {opt.text}
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground relative z-10">
                                {opt.votes} {t("theme.votes")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 flex items-center gap-3">
                        <ShareModal
                          triggerButton={
                            <button
                              type="button"
                              className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 shadow-sm flex items-center gap-1.5 transition hover:-translate-y-0.5"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>{t("theme.leaveStory")}</span>
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid: Desafio Vinculado + Receitas Recomendadas para a Semana */}
            <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
              {/* Desafio Vinculado */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-bold font-display text-foreground">
                    {t("theme.challengeOfWeek")}
                  </h3>
                </div>
                {linkedChallenge && <ChallengeCard challenge={linkedChallenge} />}
              </div>

              {/* Receitas Sugeridas do Tema */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-bold font-display text-foreground">
                      {t("theme.inspiredRecipes")}
                    </h3>
                  </div>
                  <Link
                    to="/receitas"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t("theme.seeAllRecipes")}
                  </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {themeRecipes.slice(0, 2).map((r) => (
                    <PostCard key={r.id} post={r} />
                  ))}
                </div>
              </div>
            </div>

            {/* Histórico de Temas Anteriores */}
            <section className="border-t border-border pt-10">
              <div className="mb-6">
                <h3 className="text-xl font-bold font-display text-foreground">
                  {t("theme.archive")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t("theme.archiveHint")}</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {pastThemes.map((pt, index) => {
                  const cover =
                    index === 0
                      ? "/images/hero/kitchen-prep.jpg"
                      : index === 1
                        ? "/images/recipes/default-recipe.jpg"
                        : "/images/communities/friends-dinner.jpg";

                  return (
                    <div
                      key={pt.title}
                      className="rounded-2xl border border-border bg-card shadow-xs transition hover:shadow-md overflow-hidden flex flex-col"
                    >
                      <div className="h-32 w-full relative">
                        <img
                          src={cover}
                          alt={t(pt.title)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <span className="text-[10px] font-bold text-white/90 drop-shadow-md">
                            {t(pt.week)}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h4 className="text-sm font-bold font-display text-foreground mb-2">
                          {t(pt.title)}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                          {t(pt.summary)}
                        </p>
                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span>
                            🥗 {pt.recipesCount} {t("theme.recipesCount")}
                          </span>
                          <span>
                            💬 {pt.reflectionsCount} {t("theme.storiesCount")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
