import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Download, Maximize, Minimize, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NinaLive } from "@/components/nina-live";
import { useI18n } from "@/hooks/use-i18n";
import { LOCALES, isLocale } from "@/lib/i18n";
import { presentationCopy } from "@/lib/i18n/presentation";
import { StaticContext } from "./effects";
import { PRESENTERS, PresenterAvatar } from "./parts";
import { PART_STARTS, SLIDES, type SlideApi } from "./slides";

const SWIPE_MIN = 60;

/** Lê o slide inicial do endereço (#5 abre o quinto slide), para poder compartilhar um ponto exato. */
function slideFromHash(): number {
  const n = Number.parseInt(window.location.hash.replace("#", ""), 10);
  return Number.isFinite(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0;
}

export function PresentationDeck() {
  const { locale, setLocale } = useI18n();
  const copy = presentationCopy(locale);
  // A direção decide de que lado o slide entra na animação.
  const [{ index, direction }, setPosition] = useState({ index: 0, direction: 1 });
  const [fullscreen, setFullscreen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const scroller = useRef<HTMLElement>(null);
  const printRoot = useRef<HTMLDivElement>(null);

  const total = SLIDES.length;
  const slide = SLIDES[index];
  const presenter = PRESENTERS[slide.part];

  const goTo = useCallback((target: number) => {
    setPosition((cur) => {
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, target));
      return { index: clamped, direction: clamped >= cur.index ? 1 : -1 };
    });
  }, []);
  const next = useCallback(
    () =>
      setPosition((cur) => ({ index: Math.min(SLIDES.length - 1, cur.index + 1), direction: 1 })),
    [],
  );
  const prev = useCallback(
    () => setPosition((cur) => ({ index: Math.max(0, cur.index - 1), direction: -1 })),
    [],
  );
  const api: SlideApi = { next, goTo };

  useEffect(() => {
    goTo(slideFromHash());
  }, [goTo]);

  // Mantém o endereço em sincronia e volta cada slide ao topo.
  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`);
    scroller.current?.scrollTo({ top: 0 });
  }, [index]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case " ":
          // Espaço em um botão continua clicando nele.
          if (target?.closest("button, a")) return;
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(SLIDES.length - 1);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        default:
          // 1 a 5: vai direto para a parte de cada integrante.
          if (/^[1-9]$/.test(e.key) && Number(e.key) <= PART_STARTS.length) {
            e.preventDefault();
            goTo(PART_STARTS[Number(e.key) - 1]);
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, toggleFullscreen]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) next();
    else prev();
  };

  // Parallax: posição do ponteiro (-1 a 1) vira --mx/--my, lidas pelos enfeites e mockups.
  const parallaxFrame = useRef(0);
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    cancelAnimationFrame(parallaxFrame.current);
    parallaxFrame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (((clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--my", (((clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  };

  // PDF: monta todos os slides em páginas A4 e usa o "Salvar como PDF" do navegador (texto vetorial,
  // cores do tema preservadas). Espera as imagens carregarem antes de abrir a janela de impressão.
  useEffect(() => {
    if (!printing) return;
    let cancelled = false;
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done, { once: true });
    const images = Array.from(printRoot.current?.querySelectorAll("img") ?? []);
    void Promise.all(images.map((img) => img.decode().catch(() => {}))).then(() => {
      if (!cancelled) requestAnimationFrame(() => window.print());
    });
    return () => {
      cancelled = true;
      window.removeEventListener("afterprint", done);
    };
  }, [printing]);

  const counter = copy.ui.slideOf
    .replace("{n}", String(index + 1))
    .replace("{total}", String(total));

  return (
    <>
      <div
        className="deck-root fixed inset-0 z-50 flex h-[100dvh] flex-col bg-background print:hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Barra superior */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/90 px-3 backdrop-blur sm:px-5">
          <span className="font-logo-serif text-base font-bold tracking-tight sm:text-lg">
            Nutri<span className="text-accent">Connect</span>
          </span>
          <span
            key={slide.part}
            className="nc-pop hidden min-w-0 items-center gap-2 rounded-full bg-secondary py-1 pl-1 pr-3 text-xs font-medium md:inline-flex"
            title={copy.parts[slide.part].title}
          >
            <PresenterAvatar presenter={presenter} size="sm" />
            <span className="truncate">
              <span className="text-muted-foreground">
                {copy.ui.partOf
                  .replace("{n}", String(slide.part + 1))
                  .replace("{total}", String(PRESENTERS.length))}{" "}
                ·{" "}
              </span>
              <strong className="font-semibold" style={{ color: presenter.color }}>
                {presenter.name}
              </strong>
              {presenter.leader && (
                <span className="text-muted-foreground"> · {copy.ui.leader}</span>
              )}
            </span>
          </span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <label className="sr-only" htmlFor="deck-locale">
              {copy.ui.language}
            </label>
            <select
              id="deck-locale"
              value={locale}
              onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
              className="h-9 cursor-pointer rounded-full border border-border bg-card px-2 text-xs font-medium"
            >
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.flag} {l.id === "pt-BR" ? "PT" : l.id.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setPrinting(true)}
              disabled={printing}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-foreground transition hover:bg-secondary disabled:opacity-50"
              aria-label={copy.ui.exportPdf}
              title={copy.ui.exportPdf}
            >
              <Download className="h-4 w-4" />
              <span className="hidden text-xs font-medium lg:inline">{copy.ui.exportPdf}</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden h-9 w-9 place-items-center rounded-full text-foreground transition hover:bg-secondary sm:grid"
              aria-label={copy.ui.fullscreen}
              title={`${copy.ui.fullscreen} (F)`}
            >
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
            <Link
              to="/login"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold transition hover:bg-secondary"
              title={copy.ui.skip}
            >
              <X className="h-3.5 w-3.5 sm:hidden" />
              <span className="sr-only sm:not-sr-only">{copy.ui.skip}</span>
            </Link>
          </div>
        </header>

        {/* Slide atual */}
        <main
          ref={scroller}
          onPointerMove={onPointerMove}
          className="relative flex-1 overflow-y-auto overflow-x-hidden"
          aria-roledescription="slide"
          aria-label={counter}
        >
          <div
            key={`${slide.id}-${locale}`}
            className={`flex min-h-full flex-col ${direction === 1 ? "nc-slide-next" : "nc-slide-prev"}`}
          >
            {slide.render(copy, api)}
          </div>
        </main>

        {/* Rodapé: narradora, progresso e navegação */}
        <footer className="shrink-0 border-t border-border/70 bg-background/95 backdrop-blur">
          {/* Progresso agrupado por parte: cada integrante tem sua cor. */}
          <nav aria-label={copy.ui.goTo} className="flex gap-3 px-3 pt-2 sm:px-5">
            {PRESENTERS.map((p, part) => (
              <div
                key={p.name}
                className="flex min-w-0 gap-0.5"
                style={{ flexGrow: SLIDES.filter((s) => s.part === part).length }}
                title={`${part + 1} · ${copy.parts[part].title} · ${p.name}`}
              >
                {SLIDES.map((s, i) =>
                  s.part !== part ? null : (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`${copy.ui.goTo} ${i + 1}`}
                      aria-current={i === index ? "step" : undefined}
                      className="group flex h-4 flex-1 items-center"
                    >
                      <span
                        className={`w-full rounded-full transition-all ${
                          i === index ? "h-2.5" : "h-1.5"
                        } ${i > index ? "bg-secondary group-hover:bg-border" : ""}`}
                        style={
                          i <= index
                            ? { background: p.color, opacity: i < index ? 0.55 : 1 }
                            : undefined
                        }
                      />
                    </button>
                  ),
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-3 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 sm:px-5">
            <div className="flex min-h-[56px] min-w-0 flex-1 items-center gap-2" aria-live="polite">
              {/* A Nina 3D do rodapé fica sempre montada (uma só cena WebGL) e só troca de ação. */}
              <NinaLive
                framing="bust"
                action={slide.ninaAction ?? "talk"}
                live={!printing}
                className={`h-14 w-14 shrink-0 transition-opacity ${slide.hideNarrator ? "opacity-0" : ""}`}
              />
              {!slide.hideNarrator && (
                <>
                  <p
                    key={`say-${index}-${locale}`}
                    className="nc-rise relative line-clamp-3 rounded-2xl rounded-bl-sm border border-border bg-card px-3 py-2 text-xs leading-snug shadow-card sm:text-sm"
                  >
                    <span className="sr-only">{copy.ui.ninaSays}: </span>
                    {slide.nina(copy)}
                  </p>
                </>
              )}
            </div>
            <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:inline">
              {counter}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={prev}
                disabled={index === 0}
                aria-label={copy.ui.prev}
                title={copy.ui.prev}
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card transition hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={index === total - 1}
                aria-label={copy.ui.next}
                title={copy.ui.next}
                className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Versão para impressão / PDF: um slide por página */}
      {printing && (
        <StaticContext.Provider value={true}>
          <div ref={printRoot} className="deck-root deck-print hidden print:block">
            {SLIDES.map((s, i) => (
              <section key={s.id} className="deck-print-page">
                <div className="deck-print-inner">{s.render(copy, api)}</div>
                <footer className="deck-print-footer">
                  <span className="font-logo-serif font-bold">
                    Nutri<span className="text-accent">Connect</span>
                  </span>
                  <span className="truncate italic">“{s.nina(copy)}” — Nutri Nina</span>
                  <span className="tabular-nums">
                    {i + 1} / {total}
                  </span>
                </footer>
              </section>
            ))}
          </div>
        </StaticContext.Provider>
      )}
    </>
  );
}
