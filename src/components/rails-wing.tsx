import { Children, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MIN_COLUMN = 232; // largura mínima de um card, em px
const GAP = 20;

/**
 * Lateral sem rolagem: mede cada card e reparte todos pelas colunas que cabem na largura, usando o
 * mínimo de colunas em que tudo aparece inteiro na altura disponível (na ordem, de cima para baixo e
 * da esquerda para a direita). Só se nem com o máximo de colunas tudo couber, os últimos cards
 * (os menos importantes) ficam de fora em vez de ficarem cortados.
 */
export function Wing({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<number[][] | null>(null);
  const items = Children.toArray(children);

  const compute = useCallback(() => {
    const outer = outerRef.current;
    const probe = probeRef.current;
    if (!outer || !probe) return;
    const width = outer.clientWidth;
    const height = outer.clientHeight;
    if (width === 0 || height === 0) return;

    const maxCols = Math.max(1, Math.floor((width + GAP) / (MIN_COLUMN + GAP)));
    let best: { cols: number[][]; hidden: number; width: number } | null = null;

    for (let c = 1; c <= maxCols; c++) {
      const colWidth = (width - GAP * (c - 1)) / c;
      probe.style.width = `${colWidth}px`;
      const heights = Array.from(probe.children, (el) => (el as HTMLElement).offsetHeight);
      const cols: number[][] = [[]];
      let used = 0;
      let hidden = 0;
      heights.forEach((h, i) => {
        if (cols[cols.length - 1].length > 0 && used + GAP + h > height) {
          if (cols.length < c) {
            cols.push([]);
            used = 0;
          } else {
            hidden++;
            return;
          }
        }
        used += (cols[cols.length - 1].length > 0 ? GAP : 0) + h;
        cols[cols.length - 1].push(i);
      });
      if (!best || hidden < best.hidden) best = { cols, hidden, width: colWidth };
      if (hidden === 0) break;
    }

    if (!best) return;
    probe.style.width = `${best.width}px`;
    setLayout((prev) => (JSON.stringify(prev) === JSON.stringify(best!.cols) ? prev : best!.cols));
  }, []);

  useLayoutEffect(() => {
    compute();
    const observer = new ResizeObserver(compute);
    if (outerRef.current) observer.observe(outerRef.current);
    if (probeRef.current) observer.observe(probeRef.current);
    return () => observer.disconnect();
  }, [compute, items.length]);

  return (
    <div ref={outerRef} className="relative h-full min-h-0 overflow-hidden text-left">
      {/* Cópia invisível só para medir a altura de cada card. */}
      <div
        ref={probeRef}
        aria-hidden="true"
        inert
        className="pointer-events-none invisible absolute left-0 top-0 -z-10 flex flex-col gap-5"
      >
        {items.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>

      <div className="flex items-start gap-5">
        {(layout ?? [items.map((_, i) => i)]).map((column, c) => (
          <div key={c} className="min-w-0 flex-1 space-y-5">
            {column.map((i) => (
              <div key={i}>{items[i]}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
