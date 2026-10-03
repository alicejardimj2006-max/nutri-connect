// Painéis das ferramentas de camadas do editor de fotos: texto, adesivos, desenho/censura e moldura.
import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  Copy,
  Eraser,
  Italic,
  Plus,
  Trash2,
} from "lucide-react";
import {
  makeId,
  type CensorOverlay,
  type ImageEdits,
  type Overlay,
  type StickerOverlay,
  type StrokeOverlay,
  type TextOverlay,
} from "@/lib/image-edit";
import {
  CENSOR_MODES,
  DRAW_TOOLS,
  FRAME_PRESETS,
  FRAME_STYLES,
  SHAPES,
  STICKER_GROUPS,
  TEXT_FONTS,
  TEXT_STYLES,
  type CensorMode,
  type DrawTool,
  type ShapeId,
} from "@/lib/image-edit-data";
import { ColorRow, Chips, Heading, Slider, Toggle, toolBtn, useTr } from "./image-editor-ui";

/** O que cada painel precisa do editor. */
export interface PanelCtx {
  edits: ImageEdits;
  selectedId: string | null;
  select: (id: string | null) => void;
  /** Mudança pontual (um passo no histórico). */
  change: (patch: Partial<ImageEdits>) => void;
  /** Mudança contínua (arrasto agrupado em um passo). */
  slide: (patch: Partial<ImageEdits>) => void;
}

const dangerBtn = `${toolBtn} text-destructive`;

