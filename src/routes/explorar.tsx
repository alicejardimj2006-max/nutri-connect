import { td } from "@/lib/i18n/data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Compass, Search, X } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-auth";
import { FeedShell, type FeedShellPage } from "@/components/feed-shell";
import { PostTile } from "@/components/post-tile";
import { PostModal } from "@/components/post-modal";
import { VerifiedBadge } from "@/components/person-chip";
import { RelationshipActions } from "@/components/relationship-actions";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { initials, type Post, type PostType } from "@/lib/community";
import { pickName, type Names } from "@/lib/appearance-data";
import { loadAppearance } from "@/lib/appearance";
import { trendingMix } from "@/lib/trending";
import { useFeed, useFeedRealtime, usePost } from "@/lib/social/feed-queries";
import { useSearchUsers } from "@/lib/social/queries";

export const Route = createFileRoute("/explorar")({
  validateSearch: (search: Record<string, unknown>): { tipo?: string; post?: string } => ({
    tipo: typeof search.tipo === "string" ? search.tipo : undefined,
    post: typeof search.post === "string" ? search.post : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explorar — NutriConnect" },
      {
        name: "description",
        content:
          "Descubra as publicações mais comentadas da rede NutriConnect: receitas, experiências e perguntas.",
      },
    ],
  }),
  component: ExplorarPage,
});

/** Páginas do Explorar: a primeira mistura tudo; as outras mostram só um tipo de post (e as pessoas). */
const PAGE_DEFS: { id: string; type?: PostType; label: Names }[] = [
  { id: "tudo", label: ["Geral", "General", "General", "Général"] },
  { id: "receita", type: "receita", label: ["Receitas", "Recipes", "Recetas", "Recettes"] },
  {
    id: "experiencia",
    type: "experiencia",
    label: ["Experiências", "Experiences", "Experiencias", "Expériences"],
  },
  { id: "pergunta", type: "pergunta", label: ["Perguntas", "Questions", "Preguntas", "Questions"] },
  { id: "conversa", type: "geral", label: ["Conversas", "Chats", "Conversaciones", "Discussions"] },
  { id: "pessoas", label: ["Pessoas", "People", "Personas", "Personnes"] },
];

const FETCH = 60;
const PEOPLE_PAGE = 20;
const ALIASES: Record<string, string> = {
  receitas: "receita",
  experiencias: "experiencia",
  perguntas: "pergunta",
};

