// Painel de construção de um slide personalizado: fundo, transição, blocos e propriedades do bloco.
// As mudanças caem direto no slide que está na tela (o próprio deck mostra o resultado).
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { btnCls, btnDanger, inputCls } from "@/components/admin/admin-ui";
import { PRESENTERS } from "@/components/presentation/parts";
import {
  ANIMS,
  BACKGROUNDS,
  BLOCK_LABEL,
  makeBlock,
  POSES,
  TONES,
  TRANSITIONS,
  type Block,
  type BlockType,
  type CustomSlide,
  type Shape,
  type Size,
} from "@/lib/custom-slides";
import type { Locale } from "@/lib/i18n/locales";

const BLOCK_TYPES: BlockType[] = ["text", "card", "nina", "image", "shape", "emoji"];
const SIZES: Size[] = ["sm", "md", "lg", "xl"];
const SHAPES: { id: Shape; label: string }[] = [
  { id: "circle", label: "Círculo" },
  { id: "blob", label: "Orgânica" },
  { id: "rect", label: "Retângulo" },
];

export interface BuilderProps {
  slide: CustomSlide;
  locale: Locale;
  selected: string | null;
  onSelect: (blockId: string | null) => void;
  onSlide: (fn: (s: CustomSlide) => CustomSlide) => void;
  onDeleteSlide: () => void;
  onDuplicateSlide: () => void;
  onUpload: (file: File) => Promise<string | null>;
}

const num = (v: string, min: number, max: number) => Math.min(max, Math.max(min, Number(v) || 0));

