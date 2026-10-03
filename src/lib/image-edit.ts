// Motor de edição de imagens (canvas, sem dependências): geometria, ajustes por pixel, filtros,
// camadas (texto, adesivos, desenho, censura), molduras e histograma.
import {
  ASPECTS,
  LOOKS,
  TEXT_FONTS,
  type CensorMode,
  type DrawTool,
  type FrameStyle,
  type ShapeId,
  type TextFontId,
} from "./image-edit-data";

export type AdjustKey =
  | "exposure"
  | "contrast"
  | "highlights"
  | "shadows"
  | "whites"
  | "blacks"
  | "fade"
  | "temperature"
  | "tint"
  | "hue"
  | "saturation"
  | "vibrance"
  | "colorize"
  | "sepia"
  | "clarity"
  | "sharpness"
  | "blur"
  | "tilt"
  | "vignette"
  | "grain";

export type Adjustments = Record<AdjustKey, number>;

// ───────────────────────────── Camadas ─────────────────────────────
// Posições e tamanhos são frações da largura (x, size, width) e da altura (y) da imagem final,
// então as camadas acompanham a foto em qualquer tamanho de exportação.

interface OverlayBase {
  id: string;
  /** 0 a 1. */
  opacity: number;
}

export interface TextOverlay extends OverlayBase {
  type: "text";
  text: string;
  x: number;
  y: number;
  /** Altura da letra, como fração da largura da imagem. */
  size: number;
  color: string;
  font: TextFontId;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  /** Espaço entre letras em px (na largura de 1000 px). */
  letterSpacing: number;
  /** Cor do contorno; null = sem contorno. */
  outline: string | null;
  shadow: boolean;
  /** Cor do fundo atrás do texto (aceita rgba); null = sem fundo. */
  bg: string | null;
  rotation: number;
}

export interface StickerOverlay extends OverlayBase {
  type: "sticker";
  kind: "emoji" | "shape";
  /** Emoji ou id de forma (ShapeId). */
  glyph: string;
  color: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  flip: boolean;
}

export interface StrokeOverlay extends OverlayBase {
  type: "stroke";
  tool: Exclude<DrawTool, "erase">;
  points: [number, number][];
  color: string;
  /** Espessura como fração da largura da imagem. */
  width: number;
}

export interface CensorOverlay extends OverlayBase {
  type: "censor";
  mode: CensorMode;
  shape: "rect" | "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Intensidade 1–100 (tamanho do borrão ou do pixel). */
  amount: number;
}

export type Overlay = TextOverlay | StickerOverlay | StrokeOverlay | CensorOverlay;

export function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// ───────────────────────────── Edições ─────────────────────────────

export interface ImageEdits extends Adjustments {
  /** Quartos de volta no sentido horário (0–3). */
  rotation: number;
  /** Ajuste fino de horizonte, em graus (−45 a 45). */
  straighten: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  /** Deslocamento da imagem, como fração da largura/altura do recorte. */
  offX: number;
  offY: number;
  aspect: string;
  /** Proporção usada quando o corte é "Livre" (largura ÷ altura). */
  customRatio: number;
  /** Filtro aplicado (id de LOOKS) e sua intensidade (0–100). */
  look: string;
  lookAmount: number;
  /** Cor da colorização manual (usada com o ajuste "colorize"). */
  colorizeColor: string;
  frameStyle: FrameStyle;
  /** Espessura da moldura, em % do lado menor. */
  frameWidth: number;
  frameColor: string;
  /** Cantos arredondados, em % do lado menor (50 = círculo). */
  frameRadius: number;
  overlays: Overlay[];
}

export const ZERO_ADJUSTMENTS: Adjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  fade: 0,
  temperature: 0,
  tint: 0,
  hue: 0,
  saturation: 0,
  vibrance: 0,
  colorize: 0,
  sepia: 0,
  clarity: 0,
  sharpness: 0,
  blur: 0,
  tilt: 0,
  vignette: 0,
  grain: 0,
};

export const DEFAULT_EDITS: ImageEdits = {
  ...ZERO_ADJUSTMENTS,
  rotation: 0,
  straighten: 0,
  flipH: false,
  flipV: false,
  zoom: 1,
  offX: 0,
  offY: 0,
  aspect: "original",
  customRatio: 1,
  look: "none",
  lookAmount: 100,
  colorizeColor: "#ff8a3d",
  frameStyle: "none",
  frameWidth: 0,
  frameColor: "#ffffff",
  frameRadius: 0,
  overlays: [],
};

/** Largura da foto dentro de um card do feed (coluna de 42rem menos o padding do card), em px. */
export const POST_IMAGE_W = 624;

/**
 * Proporção do maior espaço que uma foto pode ocupar no post (largura da foto × altura máxima,
 * `clamp(10rem, 100dvh − 32rem, 26rem)`), na tela atual.
 */
