import { createContext, useContext, useEffect, useState } from "react";

// Efeitos visuais reutilizados pelos slides. Tudo que depende de tempo (contadores, cartas que viram)
// respeita o modo estático, usado na versão em PDF, e a preferência de reduzir movimento.

/** true quando o slide é renderizado para impressão/PDF: tudo aparece já no estado final. */
export const StaticContext = createContext(false);

export function useStatic() {
  return useContext(StaticContext);
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce"
  );
}

/** Espera `delay` ms e então vira true (ou já nasce true no modo estático / movimento reduzido). */
export function useDelayedFlag(delay: number) {
  const isStatic = useStatic();
  const [on, setOn] = useState(isStatic);
  useEffect(() => {
    if (isStatic || prefersReducedMotion()) {
      setOn(true);
      return;
    }
    const id = window.setTimeout(() => setOn(true), delay);
    return () => window.clearTimeout(id);
  }, [delay, isStatic]);
  return on;
}

/**
 * Anima o primeiro número de um texto de 0 até o valor final, mantendo o resto do texto e o
 * separador decimal ("61,4%", "68 %", "1 em 5").
 */
export function CountUp({
  value,
  duration = 1400,
  delay = 0,
}: {
  value: string;
  duration?: number;
  delay?: number;
}) {
  const isStatic = useStatic();
  const match = value.match(/\d+(?:[.,]\d+)?/);
  const [progress, setProgress] = useState(isStatic || !match ? 1 : 0);

  useEffect(() => {
    if (isStatic || !match || prefersReducedMotion()) {
      setProgress(1);
      return;
    }
    // Timer comum (não requestAnimationFrame): se a aba ficar em segundo plano, o número ainda
    // chega ao valor final.
    let interval = 0;
    const id = window.setTimeout(() => {
      const start = Date.now();
      interval = window.setInterval(() => {
        const t = Math.min(1, (Date.now() - start) / duration);
        setProgress(1 - Math.pow(1 - t, 3));
        if (t >= 1) window.clearInterval(interval);
      }, 30);
    }, delay);
    return () => {
      window.clearTimeout(id);
      window.clearInterval(interval);
    };
    // Reinicia só quando o texto muda (troca de idioma).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isStatic]);

  if (!match || match.index === undefined) return <>{value}</>;
  const raw = match[0];
  const sep = raw.includes(",") ? "," : ".";
  const decimals = raw.includes(sep) ? raw.split(sep)[1].length : 0;
  const target = Number.parseFloat(raw.replace(",", "."));
  const current = (target * progress).toFixed(decimals).replace(".", sep);
  return (
    <>
      {value.slice(0, match.index)}
      {current}
      {value.slice(match.index + raw.length)}
    </>
  );
}

// Posições fixas (em %) para os elementos flutuantes: previsíveis, sem sorteio, iguais no servidor.
const SLOTS = [
  { left: 4, top: 12, size: 34, depth: 18, delay: 0 },
  { left: 88, top: 8, size: 30, depth: 26, delay: 1.2 },
  { left: 78, top: 72, size: 38, depth: 14, delay: 0.6 },
  { left: 10, top: 78, size: 28, depth: 22, delay: 2.1 },
  { left: 48, top: 4, size: 24, depth: 30, delay: 1.7 },
  { left: 94, top: 42, size: 26, depth: 20, delay: 0.3 },
  { left: 2, top: 46, size: 26, depth: 28, delay: 2.6 },
  { left: 60, top: 88, size: 30, depth: 16, delay: 0.9 },
  { left: 30, top: 90, size: 22, depth: 24, delay: 3.1 },
  { left: 68, top: 20, size: 22, depth: 34, delay: 1.4 },
];

/**
 * Alimentos (emojis) flutuando pelo fundo, com leve parallax conforme o ponteiro. No celular ficam
 * mais discretos, porque dividem espaço com o texto.
 */
export function FoodField({
  items,
  count = items.length,
  className = "",
  opacity = 0.9,
}: {
  items: string[];
  count?: number;
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden max-sm:opacity-40 ${className}`}
    >
      {SLOTS.slice(0, count).map((s, i) => (
        <span
          key={i}
          className="nc-parallax absolute"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              "--depth": `${s.depth}px`,
              opacity,
            } as React.CSSProperties
          }
        >
          <span
            className="nc-floaty block drop-shadow-sm"
            style={{ fontSize: s.size, animationDelay: `${s.delay}s` }}
          >
            {items[i % items.length]}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Emojis que sobem e somem (curtidas, gotas, estrelas). */
export function RisingEmojis({ items, className = "" }: { items: string[]; className?: string }) {
  const lanes = [8, 22, 38, 54, 70, 86];
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {lanes.map((left, i) => (
        <span
          key={left}
          className="nc-rise-fade absolute bottom-0 text-2xl"
          style={{ left: `${left}%`, animationDelay: `${i * 0.75}s` }}
        >
          {items[i % items.length]}
        </span>
      ))}
    </div>
  );
}

/** Faixa de palavras rolando sem fim. */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div className="nc-marquee flex w-max gap-8 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            {item}
            <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Foto em moldura de polaroide, com fita adesiva opcional. */
export function Polaroid({
  src,
  caption,
  rotate = 0,
  className = "",
  imgClassName = "h-40 w-40",
  tape = true,
  style,
}: {
  src: string;
  caption?: React.ReactNode;
  rotate?: number;
  className?: string;
  imgClassName?: string;
  tape?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <figure
      className={`relative bg-[#fffdf8] p-2.5 pb-3 shadow-[0_18px_40px_-18px_rgb(52_45_36/0.55)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      {tape && <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />}
      <img src={src} alt="" className={`object-cover ${imgClassName}`} />
      {caption && (
        <figcaption className="mt-2 text-center font-display text-sm font-bold text-[#342d24]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute z-10 h-5 w-16 bg-[#f3e3b5]/80 shadow-sm backdrop-blur-[1px] ${className}`}
    />
  );
}

/** Sublinhado "desenhado à mão" que se traça ao aparecer. */
export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 20"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute left-0 w-full ${className}`}
    >
      <path
        d="M3 14 C 60 4, 120 4, 170 10 S 260 18, 297 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="nc-draw"
        style={{ "--nc-len": 320, animationDelay: "0.5s" } as React.CSSProperties}
      />
    </svg>
  );
}
