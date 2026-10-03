import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Aperture,
  Crop,
  Eye,
  FlipHorizontal2,
  FlipVertical2,
  Frame,
  Palette,
  Pencil,
  Redo2,
  RotateCcw,
  RotateCw,
  Smile,
  Sparkles,
  Sun,
  Type,
  Undo2,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import { loadGoogleFont } from "@/lib/appearance";
import {
  DEFAULT_EDITS,
  POST_IMAGE_W,
  ZERO_ADJUSTMENTS,
  autoEnhance,
  clampOffsets,
  drawHistogram,
  frameSize,
  hitOverlay,
  hitStroke,
  makeId,
  needsAlpha,
  overlayBox,
  renderEdits,
  type ImageEdits,
  type Overlay,
  type StrokeOverlay,
} from "@/lib/image-edit";
import {
  ASPECTS,
  LOOKS,
  LOOK_CATEGORIES,
  TEXT_FONTS,
  type LookCategory,
  type Names,
} from "@/lib/image-edit-data";
import {
  DEFAULT_DRAW,
  DrawPanel,
  FramePanel,
  StickerPanel,
  TextPanel,
  type DrawState,
  type PanelCtx,
} from "./image-editor-panels";
import { ColorRow, Slider, toolBtn, useTr } from "./image-editor-ui";

export { DEFAULT_EDITS };
export type { ImageEdits };

const PREVIEW_W = 900;
const EXPORT_MAX_W = 1600;
const THUMB_W = 88;
const MAX_HISTORY = 60;

type TabId =
  | "crop"
  | "light"
  | "color"
  | "looks"
  | "detail"
  | "text"
  | "stickers"
  | "draw"
  | "frame";

const TABS: {
  id: TabId;
  label: DictKey | Names;
  icon: React.ComponentType<{ className?: string }>;
  keys: (keyof ImageEdits)[];
}[] = [
  {
    id: "crop",
    label: "ie.tab.crop",
    icon: Crop,
    keys: ["rotation", "straighten", "flipH", "flipV", "zoom", "offX", "offY", "aspect", "customRatio"],
  },
  {
    id: "light",
    label: "ie.tab.light",
    icon: Sun,
    keys: ["exposure", "contrast", "highlights", "shadows", "whites", "blacks", "fade"],
  },
  {
    id: "color",
    label: "ie.tab.color",
    icon: Palette,
    keys: ["temperature", "tint", "hue", "saturation", "vibrance", "colorize"],
  },
  { id: "looks", label: "ie.tab.looks", icon: Sparkles, keys: ["look", "lookAmount"] },
  {
    id: "detail",
    label: "ie.tab.detail",
    icon: Aperture,
    keys: ["sharpness", "clarity", "blur", "tilt", "vignette", "grain", "sepia"],
  },
  { id: "text", label: ["Texto", "Text", "Texto", "Texte"], icon: Type, keys: [] },
  { id: "stickers", label: ["Adesivos", "Stickers", "Adhesivos", "Autocollants"], icon: Smile, keys: [] },
  { id: "draw", label: ["Desenho", "Draw", "Dibujo", "Dessin"], icon: Pencil, keys: [] },
  {
    id: "frame",
    label: ["Moldura", "Frame", "Marco", "Cadre"],
    icon: Frame,
    keys: ["frameStyle", "frameWidth", "frameColor", "frameRadius"],
  },
];

const OVERLAY_TABS: Partial<Record<TabId, Overlay["type"][]>> = {
  text: ["text"],
  stickers: ["sticker"],
  draw: ["stroke", "censor"],
};

const isDirty = (e: ImageEdits, keys: (keyof ImageEdits)[]) =>
  keys.some((k) => e[k] !== DEFAULT_EDITS[k]);

const tabDirty = (e: ImageEdits, tab: (typeof TABS)[number]) => {
  const types = OVERLAY_TABS[tab.id];
  if (types) return e.overlays.some((o) => types.includes(o.type));
  return isDirty(e, tab.keys);
};

const FREEHAND = new Set(["pen", "marker", "neon"]);

