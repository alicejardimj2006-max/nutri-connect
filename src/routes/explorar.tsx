import { td } from "@/lib/i18n/data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ChefHat, Sparkles, Users, Award, Compass } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { PostCard, ChallengeCard, WeeklyThemeCard } from "@/components/community-cards";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { RelationshipActions } from "@/components/relationship-actions";
import { VerifiedBadge } from "@/components/person-chip";
import { initials } from "@/lib/community";
import { useSearchUsers } from "@/lib/social/queries";
import { CARD_GRID, PAGE_CONTAINER, PageColumns, Panel } from "@/components/page-layout";
import {
  MyCommunitiesPanel,
  PopularChallengesPanel,
  ProfessionalsPanel,
  TopRecipesPanel,
  WeeklyThemePanel,
} from "@/components/side-panels";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar — NutriConnect" },
      {
        name: "description",
        content:
          "Encontre receitas, relatos de experiências, desafios de hábitos e comunidades na rede NutriConnect.",
      },
    ],
  }),
  component: ExplorarPage,
});

type SearchTab = "tudo" | "receitas" | "experiencias" | "desafios" | "comunidades" | "pessoas";

const PEOPLE_PAGE = 20;

function ExplorarPage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t } = useI18n();
  const { posts, challenges, weeklyTheme, communities } = useCommunity();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("tudo");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [onlyPros, setOnlyPros] = useState(false);
  const [peopleLimit, setPeopleLimit] = useState(PEOPLE_PAGE);

  // A pesquisa de pessoas espera a pessoa parar de digitar (e volta à 1ª página).
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPeopleLimit(PEOPLE_PAGE);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const people = useSearchUsers(
    {
      query: debouncedQuery,
      role: onlyPros ? "profissional" : undefined,
      limit: peopleLimit,
    },
    !!user,
  );
  const peopleList = people.data ?? [];
  const peopleHasMore = peopleList.length >= peopleLimit;

  // Buscas de conteúdo alimentam o tema da semana; buscas de pessoas (aba Pessoas ou @) não.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 3 || activeTab === "pessoas" || term.startsWith("@")) return;

    const timer = setTimeout(() => {
      supabase.rpc("log_search", { p_term: term }).then(({ error }) => {
        if (error) console.error("Erro ao registrar termo de busca:", error);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  if (!authHydrated || !user) return <AuthGateLoading />;

  const q = query.toLowerCase().trim();

  // Filtragem
  const matchingPosts = posts.filter(
    (p) =>
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.text.toLowerCase().includes(q) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
      p.authorName.toLowerCase().includes(q),
  );

  const matchingRecipes = matchingPosts.filter((p) => p.type === "receita");
  const matchingExperiences = matchingPosts.filter((p) => p.type === "experiencia");

  const matchingChallenges = challenges.filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q),
  );

  const matchingCommunities = (communities || []).filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q),
  );

  const matchingTheme =
    weeklyTheme &&
    (!q ||
      weeklyTheme.title.toLowerCase().includes(q) ||
      weeklyTheme.description.toLowerCase().includes(q))
      ? [weeklyTheme]
      : [];
  const tabs: { id: SearchTab; label: string; count: number | string }[] = [
    {
      id: "tudo",
      label: t("explore.tab.all"),
      count:
        matchingPosts.length +
        matchingChallenges.length +
        matchingCommunities.length +
        matchingTheme.length,
    },
    { id: "receitas", label: t("explore.tab.recipes"), count: matchingRecipes.length },
    { id: "experiencias", label: t("explore.tab.experiences"), count: matchingExperiences.length },
    { id: "desafios", label: t("explore.tab.challenges"), count: matchingChallenges.length },
    { id: "comunidades", label: t("explore.tab.communities"), count: matchingCommunities.length },
    {
      id: "pessoas",
      label: t("explore.tab.people"),
      count: peopleHasMore ? `${peopleList.length}+` : peopleList.length,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className={`${PAGE_CONTAINER} flex-1 py-8`}>
        {/* Caixa de Busca Principal */}
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
            {t("explore.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("explore.subtitle")}</p>

          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("explore.placeholder")}
              className="w-full rounded-full border border-border bg-card pl-12 pr-4 py-3.5 text-sm text-foreground outline-none focus:border-accent shadow-card"
              autoFocus
            />
          </div>

          {/* Atalhos (antes no rodapé) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/receitas"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              <ChefHat className="h-3.5 w-3.5 text-accent" /> {t("explore.communityRecipes")}
            </Link>
            <Link
              to="/tema-da-semana"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" /> {t("weekly.badge")}
            </Link>
          </div>

          {/* Abas: a partir de 1440px ficam na coluna da esquerda */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pt-2 min-[1440px]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Resultados */}
        <PageColumns
          left={
            <>
              <Panel title={t("panel.browseBy")}>
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-pressed={activeTab === tab.id}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                          activeTab === tab.id
                            ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span>{tab.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
              <MyCommunitiesPanel />
            </>
          }
          right={
            <>
              <WeeklyThemePanel />
              <TopRecipesPanel />
              <PopularChallengesPanel />
              <ProfessionalsPanel />
            </>
          }
        >
          <div className="space-y-10">
            {/* Pessoas (pesquisa de pessoas: nome, @, acento e erro de digitação) */}
            {activeTab === "pessoas" && (
              <div className="mx-auto max-w-3xl">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span>
                      {debouncedQuery ? t("explore.people.results") : t("explore.people.suggested")}{" "}
                      ({peopleHasMore ? `${peopleList.length}+` : peopleList.length})
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOnlyPros((v) => !v)}
                    aria-pressed={onlyPros}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                      onlyPros
                        ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("explore.people.onlyPros")}
                  </button>
                </div>

                {people.isLoading ? (
                  <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                ) : peopleList.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border p-12 text-center">
                    <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base font-bold font-display text-foreground">
                      {t("explore.noResults")} “{query}”
                    </h3>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {peopleList.map((person) => (
                      <li
                        key={person.id}
                        className="rounded-2xl border border-border bg-card p-4 shadow-xs"
                      >
                        <Link
                          to="/perfil/$userId"
                          params={{ userId: person.id }}
                          className="flex items-start gap-3"
                        >
                          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground">
                            {person.avatar_url ? (
                              <img
                                src={person.avatar_url}
                                alt={person.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initials(person.name)
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                              <span className="truncate">{person.name}</span>
                              {person.verified && <VerifiedBadge />}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              @{person.username}
                              {person.verified && person.profession
                                ? ` · ${td(person.profession)} · ${person.council} ${person.registration}/${person.uf}`
                                : ""}
                            </span>
                            {person.mutual_friends > 0 && (
                              <span className="mt-0.5 block text-[11px] font-medium text-accent">
                                {t("explore.people.mutual").replace(
                                  "{n}",
                                  String(person.mutual_friends),
                                )}
                              </span>
                            )}
                            {person.is_private ? (
                              <span className="mt-1 block text-[11px] text-muted-foreground">
                                {t("explore.people.privateBio")}
                              </span>
                            ) : (
                              person.bio && (
                                <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                                  {person.bio}
                                </span>
                              )
                            )}
                          </span>
                        </Link>
                        <RelationshipActions
                          userId={person.id}
                          name={person.name}
                          relationship={person.relationship}
                          targetIsProfessional={person.verified}
                          viewerIsProfessional={!!user.professional}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {peopleHasMore && !people.isLoading && (
                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      disabled={people.isFetching}
                      onClick={() => setPeopleLimit((n) => n + PEOPLE_PAGE)}
                      className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary disabled:opacity-60 cursor-pointer"
                    >
                      {t("explore.people.more")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Seção de Tema da Semana */}
            {activeTab === "tudo" && matchingTheme.length > 0 && (
              <div className="mb-6">
                <WeeklyThemeCard theme={matchingTheme[0]} compact={true} />
              </div>
            )}

            {/* Seção de Receitas */}
            {(activeTab === "tudo" || activeTab === "receitas") && matchingRecipes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-2">
                  <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-accent" />
                    <span>
                      {t("explore.recipesFound")} ({matchingRecipes.length})
                    </span>
                  </h2>
                  {activeTab === "tudo" && (
                    <button
                      onClick={() => setActiveTab("receitas")}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      {t("profile.seeAll")}
                    </button>
                  )}
                </div>
                <div className={CARD_GRID}>
                  {matchingRecipes.slice(0, activeTab === "tudo" ? 3 : undefined).map((r) => (
                    <PostCard key={r.id} post={r} />
                  ))}
                </div>
              </div>
            )}

            {/* Seção de Experiências */}
            {(activeTab === "tudo" || activeTab === "experiencias") &&
              matchingExperiences.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-2">
                    <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>
                        {t("explore.experiencesFound")} ({matchingExperiences.length})
                      </span>
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {matchingExperiences
                      .slice(0, activeTab === "tudo" ? 2 : undefined)
                      .map((exp) => (
                        <PostCard key={exp.id} post={exp} />
                      ))}
                  </div>
                </div>
              )}

            {/* Seção de Desafios */}
            {(activeTab === "tudo" || activeTab === "desafios") &&
              matchingChallenges.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-2">
                    <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-accent" />
                      <span>
                        {t("explore.tab.challenges")} ({matchingChallenges.length})
                      </span>
                    </h2>
                  </div>
                  <div className={CARD_GRID}>
                    {matchingChallenges.map((c) => (
                      <ChallengeCard key={c.id} challenge={c} />
                    ))}
                  </div>
                </div>
              )}

            {/* Seção de Comunidades */}
            {(activeTab === "tudo" || activeTab === "comunidades") &&
              matchingCommunities.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-2">
                    <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span>
                        {t("explore.tab.communities")} ({matchingCommunities.length})
                      </span>
                    </h2>
                  </div>
                  <div className={CARD_GRID}>
                    {matchingCommunities.map((c) => (
                      <Link
                        key={c.id}
                        to="/comunidades/$slug"
                        params={{ slug: c.slug }}
                        className="block rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-sm"
                      >
                        <h3 className="text-base font-bold text-foreground font-display">
                          {c.name}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {c.description}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-foreground">
                            {td(c.category)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {c.members.length}{" "}
                            {c.members.length === 1
                              ? t("explore.member")
                              : t("comunidades.members")}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* Caso vazio */}
            {activeTab !== "pessoas" &&
              matchingPosts.length === 0 &&
              matchingChallenges.length === 0 &&
              matchingCommunities.length === 0 &&
              matchingTheme.length === 0 && (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center max-w-md mx-auto">
                  <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-bold font-display text-foreground">
                    {t("explore.noResults")} “{query}”
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{t("explore.noResultsHint")}</p>
                </div>
              )}
          </div>
        </PageColumns>
      </main>
    </div>
  );
}
