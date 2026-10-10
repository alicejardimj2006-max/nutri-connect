import { useRouterState } from "@tanstack/react-router";
import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRailsMoreSlot } from "@/components/app-screen";
import { railsFor, readRailOverrides } from "@/components/rails-pages";
import { useSiteConfig } from "@/lib/site-config";
import { useFeatures } from "@/lib/features";
import { useAppearance } from "@/hooks/use-appearance";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { planRails, type RailPlan } from "@/lib/rail-plan";

const MIN_VIEWPORT = 1280;
const GAP = 20;

interface Metrics {
  /** Largura de cada coluna. */
  width: number;
  /** Margem entre a coluna e a borda da tela. */
  edge: number;
  /** Espaço entre a coluna e o conteúdo. */
  gap: number;
}

/** Tamanhos das colunas por largura de tela: cresce junto com o monitor. */
function metricsFor(vw: number): Metrics | null {
  if (vw < MIN_VIEWPORT) return null;
  if (vw >= 2200) return { width: 380, edge: 56, gap: 40 };
  if (vw >= 1792) return { width: 340, edge: 40, gap: 32 };
  if (vw >= 1536) return { width: 300, edge: 32, gap: 28 };
  return { width: 264, edge: 24, gap: 24 };
}

/** Os cards de um lado (cada filho do fragmento declarado em rails-pages). */
function cardsOf(node: ReactNode): ReactNode[] {
  if (isValidElement(node) && node.type === Fragment) {
    return Children.toArray((node as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return Children.toArray(node);
}

/**
 * Colunas laterais com cards próprios de cada página, em telas largas. O conteúdo da página recebe
 * margens do tamanho das colunas (ver `data-rails` em styles.css), então a tela inteira é usada e
 * os cards nunca encostam na borda.
 *
 * As colunas NÃO rolam: os cards são medidos e redistribuídos. O que não cabe na coluna de origem vai
 * para a outra coluna se houver espaço; o que não coube em nenhuma delas aparece numa seção "Mais",
 * logo abaixo do conteúdo da página (nas telas internas, no fim da área que rola). Nada some.
 */
export function SideRails() {
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const { locale } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const railConfig = useSiteConfig("site_rails");
  const features = useFeatures();
  const featureKey = JSON.stringify(features);
  const rails = useMemo(
    () => railsFor(pathname, readRailOverrides(railConfig), features),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, railConfig, featureKey],
  );
  const enabled = !!user && appearance.sidePanels && !!rails;
  // Telas internas (a página não rola): a seção "Mais" vai para o fim da área de conteúdo.
  const moreSlot = useRailsMoreSlot();
  const [layout, setLayout] = useState<(Metrics & { top: number; height: number }) | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const off = () => {
      root.removeAttribute("data-rails");
      setLayout(null);
    };
    if (!enabled) {
      off();
      return;
    }

    const measure = () => {
      const m = metricsFor(window.innerWidth);
      if (!m) return off();
      root.style.setProperty("--rail-w", `${m.width}px`);
      root.style.setProperty("--rail-edge", `${m.edge}px`);
      root.style.setProperty("--rail-gap", `${m.gap}px`);
      root.setAttribute("data-rails", "on");
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const top = (header?.offsetHeight ?? 64) + 20;
      const height = Math.max(240, window.innerHeight - top - 20);
      setLayout((prev) =>
        prev &&
        prev.width === m.width &&
        prev.edge === m.edge &&
        prev.gap === m.gap &&
        prev.top === top &&
        prev.height === height
          ? prev
          : { ...m, top, height },
      );
    };

    measure();
    // O cabeçalho aparece depois da troca de rota.
    const timers = [150, 600].map((ms) => window.setTimeout(measure, ms));
    window.addEventListener("resize", measure);
    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("resize", measure);
      off();
    };
  }, [enabled, pathname]);

  const left = useMemo(() => (rails ? cardsOf(rails.left) : []), [rails]);
  const right = useMemo(() => (rails ? cardsOf(rails.right) : []), [rails]);
  const all = useMemo(() => [...left, ...right], [left, right]);

  const probeRef = useRef<HTMLDivElement>(null);
  const [plan, setPlan] = useState<RailPlan | null>(null);
  const height = layout?.height ?? 0;
  const width = layout?.width ?? 0;

  /** Mede cada card na largura da coluna e distribui sem passar da altura disponível. */
  const compute = useCallback(() => {
    const probe = probeRef.current;
    if (!probe || height === 0) return;
    const heights = Array.from(probe.children, (el) => (el as HTMLElement).offsetHeight);
    if (heights.length !== all.length) return;

    const next = planRails(heights, left.length, height, GAP);
    setPlan((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [all.length, height, left]);

  useLayoutEffect(() => {
    compute();
    const probe = probeRef.current;
    if (!probe) return;
    const observer = new ResizeObserver(compute);
    observer.observe(probe);
    return () => observer.disconnect();
  }, [compute, width, locale]);

  // Troca de página: recomeça sem plano antigo.
  useEffect(() => setPlan(null), [pathname]);

  if (!enabled || !rails || !layout) return null;

  const fallback: RailPlan = {
    left: left.map((_, i) => i),
    right: right.map((_, k) => left.length + k),
    rest: [],
  };
  const active = plan ?? fallback;
  const common = { top: layout.top, width: layout.width, height: layout.height } as const;
  const column = (indexes: number[]) => (
    <div className="flex flex-col" style={{ gap: GAP }}>
      {indexes.map((i) => (
        <div key={i}>{all[i]}</div>
      ))}
    </div>
  );

  return (
    <>
      {/* Cópia invisível só para medir a altura de cada card. */}
      <div
        ref={probeRef}
        aria-hidden="true"
        inert
        className="pointer-events-none invisible fixed -left-[9999px] top-0 -z-50 flex flex-col"
        style={{ width: layout.width, gap: GAP }}
      >
        {all.map((card, i) => (
          <div key={i}>{card}</div>
        ))}
      </div>

      <aside
        aria-label="Atalhos e perfil"
        className="fixed z-30 overflow-hidden text-left"
        style={{ ...common, left: layout.edge }}
      >
        {column(active.left)}
      </aside>
      <aside
        aria-label="Sugestões"
        className="fixed z-30 overflow-hidden text-left"
        style={{ ...common, right: layout.edge }}
      >
        {column(active.right)}
      </aside>

      {active.rest.length > 0 &&
        !rails.locked &&
        (moreSlot ? (
          // Dentro da área que rola, que já tem as margens das colunas.
          createPortal(<MoreSection cards={active.rest.map((i) => all[i])} />, moreSlot)
        ) : (
          <MoreSection
            cards={active.rest.map((i) => all[i])}
            // Mesmas margens do conteúdo da página: nunca fica por baixo das colunas laterais.
            paddingInline="calc(var(--rail-edge) + var(--rail-w) + var(--rail-gap))"
          />
        ))}
    </>
  );
}

/** Cards que não couberam nas colunas, logo abaixo do conteúdo. */
function MoreSection({ cards, paddingInline }: { cards: ReactNode[]; paddingInline?: string }) {
  return (
    <section aria-label="Mais" className="w-full pb-12 pt-2 text-left" style={{ paddingInline }}>
      <div
        className="grid items-start gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))" }}
      >
        {cards.map((card, i) => (
          <div key={i}>{card}</div>
        ))}
      </div>
    </section>
  );
}