export function postMaxRatio() {
  if (typeof window === "undefined") return POST_IMAGE_W / 416;
  const width = Math.min(POST_IMAGE_W, window.innerWidth - 80);
  const height = Math.min(416, Math.max(160, window.innerHeight - 512));
  return width / height;
}

/** Ajustes efetivos: controles da pessoa + o filtro escolhido, proporcional à intensidade. */
export function effectiveAdjustments(e: ImageEdits): Adjustments {
  const look = LOOKS.find((l) => l.id === e.look);
  const k = e.lookAmount / 100;
  const out = { ...ZERO_ADJUSTMENTS };
  (Object.keys(out) as AdjustKey[]).forEach((key) => {
    out[key] = e[key] + (look?.adjust[key] ?? 0) * k;
  });
  return out;
}

/** Cor da colorização: a do filtro, se ele tiver uma; senão a escolhida à mão. */
function colorizeColorOf(e: ImageEdits): string {
  const look = LOOKS.find((l) => l.id === e.look);
  return look?.colorize && e.lookAmount > 0 ? look.colorize : e.colorizeColor;
}

/* ------------------------------ Geometria ------------------------------ */

const angleOf = (e: ImageEdits) => ((e.rotation * 90 + e.straighten) * Math.PI) / 180;

export function frameSize(img: HTMLImageElement, e: ImageEdits, outW: number) {
  const quarter = e.rotation % 2 === 1;
  const rw = quarter ? img.naturalHeight : img.naturalWidth;
  const rh = quarter ? img.naturalWidth : img.naturalHeight;
  const def = ASPECTS.find((a) => a.id === e.aspect)?.ratio ?? null;
  const ratio =
    def === "post"
      ? postMaxRatio()
      : def === "free"
        ? Math.min(3.5, Math.max(0.3, e.customRatio))
        : (def ?? rw / rh);
  return { rw, rh, outW, outH: Math.max(1, Math.round(outW / ratio)) };
}

/** Escala mínima para a imagem (já girada) cobrir todo o recorte, vezes o zoom. */
function baseScale(img: HTMLImageElement, e: ImageEdits, outW: number, outH: number) {
  const a = angleOf(e);
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  let need = 0;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const x = (sx * outW) / 2;
      const y = (sy * outH) / 2;
      const u = Math.abs(x * cos + y * sin);
      const v = Math.abs(-x * sin + y * cos);
      need = Math.max(need, u / (img.naturalWidth / 2), v / (img.naturalHeight / 2));
    }
  }
  return need * e.zoom;
}

/** Mantém a imagem cobrindo todo o recorte (sem bordas vazias), mesmo girada. */
export function clampOffsets(img: HTMLImageElement, e: ImageEdits, outW: number) {
  const { outH } = frameSize(img, e, outW);
  const base = baseScale(img, e, outW, outH);
  const a = angleOf(e);
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const hw = (img.naturalWidth * base) / 2 + 0.01;
  const hh = (img.naturalHeight * base) / 2 + 0.01;
  const covers = (ox: number, oy: number) => {
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        let dx = (sx * outW) / 2 - ox;
        let dy = (sy * outH) / 2 - oy;
        if (e.flipH) dx = -dx;
        if (e.flipV) dy = -dy;
        const u = dx * cos + dy * sin;
        const v = -dx * sin + dy * cos;
        if (Math.abs(u) > hw || Math.abs(v) > hh) return false;
      }
    }
    return true;
  };
  const ox = e.offX * outW;
  const oy = e.offY * outH;
  if (covers(ox, oy)) return { offX: e.offX, offY: e.offY };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (covers(ox * mid, oy * mid)) lo = mid;
    else hi = mid;
  }
  return { offX: e.offX * lo, offY: e.offY * lo };
}

/* -------------------------------- Utilitários -------------------------------- */

export interface Histogram {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  l: Uint32Array;
}

function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function hexToRgb01(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Desfoque de caixa (rápido, independente do navegador) nos canais de cor. */
function boxBlur(src: Uint8ClampedArray, w: number, h: number, radius: number, passes = 1) {
  let a = new Uint8ClampedArray(src);
  let b = new Uint8ClampedArray(src.length);
  const r = Math.max(1, Math.round(radius));
  for (let p = 0; p < passes; p++) {
    // horizontal
    for (let y = 0; y < h; y++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        const row = y * w * 4;
        for (let x = -r; x <= r; x++) sum += a[row + Math.min(w - 1, Math.max(0, x)) * 4 + c];
        for (let x = 0; x < w; x++) {
          b[row + x * 4 + c] = sum / (2 * r + 1);
          sum += a[row + Math.min(w - 1, x + r + 1) * 4 + c] - a[row + Math.max(0, x - r) * 4 + c];
        }
      }
    }
    for (let i = 3; i < b.length; i += 4) b[i] = 255;
    // vertical
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let y = -r; y <= r; y++) sum += b[Math.min(h - 1, Math.max(0, y)) * w * 4 + x * 4 + c];
        for (let y = 0; y < h; y++) {
          a[y * w * 4 + x * 4 + c] = sum / (2 * r + 1);
          sum +=
            b[Math.min(h - 1, y + r + 1) * w * 4 + x * 4 + c] -
            b[Math.max(0, y - r) * w * 4 + x * 4 + c];
        }
      }
    }
    for (let i = 3; i < a.length; i += 4) a[i] = 255;
  }
  const out = a;
  a = b = new Uint8ClampedArray(0);
  return out;
}

