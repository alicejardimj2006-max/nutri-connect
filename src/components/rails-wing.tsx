import { Children, useEffect, useRef, useState, type ReactNode } from "react";

const MIN_COLUMN = 232; // largura mínima de um card, em px
const GAP = 20;

/**
 * Lateral que se adapta ao espaço: em telas muito largas os cards se distribuem em duas ou mais
 * colunas (cada card vai para a coluna seguinte, em rodízio), em vez de ficar uma coluna esticada.
 */
export function Wing({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setCols(Math.max(1, Math.floor((el.clientWidth + GAP) / (MIN_COLUMN + GAP))));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items = Children.toArray(children);
  const columns = Array.from({ length: cols }, (_, c) => items.filter((_, i) => i % cols === c));

  return (
    <div ref={ref} className="flex items-start gap-5 text-left">
      {columns.map((column, i) => (
        <div key={i} className="min-w-0 flex-1 space-y-5">
          {column}
        </div>
      ))}
    </div>
  );
}
