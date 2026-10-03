import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { railsFor } from "@/components/rails-pages";
import { useAppearance } from "@/hooks/use-appearance";
import { useAuth } from "@/hooks/use-auth";

const MIN_VIEWPORT = 1280;

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

const railScroll =
  "max-h-[var(--rail-h)] space-y-5 overflow-y-auto overscroll-contain pb-2 [scrollbar-width:thin]";

/**
 * Colunas laterais com cards próprios de cada página, em telas largas. O conteúdo da página recebe
 * margens do tamanho das colunas (ver `data-rails` em styles.css), então a tela inteira é usada e
 * os cards nunca encostam na borda: ficam afastados por uma margem. Cada coluna rola sozinha.
 */
export function SideRails() {
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const rails = useMemo(() => railsFor(pathname), [pathname]);
  const enabled = !!user && appearance.sidePanels && !!rails;
  const [layout, setLayout] = useState<(Metrics & { top: number }) | null>(null);

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
      setLayout((prev) =>
        prev && prev.width === m.width && prev.edge === m.edge && prev.gap === m.gap && prev.top === top
          ? prev
          : { ...m, top },
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

  if (!enabled || !rails || !layout) return null;

  const common = {
    top: layout.top,
    width: layout.width,
    "--rail-h": `calc(100dvh - ${layout.top + 20}px)`,
  } as React.CSSProperties;

  return (
    <>
      <aside
        aria-label="Atalhos e perfil"
        className="fixed z-30 text-left"
        style={{ ...common, left: layout.edge }}
      >
        <div className={railScroll}>{rails.left}</div>
      </aside>
      <aside
        aria-label="Sugestões"
        className="fixed z-30 text-left"
        style={{ ...common, right: layout.edge }}
      >
        <div className={railScroll}>{rails.right}</div>
      </aside>
    </>
  );
}