/* -------------------------------- Render -------------------------------- */

/** Desenha a imagem com recorte/rotação, aplica os ajustes, as camadas, a moldura e a máscara. */
export function renderEdits(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  edits: ImageEdits,
  outW: number,
  wantHistogram = false,
): Histogram | null {
  const { outH } = frameSize(img, edits, outW);
  const base = baseScale(img, edits, outW, outH);
  const { offX, offY } = clampOffsets(img, edits, outW);
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const adj = effectiveAdjustments(edits);

  /** Camadas, moldura e máscara por cima da foto já ajustada. */
  const finish = () => {
    drawOverlays(ctx, edits.overlays, outW, outH);
    drawFrame(ctx, edits, outW, outH);
    applyShapeMask(ctx, edits, outW, outH);
  };

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.save();
  const nativeFilter = typeof (ctx as { filter?: string }).filter === "string";
  if (nativeFilter && adj.blur > 0) ctx.filter = `blur(${(adj.blur / 100) * outW * 0.012}px)`;
  ctx.translate(outW / 2 + offX * outW, outH / 2 + offY * outH);
  ctx.scale(edits.flipH ? -1 : 1, edits.flipV ? -1 : 1);
  ctx.rotate(angleOf(edits));
  ctx.scale(base, base);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  const needsPixels =
    wantHistogram || (Object.keys(adj) as AdjustKey[]).some((k) => k !== "blur" && adj[k] !== 0);
  if (!needsPixels) {
    finish();
    return null;
  }

  const data = ctx.getImageData(0, 0, outW, outH);
  const px = data.data;

  const exposure = Math.pow(2, (adj.exposure / 100) * 1.2);
  const contrast = 1 + adj.contrast / 100;
  const sat = 1 + adj.saturation / 100;
  const vib = adj.vibrance / 100;
  const fade = adj.fade / 100;
  const sepia = clamp01(adj.sepia / 100);
  const temp = adj.temperature / 100;
  const tint = adj.tint / 100;
  const hi = adj.highlights / 100;
  const sh = adj.shadows / 100;
  const wh = adj.whites / 100;
  const bl = adj.blacks / 100;
  const vig = adj.vignette / 100;
  const grain = adj.grain / 100;
  const hueDeg = (adj.hue * Math.PI) / 180;
  const colorizeAmt = clamp01(adj.colorize / 100);
  const [cr, cg, cb] = hexToRgb01(colorizeColorOf(edits));
  const cosH = Math.cos(hueDeg);
  const sinH = Math.sin(hueDeg);
  const grainStep = Math.max(1, Math.round(outW / 720));
  const adjustsColor =
    exposure !== 1 ||
    contrast !== 1 ||
    sat !== 1 ||
    vib !== 0 ||
    fade !== 0 ||
    sepia !== 0 ||
    temp !== 0 ||
    tint !== 0 ||
    hi !== 0 ||
    sh !== 0 ||
    wh !== 0 ||
    bl !== 0 ||
    hueDeg !== 0 ||
    colorizeAmt !== 0 ||
    vig !== 0 ||
    grain !== 0;

  if (adjustsColor) {
    for (let y = 0, i = 0; y < outH; y++) {
      const dy = (y / outH - 0.5) * 2;
      for (let x = 0; x < outW; x++, i += 4) {
        let r = px[i] / 255;
        let g = px[i + 1] / 255;
        let b = px[i + 2] / 255;

        if (exposure !== 1) {
          r *= exposure;
          g *= exposure;
          b *= exposure;
        }
        if (temp !== 0 || tint !== 0) {
          r += temp * 0.12 + tint * 0.04;
          b += -temp * 0.12 + tint * 0.04;
          g += -tint * 0.09;
        }
        if (hueDeg !== 0) {
          const nr = (0.299 + 0.701 * cosH + 0.168 * sinH) * r + (0.587 - 0.587 * cosH + 0.33 * sinH) * g + (0.114 - 0.114 * cosH - 0.497 * sinH) * b;
          const ng = (0.299 - 0.299 * cosH - 0.328 * sinH) * r + (0.587 + 0.413 * cosH + 0.035 * sinH) * g + (0.114 - 0.114 * cosH + 0.292 * sinH) * b;
          const nb = (0.299 - 0.3 * cosH + 1.25 * sinH) * r + (0.587 - 0.588 * cosH - 1.05 * sinH) * g + (0.114 + 0.886 * cosH - 0.203 * sinH) * b;
          r = nr;
          g = ng;
          b = nb;
        }
        if (sepia > 0) {
          const sr = 0.393 * r + 0.769 * g + 0.189 * b;
          const sg = 0.349 * r + 0.686 * g + 0.168 * b;
          const sb = 0.272 * r + 0.534 * g + 0.131 * b;
          r += (sr - r) * sepia;
          g += (sg - g) * sepia;
          b += (sb - b) * sepia;
        }
        if (hi !== 0 || sh !== 0 || wh !== 0 || bl !== 0) {
          const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const wS = (1 - clamp01(l * 2)) ** 2;
          const wH = clamp01(l * 2 - 1) ** 2;
          let d = sh * 0.35 * wS + hi * 0.35 * wH;
          d += wh * 0.3 * clamp01((l - 0.55) / 0.45) + bl * 0.3 * clamp01((0.45 - l) / 0.45);
          r += d;
          g += d;
          b += d;
        }
        if (contrast !== 1) {
          r = (r - 0.5) * contrast + 0.5;
          g = (g - 0.5) * contrast + 0.5;
          b = (b - 0.5) * contrast + 0.5;
        }
        if (sat !== 1 || vib !== 0) {
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          let k = sat;
          if (vib !== 0) {
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);
            k *= 1 + vib * (1 - clamp01(chroma * 1.5));
          }
          r = gray + (r - gray) * k;
          g = gray + (g - gray) * k;
          b = gray + (b - gray) * k;
        }
        if (colorizeAmt > 0) {
          const gray = clamp01(0.2126 * r + 0.7152 * g + 0.0722 * b);
          const m = colorizeAmt * 0.65;
          r += (clamp01(gray * cr * 2) - r) * m;
          g += (clamp01(gray * cg * 2) - g) * m;
          b += (clamp01(gray * cb * 2) - b) * m;
        }
        if (fade !== 0) {
          const f = 1 - fade * 0.2;
          const lift = fade * 0.1;
          r = r * f + lift;
          g = g * f + lift;
          b = b * f + lift;
        }
        if (vig !== 0) {
          const dx = (x / outW - 0.5) * 2;
          const f = smooth(0.35, 1, Math.sqrt(dx * dx + dy * dy) / 1.4142);
          if (vig > 0) {
            const m = 1 - vig * f * 0.9;
            r *= m;
            g *= m;
            b *= m;
          } else {
            const m = -vig * f * 0.9;
            r += (1 - r) * m;
            g += (1 - g) * m;
            b += (1 - b) * m;
          }
        }
        if (grain !== 0) {
          const n = (hash((x / grainStep) | 0, (y / grainStep) | 0) - 0.5) * grain * 0.3;
          r += n;
          g += n;
          b += n;
        }

        px[i] = clamp01(r) * 255;
        px[i + 1] = clamp01(g) * 255;
        px[i + 2] = clamp01(b) * 255;
      }
    }
  }

  // Clareza: contraste local (positivo realça textura, negativo suaviza).
  if (adj.clarity !== 0) {
    const blurred = boxBlur(px, outW, outH, Math.max(2, outW * 0.012));
    const k = (adj.clarity / 100) * 0.9;
    for (let i = 0; i < px.length; i += 4) {
      for (let c = 0; c < 3; c++) px[i + c] = px[i + c] + (px[i + c] - blurred[i + c]) * k;
    }
  }

  // Desfoque de profundidade: foco numa faixa horizontal central, o resto fica desfocado.
  if (adj.tilt > 0) {
    const blurred = boxBlur(px, outW, outH, Math.max(2, outW * 0.012), 2);
    const amount = adj.tilt / 100;
    for (let y = 0; y < outH; y++) {
      const t = smooth(0.16, 0.5, Math.abs(y / outH - 0.5)) * amount;
      if (t <= 0) continue;
      for (let x = 0, i = y * outW * 4; x < outW; x++, i += 4) {
        for (let c = 0; c < 3; c++) px[i + c] = px[i + c] + (blurred[i + c] - px[i + c]) * t;
      }
    }
  }

  // Nitidez (máscara de nitidez com vizinhança 4)
  if (adj.sharpness > 0) {
    const a = (adj.sharpness / 100) * 0.9;
    const src = new Uint8ClampedArray(px);
    const stride = outW * 4;
    for (let y = 1; y < outH - 1; y++) {
      for (let x = 1; x < outW - 1; x++) {
        const i = y * stride + x * 4;
        for (let c = 0; c < 3; c++) {
          const v =
            src[i + c] * (1 + 4 * a) -
            a * (src[i + c - 4] + src[i + c + 4] + src[i + c - stride] + src[i + c + stride]);
          px[i + c] = v;
        }
      }
    }
  }

  let hist: Histogram | null = null;
  if (wantHistogram) {
    hist = {
      r: new Uint32Array(256),
      g: new Uint32Array(256),
      b: new Uint32Array(256),
      l: new Uint32Array(256),
    };
    for (let i = 0; i < px.length; i += 4) {
      hist.r[px[i]]++;
      hist.g[px[i + 1]]++;
      hist.b[px[i + 2]]++;
      hist.l[Math.round(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2])]++;
    }
  }

  ctx.putImageData(data, 0, 0);
  finish();
  return hist;
}