export function SlideBuilder({
  slide,
  locale,
  selected,
  onSelect,
  onSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onUpload,
}: BuilderProps) {
  const block = slide.blocks.find((b) => b.id === selected) ?? null;

  const setBlock = (id: string, fn: (b: Block) => Block) =>
    onSlide((s) => ({ ...s, blocks: s.blocks.map((b) => (b.id === id ? fn(b) : b)) }));

  const moveBlock = (id: string, dir: -1 | 1) =>
    onSlide((s) => {
      const i = s.blocks.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.blocks.length) return s;
      const next = [...s.blocks];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...s, blocks: next };
    });

  const removeBlock = (id: string) => {
    onSlide((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) }));
    onSelect(null);
  };

  const duplicateBlock = (id: string) => {
    const src = slide.blocks.find((b) => b.id === id);
    if (!src) return;
    const copy: Block = {
      ...src,
      id: makeBlock(src.type).id,
      x: Math.min(src.x + 3, 100 - src.w),
      y: Math.min(src.y + 3, 100 - src.h),
    };
    onSlide((s) => ({ ...s, blocks: [...s.blocks, copy] }));
    onSelect(copy.id);
  };

  const addBlock = (type: BlockType) => {
    const fresh = makeBlock(type, {
      title:
        type === "text" || type === "card" || type === "image" ? { [locale]: "Novo texto" } : {},
      body: type === "nina" ? { [locale]: "Fala da Nina" } : {},
    });
    onSlide((s) => ({ ...s, blocks: [...s.blocks, fresh] }));
    onSelect(fresh.id);
  };

  const title = (b: Block) => b.title[locale] ?? b.title["pt-BR"] ?? "";
  const body = (b: Block) => b.body[locale] ?? b.body["pt-BR"] ?? "";

  return (
    <div className="space-y-4 text-sm">
      <section className="space-y-2 rounded-2xl border border-border bg-card p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slide</p>
        <input
          className={inputCls}
          value={slide.name}
          onChange={(e) => onSlide((s) => ({ ...s, name: e.target.value }))}
          aria-label="Nome do slide"
        />
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          Parte
          <select
            className={inputCls}
            value={slide.part}
            onChange={(e) => onSlide((s) => ({ ...s, part: Number(e.target.value) }))}
          >
            {PRESENTERS.map((p, i) => (
              <option key={p.name} value={i}>
                {i + 1} · {p.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs font-semibold text-muted-foreground">Papel de parede</p>
        <div className="grid grid-cols-4 gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              type="button"
              aria-pressed={slide.background === bg.id}
              aria-label={bg.label}
              title={bg.label}
              onClick={() => onSlide((s) => ({ ...s, background: bg.id }))}
              className={`h-10 rounded-lg border-2 ${slide.background === bg.id ? "border-accent" : "border-transparent"}`}
              style={bg.style}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          Transição
          <select
            className={inputCls}
            value={slide.transition}
            onChange={(e) =>
              onSlide((s) => ({ ...s, transition: e.target.value as CustomSlide["transition"] }))
            }
          >
            {TRANSITIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnCls} onClick={onDuplicateSlide}>
            <Copy className="h-3.5 w-3.5" /> Duplicar slide
          </button>
          <button type="button" className={btnDanger} onClick={onDeleteSlide}>
            <Trash2 className="h-3.5 w-3.5" /> Excluir slide
          </button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Adicionar elemento
        </p>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((t) => (
            <button key={t} type="button" className={btnCls} onClick={() => addBlock(t)}>
              <Plus className="h-3.5 w-3.5" /> {BLOCK_LABEL[t]}
            </button>
          ))}
        </div>
        <p className="pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Elementos
        </p>
        {slide.blocks.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum elemento ainda. Adicione acima.</p>
        ) : (
          <ol className="space-y-1">
            {slide.blocks.map((b, i) => (
              <li
                key={b.id}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1 ${selected === b.id ? "border-accent bg-accent-soft" : "border-border"}`}
              >
                <button
                  type="button"
                  className="flex-1 truncate text-left text-xs"
                  onClick={() => onSelect(b.id)}
                >
                  {BLOCK_LABEL[b.type]}
                  {title(b) || body(b) || b.emoji
                    ? ` · ${(title(b) || body(b) || b.emoji).slice(0, 26)}`
                    : ""}
                </button>
                <button
                  type="button"
                  className={btnCls}
                  disabled={i === 0}
                  onClick={() => moveBlock(b.id, -1)}
                  aria-label="Trazer para trás"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className={btnCls}
                  disabled={i === slide.blocks.length - 1}
                  onClick={() => moveBlock(b.id, 1)}
                  aria-label="Levar para frente"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {block && (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {BLOCK_LABEL[block.type]} selecionado
          </p>

          {(block.type === "text" || block.type === "card" || block.type === "image") && (
            <label className="block text-xs font-semibold text-muted-foreground">
              Título ({locale})
              <input
                className={inputCls}
                value={title(block)}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({
                    ...b,
                    title: { ...b.title, [locale]: e.target.value },
                  }))
                }
              />
            </label>
          )}
          {(block.type === "text" || block.type === "card" || block.type === "nina") && (
            <label className="block text-xs font-semibold text-muted-foreground">
              {block.type === "nina" ? "Fala da Nina" : "Texto"} ({locale})
              <textarea
                className={`${inputCls} min-h-[4rem]`}
                value={body(block)}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({
                    ...b,
                    body: { ...b.body, [locale]: e.target.value },
                  }))
                }
              />
            </label>
          )}
          {(block.type === "card" || block.type === "emoji") && (
            <label className="block text-xs font-semibold text-muted-foreground">
              Emoji
              <input
                className={inputCls}
                value={block.emoji}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, emoji: e.target.value.slice(0, 4) }))
                }
              />
            </label>
          )}
          {block.type === "nina" && (
            <label className="block text-xs font-semibold text-muted-foreground">
              Situação
              <select
                className={inputCls}
                value={block.pose}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, pose: e.target.value as Block["pose"] }))
                }
              >
                {POSES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {block.type === "image" && (
            <div className="space-y-2">
              <label className={`${btnCls} cursor-pointer`}>
                Enviar imagem
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const url = await onUpload(file);
                    if (url) setBlock(block.id, (b) => ({ ...b, src: url }));
                  }}
                />
              </label>
              {block.src && (
                <button
                  type="button"
                  className={btnCls}
                  onClick={() => setBlock(block.id, (b) => ({ ...b, src: "" }))}
                >
                  Tirar imagem
                </button>
              )}
            </div>
          )}
          {block.type === "shape" && (
            <label className="block text-xs font-semibold text-muted-foreground">
              Formato
              <select
                className={inputCls}
                value={block.shape}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, shape: e.target.value as Shape }))
                }
              >
                {SHAPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Cor
              <select
                className={inputCls}
                value={block.tone}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, tone: e.target.value as Block["tone"] }))
                }
              >
                {Object.entries(TONES).map(([id, t]) => (
                  <option key={id} value={id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Tamanho
              <select
                className={inputCls}
                value={block.size}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, size: e.target.value as Size }))
                }
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Alinhamento
              <select
                className={inputCls}
                value={block.align}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, align: e.target.value as Block["align"] }))
                }
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Animação
              <select
                className={inputCls}
                value={block.anim}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, anim: e.target.value as Block["anim"] }))
                }
              >
                {ANIMS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Atraso (ms)
              <input
                type="number"
                min={0}
                max={3000}
                step={50}
                className={inputCls}
                value={block.delay}
                onChange={(e) =>
                  setBlock(block.id, (b) => ({ ...b, delay: num(e.target.value, 0, 3000) }))
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(["x", "y", "w", "h"] as const).map((k) => (
              <label key={k} className="text-xs font-semibold uppercase text-muted-foreground">
                {k}
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputCls}
                  value={Math.round(block[k])}
                  onChange={(e) =>
                    setBlock(block.id, (b) => ({ ...b, [k]: num(e.target.value, 0, 100) }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnCls} onClick={() => duplicateBlock(block.id)}>
              <Copy className="h-3.5 w-3.5" /> Duplicar
            </button>
            <button type="button" className={btnDanger} onClick={() => removeBlock(block.id)}>
              <Trash2 className="h-3.5 w-3.5" /> Excluir elemento
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
