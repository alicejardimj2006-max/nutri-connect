import { useEffect, useRef, useState } from "react";
import { ArrowUp, Volume2 } from "lucide-react";
import { useAppearance } from "@/hooks/use-appearance";
import { useI18n } from "@/hooks/use-i18n";
import { pickName } from "@/lib/appearance-data";

/** Faixa que acompanha o mouse e escurece o resto da tela (guia de leitura). */
function ReadingGuide() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const y = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
      if (bar.current) bar.current.style.transform = `translateY(${y - 28}px)`;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);
  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] h-14 w-full"
      style={{ boxShadow: "0 0 0 100vmax rgb(0 0 0 / 0.38)", transform: "translateY(-200px)" }}
    />
  );
}

/** Botão "Ouvir" ao selecionar um texto (voz do navegador, no idioma do site). */
function SpeakSelection() {
  const { locale } = useI18n();
  const [pos, setPos] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const onSelect = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!sel || sel.rangeCount === 0 || text.length < 2) return setPos(null);
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top, text: text.slice(0, 3000) });
    };
    document.addEventListener("selectionchange", onSelect);
    return () => document.removeEventListener("selectionchange", onSelect);
  }, []);

  if (!pos || typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const speak = () => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(pos.text);
    utter.lang = locale;
    window.speechSynthesis.speak(utter);
  };

  return (
    <button
      type="button"
      // O mousedown não pode desfazer a seleção antes do clique.
      onMouseDown={(e) => e.preventDefault()}
      onClick={speak}
      style={{ left: Math.max(8, pos.x - 40), top: Math.max(8, pos.y - 44) }}
      className="fixed z-[95] inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-card"
    >
      <Volume2 className="h-3.5 w-3.5" />
      {pickName(["Ouvir", "Listen", "Escuchar", "Écouter"], locale)}
    </button>
  );
}

/** Botão flutuante que leva ao topo da página, depois de rolar um pouco. */
function BackToTop() {
  const { locale } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  const label = pickName(
    ["Voltar ao topo", "Back to top", "Volver arriba", "Haut de page"],
    locale,
  );
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-40 grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground shadow-card transition hover:bg-accent/90 lg:bottom-6"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

/** Ferramentas de acessibilidade e conforto ligadas em Personalização. */
export function AccessibilityTools() {
  const { appearance: a } = useAppearance();
  return (
    <>
      {a.readingGuide && <ReadingGuide />}
      {a.speakSelection && <SpeakSelection />}
      {a.backToTop && <BackToTop />}
    </>
  );
}
