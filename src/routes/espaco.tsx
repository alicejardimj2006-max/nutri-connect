import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Compass, Sparkles } from "lucide-react";
import { AuthGateLoading, CHROME_HIDE_EVENT, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAppearance } from "@/hooks/use-appearance";
import { loadAppearance } from "@/lib/appearance";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";
import { EspacoLeftColumn, EspacoRightColumn } from "@/components/espaco-side-columns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Post } from "@/lib/community";
import { themeText } from "@/lib/social/feed";
import { useActiveTheme, useFeed, useFeedRealtime } from "@/lib/social/feed-queries";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";

// Duas páginas, cada uma separada da outra ao arrastar para o lado.
type PageId = "geral" | "tema";
// Filtros da página Geral: tudo, amigos, ou profissionais que a pessoa segue.
type Filter = "todos" | "amigos" | "seguindo";

const PAGES: { id: PageId; labelKey: DictKey }[] = [
  { id: "geral", labelKey: "espaco.tab.geral" },
  { id: "tema", labelKey: "weekly.badge" },
];

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

/** Navegação entre as duas páginas: parada no topo ao arrastar; sobe com a rolagem do feed. */
function PagesNav({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const { t } = useI18n();
  return (
    <div className="flex w-fit items-center gap-1 rounded-full border border-border/60 bg-card/90 p-1 shadow-soft backdrop-blur">
      {PAGES.map((page, index) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelect(index)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer",
            active === index
              ? "bg-secondary text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(page.labelKey)}
        </button>
      ))}
    </div>
  );
}

