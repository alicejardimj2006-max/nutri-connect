// A "mesa" do perfil: os blocos numa grade de 12 colunas. Para quem visita, cada bloco aparece
// exatamente onde a pessoa deixou. No modo de edição, os blocos podem ser arrastados (alça),
// redimensionados (canto), editados (engrenagem) e removidos. No celular a grade vira uma coluna na
// mesma ordem (de cima para baixo) e a edição usa setas para subir e descer.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Settings2, Trash2 } from "lucide-react";
import { BlockView, BLOCK_INFO, minSize } from "@/components/profile-blocks";
import { useTr } from "@/components/appearance-editor";
import {
  GAP_PX,
  GRID_COLUMNS,
  ROW_PX,
  resolveCollisions,
  type Block,
} from "@/lib/profile-page";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

interface DragState {
  id: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  base: Block[];
  origin: Block;
}

export function ProfileCanvas({
  layout,
  editing = false,
  selectedId = null,
  onChange,
  onSelect,
  onEdit,
  onDelete,
}: {
  layout: Block[];
  editing?: boolean;
  selectedId?: string | null;
  onChange?: (layout: Block[]) => void;
  onSelect?: (id: string | null) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const tr = useTr();
  const mobile = useIsMobile();
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  const drag = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || 1000);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colStep = (width + GAP_PX) / GRID_COLUMNS;
  const rowStep = ROW_PX + GAP_PX;

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const d = drag.current;
      if (!d || !onChange) return;
      const dx = Math.round((clientX - d.startX) / colStep);
      const dy = Math.round((clientY - d.startY) / rowStep);
      const o = d.origin;
      const min = minSize(o.type);
      const moved: Block =
        d.mode === "move"
          ? {
              ...o,
              x: Math.min(GRID_COLUMNS - o.w, Math.max(0, o.x + dx)),
              y: Math.max(0, o.y + dy),
            }
          : {
              ...o,
              w: Math.min(GRID_COLUMNS - o.x, Math.max(min.w, o.w + dx)),
              h: Math.min(40, Math.max(min.h, o.h + dy)),
            };
      onChange(resolveCollisions(d.base.map((b) => (b.id === d.id ? moved : b)), d.id));
    },
    [colStep, rowStep, onChange],
  );

  const start = (e: React.PointerEvent, block: Block, mode: "move" | "resize") => {
    if (mobile || !editing) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: block.id, mode, startX: e.clientX, startY: e.clientY, base: layout, origin: block };
    setDragging(block.id);
    onSelect?.(block.id);
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    apply(e.clientX, e.clientY);
    // Perto da borda da tela, a página rola sozinha para dar para arrastar mais longe.
    if (e.clientY > window.innerHeight - 70) window.scrollBy({ top: 18 });
    else if (e.clientY < 90) window.scrollBy({ top: -18 });
  };
  const end = () => {
    drag.current = null;
    setDragging(null);
  };

  /** Teclado: setas movem o bloco; com Shift mudam o tamanho. */
  const keyMove = (e: React.KeyboardEvent, block: Block) => {
    if (!editing || !onChange) return;
    const dirs: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    const min = minSize(block.type);
    const next: Block = e.shiftKey
      ? {
          ...block,
          w: Math.min(GRID_COLUMNS - block.x, Math.max(min.w, block.w + d[0])),
          h: Math.min(40, Math.max(min.h, block.h + d[1])),
        }
      : {
          ...block,
          x: Math.min(GRID_COLUMNS - block.w, Math.max(0, block.x + d[0])),
          y: Math.max(0, block.y + d[1]),
        };
    onChange(resolveCollisions(layout.map((b) => (b.id === block.id ? next : b)), block.id));
  };

  /** No celular: troca de lugar com o vizinho de cima ou de baixo. */
  const shift = (block: Block, dir: -1 | 1) => {
    if (!onChange) return;
    const order = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const i = order.findIndex((b) => b.id === block.id);
    const other = order[i + dir];
    if (!other) return;
    const swapped = layout.map((b) =>
      b.id === block.id ? { ...b, x: other.x, y: other.y } : b.id === other.id ? { ...b, x: block.x, y: block.y } : b,
    );
    onChange(resolveCollisions(swapped, block.id));
  };

  const bottom = layout.reduce((m, b) => Math.max(m, b.y + b.h), 0);
  const rows = bottom + (editing && !mobile ? 5 : 0);
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);

  if (mobile) {
    return (
      <div ref={boxRef} className="flex flex-col gap-4">
        {sorted.map((block, i) => (
          <div
            key={block.id}
            className={`relative ${editing && selectedId === block.id ? "rounded-3xl ring-2 ring-accent" : ""}`}
            style={{ minHeight: block.h * ROW_PX + (block.h - 1) * GAP_PX, height: block.type === "posts" || block.type === "recipes" ? undefined : block.h * ROW_PX + (block.h - 1) * GAP_PX }}
            onClick={() => editing && onSelect?.(block.id)}
          >
            <BlockView block={block} />
            {editing && (
              <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-soft">
                <button type="button" disabled={i === 0} onClick={() => shift(block, -1)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary disabled:opacity-30" aria-label={tr(["Subir", "Move up", "Subir", "Monter"])}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" disabled={i === sorted.length - 1} onClick={() => shift(block, 1)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary disabled:opacity-30" aria-label={tr(["Descer", "Move down", "Bajar", "Descendre"])}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => onEdit?.(block.id)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary" aria-label={tr(["Editar", "Edit", "Editar", "Modifier"])}>
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => onDelete?.(block.id)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-destructive hover:bg-destructive/10" aria-label={tr(["Remover", "Remove", "Quitar", "Supprimer"])}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      className={`relative grid ${editing ? "rounded-3xl outline-dashed outline-1 outline-border/80 outline-offset-8" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
        gridAutoRows: `${ROW_PX}px`,
        gridTemplateRows: rows > 0 ? `repeat(${rows}, ${ROW_PX}px)` : undefined,
        gap: GAP_PX,
        // Linhas guia da grade, só enquanto edita.
        backgroundImage: editing
          ? `repeating-linear-gradient(to bottom, transparent 0 ${ROW_PX}px, color-mix(in srgb, var(--border) 45%, transparent) ${ROW_PX}px ${ROW_PX + 1}px, transparent ${ROW_PX + 1}px ${ROW_PX + GAP_PX}px)`
          : undefined,
      }}
      onClick={() => editing && onSelect?.(null)}
    >
      {layout.map((block) => {
        const selected = editing && selectedId === block.id;
        const isDragging = dragging === block.id;
        return (
          <div
            key={block.id}
            className={`group relative min-h-0 min-w-0 ${isDragging ? "z-20 opacity-90" : ""} ${
              selected ? "rounded-3xl ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
            } ${editing ? "transition-[box-shadow]" : ""}`}
            style={{ gridColumn: `${block.x + 1} / span ${block.w}`, gridRow: `${block.y + 1} / span ${block.h}` }}
          >
            <BlockView block={block} />
            {editing && (
              <>
                {/* Camada que segura os cliques (links e botões dos blocos não disparam ao editar). */}
                <div
                  className="absolute inset-0 z-10 cursor-pointer rounded-3xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(block.id);
                  }}
                  onDoubleClick={() => onEdit?.(block.id)}
                />
                <div
                  className={`absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-soft transition ${
                    selected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                  }`}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => start(e, block, "move")}
                    onPointerMove={move}
                    onPointerUp={end}
                    onPointerCancel={end}
                    onKeyDown={(e) => keyMove(e, block)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-7 cursor-grab touch-none items-center gap-1 rounded-full bg-secondary px-2 text-[11px] font-semibold text-foreground active:cursor-grabbing"
                    aria-label={tr(["Arrastar bloco (setas movem, Shift+setas muda o tamanho)", "Drag block (arrows move, Shift+arrows resize)", "Arrastrar bloque (flechas mueven, Shift+flechas cambia el tamaño)", "Glisser le bloc (flèches déplacent, Maj+flèches redimensionne)"])}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                    {tr(BLOCK_INFO[block.type].name)}
                  </button>
                  <button type="button" onClick={() => onEdit?.(block.id)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary" aria-label={tr(["Editar", "Edit", "Editar", "Modifier"])}>
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => onDelete?.(block.id)} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-destructive hover:bg-destructive/10" aria-label={tr(["Remover", "Remove", "Quitar", "Supprimer"])}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Canto para mudar o tamanho */}
                <button
                  type="button"
                  onPointerDown={(e) => start(e, block, "resize")}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={end}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute -bottom-2 -right-2 z-20 grid h-6 w-6 cursor-nwse-resize touch-none place-items-center rounded-full border border-border bg-accent text-accent-foreground shadow-soft transition ${
                    selected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  aria-label={tr(["Mudar o tamanho", "Resize", "Cambiar tamaño", "Redimensionner"])}
                >
                  <svg viewBox="0 0 10 10" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M2 8 8 2M5 8l3-3" />
                  </svg>
                </button>
                {(selected || isDragging) && (
                  <span className="absolute bottom-2 left-2 z-20 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-bold text-background">
                    {block.w}×{block.h}
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
