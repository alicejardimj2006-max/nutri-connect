import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const PADDING = {
  md: { top: "px-6 pt-6", bottom: "px-6 pb-6", toggle: "px-6 pt-3" },
  sm: { top: "px-5 pt-5", bottom: "px-5 pb-5", toggle: "px-5 pt-3" },
} as const;

/** Respiro, em px, entre o cartão e cada barra de navegação. */
const BAR_GAP = 16;
const MIN_HEIGHT = 240;

/** Altura livre entre a barra superior e a inferior (esta só existe no celular), menos o respiro. */
function availableHeight() {
  const top = document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
  const bottom = document.querySelector<HTMLElement>("[data-site-bottom-nav]")?.offsetHeight ?? 0;
  return Math.max(MIN_HEIGHT, window.innerHeight - top - bottom - BAR_GAP * 2);
}

interface PostCardFrameProps {
  /** Classes do cartão (borda, cantos, fundo, sombra). O espaçamento interno é do próprio invólucro. */
  className?: string;
  size?: keyof typeof PADDING;
  /** Sempre visível, abaixo do "Ver mais" (ex.: ações da publicação). */
  footer?: React.ReactNode;
  /** Conteúdo da publicação, limitado à altura da tela enquanto não expandido. */
  children: React.ReactNode;
}

/**
 * Cartão de publicação com altura máxima igual ao espaço entre as barras de navegação superior e inferior.
 * Quando o conteúdo ultrapassa esse limite, o cartão é cortado com um degradê e ganha "Ver mais".
 */
export function PostCardFrame({
  className = "",
  size = "md",
  footer,
  children,
}: PostCardFrameProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    const region = regionRef.current;
    const inner = innerRef.current;
    if (!article || !region || !inner) return;

    const observed = new Set<Element>();
    const observer = new ResizeObserver(() => measure());
    const watch = (el: Element | null) => {
      if (el && !observed.has(el)) {
        observed.add(el);
        observer.observe(el);
      }
    };

    // Altura que o cartão teria sem limite, ignorando o próprio botão para não oscilar no limiar.
    const measure = () => {
      const limit = availableHeight();
      const chrome =
        article.offsetHeight - region.offsetHeight - (toggleRef.current?.offsetHeight ?? 0);
      setMaxHeight(limit);
      setOverflowing(inner.offsetHeight + chrome > limit + 1);
      // A barra inferior pode aparecer depois (ex.: após o login); passa a ser observada quando surgir.
      watch(document.querySelector("[data-site-header]"));
      watch(document.querySelector("[data-site-bottom-nav]"));
    };

    watch(inner);
    watch(article);
    measure();
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // A barra inferior só existe com usuário logado, então a medição refaz quando ele muda.
  }, [userId]);

  const isExpanded = expanded;
  const clamped = !isExpanded && overflowing;
  const pad = PADDING[size];

  return (
    <article
      ref={articleRef}
      style={isExpanded ? undefined : { maxHeight: maxHeight ?? "calc(100dvh - 8rem)" }}
      className={`flex min-w-0 flex-col overflow-hidden ${className}`}
    >
      <div ref={regionRef} className={`relative min-h-0 overflow-hidden ${pad.top}`}>
        <div ref={innerRef} className="flow-root">
          {children}
        </div>
        {clamped && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>

      {overflowing && (
        <div ref={toggleRef} className={`shrink-0 ${pad.toggle}`}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex cursor-pointer items-center gap-1 text-xs font-bold text-accent hover:underline"
          >
            {expanded ? (
              <>
                Ver menos <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Ver mais <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      <div className={`shrink-0 ${pad.bottom}`}>{footer}</div>
    </article>
  );
}
