import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Sparkles } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-auth";
import { FeedShell, type FeedShellPage } from "@/components/feed-shell";
import { useAppearance } from "@/hooks/use-appearance";
import { loadAppearance } from "@/lib/appearance";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";
import { EspacoLeftColumn, EspacoRightColumn } from "@/components/espaco-side-columns";
import type { Post } from "@/lib/community";
import { themeText } from "@/lib/social/feed";
import { useActiveTheme, useFeed, useFeedRealtime } from "@/lib/social/feed-queries";
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

function PostList({
  posts,
  loading,
  emptyMessage,
  hasMore,
  onMore,
}: {
  posts: Post[];
  loading: boolean;
  emptyMessage: string;
  hasMore: boolean;
  onMore: () => void;
}) {
  const { t } = useI18n();
  if (loading && posts.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">{t("espaco.loading")}</div>
    );
  }
  if (posts.length === 0) return <EmptyState message={emptyMessage} />;
  return (
    <>
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onMore}
            className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary cursor-pointer"
          >
            {t("espaco.loadMore")}
          </button>
        </div>
      )}
    </>
  );
}

function EspacoDeHojePage() {
  const { user } = useRequireAuth();
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<Filter>("todos");
  const [pageSize] = useState(() => loadAppearance().feedPageSize || DEFAULT_PAGE_SIZE);
  const [limit, setLimit] = useState(pageSize);
  const [themeLimit, setThemeLimit] = useState(pageSize);
  const { appearance } = useAppearance();
  const enabled = !!user;
  useFeedRealtime(user?.id);
  const geral = useFeed({ scope: filter, limit }, enabled);
  const theme = useActiveTheme(enabled);
  const themeFeed = useFeed(
    { scope: "tema", theme: theme.data?.id, limit: themeLimit },
    enabled && !!theme.data,
  );

  const geralPosts = geral.data ?? [];
  const themePosts = themeFeed.data ?? [];
  const text = theme.data ? themeText(theme.data, locale) : null;

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setLimit(pageSize);
  };

  const filters = (
    <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/60 bg-card/90 p-1 shadow-soft backdrop-blur">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          aria-pressed={filter === f.id}
          onClick={() => changeFilter(f.id)}
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
        <PostList
          posts={geralPosts}
          loading={geral.isLoading}
          emptyMessage={t(EMPTY_FILTER_KEYS[filter])}
          hasMore={geralPosts.length >= limit}
          onMore={() => setLimit((n) => n + pageSize)}
        />
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
              <h2 className="mt-2 text-xl font-extrabold font-display text-foreground">{text.title}</h2>
              {text.description && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{text.description}</p>
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
          {text && (
            <PostList
              posts={themePosts}
              loading={themeFeed.isLoading}
              emptyMessage={t("espaco.empty.tema")}
              hasMore={themePosts.length >= themeLimit}
              onMore={() => setThemeLimit((n) => n + pageSize)}
            />
          )}
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