/* ---------------------------- Camadas: desenho ---------------------------- */

type Ctx = CanvasRenderingContext2D;

function fontFamily(id: TextFontId): string {
  return TEXT_FONTS.find((f) => f.id === id)?.css ?? TEXT_FONTS[0].css;
}

function setTextFont(ctx: Ctx, o: TextOverlay, outW: number) {
  const px = Math.max(6, o.size * outW);
  ctx.font = `${o.italic ? "italic " : ""}${o.bold ? "700" : "400"} ${px}px ${fontFamily(o.font)}`;
  const spacing = (o.letterSpacing * outW) / 1000;
  (ctx as unknown as { letterSpacing?: string }).letterSpacing = `${spacing}px`;
  return px;
}

let measureCtx: Ctx | null = null;
function measurer(): Ctx | null {
  if (typeof document === "undefined") return null;
  measureCtx ??= document.createElement("canvas").getContext("2d");
  return measureCtx;
}

/** Medidas do texto (em px da imagem final): linhas, largura e altura da caixa. */
function layoutText(ctx: Ctx, o: TextOverlay, outW: number) {
  const px = setTextFont(ctx, o, outW);
  const lines = (o.text || " ").split("\n");
  const lineH = px * 1.2;
  let w = 0;
  for (const line of lines) w = Math.max(w, ctx.measureText(line).width);
  return { lines, px, lineH, w, h: lineH * lines.length };
}