function EspacoDeHojePage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t, locale } = useI18n();
  const [activePage, setActivePage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [filter, setFilter] = useState<Filter>("todos");
  const [pageSize] = useState(() => loadAppearance().feedPageSize || DEFAULT_PAGE_SIZE);
  const [limit, setLimit] = useState(pageSize);
  const [themeLimit, setThemeLimit] = useState(pageSize);

  useEffect(() => {
    if (!carouselApi) return;
    setActivePage(carouselApi.selectedScrollSnap());
    const onSelect = () => setActivePage(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Os filtros fazem parte da página Geral (acompanham o feed ao arrastar para o lado) e flutuam no
  // alto dela: somem ao rolar para baixo e voltam ao rolar para cima (ou no topo).
  // O seletor de páginas fica parado no topo ao arrastar para o lado, mas sobe e some junto com a
  // rolagem do feed que está aberto.
  const [filtersVisible, setFiltersVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const geralRef = useRef<HTMLDivElement>(null);
  const temaRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  // Espaço igual (12px) entre a barra superior, o seletor de páginas, os filtros e o primeiro post:
  // a reserva no alto de cada página usa a altura real do seletor.
  const [navHeight, setNavHeight] = useState(38);

  // No celular, as barras de cima e de baixo recolhem ao rolar o feed para baixo (a logo fica
  // flutuando) e voltam ao rolar para cima. Como o feed rola por dentro, a janela não rola: o feed
  // avisa o cabeçalho pelo evento CHROME_HIDE_EVENT. O feed ocupa a tela toda, por baixo do cabeçalho.
  const [mobile, setMobile] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const chromeHidden = useRef(false);
  const chromeLast = useRef(0);
  const mobileRef = useRef(false);
  const setChrome = useCallback((hidden: boolean) => {
    if (chromeHidden.current === hidden) return;
    chromeHidden.current = hidden;
    window.dispatchEvent(new CustomEvent(CHROME_HIDE_EVENT, { detail: hidden }));
  }, []);
  const updateChrome = useCallback(
    (top: number) => {
      if (!mobileRef.current) return;
      const previous = chromeLast.current;
      if (top < 64) setChrome(false);
      else if (top > previous + 8) setChrome(true);
      else if (top < previous - 8) setChrome(false);
      if (Math.abs(top - previous) > 8) chromeLast.current = top;
    },
    [setChrome],
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      mobileRef.current = mq.matches;
      setMobile(mq.matches);
      if (!mq.matches) setChrome(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      setChrome(false);
    };
  }, [setChrome]);
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;
    const measure = () => setHeaderH(Math.round(header.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, [authHydrated, user]);
  const topOffset = mobile ? headerH : 0;
  useLayoutEffect(() => {
    const pill = navRef.current?.firstElementChild;
    if (!pill) return;
    const measure = () => setNavHeight(Math.round(pill.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pill);
    return () => observer.disconnect();
    // O seletor só existe depois que o login é conferido.
  }, [authHydrated, user]);
  const topGap = 12;
  const topPad = topOffset + topGap + navHeight + topGap;
  const moveNav = useCallback((top: number) => {
    const el = navRef.current;
    if (!el) return;
    el.style.transform = `translateY(${-Math.min(top, 96)}px)`;
    el.style.opacity = String(Math.max(0, 1 - top / 56));
    el.style.pointerEvents = top > 40 ? "none" : "";
  }, []);
  const handleGeralScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const previous = lastScrollTop.current;
    if (top <= 16) setFiltersVisible(true);
    else if (top > previous + 4) setFiltersVisible(false);
    else if (top < previous - 4) setFiltersVisible(true);
    lastScrollTop.current = top;
    moveNav(top);
    updateChrome(top);
  };
  const handleTemaScroll = (e: React.UIEvent<HTMLDivElement>) => {
    moveNav(e.currentTarget.scrollTop);
    updateChrome(e.currentTarget.scrollTop);
  };
  // Ao trocar de página, o seletor acompanha a rolagem da página que ficou aberta.
  useEffect(() => {
    const top = (activePage === 0 ? geralRef : temaRef).current?.scrollTop ?? 0;
    moveNav(top);
    chromeLast.current = top;
    if (top < 64) setChrome(false);
  }, [activePage, moveNav, setChrome]);

  // Só o feed rola: cada página ocupa a altura que a coluna central tem (medida ao vivo),
  // então rolar uma não mexe na outra e a janela fica parada.
  const pagesRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number>();
  const ready = authHydrated && !!user;
  useLayoutEffect(() => {
    const el = pagesRef.current;
    if (!ready || !el) return;
    const measure = () => setPageHeight(Math.max(320, el.clientHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  const { appearance } = useAppearance();
  const panels = appearance.sidePanels;
  const enabled = !!user;
  useFeedRealtime(user?.id);
  const geral = useFeed({ scope: filter, limit }, enabled);
  const theme = useActiveTheme(enabled);
  const themeFeed = useFeed(
    { scope: "tema", theme: theme.data?.id, limit: themeLimit },
    enabled && !!theme.data,
  );

  if (!authHydrated || !user) return <AuthGateLoading />;

  const geralPosts = geral.data ?? [];
  const themePosts = themeFeed.data ?? [];
  const text = theme.data ? themeText(theme.data, locale) : null;

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setLimit(pageSize);
  };
  const goToPage = (index: number) => carouselApi?.scrollTo(index);

  return (
    // Altura fixa da tela: a janela não rola. Só o feed (cada página) rola; as colunas
    // laterais não rolam: os cards são redistribuídos para caberem todos.
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <SiteHeader />

      <main
        // O feed vai até a borda da tela; o fim da lista já tem folga própria para a barra de baixo.
        data-no-bottom-pad
        className="flex min-h-0 w-full flex-1 px-4 sm:px-6 xl:px-8 2xl:px-14"
        style={{ marginTop: -topOffset }}
      >
        <div
          className={`grid h-full min-h-0 w-full gap-8 ${
            panels
              ? "lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(240px,1fr)_minmax(0,48rem)_minmax(240px,1fr)]"
              : "mx-auto max-w-3xl"
          }`}
        >
          {panels && (
            <div className="hidden h-full min-h-0 overflow-hidden py-6 xl:block">
              <EspacoLeftColumn />
            </div>
          )}

          {/* Feed centralizado, deslizável entre páginas (arraste para o lado no celular).
              Cada página é uma "tela" inteira, com um vão largo entre elas. */}
          <div
            ref={pagesRef}
            className="relative mx-auto h-full min-h-0 w-full min-w-0 max-w-3xl overflow-x-clip"
          >
            <div
              ref={navRef}
              className="pointer-events-none absolute inset-x-0 z-30 flex justify-center will-change-transform"
              style={{ top: topOffset + 12 }}
            >
              <div className="pointer-events-auto">
                <PagesNav active={activePage} onSelect={goToPage} />
              </div>
            </div>
            <Carousel setApi={setCarouselApi} opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-12">
                <CarouselItem className="pl-12">
                  <div
                    ref={geralRef}
                    onScroll={handleGeralScroll}
                    className="overflow-y-auto overscroll-contain px-2 pb-28 lg:pb-8"
                    style={{ height: pageHeight }}
                  >
                    {/* Espaçador (não é padding: o 'sticky' mede a partir da borda de dentro do padding). */}
                    <div className="shrink-0" style={{ height: topPad }} aria-hidden="true" />
                    {/* Filtros flutuantes: ficam no alto desta página, somem ao rolar para baixo. */}
                    <div
                      className="pointer-events-none sticky z-20 mb-3 flex justify-center"
                      style={{ top: topOffset + 12 }}
                    >
                      <div
                        className={cn(
                          "pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/60 bg-card/90 p-1 shadow-soft backdrop-blur transition duration-200",
                          !filtersVisible && "pointer-events-none -translate-y-[160%] opacity-0",
                        )}
                      >
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
                    </div>
                    <PostList
                      posts={geralPosts}
                      loading={geral.isLoading}
                      emptyMessage={t(EMPTY_FILTER_KEYS[filter])}
                      hasMore={geralPosts.length >= limit}
                      onMore={() => setLimit((n) => n + pageSize)}
                    />
                  </div>
                </CarouselItem>

                <CarouselItem className="pl-12">
                  <div
                    ref={temaRef}
                    onScroll={handleTemaScroll}
                    className="overflow-y-auto overscroll-contain px-2 pb-28 lg:pb-8"
                    style={{ height: pageHeight }}
                  >
                    {/* Espaçador (não é padding: o 'sticky' mede a partir da borda de dentro do padding). */}
                    <div className="shrink-0" style={{ height: topPad }} aria-hidden="true" />
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
                          <p className="mt-3 text-sm font-semibold text-foreground">
                            {text.question}
                          </p>
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
                  </div>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>

          {panels && (
            <div className="hidden h-full min-h-0 overflow-hidden py-6 lg:block">
              <EspacoRightColumn />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
