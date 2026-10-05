// A "mesa" do perfil: os blocos numa grade de 12 colunas. Para quem visita, cada bloco aparece
// exatamente onde a pessoa deixou. No modo de edição, os blocos podem ser arrastados (alça),
// redimensionados (canto), editados (engrenagem) e removidos. O bloco arrastado acompanha o cursor
// sem saltos e os outros deslizam até o novo lugar (mesmo jeito dos campos do modal de publicação).
// No celular a grade vira uma coluna na mesma ordem (de cima para baixo) e a edição usa setas.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Settings2, Trash2 } from "lucide-react";
import {
  AUTO_HEIGHT_TYPES,
  BlockView,
  BLOCK_INFO,
  minSize,
  useAutoHeight,
} from "@/components/profile-blocks";
import { useTr } from "@/components/appearance-editor";
import {
  GAP_PX,
  GRID_COLUMNS,
  ROW_PX,
  compactLayout,
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
  el: HTMLElement;
  /** Ponteiro no começo e agora (tela), e onde dentro do bloco ele segurou. */
  sx: number;
  sy: number;
  px: number;
  py: number;
  gx: number;
  gy: number;
  scrollY: number;
  startW: number;
  startH: number;
  base: Block[];
  origin: Block;
  /** Célula de destino atual (só recalcula o layout quando ela muda). */
  key: string;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const LIFT = "scale(1.02)";

export function ProfileCanvas({
  layout: layoutProp,
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
  // Blocos de publicações têm a altura das linhas de miniaturas (sem espaço sobrando).
  const autoHeight = useAutoHeight(width, mobile);
  // Fora da edição os blocos sobem até encostar uns nos outros (sem vãos entre eles).
  const sized = layoutProp.map(autoHeight);
  const layout = editing ? sized : compactLayout(sized);
  const drag = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const els = useRef(new Map<string, HTMLElement>());
  const snapshot = useRef<Map<HTMLElement, DOMRect> | null>(null);
  const raf = useRef<number | null>(null);

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

  /** Guarda onde cada bloco está agora, para os outros deslizarem quando o layout mudar. */
  const capture = () => {
    const rects = new Map<HTMLElement, DOMRect>();
    els.current.forEach((el) => rects.set(el, el.getBoundingClientRect()));
    snapshot.current = rects;
  };

  /** Mantém o bloco arrastado sob o cursor, mesmo depois que a grade o muda de lugar. */
  const placeDragged = () => {
    const d = drag.current;
    if (!d || d.mode !== "move") return;
    d.el.style.transform = "";
    const r = d.el.getBoundingClientRect();
    d.el.style.transform = `translate(${d.px - d.gx - r.left}px, ${d.py - d.gy - r.top}px) ${LIFT}`;
  };

  // Os outros blocos deslizam até o novo lugar quando o layout muda.
  useLayoutEffect(() => {
    const before = snapshot.current;
    snapshot.current = null;
    if (before) {
      els.current.forEach((el) => {
        const old = before.get(el);
        if (!old || drag.current?.el === el) return;
        const now = el.getBoundingClientRect();
        const dx = old.left - now.left;
        const dy = old.top - now.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.getAnimations().forEach((a) => a.cancel());
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          {
            duration: 300,
            easing: EASE,
          },
        );
      });
    }
    placeDragged();
  }, [layout]);

  /** Calcula a célula de destino a partir do ponteiro e atualiza o layout se ela mudou. */
  const evaluate = useCallback(() => {
    const d = drag.current;
    if (!d || !onChange) return;
    const dxPx = d.px - d.sx;
    const dyPx = d.py - d.sy + (window.scrollY - d.scrollY);
    const o = d.origin;
    const min = minSize(o.type);
    let moved: Block;
    if (d.mode === "move") {
      moved = {
        ...o,
        x: Math.min(GRID_COLUMNS - o.w, Math.max(0, o.x + Math.round(dxPx / colStep))),
        y: Math.max(0, o.y + Math.round(dyPx / rowStep)),
      };
    } else {
      // O tamanho segue o cursor ao pixel; a grade só muda quando passa de uma célula para outra.
      const minPx = (n: number, step: number, gap: number) => n * step - gap;
      d.el.style.width = `${Math.max(minPx(min.w, colStep, GAP_PX), d.startW + dxPx)}px`;
      if (!AUTO_HEIGHT_TYPES.includes(o.type)) {
        d.el.style.height = `${Math.max(minPx(min.h, rowStep, GAP_PX), d.startH + dyPx)}px`;
      }
      moved = {
        ...o,
        w: Math.min(
          GRID_COLUMNS - o.x,
          Math.max(min.w, Math.round((d.startW + GAP_PX + dxPx) / colStep)),
        ),
        h: AUTO_HEIGHT_TYPES.includes(o.type)
          ? o.h
          : Math.min(40, Math.max(min.h, Math.round((d.startH + GAP_PX + dyPx) / rowStep))),
      };
    }
    const key = d.mode === "move" ? `${moved.x},${moved.y}` : `${moved.w},${moved.h}`;
    if (key !== d.key) {
      d.key = key;
      capture();
      onChange(
        resolveCollisions(
          d.base.map((b) => (b.id === d.id ? moved : b)),
          d.id,
        ),
      );
    } else {
      placeDragged();
    }
  }, [colStep, rowStep, onChange]);

  /** Perto da borda da tela, a página rola sozinha enquanto o bloco é segurado. */
  const autoScroll = useCallback(() => {
    const d = drag.current;
    if (!d) {
      raf.current = null;
      return;
    }
    const edge = 90;
    let speed = 0;
    if (d.py > window.innerHeight - edge)
      speed = Math.min(22, (d.py - (window.innerHeight - edge)) / 3);
    else if (d.py < edge + 40) speed = -Math.min(22, (edge + 40 - d.py) / 3);
    if (speed !== 0) {
      window.scrollBy(0, speed);
      evaluate();
    }
    raf.current = requestAnimationFrame(autoScroll);
  }, [evaluate]);

  useEffect(() => () => void (raf.current && cancelAnimationFrame(raf.current)), []);

  const start = (e: React.PointerEvent, block: Block, mode: "move" | "resize") => {
    if (mobile || !editing) return;
    e.preventDefault();
    e.stopPropagation();
    const el = els.current.get(block.id);
    if (!el) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    el.getAnimations().forEach((a) => a.cancel());
    const r = el.getBoundingClientRect();
    drag.current = {
      id: block.id,
      mode,
      el,
      sx: e.clientX,
      sy: e.clientY,
      px: e.clientX,
      py: e.clientY,
      gx: e.clientX - r.left,
      gy: e.clientY - r.top,
      scrollY: window.scrollY,
      startW: r.width,
      startH: r.height,
      base: layout,
      origin: block,
      key: mode === "move" ? `${block.x},${block.y}` : `${block.w},${block.h}`,
    };
    el.style.transition = "none";
    el.style.zIndex = "30";
    if (mode === "move") el.style.transform = `${LIFT}`;
    document.body.style.userSelect = "none";
    setDragging(block.id);
    onSelect?.(block.id);
    raf.current = requestAnimationFrame(autoScroll);
  };

  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    d.px = e.clientX;
    d.py = e.clientY;
    evaluate();
  };

  const end = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    document.body.style.userSelect = "";
    const el = d.el;
    const cur = el.getBoundingClientRect();
    el.style.transition = "";
    el.style.zIndex = "";
    if (d.mode === "move") {
      el.style.transform = "";
      const nat = el.getBoundingClientRect();
      el.animate(
        [
          { transform: `translate(${cur.left - nat.left}px, ${cur.top - nat.top}px) ${LIFT}` },
          { transform: "none" },
        ],
        { duration: 220, easing: EASE },
      );
    } else {
      el.style.width = "";
      el.style.height = "";
      const nat = el.getBoundingClientRect();
      el.animate(
        [
          { width: `${cur.width}px`, height: `${cur.height}px` },
          { width: `${nat.width}px`, height: `${nat.height}px` },
        ],
        { duration: 200, easing: EASE },
      );
    }
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
    const dir = dirs[e.key];
    if (!dir) return;
    e.preventDefault();
    const min = minSize(block.type);
    const next: Block = e.shiftKey
      ? {
          ...block,
          w: Math.min(GRID_COLUMNS - block.x, Math.max(min.w, block.w + dir[0])),
          h: Math.min(40, Math.max(min.h, block.h + dir[1])),
        }
      : {
          ...block,
          x: Math.min(GRID_COLUMNS - block.w, Math.max(0, block.x + dir[0])),
          y: Math.max(0, block.y + dir[1]),
        };
    capture();
    onChange(
      resolveCollisions(
        layout.map((b) => (b.id === block.id ? next : b)),
        block.id,
      ),
    );
  };

  /** No celular: troca de lugar com o vizinho de cima ou de baixo. */
  const shift = (block: Block, dir: -1 | 1) => {
    if (!onChange) return;
    const order = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const i = order.findIndex((b) => b.id === block.id);
    const other = order[i + dir];
    if (!other) return;
    const swapped = layout.map((b) =>
      b.id === block.id
        ? { ...b, x: other.x, y: other.y }
        : b.id === other.id
          ? { ...b, x: block.x, y: block.y }
          : b,
    );
    onChange(resolveCollisions(swapped, block.id));
  };

  const bottom = layout.reduce((m, b) => Math.max(m, b.y + b.h), 0);
  const rows = bottom + (editing && !mobile ? 5 : 0);
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);

  if (mobile) {
    return (
      <div ref={boxRef} className="flex flex-col gap-4">
        {sorted.map((block, i) => {
          const px = block.h * ROW_PX + (block.h - 1) * GAP_PX;
          return (
            <div
              key={block.id}
              className={`relative ${editing && selectedId === block.id ? "rounded-3xl ring-2 ring-accent" : ""}`}
              style={{
                minHeight: px,
                height: px,
              }}
              onClick={() => editing && onSelect?.(block.id)}
            >
              <BlockView block={block} />
              {editing && (
                <div
                  className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-soft"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => shift(block, -1)}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary disabled:opacity-30"
                    aria-label={tr(["Subir", "Move up", "Subir", "Monter"])}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={i === sorted.length - 1}
                    onClick={() => shift(block, 1)}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary disabled:opacity-30"
                    aria-label={tr(["Descer", "Move down", "Bajar", "Descendre"])}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit?.(block.id)}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary"
                    aria-label={tr(["Editar", "Edit", "Editar", "Modifier"])}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(block.id)}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-destructive hover:bg-destructive/10"
                    aria-label={tr(["Remover", "Remove", "Quitar", "Supprimer"])}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
            data-block={block.id}
            ref={(el) => {
              if (el) els.current.set(block.id, el);
              else els.current.delete(block.id);
            }}
            className={`group relative min-h-0 min-w-0 will-change-transform ${
              selected ? "rounded-3xl ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
            } ${isDragging ? "[&>section]:shadow-2xl" : ""}`}
            style={{
              gridColumn: `${block.x + 1} / span ${block.w}`,
              gridRow: `${block.y + 1} / span ${block.h}`,
            }}
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
                    selected || isDragging
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => start(e, block, "move")}
                    onPointerMove={move}
                    onPointerUp={end}
                    onPointerCancel={end}
                    onKeyDown={(e) => keyMove(e, block)}
                    className="flex h-7 cursor-grab touch-none select-none items-center gap-1 rounded-full bg-secondary px-2 text-[11px] font-semibold text-foreground active:cursor-grabbing"
                    aria-label={tr([
                      "Arrastar bloco (setas movem, Shift+setas muda o tamanho)",
                      "Drag block (arrows move, Shift+arrows resize)",
                      "Arrastrar bloque (flechas mueven, Shift+flechas cambia el tamaño)",
                      "Glisser le bloc (flèches déplacent, Maj+flèches redimensionne)",
                    ])}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                    {tr(BLOCK_INFO[block.type].name)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit?.(block.id)}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-secondary"
                    aria-label={tr([
                      "Ajustes do bloco",
                      "Block settings",
                      "Ajustes del bloque",
                      "Réglages du bloc",
                    ])}
                    title={tr([
                      "Ajustes do bloco",
                      "Block settings",
                      "Ajustes del bloque",
                      "Réglages du bloc",
                    ])}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(block.id)}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-destructive hover:bg-destructive/10"
                    aria-label={tr(["Remover", "Remove", "Quitar", "Supprimer"])}
                  >
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
                  <svg
                    viewBox="0 0 10 10"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
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