function drawText(ctx: Ctx, o: TextOverlay, outW: number, outH: number) {
  ctx.save();
  ctx.globalAlpha = o.opacity;
  const { lines, px, lineH, w, h } = layoutText(ctx, o, outW);
  ctx.translate(o.x * outW, o.y * outH);
  ctx.rotate((o.rotation * Math.PI) / 180);
  ctx.textBaseline = "middle";
  ctx.textAlign = o.align;
  const left = o.align === "left" ? -w / 2 : o.align === "right" ? w / 2 : 0;
  const pad = px * 0.28;
  if (o.bg) {
    ctx.fillStyle = o.bg;
    const r = px * 0.2;
    ctx.beginPath();
    ctx.roundRect(-w / 2 - pad, -h / 2 - pad * 0.5, w + pad * 2, h + pad, r);
    ctx.fill();
  }
  if (o.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = px * 0.18;
    ctx.shadowOffsetY = px * 0.05;
  }
  lines.forEach((line, i) => {
    const y = -h / 2 + lineH * i + lineH / 2;
    if (o.outline) {
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(2, px * 0.14);
      ctx.strokeStyle = o.outline;
      ctx.strokeText(line, left, y);
    }
    ctx.fillStyle = o.color;
    ctx.fillText(line, left, y);
  });
  ctx.restore();
}

function shapePath(ctx: Ctx, id: ShapeId, r: number) {
  ctx.beginPath();
  switch (id) {
    case "heart":
      ctx.moveTo(0, r * 0.9);
      ctx.bezierCurveTo(-r * 1.6, r * 0.1, -r * 0.8, -r * 1.1, 0, -r * 0.35);
      ctx.bezierCurveTo(r * 0.8, -r * 1.1, r * 1.6, r * 0.1, 0, r * 0.9);
      break;
    case "star":
    case "burst":
    case "sparkle": {
      const points = id === "star" ? 5 : id === "burst" ? 12 : 4;
      const inner = id === "star" ? 0.45 : id === "burst" ? 0.72 : 0.22;
      for (let i = 0; i < points * 2; i++) {
        const rad = i % 2 === 0 ? r : r * inner;
        const a = (Math.PI * i) / points - Math.PI / 2;
        ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      break;
    }
    case "circle":
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;
    case "ring":
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.moveTo(r * 0.62, 0);
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2, true);
      break;
    case "drop":
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.5, -r * 0.4, r * 0.9, r * 0.1, r * 0.9, r * 0.4);
      ctx.bezierCurveTo(r * 0.9, r * 0.8, r * 0.5, r, 0, r);
      ctx.bezierCurveTo(-r * 0.5, r, -r * 0.9, r * 0.8, -r * 0.9, r * 0.4);
      ctx.bezierCurveTo(-r * 0.9, r * 0.1, -r * 0.5, -r * 0.4, 0, -r);
      break;
    case "arrow":
      ctx.moveTo(-r, -r * 0.25);
      ctx.lineTo(r * 0.25, -r * 0.25);
      ctx.lineTo(r * 0.25, -r * 0.6);
      ctx.lineTo(r, 0);
      ctx.lineTo(r * 0.25, r * 0.6);
      ctx.lineTo(r * 0.25, r * 0.25);
      ctx.lineTo(-r, r * 0.25);
      ctx.closePath();
      break;
    case "bubble":
      ctx.roundRect(-r, -r * 0.7, r * 2, r * 1.4, r * 0.35);
      ctx.moveTo(-r * 0.3, r * 0.6);
      ctx.lineTo(-r * 0.62, r * 1.1);
      ctx.lineTo(r * 0.08, r * 0.6);
      ctx.closePath();
      break;
    case "leaf":
      ctx.moveTo(-r, r * 0.6);
      ctx.bezierCurveTo(-r * 0.9, -r * 0.9, r * 0.4, -r * 1.1, r, -r * 0.7);
      ctx.bezierCurveTo(r * 1.0, r * 0.2, r * 0.1, r * 1.0, -r, r * 0.6);
      ctx.closePath();
      break;
    case "check":
      ctx.moveTo(-r * 0.6, 0);
      ctx.lineTo(-r * 0.15, r * 0.45);
      ctx.lineTo(r * 0.65, -r * 0.5);
      break;
  }
}

