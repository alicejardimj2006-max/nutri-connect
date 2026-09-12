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
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { PostCard, ChallengeCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";

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
  const { weeklyTheme, posts, challenges, hydrated } = useCommunity();

  const themeRecipes = posts.filter((p) => p.type === "receita");
  const linkedChallenge = challenges.find((c) => c.themeId === weeklyTheme?.id) || challenges[0];

  const pastThemes = [
    {
      title: "Desvendando Rótulos e Ingredientes",
      week: "Semana de 01 a 07 de Setembro",
      summary:
        "Conversamos sobre como ler a lista de ingredientes sem medo e identificar armadilhas da indústria.",
      recipesCount: 14,
      reflectionsCount: 86,
    },
    {
      title: "Café da Manhã que Sustenta",
      week: "Semana de 25 a 31 de Agosto",
      summary:
        "Trocas sobre combinações de fibras e proteínas para começar o dia com energia estável.",
      recipesCount: 22,
      reflectionsCount: 110,
    },
    {
      title: "Comer com Atenção Plena",
      week: "Semana de 18 a 24 de Agosto",
      summary:
        "Práticas de respiração e observação de sinais de saciedade à mesa sem telas por perto.",
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
            Carregando o tema da semana…
          </div>
        ) : (
          <div className="space-y-12">
            {/* Bloco Principal do Tema - Editorial */}
            <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-card shadow-card flex flex-col">
              <div className="h-64 sm:h-80 w-full relative">
                <img
                  src="/images/themes/fresh-ingredients.jpg"
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
                        Pergunta da Semana
                      </h3>
                      <p className="text-lg font-semibold text-foreground italic">
                        “{weeklyTheme.questionOfTheWeek}”
                      </p>

                      {/* Placeholder for the poll (Enquete) */}
                      {weeklyTheme.poll && (
                        <div className="mt-6 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Vote para responder:
                          </p>
                          {weeklyTheme.poll.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="relative flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 cursor-pointer transition"
                            >
                              <span className="text-sm font-medium text-foreground relative z-10">
                                {opt.label}
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground relative z-10">
                                {opt.votes} votos
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
                              <span>Deixe seu relato no Espaço de Hoje</span>
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
                    Desafio desta Semana
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
                      Receitas Inspiradas no Tema
                    </h3>
                  </div>
                  <Link
                    to="/receitas"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ver todas as receitas
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
                  Acervo de Temas Anteriores
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Revisite os aprendizados e conversas de semanas passadas para inspirar sua rotina.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {pastThemes.map((t, index) => {
                  const cover =
                    index === 0
                      ? "/images/themes/reading-labels.jpg"
                      : index === 1
                        ? "/images/recipes/oatmeal.jpg"
                        : "/images/communities/friends-dinner.jpg";

                  return (
                    <div
                      key={t.title}
                      className="rounded-2xl border border-border bg-card shadow-xs transition hover:shadow-md overflow-hidden flex flex-col"
                    >
                      <div className="h-32 w-full relative">
                        <img
                          src={cover}
                          alt={t.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <span className="text-[10px] font-bold text-white/90 drop-shadow-md">
                            {t.week}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h4 className="text-sm font-bold font-display text-foreground mb-2">
                          {t.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                          {t.summary}
                        </p>
                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span>🥗 {t.recipesCount} receitas</span>
                          <span>💬 {t.reflectionsCount} relatos</span>
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

      <SiteFooter />
    </div>
  );
}
