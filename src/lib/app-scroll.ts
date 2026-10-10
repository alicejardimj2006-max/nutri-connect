// Rolagem das telas internas: a página tem a altura da tela e quem rola é a área de conteúdo
// (<main data-app-main>, ver components/app-screen.tsx). No feed e nas páginas públicas quem rola
// continua sendo a janela. Estas funções funcionam nos dois casos.

export const APP_MAIN = "[data-app-main]";

/** A área que rola na página atual (ou null quando é a própria janela). */
export function appScroller(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(APP_MAIN);
}

/** Quanto a página atual já rolou. */
export function scrollTop(): number {
  const el = appScroller();
  return el ? el.scrollTop : typeof window === "undefined" ? 0 : window.scrollY;
}

export function scrollToTop(behavior: ScrollBehavior = "smooth") {
  (appScroller() ?? window).scrollTo({ top: 0, behavior });
}

/**
 * Avisa quando a página rola, seja a janela ou a área de conteúdo (o evento "scroll" não sobe
 * pela árvore, então ouvimos na fase de captura).
 */
export function onPageScroll(cb: () => void): () => void {
  const handler = (e: Event) => {
    const t = e.target;
    if (t === document || t === window || (t instanceof HTMLElement && t.matches(APP_MAIN))) cb();
  };
  document.addEventListener("scroll", handler, { capture: true, passive: true });
  return () => document.removeEventListener("scroll", handler, { capture: true });
}
