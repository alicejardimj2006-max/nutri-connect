import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, Compass, Sparkles } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-auth";
import { FeedShell, type FeedShellPage } from "@/components/feed-shell";
import { useAppearance } from "@/hooks/use-appearance";
import { loadAppearance } from "@/lib/appearance";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";
import { PushInviteCard } from "@/components/push-settings";
import { EspacoLeftColumn, EspacoRightColumn } from "@/components/espaco-side-columns";
import { themeText } from "@/lib/social/feed";
import { useActiveTheme, useFeedRealtime, useInfiniteFeed } from "@/lib/social/feed-queries";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";

// Filtros da página Geral: tudo, amigos, ou profissionais que a pessoa segue.
type Filter = "todos" | "amigos" | "seguindo";

const FILTERS: { id: Filter; labelKey: DictKey }[] = [
  { id: "todos", labelKey: "espaco.filter.all" },
  { id: "amigos", labelKey: "espaco.tab.amigos" },
  { id: "seguindo", labelKey: "espaco.tab.profissionais" },
];

const EMPTY_FILTER_KEYS: Record<Filter, DictKey> = {
  todos: "espaco.empty.geral",
  amigos: "espaco.empty.amigos",
  seguindo: "espaco.empty.profissionais",
};

const DEFAULT_PAGE_SIZE = 20;

export const Route = createFileRoute("/espaco")({
  head: () => ({
    meta: [
      { title: "Espaço de Hoje | NutriConnect" },
      {
        name: "description",
        content: "Receitas e experiências compartilhadas pela comunidade NutriConnect.",
      },
      { property: "og:title", content: "Espaço de Hoje | NutriConnect" },
      {
        property: "og:description",
        content: "Acompanhe o feed diário da comunidade NutriConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EspacoDeHojePage,
});

function EmptyState({ message }: { message: string }) {
  const { t } = useI18n();
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center max-w-lg mx-auto">
      <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
      <p className="text-base text-muted-foreground font-medium mb-6">{message}</p>
      <ShareModal
        triggerButton={
          <button className="rounded-full bg-secondary border border-border px-6 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition">
            {t("espaco.firstPost")}
          </button>
        }
      />
    </div>
  );
}

/** Contêiner que rola a página do feed (cada página do FeedShell rola por dentro). */
function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return null;
}

/**
 * Pede a próxima página quando o fim da lista chega perto (antes de a pessoa alcançá-lo).
 * O observador é refeito a cada página carregada: se o fim continuar à vista, pede outra.
 */
function LoadMoreTrigger({ onReach, pageCount }: { onReach: () => void; pageCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onReachRef = useRef(onReach);
  useEffect(() => {
    onReachRef.current = onReach;
  }, [onReach]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onReachRef.current();
      },
      { root: scrollParent(el), rootMargin: "0px 0px 1200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageCount]);
  return <div ref={ref} className="h-px" aria-hidden="true" />;
}

type InfiniteFeed = ReturnType<typeof useInfiniteFeed>;

function PostList({ feed, emptyMessage }: { feed: InfiniteFeed; emptyMessage: string }) {
  const { t } = useI18n();
  const { query, posts } = feed;
  if (query.isLoading && posts.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">{t("espaco.loading")}</div>
    );
  }
  if (posts.length === 0) return <EmptyState message={emptyMessage} />;
  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage && !query.isFetchNextPageError) {
      void query.fetchNextPage();
    }
  };
  return (
    <>
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {query.hasNextPage && (
        <LoadMoreTrigger onReach={loadMore} pageCount={query.data?.pages.length ?? 0} />
      )}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        {query.isFetchingNextPage ? (
          t("espaco.loadingMore")
        ) : query.isFetchNextPageError ? (
          // Deu erro ao buscar a próxima página: a pessoa tenta de novo pelo botão.
          <button
            type="button"
            onClick={() => void query.fetchNextPage()}
            className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary cursor-pointer"
          >
            {t("espaco.loadMore")}
          </button>
        ) : (
          !query.hasNextPage && t("espaco.end")
        )}
      </div>
    </>
  );
}

/**
 * Aviso flutuante de publicações novas: ao tocar, o feed volta ao topo e recarrega. Vai para o
 * <body> porque o carrossel do FeedShell usa transform, que prenderia o `fixed` dentro dele.
 */
function NewPostsButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      className="fixed left-1/2 top-24 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-soft transition hover:brightness-105 cursor-pointer"
    >
      <ArrowUp className="h-3.5 w-3.5" /> {t("espaco.newPosts")}
    </button>,
    document.body,
  );
}

