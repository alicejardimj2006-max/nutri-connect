// Casca das páginas de feed (Espaço de hoje e Explorar): cabeçalho, páginas que se arrastam para o
// lado, seletor de páginas fixo no topo, barra flutuante por página e recolhimento das barras do
// celular. Só o conteúdo de cada página rola, por dentro; a janela fica parada.
//
//  * o seletor de páginas fica parado na horizontal ao arrastar, mas sobe e some com a rolagem;
//  * a barra flutuante (`toolbar`) faz parte da página (acompanha o arrasto) e some ao rolar para
//    baixo / volta ao rolar para cima;
//  * no celular, a barra de cima e a de baixo recolhem ao rolar para baixo (a logo fica flutuando) e
//    voltam ao rolar para cima; o feed ocupa a tela toda, por baixo do cabeçalho.
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";
import { AuthGateLoading, CHROME_HIDE_EVENT, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export interface FeedShellPage {
  id: string;
  label: string;
  /** Barra flutuante do alto da página (some ao rolar para baixo). */
  toolbar?: ReactNode;
  content: ReactNode;
}

const TOP_GAP = 12;

function PagesNav({
  pages,
  active,
  onSelect,
}: {
  pages: FeedShellPage[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    refs.current[active]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [active]);
  return (
    <div className="no-scrollbar flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border/60 bg-card/90 p-1 shadow-soft backdrop-blur">
      {pages.map((page, index) => (
        <button
          key={page.id}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          onClick={() => onSelect(index)}
          className={cn(
            "shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition",
            active === index
              ? "bg-secondary text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {page.label}
        </button>
      ))}
    </div>
  );
}

export function FeedShell({
  pages,
  initialPage = 0,
  onPageChange,
  wings,
  columnClass = "max-w-3xl",
  sharedToolbar,
}: {
  pages: FeedShellPage[];
  /**
   * Barra flutuante que NÃO acompanha o arrasto entre páginas (ex.: a busca do Explorar): fica parada
   * logo abaixo do seletor, sobe com ele ao rolar e some ao rolar para baixo.
   */
  sharedToolbar?: ReactNode;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  /** Colunas laterais próprias da página (as de sempre, sem rolagem). */
  wings?: { left: ReactNode; right: ReactNode };
  /** Largura máxima da coluna do feed. */
  columnClass?: string;
}) {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const ready = authHydrated && !!user;
  const [activePage, setActivePage] = useState(initialPage);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      const index = carouselApi.selectedScrollSnap();
      setActivePage(index);
      onPageChange?.(index);
    };
    setActivePage(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, onPageChange]);

  // ── Celular: as barras recolhem com a rolagem do feed ───────────────────────────────────────
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
  }, [ready]);
  const topOffset = mobile ? headerH : 0;

  // ── Seletor de páginas e barra flutuante ────────────────────────────────────────────────────
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const scrollers = useRef<(HTMLDivElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(38);
  const navHeightRef = useRef(38);
  const sharedRef = useRef<HTMLDivElement>(null);
  const [sharedHeight, setSharedHeight] = useState(0);
  const hasSharedToolbar = !!sharedToolbar;
  useLayoutEffect(() => {
    const pill = sharedRef.current?.firstElementChild;
    if (!pill) {
      setSharedHeight(0);
      return;
    }
    const measure = () => setSharedHeight(Math.round(pill.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pill);
    return () => observer.disconnect();
  }, [ready, hasSharedToolbar]);
  useLayoutEffect(() => {
    const pill = navRef.current?.firstElementChild;
    if (!pill) return;
    const measure = () => {
      const h = Math.round(pill.getBoundingClientRect().height);
      navHeightRef.current = h;
      setNavHeight(h);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pill);
    return () => observer.disconnect();
  }, [ready]);
  // Espaço igual (12px) entre a barra superior, o seletor, a barra flutuante e o primeiro item.
  const topPad =
    topOffset + TOP_GAP + navHeight + TOP_GAP + (sharedToolbar ? sharedHeight + TOP_GAP : 0);

  const moveNav = useCallback((top: number) => {
    const el = navRef.current;
    if (!el) return;
    el.style.transform = `translateY(${-Math.min(top, 96)}px)`;
    el.style.opacity = String(Math.max(0, 1 - top / 56));
    el.style.pointerEvents = top > 40 ? "none" : "";
    // A barra compartilhada sobe junto com o seletor e para logo abaixo do cabeçalho.
    const shared = sharedRef.current;
    if (shared)
      shared.style.transform = `translateY(${-Math.min(top, navHeightRef.current + TOP_GAP)}px)`;
  }, []);
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const previous = lastScrollTop.current;
    if (top <= 16) setToolbarVisible(true);
    else if (top > previous + 4) setToolbarVisible(false);
    else if (top < previous - 4) setToolbarVisible(true);
    lastScrollTop.current = top;
    moveNav(top);
    updateChrome(top);
  };
  // Ao trocar de página, o seletor e as barras acompanham a rolagem da página que ficou aberta.
  useEffect(() => {
    const top = scrollers.current[activePage]?.scrollTop ?? 0;
    moveNav(top);
    chromeLast.current = top;
    lastScrollTop.current = top;
    setToolbarVisible(true);
    if (top < 64) setChrome(false);
  }, [activePage, moveNav, setChrome]);

  // ── Altura: cada página ocupa a altura da coluna (medida ao vivo) ───────────────────────────
  const pagesRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number>();
  useLayoutEffect(() => {
    const el = pagesRef.current;
    if (!ready || !el) return;
    const measure = () => setPageHeight(Math.max(320, el.clientHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  if (!ready) return <AuthGateLoading />;

  const goToPage = (index: number) => carouselApi?.scrollTo(index);
  const panels = !!wings;

  return (
    // Altura fixa da tela: a janela não rola. Só o conteúdo de cada página rola.
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <SiteHeader />

      <main
        // No celular o feed é uma camada fixa que vai de ponta a ponta da tela (por baixo do cabeçalho),
        // sem depender de nenhum espaço reservado em volta; o fim da lista já tem folga própria.
        data-no-bottom-pad
        className="flex min-h-0 w-full flex-1 px-4 max-lg:fixed max-lg:inset-0 sm:px-6 xl:px-8 2xl:px-14"
      >
        <div
          className={cn(
            "grid h-full min-h-0 w-full gap-8",
            panels
              ? "lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(240px,1fr)_minmax(0,48rem)_minmax(240px,1fr)]"
              : "mx-auto",
            !panels && columnClass,
          )}
        >
          {wings && (
            <div className="hidden h-full min-h-0 overflow-hidden py-6 xl:block">{wings.left}</div>
          )}

          <div
            ref={pagesRef}
            className={cn(
              "relative mx-auto h-full min-h-0 w-full min-w-0 overflow-x-clip",
              panels ? "max-w-3xl" : "max-w-none",
            )}
          >
            <div
              ref={navRef}
              className="pointer-events-none absolute inset-x-0 z-30 flex justify-center px-2 will-change-transform"
              style={{ top: topOffset + TOP_GAP }}
            >
              <div className="pointer-events-auto max-w-full">
                <PagesNav pages={pages} active={activePage} onSelect={goToPage} />
              </div>
            </div>

            {sharedToolbar && (
              <div
                ref={sharedRef}
                className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-2 will-change-transform"
                style={{ top: topOffset + TOP_GAP + navHeight + TOP_GAP }}
              >
                <div
                  className={cn(
                    "pointer-events-auto max-w-full transition duration-200",
                    !toolbarVisible && "pointer-events-none -translate-y-[200%] opacity-0",
                  )}
                >
                  {sharedToolbar}
                </div>
              </div>
            )}

            <Carousel
              setApi={setCarouselApi}
              opts={{ align: "start", startIndex: initialPage }}
              className="w-full"
            >
              <CarouselContent className="-ml-12">
                {pages.map((page, index) => (
                  <CarouselItem key={page.id} className="pl-12">
                    <div
                      ref={(el) => {
                        scrollers.current[index] = el;
                      }}
                      onScroll={handleScroll}
                      className="overflow-y-auto overscroll-contain px-2 pb-6 lg:pb-8"
                      style={{ height: pageHeight }}
                    >
                      {/* Espaçador (não é padding: o 'sticky' mede a partir da borda de dentro do padding). */}
                      <div className="shrink-0" style={{ height: topPad }} aria-hidden="true" />
                      {page.toolbar && (
                        <div
                          className="pointer-events-none sticky z-20 mb-3 flex justify-center"
                          style={{ top: topOffset + TOP_GAP }}
                        >
                          <div
                            className={cn(
                              "pointer-events-auto max-w-full transition duration-200",
                              !toolbarVisible &&
                                "pointer-events-none -translate-y-[160%] opacity-0",
                            )}
                          >
                            {page.toolbar}
                          </div>
                        </div>
                      )}
                      {page.content}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {wings && (
            <div className="hidden h-full min-h-0 overflow-hidden py-6 lg:block">{wings.right}</div>
          )}
        </div>
      </main>
    </div>
  );
}
