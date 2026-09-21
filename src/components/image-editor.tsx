import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FlipHorizontal2, RotateCcw, RotateCw, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface ImageEdits {
  /** Quartos de volta no sentido horário (0–3). */
  rotation: number;
  flip: boolean;
  zoom: number;
  /** Deslocamento da imagem, como fração da largura/altura do recorte. */
  offX: number;
  offY: number;
  aspect: string;
  brightness: number;
  contrast: number;
  saturation: number;
}

export const DEFAULT_EDITS: ImageEdits = {
  rotation: 0,
  flip: false,
  zoom: 1,
  offX: 0,
  offY: 0,
  aspect: "original",
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

const ASPECTS: { id: string; label: string; ratio: number | null }[] = [
  { id: "original", label: "Original", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
];

const PREVIEW_W = 720;
const EXPORT_MAX_W = 1600;

function geometry(img: HTMLImageElement, e: ImageEdits, outW: number) {
  const quarter = e.rotation % 2 === 1;
  const rw = quarter ? img.naturalHeight : img.naturalWidth;
  const rh = quarter ? img.naturalWidth : img.naturalHeight;
  const ratio = ASPECTS.find((a) => a.id === e.aspect)?.ratio ?? rw / rh;
  const outH = Math.round(outW / ratio);
  const base = Math.max(outW / rw, outH / rh) * e.zoom;
  const limX = Math.max(0, (rw * base - outW) / 2) / outW;
  const limY = Math.max(0, (rh * base - outH) / 2) / outH;
  return { rw, outH, base, limX, limY };
}

const clamp = (v: number, lim: number) => Math.min(lim, Math.max(-lim, v));

function draw(canvas: HTMLCanvasElement, img: HTMLImageElement, e: ImageEdits, outW: number) {
  const { outH, base, limX, limY } = geometry(img, e, outW);
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const b = e.brightness / 100;
  const c = e.contrast / 100;
  const s = e.saturation / 100;
  const nativeFilter = typeof (ctx as { filter?: string }).filter === "string";

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.save();
  if (nativeFilter) ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
  ctx.translate(outW / 2 + clamp(e.offX, limX) * outW, outH / 2 + clamp(e.offY, limY) * outH);
  ctx.scale(e.flip ? -1 : 1, 1);
  ctx.rotate((e.rotation * Math.PI) / 2);
  ctx.scale(base, base);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  // Safari não suporta ctx.filter: aplica os ajustes pixel a pixel.
  if (!nativeFilter && (b !== 1 || c !== 1 || s !== 1)) {
    const data = ctx.getImageData(0, 0, outW, outH);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      let r = px[i] * b;
      let g = px[i + 1] * b;
      let bl = px[i + 2] * b;
      r = (r - 127.5) * c + 127.5;
      g = (g - 127.5) * c + 127.5;
      bl = (bl - 127.5) * c + 127.5;
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      px[i] = gray + (r - gray) * s;
      px[i + 1] = gray + (g - gray) * s;
      px[i + 2] = gray + (bl - gray) * s;
    }
    ctx.putImageData(data, 0, 0);
  }
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "%",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-foreground">
        {label}
        <span className="tabular-nums text-muted-foreground">
          {Math.round(value)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-[var(--color-primary)]"
      />
    </label>
  );
}

/** Largura da foto dentro de um card do feed (coluna de 42rem menos o padding do card), em px. */
const POST_IMAGE_W = 624;

const toolBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary cursor-pointer";

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
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [edits, setEdits] = useState<ImageEdits>(initial ?? DEFAULT_EDITS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameScale, setFrameScale] = useState(1);
  const pan = useRef<{ x: number; y: number } | null>(null);

  // Cada vez que o editor abre, recomeça dos ajustes salvos (ou do padrão).
  useEffect(() => {
    if (open) setEdits(initial ?? DEFAULT_EDITS);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = src;
  }, [open, src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!open || !img || !canvas) return;
    draw(canvas, img, edits, PREVIEW_W);
  }, [open, img, edits]);

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
      if (img) {
        const { limX, limY } = geometry(img, next, PREVIEW_W);
        next.offX = clamp(next.offX, limX);
        next.offY = clamp(next.offY, limY);
      }
      return next;
    });

  const handleApply = () => {
    if (!img) return;
    const { rw } = geometry(img, edits, 1);
    const canvas = document.createElement("canvas");
    draw(canvas, img, edits, Math.min(EXPORT_MAX_W, Math.round(rw)));
    onApply(canvas.toDataURL("image/jpeg", 0.9), edits);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-4xl gap-0 overflow-y-auto rounded-3xl p-0">
        <div className="grid gap-0 md:grid-cols-[1fr_320px]">
          <div className="flex min-h-[260px] items-center justify-center bg-card p-4 sm:p-6">
            {/* Fundo do post: aparece nas laterais quando a altura máxima limita a foto */}
            <div
              ref={frameRef}
              className="flex w-full justify-center overflow-hidden rounded-2xl bg-secondary/40 shadow-inner"
            >
              <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                  pan.current = { x: e.clientX, y: e.clientY };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!pan.current) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const dx = (e.clientX - pan.current.x) / rect.width;
                  const dy = (e.clientY - pan.current.y) / rect.height;
                  pan.current = { x: e.clientX, y: e.clientY };
                  update({ offX: edits.offX + dx, offY: edits.offY + dy });
                }}
                onPointerUp={() => (pan.current = null)}
                onPointerCancel={() => (pan.current = null)}
                style={{
                  maxHeight: `calc(clamp(10rem, calc(100dvh - 32rem), 26rem) * ${frameScale})`,
                }}
                className="block max-w-full cursor-grab touch-none rounded-2xl bg-white active:cursor-grabbing"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <DialogTitle className="text-lg font-bold font-display">Ajustar foto</DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Arraste a imagem para reposicionar. O recorte é exatamente o que aparece na
                publicação. As mudanças só valem ao aplicar.
              </DialogDescription>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-foreground">Enquadramento</p>
              <div className="flex flex-wrap gap-1.5">
                {ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => update({ aspect: a.id })}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                      edits.aspect === a.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={toolBtn}
                onClick={() => update({ rotation: (edits.rotation + 3) % 4 })}
                title="Girar para a esquerda"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Girar
              </button>
              <button
                type="button"
                className={toolBtn}
                onClick={() => update({ rotation: (edits.rotation + 1) % 4 })}
                title="Girar para a direita"
              >
                <RotateCw className="h-3.5 w-3.5" /> Girar
              </button>
              <button
                type="button"
                className={toolBtn}
                onClick={() => update({ flip: !edits.flip })}
                title="Espelhar"
              >
                <FlipHorizontal2 className="h-3.5 w-3.5" /> Espelhar
              </button>
            </div>

            <Slider
              label="Zoom"
              value={edits.zoom * 100}
              min={100}
              max={300}
              onChange={(v) => update({ zoom: v / 100 })}
            />
            <Slider
              label="Brilho"
              value={edits.brightness}
              min={50}
              max={150}
              onChange={(v) => update({ brightness: v })}
            />
            <Slider
              label="Contraste"
              value={edits.contrast}
              min={50}
              max={150}
              onChange={(v) => update({ contrast: v })}
            />
            <Slider
              label="Saturação"
              value={edits.saturation}
              min={0}
              max={200}
              onChange={(v) => update({ saturation: v })}
            />

            <button
              type="button"
              className={`${toolBtn} self-start`}
              onClick={() => setEdits(DEFAULT_EDITS)}
            >
              <Undo2 className="h-3.5 w-3.5" /> Restaurar original
            </button>

            <div className="mt-auto flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!img}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