function EspacoDeHojePage() {
  const { user } = useRequireAuth();
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<Filter>("todos");
  const [pageSize] = useState(() => loadAppearance().feedPageSize || DEFAULT_PAGE_SIZE);
  const { appearance } = useAppearance();
  const enabled = !!user;
  const [hasNew, setHasNew] = useState(false);
  const onNewPost = useCallback(() => setHasNew(true), []);
  useFeedRealtime(user?.id, onNewPost);
  // Geral, Amigos e Profissionais: na ordem do algoritmo (últimos 7 dias), depois por data.
  const geralFeed = useInfiniteFeed({ scope: filter, limit: pageSize }, true, enabled);
  // Aba Profissionais: quem a pessoa segue; se nenhum deles publicou ainda, os profissionais em geral.
  const prosFallback =
    filter === "seguindo" && geralFeed.query.isSuccess && geralFeed.posts.length === 0;
  const prosFeed = useInfiniteFeed(
    { scope: "profissionais", limit: pageSize },
    true,
    enabled && prosFallback,
  );
  const geral = prosFallback ? prosFeed : geralFeed;
  const theme = useActiveTheme(enabled);
  // Tema da Semana: infinito, mas por ordem de data.
  const themeFeed = useInfiniteFeed(
    { scope: "tema", theme: theme.data?.id, limit: pageSize },
    false,
    enabled && !!theme.data,
  );
  const listRef = useRef<HTMLDivElement>(null);

  const text = theme.data ? themeText(theme.data, locale) : null;

  const showNewPosts = () => {
    setHasNew(false);
    scrollParent(listRef.current)?.scrollTo({ top: 0, behavior: "smooth" });
    void geral.restart();
    if (theme.data) void themeFeed.restart();
  };

  const filters = (
    <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/60 bg-card/90 p-1 shadow-soft backdrop-blur">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          aria-pressed={filter === f.id}
          onClick={() => setFilter(f.id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer",
            filter === f.id
              ? "bg-accent text-accent-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(f.labelKey)}
        </button>
      ))}
    </div>
  );

  const pages: FeedShellPage[] = [
    {
      id: "geral",
      label: t("espaco.tab.geral"),
      toolbar: filters,
      content: (
        <div ref={listRef}>
          {hasNew && <NewPostsButton onClick={showNewPosts} />}
          <PushInviteCard />
          <PostList feed={geral} emptyMessage={t(EMPTY_FILTER_KEYS[filter])} />
        </div>
      ),
    },
    {
      id: "tema",
      label: t("weekly.badge"),
      content: (
        <>
          {text ? (
            <div className="mb-6 rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-soft/60 to-card p-6 shadow-xs">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                <Sparkles className="h-4 w-4" /> {text.badge ?? t("weekly.badge")}
              </p>
              <h2 className="mt-2 text-xl font-extrabold font-display text-foreground">
                {text.title}
              </h2>
              {text.description && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                  {text.description}
                </p>
              )}
              {text.question && (
                <p className="mt-3 text-sm font-semibold text-foreground">{text.question}</p>
              )}
              <Link
                to="/tema-da-semana"
                className="mt-4 inline-block text-xs font-semibold text-accent hover:underline"
              >
                {t("espaco.theme.open")}
              </Link>
            </div>
          ) : (
            !theme.isLoading && (
              <p className="mb-6 rounded-2xl bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
                {t("espaco.theme.none")}
              </p>
            )
          )}
          {text && <PostList feed={themeFeed} emptyMessage={t("espaco.empty.tema")} />}
        </>
      ),
    },
  ];

  return (
    <FeedShell
      pages={pages}
      wings={
        appearance.sidePanels
          ? { left: <EspacoLeftColumn />, right: <EspacoRightColumn /> }
          : undefined
      }
    />
  );
}
