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