function ExplorarPage() {
  const { user } = useRequireAuth();
  const { t, locale } = useI18n();
  const search = Route.useSearch();
  const initialId = ALIASES[search.tipo ?? ""] ?? search.tipo ?? "tudo";
  const initialPage = Math.max(
    0,
    PAGE_DEFS.findIndex((p) => p.id === initialId),
  );

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [visited, setVisited] = useState<Set<string>>(() => new Set([PAGE_DEFS[initialPage].id]));
  const [more, setMore] = useState<Record<string, number>>({});
  const [onlyPros, setOnlyPros] = useState(false);
  const [openId, setOpenId] = useState<string | null>(search.post ?? null);
  const [openPost, setOpenPost] = useState<Post | null>(null);
  // Mesma "sorte" durante toda a visita: a grade não embaralha a cada clique.
  const [seed] = useState(() => Math.random());
  const enabled = !!user;
  useFeedRealtime(user?.id);

  // Os temas do card lateral preenchem a busca.
  useEffect(() => {
    const onQuery = (e: Event) => setQuery(String((e as CustomEvent<string>).detail ?? ""));
    window.addEventListener("explore:query", onQuery);
    return () => window.removeEventListener("explore:query", onQuery);
  }, []);

  // A busca espera a pessoa parar de digitar.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Buscas de conteúdo alimentam o tema da semana; buscas por @pessoa não.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 3 || term.startsWith("@")) return;
    const timer = setTimeout(() => {
      supabase.rpc("log_search", { p_term: term }).then(({ error }) => {
        if (error) console.error("Erro ao registrar termo de busca:", error);
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [query]);

  const onPageChange = useCallback((index: number) => {
    const id = PAGE_DEFS[index]?.id;
    if (id) setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const limitFor = (id: string) => FETCH + (more[id] ?? 0);
  const q = debounced || undefined;
  const feeds = {
    tudo: useFeed(
      { scope: "todos", query: q, limit: limitFor("tudo") },
      enabled && visited.has("tudo"),
    ),
    receita: useFeed(
      { scope: "todos", type: "receita", query: q, limit: limitFor("receita") },
      enabled && visited.has("receita"),
    ),
    experiencia: useFeed(
      { scope: "todos", type: "experiencia", query: q, limit: limitFor("experiencia") },
      enabled && visited.has("experiencia"),
    ),
    pergunta: useFeed(
      { scope: "todos", type: "pergunta", query: q, limit: limitFor("pergunta") },
      enabled && visited.has("pergunta"),
    ),
    conversa: useFeed(
      { scope: "todos", type: "geral", query: q, limit: limitFor("conversa") },
      enabled && visited.has("conversa"),
    ),
  } as const;

  const people = useSearchUsers(
    {
      query: debounced,
      role: onlyPros ? "profissional" : undefined,
      limit: PEOPLE_PAGE + (more.pessoas ?? 0),
    },
    enabled && visited.has("pessoas"),
  );

  // Um link para um post (ex.: /receitas/<id>) abre o post em modal por cima da grade.
  const linked = usePost(openId && !openPost ? openId : undefined);
  const modalPost = openPost ?? (openId ? (linked.data ?? null) : null);
  const closeModal = () => {
    setOpenPost(null);
    setOpenId(null);
  };

  const mixed = useMemo(
    () => ({
      tudo: trendingMix(feeds.tudo.data ?? [], seed),
      receita: trendingMix(feeds.receita.data ?? [], seed),
      experiencia: trendingMix(feeds.experiencia.data ?? [], seed),
      pergunta: trendingMix(feeds.pergunta.data ?? [], seed),
      conversa: trendingMix(feeds.conversa.data ?? [], seed),
    }),
    [
      feeds.tudo.data,
      feeds.receita.data,
      feeds.experiencia.data,
      feeds.pergunta.data,
      feeds.conversa.data,
      seed,
    ],
  );

  const pageSize = useMemo(() => loadAppearance().feedPageSize || 20, []);

  const toolbar = (
    <label className="flex w-[min(22rem,calc(100vw-2rem))] items-center gap-2 rounded-full border border-border/60 bg-card/90 px-4 py-2 shadow-soft backdrop-blur focus-within:border-accent">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("explore.placeholder")}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        aria-label={t("common.search")}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="grid h-5 w-5 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground"
          aria-label={pickName(
            ["Limpar busca", "Clear search", "Borrar búsqueda", "Effacer la recherche"],
            locale,
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </label>
  );

  const grid = (id: string, posts: Post[], loading: boolean) => {
    const limit = limitFor(id);
    return (
      <>
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-secondary/50 sm:rounded-2xl"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border p-10 text-center">
            <Compass className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">
              {debounced ? `${t("explore.noResults")} “${debounced}”` : t("explore.noResults")}
            </p>
            {debounced && (
              <p className="mt-1 text-xs text-muted-foreground">{t("explore.noResultsHint")}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {posts.map((post) => (
              <PostTile key={post.id} post={post} onOpen={setOpenPost} />
            ))}
          </div>
        )}
        {posts.length >= limit && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMore((m) => ({ ...m, [id]: (m[id] ?? 0) + pageSize }))}
              className="cursor-pointer rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary"
            >
              {t("espaco.loadMore")}
            </button>
          </div>
        )}
      </>
    );
  };

  const peopleList = people.data ?? [];
  const peoplePage = (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-foreground">
          {debounced ? t("explore.people.results") : t("explore.people.suggested")}
        </h2>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
          <input
            type="checkbox"
            checked={onlyPros}
            onChange={(e) => setOnlyPros(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          {t("explore.people.onlyPros")}
        </label>
      </div>
      {people.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : peopleList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <Compass className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            {t("explore.noResults")} “{debounced}”
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {peopleList.map((person) => (
            <li key={person.id} className="rounded-2xl border border-border bg-card p-4 shadow-xs">
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
                      {t("explore.people.mutual").replace("{n}", String(person.mutual_friends))}
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
                viewerIsProfessional={!!user?.professional}
              />
            </li>
          ))}
        </ul>
      )}
      {peopleList.length >= PEOPLE_PAGE + (more.pessoas ?? 0) && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMore((m) => ({ ...m, pessoas: (m.pessoas ?? 0) + PEOPLE_PAGE }))}
            className="cursor-pointer rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary"
          >
            {t("explore.people.more")}
          </button>
        </div>
      )}
    </div>
  );

  const pages: FeedShellPage[] = PAGE_DEFS.map((def) => {
    const label = pickName(def.label, locale);
    if (def.id === "pessoas") return { id: def.id, label, content: peoplePage };
    const key = def.id as keyof typeof feeds;
    return {
      id: def.id,
      label,
      content: grid(def.id, mixed[key], feeds[key].isLoading),
    };
  });

  return (
    <>
      <FeedShell
        pages={pages}
        initialPage={initialPage}
        onPageChange={onPageChange}
        columnClass="max-w-4xl"
        sharedToolbar={toolbar}
      />
      <PostModal post={modalPost} onClose={closeModal} />
    </>
  );
}
