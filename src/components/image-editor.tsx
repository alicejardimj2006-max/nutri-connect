import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Aperture,
  Crop,
  Eye,
  FlipHorizontal2,
  FlipVertical2,
  Palette,
  Redo2,
  RotateCcw,
  RotateCw,
  Sparkles,
  Sun,
  Undo2,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import {
  ASPECTS,
  DEFAULT_EDITS,
  LOOKS,
  POST_IMAGE_W,
  ZERO_ADJUSTMENTS,
  autoEnhance,
  clampOffsets,
  drawHistogram,
  frameSize,
  renderEdits,
  type ImageEdits,
} from "@/lib/image-edit";

export { DEFAULT_EDITS };
export type { ImageEdits };

const PREVIEW_W = 900;
const EXPORT_MAX_W = 1600;
const THUMB_W = 88;
const MAX_HISTORY = 60;

type TabId = "crop" | "light" | "color" | "looks" | "detail";

const TABS: {
  id: TabId;
  label: DictKey;
  icon: React.ComponentType<{ className?: string }>;
  keys: (keyof ImageEdits)[];
}[] = [
  {
    id: "crop",
    label: "ie.tab.crop",
    icon: Crop,
    keys: ["rotation", "straighten", "flipH", "flipV", "zoom", "offX", "offY", "aspect"],
  },
  {
    id: "light",
    label: "ie.tab.light",
    icon: Sun,
    keys: ["exposure", "contrast", "highlights", "shadows", "fade"],
  },
  {
    id: "color",
    label: "ie.tab.color",
    icon: Palette,
    keys: ["temperature", "tint", "saturation", "vibrance"],
  },
  { id: "looks", label: "ie.tab.looks", icon: Sparkles, keys: ["look", "lookAmount"] },
  {
    id: "detail",
    label: "ie.tab.detail",
    icon: Aperture,
    keys: ["sharpness", "blur", "vignette", "grain"],
  },
];

const isDirty = (e: ImageEdits, keys: (keyof ImageEdits)[]) =>
  keys.some((k) => e[k] !== DEFAULT_EDITS[k]);

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  neutral = 0,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** Valor "sem efeito": duplo clique no rótulo volta para ele. */
  neutral?: number;
  onChange: (v: number) => void;
}) {
  const { t } = useI18n();
  const shown = step < 1 ? value.toFixed(1) : Math.round(value);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <button
          type="button"
          onDoubleClick={() => onChange(neutral)}
          title={t("ie.resetTitle")}
          className="font-medium text-foreground cursor-pointer select-none"
        >
          {label}
        </button>
        <span
          className={`tabular-nums ${value !== neutral ? "font-semibold text-primary" : "text-muted-foreground"}`}
        >
          {value > neutral && neutral === 0 ? "+" : ""}
          {shown}
          {unit}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={() => onChange(neutral)}
        className="w-full cursor-pointer accent-[var(--color-primary)]"
      />
    </div>
  );
}

const toolBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card cursor-pointer disabled:cursor-not-allowed";

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
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [edits, setEdits] = useState<ImageEdits>({ ...DEFAULT_EDITS, ...initial });
  const editsRef = useRef(edits);
  editsRef.current = edits;
  const [past, setPast] = useState<ImageEdits[]>([]);
  const [future, setFuture] = useState<ImageEdits[]>([]);
  const [tab, setTab] = useState<TabId>("crop");
  const [comparing, setComparing] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [frameScale, setFrameScale] = useState(1);
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
  const pan = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const sliding = useRef(false);
  const slideTimer = useRef<number | undefined>(undefined);

  // Cada vez que o editor abre, recomeça dos ajustes salvos (ou do padrão), com histórico limpo.
  useEffect(() => {
    if (!open) return;
    setEdits({ ...DEFAULT_EDITS, ...initial });
    setPast([]);
    setFuture([]);
    setTab("crop");
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = src;
  }, [open, src]);

  // Render principal + histograma. Ao comparar, mostra só o recorte, sem ajustes de cor.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!open || !img || !canvas) return;
    const shown = comparing
      ? { ...edits, ...ZERO_ADJUSTMENTS, look: "none", lookAmount: 0 }
      : edits;
    const hist = renderEdits(canvas, img, shown, PREVIEW_W, true);
    if (hist && histRef.current) drawHistogram(histRef.current, hist);
  }, [open, img, edits, comparing]);

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

  const resetKeys = (keys: (keyof ImageEdits)[]) => {
    const patch: Record<string, unknown> = {};
    keys.forEach((k) => (patch[k] = DEFAULT_EDITS[k]));
    change(patch as Partial<ImageEdits>);
  };

  /** Correção automática: analisa a foto sem os ajustes de luz atuais, para não acumular. */
  const autoFix = () => {
    if (!img) return;
    const probe = document.createElement("canvas");
    const hist = renderEdits(
      probe,
      img,
      { ...edits, exposure: 0, contrast: 0, highlights: 0, shadows: 0, fade: 0, vibrance: 0 },
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
    onApply(canvas.toDataURL("image/jpeg", 0.92), edits);
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
    () => isDirty(edits, Object.keys(DEFAULT_EDITS) as (keyof ImageEdits)[]),
    [edits],
  );

  const num = (key: keyof ImageEdits) => edits[key] as number;
  const adjSlider = (key: keyof ImageEdits, label: DictKey, min = -100, max = 100) => (
    <Slider
      label={t(label)}
      value={num(key)}
      min={min}
      max={max}
      onChange={(v) => slide({ [key]: v } as Partial<ImageEdits>)}
    />
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        onKeyDown={(e) => {
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
                <canvas
                  ref={canvasRef}
                  onPointerDown={(e) => {
                    pan.current = { x: e.clientX, y: e.clientY, moved: false };
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    const p = pan.current;
                    if (!p) return;
                    if (!p.moved) {
                      p.moved = true;
                      checkpoint();
                    }
                    const rect = e.currentTarget.getBoundingClientRect();
                    const dx = (e.clientX - p.x) / rect.width;
                    const dy = (e.clientY - p.y) / rect.height;
                    p.x = e.clientX;
                    p.y = e.clientY;
                    update({ offX: editsRef.current.offX + dx, offY: editsRef.current.offY + dy });
                  }}
                  onPointerUp={() => (pan.current = null)}
                  onPointerCancel={() => (pan.current = null)}
                  style={{
                    maxHeight: mobile
                      ? "100%"
                      : `calc(clamp(10rem, calc(100dvh - 32rem), 26rem) * ${frameScale})`,
                  }}
                  className="block max-w-full cursor-grab touch-none rounded-2xl bg-white active:cursor-grabbing"
                />
              </div>
            </div>
            <p className="hidden border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground md:block">
              {t("ie.hint")}
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
                    className={`relative flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition cursor-pointer ${
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(tb.label)}
                    {isDirty(edits, tb.keys) && (
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
                            : a.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  {adjSlider("fade", "ie.fade", 0, 100)}
                </>
              )}

              {tab === "color" && (
                <>
                  {adjSlider("temperature", "ie.temperature")}
                  {adjSlider("tint", "ie.tint")}
                  {adjSlider("saturation", "ie.saturation")}
                  {adjSlider("vibrance", "ie.vibrance")}
                </>
              )}

              {tab === "looks" && (
                <>
                  <div className="grid grid-cols-3 gap-2.5">
                    {LOOKS.map((look) => {
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
                          {t(`ie.look.${look.id}` as DictKey)}
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
                  {adjSlider("blur", "ie.blur", 0, 100)}
                  {adjSlider("vignette", "ie.vignette")}
                  {adjSlider("grain", "ie.grain", 0, 100)}
                </>
              )}

              {isDirty(edits, TABS.find((t) => t.id === tab)!.keys) && (
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline cursor-pointer"
                  onClick={() => resetKeys(TABS.find((t) => t.id === tab)!.keys)}
                >
                  {t("ie.resetTab")}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/60 p-3">
              <button
                type="button"
                onClick={() => change({ ...DEFAULT_EDITS })}
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