/** Ações comuns a qualquer camada: duplicar, ordem e apagar. */
function LayerActions({ ctx, overlay }: { ctx: PanelCtx; overlay: Overlay }) {
  const tr = useTr();
  const { edits, change, select } = ctx;
  const list = edits.overlays;
  const index = list.findIndex((o) => o.id === overlay.id);

  const duplicate = () => {
    const copy = { ...overlay, id: makeId() } as Overlay;
    if (copy.type === "text" || copy.type === "sticker") {
      copy.x = Math.min(0.95, copy.x + 0.04);
      copy.y = Math.min(0.95, copy.y + 0.04);
    }
    change({ overlays: [...list, copy] });
    select(copy.id);
  };
  const move = (toEnd: boolean) => {
    const rest = list.filter((o) => o.id !== overlay.id);
    change({ overlays: toEnd ? [...rest, overlay] : [overlay, ...rest] });
  };
  const remove = () => {
    change({ overlays: list.filter((o) => o.id !== overlay.id) });
    select(null);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <button type="button" className={toolBtn} onClick={duplicate} title={tr(["Duplicar", "Duplicate", "Duplicar", "Dupliquer"])}>
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={toolBtn} onClick={() => move(true)} disabled={index === list.length - 1} title={tr(["Trazer para frente", "Bring to front", "Traer al frente", "Mettre devant"])}>
        <ArrowUpToLine className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={toolBtn} onClick={() => move(false)} disabled={index === 0} title={tr(["Enviar para trás", "Send to back", "Enviar atrás", "Mettre derrière"])}>
        <ArrowDownToLine className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={dangerBtn} onClick={remove} title={tr(["Apagar", "Delete", "Borrar", "Supprimer"])}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function patchOverlay(ctx: PanelCtx, id: string, patch: Partial<Overlay>, continuous: boolean) {
  const overlays = ctx.edits.overlays.map((o) => (o.id === id ? ({ ...o, ...patch } as Overlay) : o));
  (continuous ? ctx.slide : ctx.change)({ overlays });
}

const hexToRgba = (hex: string, a: number) => {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// ───────────────────────────── Texto ─────────────────────────────

export function TextPanel({ ctx }: { ctx: PanelCtx }) {
  const tr = useTr();
  const texts = ctx.edits.overlays.filter((o): o is TextOverlay => o.type === "text");
  const sel = texts.find((o) => o.id === ctx.selectedId) ?? null;

  const add = () => {
    const o: TextOverlay = {
      id: makeId(),
      type: "text",
      text: tr(["Seu texto", "Your text", "Tu texto", "Votre texte"]),
      x: 0.5,
      y: 0.5,
      size: 0.07,
      color: "#ffffff",
      font: "sans",
      bold: true,
      italic: false,
      align: "center",
      letterSpacing: 0,
      outline: null,
      shadow: true,
      bg: null,
      rotation: 0,
      opacity: 1,
    };
    ctx.change({ overlays: [...ctx.edits.overlays, o] });
    ctx.select(o.id);
  };
  const set = (patch: Partial<TextOverlay>, continuous = false) =>
    sel && patchOverlay(ctx, sel.id, patch, continuous);

  return (
    <div className="space-y-4">
      <button type="button" className={`${toolBtn} w-full`} onClick={add}>
        <Plus className="h-3.5 w-3.5" /> {tr(["Adicionar texto", "Add text", "Añadir texto", "Ajouter du texte"])}
      </button>
      <p className="text-[11px] text-muted-foreground">
        {tr([
          "Toque no texto sobre a foto para selecionar e arraste para mover.",
          "Tap the text on the photo to select it and drag to move.",
          "Toca el texto sobre la foto para seleccionarlo y arrástralo para moverlo.",
          "Touchez le texte sur la photo pour le sélectionner et faites-le glisser.",
        ])}
      </p>

      {texts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {texts.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => ctx.select(o.id)}
              className={`max-w-[9rem] truncate rounded-full border px-3 py-1 text-xs transition cursor-pointer ${
                o.id === ctx.selectedId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {o.text.split("\n")[0] || "…"}
            </button>
          ))}
        </div>
      )}

      {sel && (
        <>
          <textarea
            value={sel.text}
            rows={2}
            maxLength={200}
            onChange={(e) => set({ text: e.target.value }, true)}
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <div>
            <Heading>{tr(["Estilos prontos", "Ready-made styles", "Estilos listos", "Styles prêts"])}</Heading>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {TEXT_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set(s.patch as Partial<TextOverlay>)}
                  className="rounded-lg border border-border px-1 py-2 text-[11px] font-medium text-foreground transition hover:bg-secondary cursor-pointer"
                >
                  {tr(s.names)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Heading>{tr(["Fonte", "Font", "Fuente", "Fuente"])}</Heading>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {TEXT_FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={sel.font === f.id}
                  onClick={() => set({ font: f.id })}
                  className={`rounded-lg border px-1 py-1.5 text-center transition cursor-pointer ${
                    sel.font === f.id ? "border-primary bg-primary-soft" : "border-border hover:bg-secondary"
                  }`}
                >
                  <span className="block text-base leading-tight text-foreground" style={{ fontFamily: f.css }}>
                    Aa
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Slider
            label={tr(["Tamanho", "Size", "Tamaño", "Taille"])}
            value={Math.round(sel.size * 1000) / 10}
            min={2}
            max={30}
            step={0.5}
            neutral={7}
            unit="%"
            onChange={(v) => set({ size: v / 100 }, true)}
          />

          <ColorRow label={tr(["Cor", "Color", "Color", "Couleur"])} value={sel.color} onChange={(c) => c && set({ color: c })} />

          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={sel.bold} className={`${toolBtn} ${sel.bold ? "!border-primary !bg-primary-soft" : ""}`} onClick={() => set({ bold: !sel.bold })}>
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button type="button" aria-pressed={sel.italic} className={`${toolBtn} ${sel.italic ? "!border-primary !bg-primary-soft" : ""}`} onClick={() => set({ italic: !sel.italic })}>
              <Italic className="h-3.5 w-3.5" />
            </button>
            {(["left", "center", "right"] as const).map((a) => {
              const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
              return (
                <button key={a} type="button" aria-pressed={sel.align === a} className={`${toolBtn} ${sel.align === a ? "!border-primary !bg-primary-soft" : ""}`} onClick={() => set({ align: a })}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          <Slider
            label={tr(["Espaço entre letras", "Letter spacing", "Espacio entre letras", "Espacement des lettres"])}
            value={sel.letterSpacing}
            min={-5}
            max={30}
            onChange={(v) => set({ letterSpacing: v }, true)}
          />
          <Slider
            label={tr(["Rotação", "Rotation", "Rotación", "Rotation"])}
            value={sel.rotation}
            min={-180}
            max={180}
            unit="°"
            onChange={(v) => set({ rotation: v }, true)}
          />
          <Slider
            label={tr(["Opacidade", "Opacity", "Opacidad", "Opacité"])}
            value={Math.round(sel.opacity * 100)}
            min={10}
            max={100}
            neutral={100}
            unit="%"
            onChange={(v) => set({ opacity: v / 100 }, true)}
          />

          <Toggle label={tr(["Sombra", "Shadow", "Sombra", "Ombre"])} checked={sel.shadow} onChange={(shadow) => set({ shadow })} />

          <ColorRow
            label={tr(["Contorno", "Outline", "Contorno", "Contour"])}
            value={sel.outline}
            allowNone
            noneLabel={tr(["Sem", "None", "Sin", "Aucun"])}
            onChange={(outline) => set({ outline })}
          />

          <ColorRow
            label={tr(["Fundo do texto", "Text background", "Fondo del texto", "Fond du texte"])}
            value={sel.bg && sel.bg.startsWith("#") ? sel.bg : sel.bg ? "#000000" : null}
            allowNone
            noneLabel={tr(["Sem", "None", "Sin", "Aucun"])}
            onChange={(c) => set({ bg: c })}
          />
          {sel.bg && (
            <Toggle
              label={tr(["Fundo translúcido", "Translucent background", "Fondo translúcido", "Fond translucide"])}
              checked={sel.bg.startsWith("rgba")}
              onChange={(soft) => {
                const hex = sel.bg?.startsWith("#") ? sel.bg : "#000000";
                set({ bg: soft ? hexToRgba(hex, 0.55) : hex });
              }}
            />
          )}

          <LayerActions ctx={ctx} overlay={sel} />
        </>
      )}
    </div>
  );
}

// ───────────────────────────── Adesivos ─────────────────────────────

export function StickerPanel({ ctx }: { ctx: PanelCtx }) {
  const tr = useTr();
  const [group, setGroup] = useState<string>("food");
  const stickers = ctx.edits.overlays.filter((o): o is StickerOverlay => o.type === "sticker");
  const sel = stickers.find((o) => o.id === ctx.selectedId) ?? null;

  const add = (kind: "emoji" | "shape", glyph: string) => {
    const o: StickerOverlay = {
      id: makeId(),
      type: "sticker",
      kind,
      glyph,
      color: "#ff4f9a",
      x: 0.5,
      y: 0.5,
      size: kind === "emoji" ? 0.14 : 0.16,
      rotation: 0,
      flip: false,
      opacity: 1,
    };
    ctx.change({ overlays: [...ctx.edits.overlays, o] });
    ctx.select(o.id);
  };
  const set = (patch: Partial<StickerOverlay>, continuous = false) =>
    sel && patchOverlay(ctx, sel.id, patch, continuous);

  const groups = [
    ...STICKER_GROUPS.map((g) => ({ id: g.id, label: tr(g.names) })),
    { id: "shapes", label: tr(["Formas", "Shapes", "Formas", "Formes"]) },
  ];
  const current = STICKER_GROUPS.find((g) => g.id === group);

  return (
    <div className="space-y-4">
      <Chips options={groups} value={group} onChange={setGroup} />

      {group === "shapes" ? (
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => add("shape", s.id as ShapeId)}
              className="rounded-lg border border-border px-1 py-2 text-[11px] font-medium text-foreground transition hover:bg-secondary cursor-pointer"
            >
              {tr(s.names)}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto rounded-xl border border-border/60 p-1.5">
          {(current?.glyphs ?? []).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => add("emoji", g)}
              className="rounded-lg p-1 text-xl leading-none transition hover:bg-secondary cursor-pointer"
            >
              {g}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {tr([
          "Toque no adesivo sobre a foto para selecionar e arraste para mover.",
          "Tap the sticker on the photo to select it and drag to move.",
          "Toca el adhesivo sobre la foto para seleccionarlo y arrástralo para moverlo.",
          "Touchez l'autocollant sur la photo pour le sélectionner et faites-le glisser.",
        ])}
      </p>

      {sel && (
        <>
          <Slider
            label={tr(["Tamanho", "Size", "Tamaño", "Taille"])}
            value={Math.round(sel.size * 1000) / 10}
            min={3}
            max={70}
            step={0.5}
            neutral={14}
            unit="%"
            onChange={(v) => set({ size: v / 100 }, true)}
          />
          <Slider
            label={tr(["Rotação", "Rotation", "Rotación", "Rotation"])}
            value={sel.rotation}
            min={-180}
            max={180}
            unit="°"
            onChange={(v) => set({ rotation: v }, true)}
          />
          <Slider
            label={tr(["Opacidade", "Opacity", "Opacidad", "Opacité"])}
            value={Math.round(sel.opacity * 100)}
            min={10}
            max={100}
            neutral={100}
            unit="%"
            onChange={(v) => set({ opacity: v / 100 }, true)}
          />
          <Toggle label={tr(["Espelhar", "Flip", "Reflejar", "Retourner"])} checked={sel.flip} onChange={(flip) => set({ flip })} />
          {sel.kind === "shape" && (
            <ColorRow label={tr(["Cor", "Color", "Color", "Couleur"])} value={sel.color} onChange={(c) => c && set({ color: c })} />
          )}
          <LayerActions ctx={ctx} overlay={sel} />
        </>
      )}
    </div>
  );
}

// ───────────────────────────── Desenho e censura ─────────────────────────────

export interface DrawState {
  mode: "draw" | "censor";
  tool: DrawTool;
  color: string;
  /** Espessura do traço, como fração da largura da imagem. */
  size: number;
  opacity: number;
  censorMode: CensorMode;
  censorShape: "rect" | "ellipse";
  censorAmount: number;
}

export const DEFAULT_DRAW: DrawState = {
  mode: "draw",
  tool: "pen",
  color: "#ff4f4f",
  size: 0.008,
  opacity: 1,
  censorMode: "blur",
  censorShape: "rect",
  censorAmount: 60,
};

export function DrawPanel({
  ctx,
  draw,
  setDraw,
}: {
  ctx: PanelCtx;
  draw: DrawState;
  setDraw: (patch: Partial<DrawState>) => void;
}) {
  const tr = useTr();
  const strokes = ctx.edits.overlays.filter((o): o is StrokeOverlay => o.type === "stroke");
  const censors = ctx.edits.overlays.filter((o): o is CensorOverlay => o.type === "censor");

  return (
    <div className="space-y-4">
      <Chips
        options={[
          { id: "draw" as const, label: tr(["Desenhar", "Draw", "Dibujar", "Dessiner"]) },
          { id: "censor" as const, label: tr(["Censurar", "Censor", "Censurar", "Masquer"]) },
        ]}
        value={draw.mode}
        onChange={(mode) => setDraw({ mode })}
      />

      {draw.mode === "draw" ? (
        <>
          <div className="grid grid-cols-4 gap-1.5">
            {DRAW_TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={draw.tool === t.id}
                onClick={() => setDraw({ tool: t.id })}
                className={`inline-flex items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-medium transition cursor-pointer ${
                  draw.tool === t.id ? "border-primary bg-primary-soft text-primary" : "border-border text-foreground hover:bg-secondary"
                }`}
              >
                {t.id === "erase" && <Eraser className="h-3 w-3" />}
                {tr(t.names)}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {draw.tool === "erase"
              ? tr(["Toque num traço para apagá-lo.", "Tap a stroke to erase it.", "Toca un trazo para borrarlo.", "Touchez un trait pour l'effacer."])
              : tr(["Arraste sobre a foto para desenhar.", "Drag over the photo to draw.", "Arrastra sobre la foto para dibujar.", "Faites glisser sur la photo pour dessiner."])}
          </p>
          {draw.tool !== "erase" && (
            <>
              <ColorRow label={tr(["Cor", "Color", "Color", "Couleur"])} value={draw.color} onChange={(c) => c && setDraw({ color: c })} />
              <Slider
                label={tr(["Espessura", "Thickness", "Grosor", "Épaisseur"])}
                value={Math.round(draw.size * 1000)}
                min={2}
                max={40}
                neutral={8}
                onChange={(v) => setDraw({ size: v / 1000 })}
              />
              <Slider
                label={tr(["Opacidade", "Opacity", "Opacidad", "Opacité"])}
                value={Math.round(draw.opacity * 100)}
                min={10}
                max={100}
                neutral={100}
                unit="%"
                onChange={(v) => setDraw({ opacity: v / 100 })}
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={toolBtn}
              disabled={strokes.length === 0}
              onClick={() => {
                const last = strokes[strokes.length - 1];
                ctx.change({ overlays: ctx.edits.overlays.filter((o) => o.id !== last.id) });
              }}
            >
              {tr(["Apagar o último", "Remove last", "Borrar el último", "Effacer le dernier"])}
            </button>
            <button
              type="button"
              className={dangerBtn}
              disabled={strokes.length === 0}
              onClick={() => ctx.change({ overlays: ctx.edits.overlays.filter((o) => o.type !== "stroke") })}
            >
              {tr(["Limpar desenhos", "Clear drawings", "Limpiar dibujos", "Effacer les dessins"])}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground">
            {tr([
              "Arraste sobre a foto para cobrir uma área (rosto, placa, dado pessoal). O efeito fica na imagem final.",
              "Drag over the photo to cover an area (a face, a plate, personal data). The effect stays in the final image.",
              "Arrastra sobre la foto para cubrir un área (rostro, matrícula, dato personal). El efecto queda en la imagen final.",
              "Faites glisser sur la photo pour couvrir une zone (visage, plaque, donnée personnelle). L'effet reste dans l'image finale.",
            ])}
          </p>
          <Chips
            options={CENSOR_MODES.map((m) => ({ id: m.id, label: tr(m.names) }))}
            value={draw.censorMode}
            onChange={(censorMode) => setDraw({ censorMode })}
          />
          <Chips
            options={[
              { id: "rect" as const, label: tr(["Retângulo", "Rectangle", "Rectángulo", "Rectangle"]) },
              { id: "ellipse" as const, label: tr(["Elipse", "Ellipse", "Elipse", "Ellipse"]) },
            ]}
            value={draw.censorShape}
            onChange={(censorShape) => setDraw({ censorShape })}
          />
          {draw.censorMode !== "black" && (
            <Slider
              label={tr(["Intensidade", "Intensity", "Intensidad", "Intensité"])}
              value={draw.censorAmount}
              min={10}
              max={100}
              neutral={60}
              onChange={(censorAmount) => setDraw({ censorAmount })}
            />
          )}
          {censors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {censors.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${toolBtn} text-[11px]`}
                  onClick={() => ctx.change({ overlays: ctx.edits.overlays.filter((o) => o.id !== c.id) })}
                  title={tr(["Remover esta censura", "Remove this censor", "Quitar esta censura", "Retirer ce masque"])}
                >
                  <Trash2 className="h-3 w-3" /> {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ───────────────────────────── Moldura ─────────────────────────────

export function FramePanel({ ctx }: { ctx: PanelCtx }) {
  const tr = useTr();
  const { edits, change, slide } = ctx;
  return (
    <div className="space-y-4">
      <div>
        <Heading>{tr(["Molduras prontas", "Ready-made frames", "Marcos listos", "Cadres prêts"])}</Heading>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {FRAME_PRESETS.map((p) => {
            const active =
              edits.frameStyle === p.patch.frameStyle &&
              edits.frameWidth === p.patch.frameWidth &&
              edits.frameColor === p.patch.frameColor &&
              edits.frameRadius === p.patch.frameRadius;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => change(p.patch)}
                className={`rounded-lg border px-1 py-2 text-[11px] font-medium transition cursor-pointer ${
                  active ? "border-primary bg-primary-soft text-primary" : "border-border text-foreground hover:bg-secondary"
                }`}
              >
                {tr(p.names)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Heading>{tr(["Estilo", "Style", "Estilo", "Style"])}</Heading>
        <div className="mt-2">
          <Chips
            options={FRAME_STYLES.map((s) => ({ id: s.id, label: tr(s.names) }))}
            value={edits.frameStyle}
            onChange={(frameStyle) =>
              change({ frameStyle, frameWidth: frameStyle !== "none" && edits.frameWidth === 0 ? 5 : edits.frameWidth })
            }
          />
        </div>
      </div>

      {edits.frameStyle !== "none" && (
        <>
          <Slider
            label={tr(["Espessura", "Thickness", "Grosor", "Épaisseur"])}
            value={edits.frameWidth}
            min={1}
            max={20}
            step={0.5}
            neutral={0}
            unit="%"
            onChange={(frameWidth) => slide({ frameWidth })}
          />
          <ColorRow
            label={tr(["Cor da moldura", "Frame color", "Color del marco", "Couleur du cadre"])}
            value={edits.frameColor}
            onChange={(c) => c && change({ frameColor: c })}
          />
        </>
      )}

      <Slider
        label={tr(["Cantos arredondados", "Rounded corners", "Esquinas redondeadas", "Coins arrondis"])}
        value={edits.frameRadius}
        min={0}
        max={50}
        unit="%"
        onChange={(frameRadius) => slide({ frameRadius })}
      />
      <p className="text-[11px] text-muted-foreground">
        {tr([
          "Com cantos arredondados a foto é salva com fundo transparente nos cantos.",
          "With rounded corners the photo is saved with transparent corners.",
          "Con esquinas redondeadas la foto se guarda con las esquinas transparentes.",
          "Avec des coins arrondis, la photo est enregistrée avec des coins transparents.",
        ])}
      </p>
    </div>
  );
}
