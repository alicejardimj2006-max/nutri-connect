// Slide montado com blocos. Tudo é medido em % do próprio slide (cqw), então texto, Nina e cards
// mantêm a proporção em qualquer tela. No modo edição, cada bloco se arrasta e se redimensiona.
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { Locale } from "@/lib/i18n/locales";
import {
  ANIMS,
  backgroundOf,
  localized,
  TONES,
  type Block,
  type CustomSlide,
} from "@/lib/custom-slides";
import { StageNina } from "./layout";

const TITLE_CQW: Record<Block["size"], number> = { sm: 1.8, md: 2.6, lg: 3.8, xl: 5.6 };

export interface CanvasEditing {
  selected: string | null;
  onSelect: (blockId: string | null) => void;
  onPatch: (blockId: string, patch: Partial<Pick<Block, "x" | "y" | "w" | "h">>) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Cores dos diagramas e das maquetes (a cor de cada item segue esta ordem).
const PALETTE = ["#b4532a", "#555f36", "#7a3f8f", "#e0a27f", "#b9c28f", "#f5c542"];

const MOCK_TITLE: Record<string, string> = {
  feed: "Feed",
  perfil: "Meu perfil",
  trilha: "Trilha",
  comunidade: "Comunidade",
  desafio: "Desafio",
};

/** Diagramas (venn, ciclo, fluxo, barras, pirâmide), desenhados com % do próprio bloco. */
function DiagramView({ block, locale }: { block: Block; locale: Locale }) {
  const labels = block.items.map((i) => localized(i, locale));
  const label = (t: string, x: number, y: number, key: number | string, color = "#342d24") => (
    <span
      key={key}
      className="absolute -translate-x-1/2 -translate-y-1/2 text-center font-bold leading-tight"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: "2.2cqw", color, maxWidth: "30%" }}
    >
      {t}
    </span>
  );
  if (block.kind === "cycle") {
    const n = Math.max(labels.length, 1);
    return (
      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.3cqw] border-dashed border-current opacity-40" />
        {labels.map((t, i) => {
          const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
          const x = 50 + 36 * Math.cos(a);
          const y = 50 + 36 * Math.sin(a);
          return (
            <div
              key={i}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full p-[1cqw] text-center font-bold text-white shadow"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: "22%",
                aspectRatio: "1",
                background: PALETTE[i % PALETTE.length],
                fontSize: "2cqw",
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
    );
  }
  if (block.kind === "flow") {
    return (
      <div className="flex h-full w-full items-center justify-center gap-[1cqw]">
        {labels.map((t, i) => (
          <div key={i} className="flex items-center gap-[1cqw]">
            <div
              className="grid place-items-center rounded-[2cqw] p-[1.2cqw] text-center font-bold text-white shadow"
              style={{
                background: PALETTE[i % PALETTE.length],
                fontSize: "2cqw",
                minWidth: 0,
                flex: "1 1 0",
                height: "60%",
              }}
            >
              {t}
            </div>
            {i < labels.length - 1 ? <span style={{ fontSize: "3cqw" }}>→</span> : null}
          </div>
        ))}
      </div>
    );
  }
  if (block.kind === "bars") {
    const values = labels.map((t, i) => {
      const v = Number(t.split(":").pop());
      return Number.isFinite(v) && t.includes(":") ? v : i + 1;
    });
    const max = Math.max(...values, 1);
    return (
      <div className="flex h-full w-full items-end justify-around gap-[1.5cqw]">
        {labels.map((t, i) => (
          <div
            key={i}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-[0.8cqw]"
          >
            <div
              className="w-full rounded-t-[1.2cqw]"
              style={{
                height: `${(values[i] / max) * 80}%`,
                background: PALETTE[i % PALETTE.length],
              }}
            />
            <span className="text-center font-bold leading-tight" style={{ fontSize: "1.9cqw" }}>
              {t.split(":")[0]}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (block.kind === "pyramid") {
    const n = Math.max(labels.length, 1);
    return (
      <div className="flex h-full w-full flex-col-reverse items-center justify-center gap-[0.8cqw]">
        {labels.map((t, i) => (
          <div
            key={i}
            className="grid place-items-center rounded-[1cqw] text-center font-bold text-white"
            style={{
              width: `${30 + ((100 - 30) * (i + 1)) / n}%`,
              height: `${80 / n}%`,
              background: PALETTE[i % PALETTE.length],
              fontSize: "2cqw",
            }}
          >
            {t}
          </div>
        ))}
      </div>
    );
  }
  // Venn (padrão): até três círculos sobrepostos, com os rótulos no centro de cada um.
  const circles = [
    { left: 4, top: 8, color: PALETTE[0] },
    { left: 36, top: 8, color: PALETTE[1] },
    { left: 20, top: 40, color: PALETTE[2] },
  ];
  const spots = [
    { x: 24, y: 28 },
    { x: 60, y: 28 },
    { x: 42, y: 66 },
  ];
  return (
    <div className="relative h-full w-full">
      {circles.map((c, i) => (
        <div
          key={i}
          className="absolute h-[56%] w-[56%] rounded-full opacity-50"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            background: c.color,
            mixBlendMode: "multiply",
          }}
        />
      ))}
      {labels.slice(0, 3).map((t, i) => label(t, spots[i].x, spots[i].y, i))}
    </div>
  );
}

/** Maquete de tela de celular com as linhas do bloco como conteúdo. */
function MockupView({ block, locale }: { block: Block; locale: Locale }) {
  const rows = block.items.map((i) => localized(i, locale));
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="flex h-full flex-col overflow-hidden rounded-[4cqw] border-[0.6cqw] border-[#342d24] bg-[#fffdf8] shadow-[0_3cqw_8cqw_-3cqw_rgb(52_45_36/0.5)]"
        style={{ aspectRatio: "9 / 19", maxWidth: "100%" }}
      >
        <div
          className="px-[2cqw] py-[1.6cqw] font-bold text-white"
          style={{ background: "#b4532a", fontSize: "2.2cqw" }}
        >
          {MOCK_TITLE[block.kind] ?? "Tela"}
        </div>
        <div className="flex flex-1 flex-col gap-[1.2cqw] overflow-hidden p-[1.6cqw]">
          {rows.map((r, i) => (
            <div
              key={i}
              className="rounded-[2cqw] bg-[#f6efe2] p-[1.6cqw] leading-snug text-[#342d24]"
              style={{ fontSize: "1.9cqw" }}
            >
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockView({
  block,
  locale,
  dark,
  canvas,
  editing,
}: {
  block: Block;
  locale: Locale;
  dark: boolean;
  canvas: React.RefObject<HTMLDivElement | null>;
  editing?: CanvasEditing;
}) {
  const drag = useRef<{
    px: number;
    py: number;
    x: number;
    y: number;
    w: number;
    h: number;
    mode: "move" | "resize";
  } | null>(null);
  const selected = editing?.selected === block.id;
  const anim = ANIMS.find((a) => a.id === block.anim)?.cls ?? "";
  const title = localized(block.title, locale);
  const body = localized(block.body, locale);
  const titleSize = TITLE_CQW[block.size];
  const defaultFg = dark ? "#fffdf8" : "#342d24";
  const fg =
    block.tone === "ink" || block.tone === "light"
      ? block.tone === "light"
        ? "#fffdf8"
        : defaultFg
      : TONES[block.tone].fg;

  const start = (e: ReactPointerEvent<HTMLDivElement>, mode: "move" | "resize") => {
    if (!editing) return;
    e.stopPropagation();
    e.preventDefault();
    editing.onSelect(block.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      px: e.clientX,
      py: e.clientY,
      x: block.x,
      y: block.y,
      w: block.w,
      h: block.h,
      mode,
    };
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = canvas.current;
    if (!editing || !d || !el) return;
    const r = el.getBoundingClientRect();
    const dx = ((e.clientX - d.px) / r.width) * 100;
    const dy = ((e.clientY - d.py) / r.height) * 100;
    if (d.mode === "move") {
      editing.onPatch(block.id, {
        x: clamp(d.x + dx, 0, 100 - d.w),
        y: clamp(d.y + dy, 0, 100 - d.h),
      });
    } else {
      editing.onPatch(block.id, {
        w: clamp(d.w + dx, 3, 100 - d.x),
        h: clamp(d.h + dy, 3, 100 - d.y),
      });
    }
  };

  const end = () => {
    drag.current = null;
  };

  let content: React.ReactNode = null;
  if (block.type === "text") {
    content = (
      <div
        className="flex h-full w-full flex-col justify-center"
        style={{ color: fg, textAlign: block.align }}
      >
        {title || !editing ? (
          <p
            className="font-display font-bold leading-tight"
            style={{ fontSize: `${titleSize}cqw` }}
          >
            {title || (editing ? "Título" : "")}
          </p>
        ) : null}
        {body ? (
          <p
            className="mt-[0.8cqw] leading-relaxed opacity-90"
            style={{ fontSize: `${titleSize * 0.55}cqw` }}
          >
            {body}
          </p>
        ) : null}
      </div>
    );
  } else if (block.type === "card") {
    content = (
      <div
        className="flex h-full w-full flex-col gap-[1cqw] rounded-[3cqw] p-[3cqw] shadow-[0_2cqw_5cqw_-2cqw_rgb(52_45_36/0.35)]"
        style={{
          background:
            TONES[block.tone === "ink" || block.tone === "light" ? "card" : block.tone].bg,
          color: TONES[block.tone === "ink" || block.tone === "light" ? "card" : block.tone].fg,
          textAlign: block.align,
        }}
      >
        {block.emoji ? (
          <span style={{ fontSize: "5cqw", lineHeight: 1 }}>{block.emoji}</span>
        ) : null}
        {title ? (
          <p
            className="font-display font-bold leading-tight"
            style={{ fontSize: `${titleSize}cqw` }}
          >
            {title}
          </p>
        ) : null}
        {body ? (
          <p className="leading-relaxed opacity-85" style={{ fontSize: `${titleSize * 0.6}cqw` }}>
            {body}
          </p>
        ) : null}
      </div>
    );
  } else if (block.type === "nina") {
    content = (
      <div className="flex h-full w-full flex-col">
        <div className="min-h-0 flex-1">
          <StageNina action={block.pose} framing="bust" className="h-full w-full" />
        </div>
        {body ? (
          <p
            className="mt-[0.6cqw] text-center leading-snug"
            style={{ color: fg, fontSize: `${TITLE_CQW.sm}cqw` }}
          >
            {body}
          </p>
        ) : null}
      </div>
    );
  } else if (block.type === "image") {
    content = block.src ? (
      <img
        src={block.src}
        alt={title}
        className="h-full w-full rounded-[3cqw] object-cover shadow-[0_2cqw_5cqw_-2cqw_rgb(52_45_36/0.35)]"
        draggable={false}
      />
    ) : (
      <div
        className="grid h-full w-full place-items-center rounded-[3cqw] border-[0.3cqw] border-dashed border-current opacity-50"
        style={{ color: fg, fontSize: "2cqw" }}
      >
        Imagem
      </div>
    );
  } else if (block.type === "shape") {
    const bg = TONES[block.tone === "ink" || block.tone === "light" ? "sage" : block.tone].bg;
    content = (
      <div
        className="h-full w-full"
        style={{
          background: bg,
          borderRadius:
            block.shape === "circle"
              ? "50%"
              : block.shape === "blob"
                ? "42% 58% 60% 40% / 45% 45% 55% 55%"
                : "2cqw",
        }}
      />
    );
  } else if (block.type === "diagram") {
    content = <DiagramView block={block} locale={locale} />;
  } else if (block.type === "mockup") {
    content = <MockupView block={block} locale={locale} />;
  } else if (block.type === "emoji") {
    content = (
      <div
        className="grid h-full w-full place-items-center leading-none"
        style={{ fontSize: `${Math.min(block.w, block.h) * 0.9}cqw` }}
      >
        {block.emoji}
      </div>
    );
  }

  return (
    <div
      className={`absolute ${anim}`}
      style={{
        left: `${block.x}%`,
        top: `${block.y}%`,
        width: `${block.w}%`,
        height: `${block.h}%`,
        animationDelay: `${block.delay}ms`,
        cursor: editing ? "move" : undefined,
        outline:
          editing && selected
            ? "2px solid #b4532a"
            : editing
              ? "1px dashed rgb(52 45 36 / 0.25)"
              : undefined,
        outlineOffset: 3,
        touchAction: editing ? "none" : undefined,
      }}
      onPointerDown={(e) => start(e, "move")}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {content}
      {editing && selected ? (
        <div
          className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-primary shadow"
          onPointerDown={(e) => start(e, "resize")}
          aria-label="Redimensionar"
        />
      ) : null}
    </div>
  );
}

export function CustomSlideView({
  slide,
  locale,
  editing,
}: {
  slide: CustomSlide;
  locale: Locale;
  editing?: CanvasEditing;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const bg = backgroundOf(slide.background);
  return (
    <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
      <div
        ref={canvas}
        className="relative overflow-hidden rounded-3xl shadow-soft"
        style={{
          ...bg.style,
          width: "min(100%, calc((100dvh - 230px) * 16 / 9))",
          aspectRatio: "16 / 9",
          containerType: "inline-size",
        }}
        onPointerDown={() => editing?.onSelect(null)}
      >
        {slide.blocks.map((b) => (
          <BlockView
            key={b.id}
            block={b}
            locale={locale}
            dark={bg.dark}
            canvas={canvas}
            editing={editing}
          />
        ))}
      </div>
    </div>
  );
}