type Drag =
  | { mode: "pan"; x: number; y: number; moved: boolean }
  | { mode: "move"; id: string; x: number; y: number; moved: boolean }
  | { mode: "draw"; id: string; ox: number; oy: number }
  | { mode: "erase"; moved: boolean };

export function ImageEditor({
  open,
  src,
  initial,
  onCancel,
  onApply,
}: {
  open: boolean;
  src: string;
  initial?: ImageEdits;
  onCancel: () => void;
  onApply: (dataUrl: string, edits: ImageEdits) => void;
}) {
  const { t } = useI18n();
  const tr = useTr();
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [edits, setEdits] = useState<ImageEdits>({ ...DEFAULT_EDITS, ...initial });
  const editsRef = useRef(edits);
  editsRef.current = edits;
  const [past, setPast] = useState<ImageEdits[]>([]);
  const [future, setFuture] = useState<ImageEdits[]>([]);
  const [tab, setTab] = useState<TabId>("crop");
  const [comparing, setComparing] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [lookCategory, setLookCategory] = useState<LookCategory | "all">("all");
  const [frameScale, setFrameScale] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draw, setDrawState] = useState<DrawState>(DEFAULT_DRAW);
  const setDraw = (patch: Partial<DrawState>) => setDrawState((d) => ({ ...d, ...patch }));
  const [fontTick, setFontTick] = useState(0);
  // No celular a foto ocupa todo o palco (a referência de altura do post deixaria ela minúscula).
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const histRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const sliding = useRef(false);
  const slideTimer = useRef<number | undefined>(undefined);

  // Cada vez que o editor abre, recomeça dos ajustes salvos (ou do padrão), com histórico limpo.
  useEffect(() => {
    if (!open) return;
    setEdits({ ...DEFAULT_EDITS, ...initial });
    setPast([]);
    setFuture([]);
    setTab("crop");
    setSelectedId(null);
    setDrawState(DEFAULT_DRAW);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = src;
  }, [open, src]);

  // As fontes do texto precisam estar carregadas para o canvas desenhá-las.
  useEffect(() => {
    if (!open) return;
    for (const f of TEXT_FONTS) {
      loadGoogleFont(f);
      void document.fonts?.load(`16px ${f.css}`).then(() => setFontTick((n) => n + 1));
    }
  }, [open]);

  // Render principal + histograma. Ao comparar, mostra só o recorte, sem ajustes nem camadas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!open || !img || !canvas) return;
    const shown = comparing
      ? {
          ...edits,
          ...ZERO_ADJUSTMENTS,
          look: "none",
          lookAmount: 0,
          overlays: [],
          frameStyle: "none" as const,
          frameWidth: 0,
          frameRadius: 0,
        }
      : edits;
    const hist = renderEdits(canvas, img, shown, PREVIEW_W, true);
    if (hist && histRef.current) drawHistogram(histRef.current, hist);
  }, [open, img, edits, comparing, fontTick]);

  // Miniaturas dos filtros (quadradas, independentes do recorte atual).
  useEffect(() => {
    if (!open || !img) return;
    const canvas = document.createElement("canvas");
    const next: Record<string, string> = {};
    for (const look of LOOKS) {
      renderEdits(
        canvas,
        img,
        { ...DEFAULT_EDITS, aspect: "1:1", look: look.id, lookAmount: 100 },
        THUMB_W * 2,
      );
      next[look.id] = canvas.toDataURL("image/jpeg", 0.8);
    }
    setThumbs(next);
  }, [open, img]);

  // A área de ajuste reproduz a foto do post: mesma proporção de largura e altura máxima.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!open || !frame) return;
    const measure = () => setFrameScale(Math.min(1, frame.clientWidth / POST_IMAGE_W));
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    measure();
    return () => observer.disconnect();
  }, [open, img]);

  /** Aplica a mudança e mantém a imagem cobrindo todo o recorte. */
  const update = (patch: Partial<ImageEdits>) =>
    setEdits((prev) => {
      const next = { ...prev, ...patch };
      if (img) Object.assign(next, clampOffsets(img, next, PREVIEW_W));
      return next;
    });
  /** Como `update`, mas a mudança é calculada a partir do estado mais recente (arrasto rápido). */
  const updateFn = (fn: (e: ImageEdits) => Partial<ImageEdits>) =>
    setEdits((prev) => {
      const next = { ...prev, ...fn(prev) };
      if (img) Object.assign(next, clampOffsets(img, next, PREVIEW_W));
      return next;
    });

  const checkpoint = () => {
    setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), editsRef.current]);
    setFuture([]);
  };
  /** Mudança pontual (botões): vira um passo no histórico. */
  const change = (patch: Partial<ImageEdits>) => {
    checkpoint();
    update(patch);
  };
  /** Mudança contínua (sliders): agrupa o arrasto inteiro em um único passo. */
  const slide = (patch: Partial<ImageEdits>) => {
    if (!sliding.current) {
      checkpoint();
      sliding.current = true;
    }
    window.clearTimeout(slideTimer.current);
    slideTimer.current = window.setTimeout(() => (sliding.current = false), 600);
    update(patch);
  };

  const undo = () => {
    const prev = past[past.length - 1];
    if (!prev) return;
    setFuture((f) => [editsRef.current, ...f]);
    setPast((p) => p.slice(0, -1));
    setEdits(prev);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setPast((p) => [...p, editsRef.current]);
    setFuture((f) => f.slice(1));
    setEdits(next);
  };

  const currentTab = TABS.find((x) => x.id === tab)!;

  const resetTab = () => {
    const types = OVERLAY_TABS[tab];
    if (types) {
      change({ overlays: edits.overlays.filter((o) => !types.includes(o.type)) });
      setSelectedId(null);
      return;
    }
    const patch: Record<string, unknown> = {};
    currentTab.keys.forEach((k) => (patch[k] = DEFAULT_EDITS[k]));
    change(patch as Partial<ImageEdits>);
  };

  /** Correção automática: analisa a foto sem os ajustes de luz atuais, para não acumular. */
  const autoFix = () => {
    if (!img) return;
    const probe = document.createElement("canvas");
    const hist = renderEdits(
      probe,
      img,
      {
        ...edits,
        exposure: 0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        fade: 0,
        vibrance: 0,
        overlays: [],
      },
      320,
      true,
    );
    if (hist) change(autoEnhance(hist));
  };

  const handleApply = () => {
    if (!img) return;
    const { rw } = frameSize(img, edits, 1);
    const canvas = document.createElement("canvas");
    renderEdits(canvas, img, edits, Math.min(EXPORT_MAX_W, Math.round(rw)));
    // Cantos arredondados/círculo precisam de transparência (WebP); o resto segue em JPEG.
    const url = needsAlpha(edits)
      ? canvas.toDataURL("image/webp", 0.92)
      : canvas.toDataURL("image/jpeg", 0.92);
    onApply(url, edits);
  };

  // Zoom com a roda do mouse sobre a imagem.
  useEffect(() => {
    const frame = frameRef.current;
    if (!open || !frame) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const z = editsRef.current.zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06);
      slide({ zoom: Math.min(4, Math.max(1, z)) });
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, img]);

  const dirtyAny = useMemo(
    () =>
      isDirty(edits, (Object.keys(DEFAULT_EDITS) as (keyof ImageEdits)[]).filter((k) => k !== "overlays")) ||
      edits.overlays.length > 0,
    [edits],
  );

  // ── Interação com a foto: mover camadas, desenhar, censurar, apagar traços e reposicionar ──

  const norm = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      nx: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      ny: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      rect,
    };
  };
  const outHeight = () => (img ? frameSize(img, editsRef.current, PREVIEW_W).outH : PREVIEW_W);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { nx, ny } = norm(e);
    e.currentTarget.setPointerCapture(e.pointerId);

    if (tab === "draw") {
      if (draw.mode === "draw" && draw.tool === "erase") {
        const hit = hitStroke(editsRef.current.overlays, nx, ny, PREVIEW_W, outHeight());
        drag.current = { mode: "erase", moved: false };
        if (hit) {
          checkpoint();
          drag.current = { mode: "erase", moved: true };
          updateFn((prev) => ({ overlays: prev.overlays.filter((o) => o.id !== hit.id) }));
        }
        return;
      }
      checkpoint();
      const id = makeId();
      const overlay: Overlay =
        draw.mode === "censor"
          ? {
              id,
              type: "censor",
              mode: draw.censorMode,
              shape: draw.censorShape,
              x: nx,
              y: ny,
              w: 0,
              h: 0,
              amount: draw.censorAmount,
              opacity: 1,
            }
          : {
              id,
              type: "stroke",
              tool: draw.tool as StrokeOverlay["tool"],
              points: [[nx, ny]],
              color: draw.color,
              width: draw.size,
              opacity: draw.opacity,
            };
      updateFn((prev) => ({ overlays: [...prev.overlays, overlay] }));
      drag.current = { mode: "draw", id, ox: nx, oy: ny };
      return;
    }

    if (tab === "text" || tab === "stickers") {
      const hit = hitOverlay(editsRef.current.overlays, nx, ny, PREVIEW_W, outHeight());
      const allowed = OVERLAY_TABS[tab] ?? [];
      if (hit && allowed.includes(hit.type)) {
        setSelectedId(hit.id);
        drag.current = { mode: "move", id: hit.id, x: e.clientX, y: e.clientY, moved: false };
      } else {
        setSelectedId(null);
        drag.current = null;
      }
      return;
    }

    drag.current = { mode: "pan", x: e.clientX, y: e.clientY, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) return;
    const { nx, ny, rect } = norm(e);

    if (d.mode === "draw") {
      updateFn((prev) => ({
        overlays: prev.overlays.map((o) => {
          if (o.id !== d.id) return o;
          if (o.type === "stroke") {
            return FREEHAND.has(o.tool)
              ? { ...o, points: [...o.points, [nx, ny] as [number, number]] }
              : { ...o, points: [o.points[0], [nx, ny] as [number, number]] };
          }
          if (o.type === "censor") {
            return { ...o, x: Math.min(d.ox, nx), y: Math.min(d.oy, ny), w: Math.abs(nx - d.ox), h: Math.abs(ny - d.oy) };
          }
          return o;
        }),
      }));
      return;
    }

    if (d.mode === "erase") {
      const hit = hitStroke(editsRef.current.overlays, nx, ny, PREVIEW_W, outHeight());
      if (hit) {
        if (!d.moved) {
          checkpoint();
          d.moved = true;
        }
        updateFn((prev) => ({ overlays: prev.overlays.filter((o) => o.id !== hit.id) }));
      }
      return;
    }

    const dx = (e.clientX - d.x) / rect.width;
    const dy = (e.clientY - d.y) / rect.height;
    d.x = e.clientX;
    d.y = e.clientY;
    if (!d.moved) {
      d.moved = true;
      checkpoint();
    }
    if (d.mode === "move") {
      updateFn((prev) => ({
        overlays: prev.overlays.map((o) =>
          o.id === d.id && (o.type === "text" || o.type === "sticker")
            ? { ...o, x: Math.min(1, Math.max(0, o.x + dx)), y: Math.min(1, Math.max(0, o.y + dy)) }
            : o,
        ),
      }));
    } else {
      update({ offX: editsRef.current.offX + dx, offY: editsRef.current.offY + dy });
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.mode === "draw") {
      // Censura sem área (um simples toque) não vira camada.
      updateFn((prev) => ({
        overlays: prev.overlays.filter(
          (o) => !(o.id === d.id && o.type === "censor" && (o.w < 0.01 || o.h < 0.01)),
        ),
      }));
    }
  };

  const ctx: PanelCtx = { edits, selectedId, select: setSelectedId, change, slide };

  // Caixa de seleção da camada escolhida (texto ou adesivo), sobre a foto.
  const selected = edits.overlays.find((o) => o.id === selectedId) ?? null;
  const selBox = (() => {
    if (!img || !selected || comparing || (tab !== "text" && tab !== "stickers")) return null;
    const outH = frameSize(img, edits, PREVIEW_W).outH;
    const box = overlayBox(selected, PREVIEW_W, outH);
    if (!box) return null;
    return {
      left: `${((box.cx - box.w / 2) / PREVIEW_W) * 100}%`,
      top: `${((box.cy - box.h / 2) / outH) * 100}%`,
      width: `${(box.w / PREVIEW_W) * 100}%`,
      height: `${(box.h / outH) * 100}%`,
      transform: `rotate(${box.rotation}deg)`,
    };
  })();

  const num = (key: keyof ImageEdits) => edits[key] as number;
  const adjSlider = (key: keyof ImageEdits, label: DictKey | Names, min = -100, max = 100) => (
    <Slider
      label={Array.isArray(label) ? tr(label as Names) : t(label as DictKey)}
      value={num(key)}
      min={min}
      max={max}
      resetTitle={t("ie.resetTitle")}
      onChange={(v) => slide({ [key]: v } as Partial<ImageEdits>)}
    />
  );

  const visibleLooks = LOOKS.filter((l) => lookCategory === "all" || l.category === lookCategory || l.id === "none");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
          if (!typing && (e.key === "Delete" || e.key === "Backspace") && selectedId) {
            e.preventDefault();
            change({ overlays: edits.overlays.filter((o) => o.id !== selectedId) });
            setSelectedId(null);
            return;
          }
          const mod = e.ctrlKey || e.metaKey;
          if (!mod) return;
          const k = e.key.toLowerCase();
          if (k === "z" && !e.shiftKey) {
            e.preventDefault();
            undo();
          } else if ((k === "z" && e.shiftKey) || k === "y") {
            e.preventDefault();
            redo();
          }
        }}
        className="flex h-[94dvh] max-h-[94dvh] w-[96vw] max-w-6xl flex-col gap-0 overflow-hidden rounded-3xl p-0 md:h-[88dvh]"
      >
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,50%)_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_380px] md:grid-rows-1">
          {/* ------------------------------ Palco ------------------------------ */}
          <div className="flex min-h-0 flex-col bg-card">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5 pr-14">
              <DialogTitle className="mr-auto text-base font-bold font-display">
                {t("ie.title")}
              </DialogTitle>
              <DialogDescription className="sr-only">{t("ie.desc")}</DialogDescription>
              <button
                type="button"
                className={toolBtn}
                onClick={undo}
                disabled={past.length === 0}
                title={t("ie.undoTitle")}
                aria-label={t("ie.undo")}
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={toolBtn}
                onClick={redo}
                disabled={future.length === 0}
                title={t("ie.redoTitle")}
                aria-label={t("ie.redo")}
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={toolBtn}
                onPointerDown={() => setComparing(true)}
                onPointerUp={() => setComparing(false)}
                onPointerLeave={() => setComparing(false)}
                onPointerCancel={() => setComparing(false)}
                disabled={!dirtyAny}
                title={t("ie.compareTitle")}
              >
                <Eye className="h-3.5 w-3.5" /> {t("ie.compare")}
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-secondary/30 p-2 md:p-6">
              {/* Fundo do post: aparece nas laterais quando a altura máxima limita a foto */}
              <div
                ref={frameRef}
                className={`flex w-full justify-center overflow-hidden rounded-2xl bg-secondary/60 shadow-inner ${mobile ? "h-full items-center" : ""}`}
              >
                <div className="relative max-w-full">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    style={{
                      maxHeight: mobile
                        ? "100%"
                        : `calc(clamp(10rem, calc(100dvh - 32rem), 26rem) * ${frameScale})`,
                    }}
                    className={`block max-w-full touch-none rounded-2xl bg-white ${
                      tab === "draw"
                        ? "cursor-crosshair"
                        : tab === "text" || tab === "stickers"
                          ? "cursor-pointer"
                          : "cursor-grab active:cursor-grabbing"
                    }`}
                  />
                  {selBox && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute rounded-md border-2 border-dashed border-primary"
                      style={selBox}
                    />
                  )}
                </div>
              </div>
            </div>
            <p className="hidden border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground md:block">
              {tab === "draw"
                ? tr([
                    "Arraste sobre a foto para desenhar ou censurar.",
                    "Drag over the photo to draw or censor.",
                    "Arrastra sobre la foto para dibujar o censurar.",
                    "Faites glisser sur la photo pour dessiner ou masquer.",
                  ])
                : tab === "text" || tab === "stickers"
                  ? tr([
                      "Toque num item para selecioná-lo e arraste para mover. Delete apaga o selecionado.",
                      "Tap an item to select it and drag to move. Delete removes the selected one.",
                      "Toca un elemento para seleccionarlo y arrástralo para moverlo. Suprimir borra el seleccionado.",
                      "Touchez un élément pour le sélectionner et faites-le glisser. Suppr. efface la sélection.",
                    ])
                  : t("ie.hint")}
            </p>
          </div>

          {/* ------------------------------ Painel ------------------------------ */}
          <div className="flex min-h-0 flex-col border-t border-border/60 md:border-l md:border-t-0">
            <div className="border-b border-border/60 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("ie.histogram")}
                </span>
                <button
                  type="button"
                  onClick={autoFix}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary transition hover:opacity-80 cursor-pointer"
                >
                  <Zap className="h-3 w-3" /> {t("ie.auto")}
                </button>
              </div>
              <canvas ref={histRef} className="h-14 w-full rounded-lg bg-secondary/40" />
            </div>

            <div role="tablist" className="grid grid-cols-5 border-b border-border/60">
              {TABS.map((tb) => {
                const Icon = tb.icon;
                const active = tab === tb.id;
                return (
                  <button
                    key={tb.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(tb.id)}
                    className={`relative flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium transition cursor-pointer ${
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {Array.isArray(tb.label) ? tr(tb.label as Names) : t(tb.label as DictKey)}
                    {tabDirty(edits, tb) && (
                      <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {tab === "crop" && (
                <>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-foreground">{t("ie.aspect")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ASPECTS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => change({ aspect: a.id })}
                          title={
                            a.id === "original"
                              ? t("ie.aspect.originalTitle")
                              : a.id === "native"
                                ? t("ie.aspect.nativeTitle")
                                : undefined
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                            edits.aspect === a.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {a.id === "original" || a.id === "native"
                            ? t(a.id === "original" ? "ie.aspect.original" : "ie.aspect.native")
                            : tr(a.names)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {edits.aspect === "free" && (
                    <Slider
                      label={tr(["Proporção (largura ÷ altura)", "Ratio (width ÷ height)", "Proporción (ancho ÷ alto)", "Rapport (largeur ÷ hauteur)"])}
                      value={Math.round(edits.customRatio * 100) / 100}
                      min={0.3}
                      max={3.5}
                      step={0.05}
                      neutral={1}
                      onChange={(v) => slide({ customRatio: v })}
                    />
                  )}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      className={toolBtn}
                      onClick={() => change({ rotation: (edits.rotation + 3) % 4 })}
                      title={t("ie.rotateLeft")}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className={toolBtn}
                      onClick={() => change({ rotation: (edits.rotation + 1) % 4 })}
                      title={t("ie.rotateRight")}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className={toolBtn}
                      onClick={() => change({ flipH: !edits.flipH })}
                      title={t("ie.flipH")}
                    >
                      <FlipHorizontal2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className={toolBtn}
                      onClick={() => change({ flipV: !edits.flipV })}
                      title={t("ie.flipV")}
                    >
                      <FlipVertical2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Slider
                    label={t("ie.straighten")}
                    value={edits.straighten}
                    min={-45}
                    max={45}
                    step={0.5}
                    unit="°"
                    onChange={(v) => slide({ straighten: v })}
                  />
                  <Slider
                    label={t("ie.zoom")}
                    value={Math.round(edits.zoom * 100)}
                    min={100}
                    max={400}
                    unit="%"
                    neutral={100}
                    onChange={(v) => slide({ zoom: v / 100 })}
                  />
                  <button
                    type="button"
                    className={toolBtn}
                    onClick={() => change({ offX: 0, offY: 0 })}
                    disabled={edits.offX === 0 && edits.offY === 0}
                  >
                    {t("ie.center")}
                  </button>
                </>
              )}

              {tab === "light" && (
                <>
                  {adjSlider("exposure", "ie.exposure")}
                  {adjSlider("contrast", "ie.contrast")}
                  {adjSlider("highlights", "ie.highlights")}
                  {adjSlider("shadows", "ie.shadows")}
                  {adjSlider("whites", ["Brancos", "Whites", "Blancos", "Blancs"])}
                  {adjSlider("blacks", ["Pretos", "Blacks", "Negros", "Noirs"])}
                  {adjSlider("fade", "ie.fade", 0, 100)}
                </>
              )}

              {tab === "color" && (
                <>
                  {adjSlider("temperature", "ie.temperature")}
                  {adjSlider("tint", "ie.tint")}
                  {adjSlider("hue", ["Matiz", "Hue", "Matiz", "Teinte"], -180, 180)}
                  {adjSlider("saturation", "ie.saturation")}
                  {adjSlider("vibrance", "ie.vibrance")}
                  {adjSlider("colorize", ["Colorização", "Colorize", "Colorización", "Colorisation"], 0, 100)}
                  {edits.colorize > 0 && (
                    <ColorRow
                      label={tr(["Cor da colorização", "Colorize color", "Color de la colorización", "Couleur de colorisation"])}
                      value={edits.colorizeColor}
                      onChange={(c) => c && change({ colorizeColor: c })}
                    />
                  )}
                </>
              )}

              {tab === "looks" && (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all" as const, label: tr(["Todos", "All", "Todos", "Tous"]) },
                      ...LOOK_CATEGORIES.map((c) => ({ id: c.id, label: tr(c.names) })),
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={lookCategory === c.id}
                        onClick={() => setLookCategory(c.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                          lookCategory === c.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {visibleLooks.map((look) => {
                      const active = edits.look === look.id;
                      return (
                        <button
                          key={look.id}
                          type="button"
                          onClick={() => change({ look: look.id })}
                          className={`group flex flex-col items-center gap-1 rounded-xl border-2 p-1 text-[11px] font-medium transition cursor-pointer ${
                            active
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:border-border"
                          }`}
                        >
                          {thumbs[look.id] ? (
                            <img
                              src={thumbs[look.id]}
                              alt=""
                              className="aspect-square w-full rounded-lg object-cover"
                            />
                          ) : (
                            <span className="aspect-square w-full rounded-lg bg-secondary" />
                          )}
                          {tr(look.names)}
                        </button>
                      );
                    })}
                  </div>
                  {edits.look !== "none" && (
                    <Slider
                      label={t("ie.lookAmount")}
                      value={edits.lookAmount}
                      min={0}
                      max={100}
                      unit="%"
                      neutral={100}
                      onChange={(v) => slide({ lookAmount: v })}
                    />
                  )}
                </>
              )}

              {tab === "detail" && (
                <>
                  {adjSlider("sharpness", "ie.sharpness", 0, 100)}
                  {adjSlider("clarity", ["Clareza", "Clarity", "Claridad", "Clarté"])}
                  {adjSlider("blur", "ie.blur", 0, 100)}
                  {adjSlider("tilt", ["Desfoque de profundidade", "Depth blur", "Desenfoque de profundidad", "Flou de profondeur"], 0, 100)}
                  {adjSlider("vignette", "ie.vignette")}
                  {adjSlider("grain", "ie.grain", 0, 100)}
                  {adjSlider("sepia", ["Sépia", "Sepia", "Sepia", "Sépia"], 0, 100)}
                </>
              )}

              {tab === "text" && <TextPanel ctx={ctx} />}
              {tab === "stickers" && <StickerPanel ctx={ctx} />}
              {tab === "draw" && <DrawPanel ctx={ctx} draw={draw} setDraw={setDraw} />}
              {tab === "frame" && <FramePanel ctx={ctx} />}

              {tabDirty(edits, currentTab) && tab !== "frame" && (
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline cursor-pointer"
                  onClick={resetTab}
                >
                  {t("ie.resetTab")}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/60 p-3">
              <button
                type="button"
                onClick={() => {
                  change({ ...DEFAULT_EDITS, overlays: [] });
                  setSelectedId(null);
                }}
                disabled={!dirtyAny}
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
              >
                {t("ie.restoreAll")}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!img}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {t("ie.apply")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

