import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Largura das telas no computador: usa a tela toda (com um teto para monitores gigantes). */
export const PAGE_CONTAINER = "mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8";

/** Cartão de um painel lateral: título em caixa-alta pequena e o conteúdo logo abaixo. */
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border/80 bg-card p-5 shadow-xs ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Classes completas (e não montadas por pedaços) para o Tailwind enxergá-las.
const GRID_BOTH =
  "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 min-[1440px]:grid-cols-[300px_minmax(0,1fr)_320px]";
const GRID_RIGHT = "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8";
const GRID_LEFT =
  "min-[1440px]:grid min-[1440px]:grid-cols-[300px_minmax(0,1fr)] min-[1440px]:gap-8";

/** Grade de cards do miolo: 1 coluna no celular, 2 no tablet/notebook, 3 em monitores grandes. */
export const CARD_GRID = "grid gap-5 sm:grid-cols-2 min-[1700px]:grid-cols-3";

/** Coluna lateral que acompanha a rolagem da página. */
export const STICKY_COLUMN =
  "no-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto";

/**
 * Três colunas no computador: `left` (só a partir de 1440px), conteúdo e `right`.
 * No celular e no tablet só o conteúdo aparece. As laterais acompanham a rolagem.
 */
export function PageColumns({
  left,
  right,
  children,
  className,
}: {
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const grid = left && right ? GRID_BOTH : right ? GRID_RIGHT : left ? GRID_LEFT : "";
  return (
    <div className={cn(grid, className)}>
      {left && (
        <div className="hidden min-[1440px]:block">
          <div className={STICKY_COLUMN}>{left}</div>
        </div>
      )}
      <div className="min-w-0">{children}</div>
      {right && (
        <div className="hidden lg:block">
          <div className={STICKY_COLUMN}>{right}</div>
        </div>
      )}
    </div>
  );
}