function drawSticker(ctx: Ctx, o: StickerOverlay, outW: number, outH: number) {
  ctx.save();
  ctx.globalAlpha = o.opacity;
  ctx.translate(o.x * outW, o.y * outH);
  ctx.rotate((o.rotation * Math.PI) / 180);
  if (o.flip) ctx.scale(-1, 1);
  const size = Math.max(8, o.size * outW);
  if (o.kind === "emoji") {
    ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.glyph, 0, size * 0.06);
  } else {
    const r = size / 2;
    shapePath(ctx, o.glyph as ShapeId, r);
    if (o.glyph === "check") {
      ctx.lineWidth = r * 0.35;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = o.color;
      ctx.stroke();
    } else {
      ctx.fillStyle = o.color;
      ctx.fill("evenodd");
    }
  }
  ctx.restore();
}

function drawStroke(ctx: Ctx, o: StrokeOverlay, outW: number, outH: number) {
  if (o.points.length < 1) return;
  const pts = o.points.map(([x, y]) => [x * outW, y * outH] as const);
  const w = Math.max(1, o.width * outW);
  ctx.save();
  ctx.lineCap = o.tool === "marker" ? "butt" : "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = o.color;
  ctx.fillStyle = o.color;
  ctx.lineWidth = w;
  ctx.globalAlpha = o.opacity * (o.tool === "marker" ? 0.45 : 1);
  const first = pts[0];
  const last = pts[pts.length - 1];

  const freehand = () => {
    ctx.beginPath();
    ctx.moveTo(first[0], first[1]);
    if (pts.length === 1) ctx.lineTo(first[0] + 0.01, first[1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    if (pts.length > 1) ctx.lineTo(last[0], last[1]);
    ctx.stroke();
  };

  switch (o.tool) {
    case "pen":
    case "marker":
      if (o.tool === "marker") ctx.lineWidth = w * 2.4;
      freehand();
      break;
    case "neon":
      ctx.shadowColor = o.color;
      ctx.shadowBlur = w * 3;
      freehand();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(1, w * 0.4);
      freehand();
      break;
    case "line":
      ctx.beginPath();
      ctx.moveTo(first[0], first[1]);
      ctx.lineTo(last[0], last[1]);
      ctx.stroke();
      break;
    case "arrow": {
      const a = Math.atan2(last[1] - first[1], last[0] - first[0]);
      const head = Math.max(w * 3.2, 10);
      ctx.beginPath();
      ctx.moveTo(first[0], first[1]);
      ctx.lineTo(last[0], last[1]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(last[0], last[1]);
      ctx.lineTo(last[0] - head * Math.cos(a - 0.45), last[1] - head * Math.sin(a - 0.45));
      ctx.lineTo(last[0] - head * Math.cos(a + 0.45), last[1] - head * Math.sin(a + 0.45));
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "rect":
      ctx.strokeRect(first[0], first[1], last[0] - first[0], last[1] - first[1]);
      break;
    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(
        (first[0] + last[0]) / 2,
        (first[1] + last[1]) / 2,
        Math.abs(last[0] - first[0]) / 2,
        Math.abs(last[1] - first[1]) / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      break;
  }
  ctx.restore();
}

/** Borra, pixela ou cobre uma região da foto (a privacidade vem antes de qualquer outro efeito). */
function applyCensor(ctx: Ctx, o: CensorOverlay, outW: number, outH: number) {
  const x = Math.max(0, Math.round(o.x * outW));
  const y = Math.max(0, Math.round(o.y * outH));
  const w = Math.min(outW - x, Math.round(o.w * outW));
  const h = Math.min(outH - y, Math.round(o.h * outH));
  if (w < 2 || h < 2) return;
  ctx.save();
  if (o.shape === "ellipse") {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.globalAlpha = 1;
  if (o.mode === "black") {
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, w, h);
  } else if (o.mode === "pixel") {
    const cell = Math.max(3, Math.round((o.amount / 100) * Math.max(w, h) * 0.18) + 3);
    const tw = Math.max(1, Math.round(w / cell));
    const th = Math.max(1, Math.round(h / cell));
    const tmp = document.createElement("canvas");
    tmp.width = tw;
    tmp.height = th;
    const tctx = tmp.getContext("2d");
    if (tctx) {
      tctx.drawImage(ctx.canvas, x, y, w, h, 0, 0, tw, th);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, tw, th, x, y, w, h);
      ctx.imageSmoothingEnabled = true;
    }
  } else {
    const region = ctx.getImageData(x, y, w, h);
    const radius = Math.max(2, (o.amount / 100) * Math.max(w, h) * 0.12 + 2);
    const blurred = boxBlur(region.data, w, h, radius, 3);
    region.data.set(blurred);
    ctx.putImageData(region, x, y);
  }
  ctx.restore();
}

function drawOverlays(ctx: Ctx, overlays: Overlay[], outW: number, outH: number) {
  for (const o of overlays) {
    if (o.type === "text") drawText(ctx, o, outW, outH);
    else if (o.type === "sticker") drawSticker(ctx, o, outW, outH);
    else if (o.type === "stroke") drawStroke(ctx, o, outW, outH);
    else applyCensor(ctx, o, outW, outH);
  }
}

/* ------------------------------- Molduras ------------------------------- */

function drawFrame(ctx: Ctx, e: ImageEdits, w: number, h: number) {
  if (e.frameStyle === "none" || e.frameWidth <= 0) return;
  const t = Math.max(1, Math.round((e.frameWidth / 100) * Math.min(w, h)));
  ctx.save();
  ctx.fillStyle = e.frameColor;
  ctx.strokeStyle = e.frameColor;
  const band = (top: number, right: number, bottom: number, left: number) => {
    ctx.fillRect(0, 0, w, top);
    ctx.fillRect(0, h - bottom, w, bottom);
    ctx.fillRect(0, 0, left, h);
    ctx.fillRect(w - right, 0, right, h);
  };
  switch (e.frameStyle) {
    case "simple":
      band(t, t, t, t);
      break;
    case "double": {
      const outer = Math.max(1, Math.round(t * 0.55));
      band(outer, outer, outer, outer);
      ctx.lineWidth = Math.max(1, t * 0.16);
      const inset = t * 0.95;
      ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
      break;
    }
    case "matte":
      band(t, t, t, t);
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.lineWidth = Math.max(1, t * 0.06);
      ctx.strokeRect(t, t, w - t * 2, h - t * 2);
      break;
    case "polaroid":
      band(t, t, t * 3.2, t);
      break;
    case "film": {
      const bar = Math.round(t * 1.6);
      band(bar, 0, bar, 0);
      ctx.fillStyle = "#f4f4f4";
      const hole = Math.max(3, bar * 0.36);
      const gap = hole * 2.1;
      for (let x = gap / 2; x < w; x += gap) {
        ctx.beginPath();
        ctx.roundRect(x, (bar - hole) / 2, hole * 1.2, hole, hole * 0.2);
        ctx.roundRect(x, h - bar + (bar - hole) / 2, hole * 1.2, hole, hole * 0.2);
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

/** Cantos arredondados / círculo: o que sobra fica transparente. */
function applyShapeMask(ctx: Ctx, e: ImageEdits, w: number, h: number) {
  const pct = e.aspect === "circle" ? 50 : e.frameRadius;
  if (pct <= 0) return;
  const r = (pct / 100) * Math.min(w, h);
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.fill();
  ctx.restore();
}

/** true quando o resultado tem cantos transparentes (precisa de formato com transparência). */
export function needsAlpha(e: ImageEdits): boolean {
  return e.aspect === "circle" || e.frameRadius > 0;
}

/* ------------------------- Camadas: seleção e toque ------------------------- */

export interface OverlayBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number;
}

/** Caixa (em px da imagem final) de uma camada de texto, adesivo ou censura. */
export function overlayBox(o: Overlay, outW: number, outH: number): OverlayBox | null {
  if (o.type === "sticker") {
    const s = o.size * outW;
    return { cx: o.x * outW, cy: o.y * outH, w: s * 1.1, h: s * 1.1, rotation: o.rotation };
  }
  if (o.type === "censor") {
    return { cx: (o.x + o.w / 2) * outW, cy: (o.y + o.h / 2) * outH, w: o.w * outW, h: o.h * outH, rotation: 0 };
  }
  if (o.type === "text") {
    const ctx = measurer();
    if (!ctx) return null;
    const { w, h, px } = layoutText(ctx, o, outW);
    const pad = px * 0.28;
    // O bloco de texto é centrado em (x, y); o alinhamento só vale entre as linhas.
    return { cx: o.x * outW, cy: o.y * outH, w: w + pad * 2, h: h + pad, rotation: o.rotation };
  }
  return null;
}

/** Camada de cima sob o ponto (nx, ny em 0–1), ou null. Traços não são selecionáveis por toque. */
export function hitOverlay(overlays: Overlay[], nx: number, ny: number, outW: number, outH: number) {
  const px = nx * outW;
  const py = ny * outH;
  for (let i = overlays.length - 1; i >= 0; i--) {
    const box = overlayBox(overlays[i], outW, outH);
    if (!box) continue;
    const a = (-box.rotation * Math.PI) / 180;
    const dx = px - box.cx;
    const dy = py - box.cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    const slack = Math.max(6, outW * 0.012);
    if (Math.abs(lx) <= box.w / 2 + slack && Math.abs(ly) <= box.h / 2 + slack) {
      return overlays[i];
    }
  }
  return null;
}

/** Traço mais próximo do ponto (para a borracha), dentro da tolerância. */
export function hitStroke(overlays: Overlay[], nx: number, ny: number, outW: number, outH: number) {
  const px = nx * outW;
  const py = ny * outH;
  const tol = Math.max(10, outW * 0.02);
  for (let i = overlays.length - 1; i >= 0; i--) {
    const o = overlays[i];
    if (o.type !== "stroke") continue;
    const pts = o.points.map(([x, y]) => [x * outW, y * outH] as const);
    const reach = tol + (o.width * outW) / 2;
    const near = (ax: number, ay: number, bx: number, by: number) => {
      const vx = bx - ax;
      const vy = by - ay;
      const len2 = vx * vx + vy * vy || 1;
      const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
      return Math.hypot(px - (ax + t * vx), py - (ay + t * vy)) <= reach;
    };
    if (o.tool === "rect" || o.tool === "ellipse") {
      const [a, b] = [pts[0], pts[pts.length - 1]];
      const x0 = Math.min(a[0], b[0]);
      const x1 = Math.max(a[0], b[0]);
      const y0 = Math.min(a[1], b[1]);
      const y1 = Math.max(a[1], b[1]);
      if (px >= x0 - reach && px <= x1 + reach && py >= y0 - reach && py <= y1 + reach) return o;
      continue;
    }
    if (o.tool === "line" || o.tool === "arrow") {
      if (near(pts[0][0], pts[0][1], pts[pts.length - 1][0], pts[pts.length - 1][1])) return o;
      continue;
    }
    for (let k = 0; k < pts.length - 1; k++) {
      if (near(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1])) return o;
    }
    if (pts.length === 1 && Math.hypot(px - pts[0][0], py - pts[0][1]) <= reach) return o;
  }
  return null;
}

/* ------------------------------- Histograma ------------------------------- */

/** Desenha o histograma (luminância + canais RGB) em um canvas. */
export function drawHistogram(canvas: HTMLCanvasElement, hist: Histogram) {
  const w = 256;
  const h = 72;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  // Ignora os extremos (pretos/brancos puros) para não achatar a escala.
  const peak = (arr: Uint32Array) => {
    let m = 1;
    for (let i = 2; i < 254; i++) m = Math.max(m, arr[i]);
    return m;
  };
  const scale = Math.max(peak(hist.r), peak(hist.g), peak(hist.b), peak(hist.l));
  const plot = (arr: Uint32Array, fill: string) => {
    ctx.fillStyle = fill;
    for (let i = 0; i < 256; i++) {
      const v = Math.min(1, arr[i] / scale) * (h - 2);
      ctx.fillRect(i, h - v, 1, v);
    }
  };
  ctx.globalCompositeOperation = "source-over";
  plot(hist.l, "rgba(128,128,128,0.35)");
  ctx.globalCompositeOperation = "screen";
  plot(hist.r, "rgba(239,68,68,0.75)");
  plot(hist.g, "rgba(34,197,94,0.75)");
  plot(hist.b, "rgba(59,130,246,0.75)");
}

/** Sugere exposição/contraste/vibração a partir dos percentis do histograma (correção automática). */
export function autoEnhance(hist: Histogram): Partial<ImageEdits> {
  const total = hist.l.reduce((a, b) => a + b, 0);
  const percentile = (p: number) => {
    let acc = 0;
    for (let i = 0; i < 256; i++) {
      acc += hist.l[i];
      if (acc >= total * p) return i;
    }
    return 255;
  };
  const lo = percentile(0.01);
  const hi = percentile(0.99);
  const mid = percentile(0.5);
  const range = Math.max(40, hi - lo);
  return {
    contrast: Math.round(Math.max(-30, Math.min(60, (255 / range - 1) * 60))),
    exposure: Math.round(Math.max(-40, Math.min(40, ((120 - mid) / 255) * 90))),
    vibrance: 20,
    sharpness: 15,
  };
}
