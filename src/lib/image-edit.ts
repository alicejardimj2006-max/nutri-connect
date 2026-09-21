// Motor de edição de imagens (canvas, sem dependências): geometria, ajustes por pixel, filtros e histograma.

export type AdjustKey =
  | "exposure"
  | "contrast"
  | "highlights"
  | "shadows"
  | "fade"
  | "temperature"
  | "tint"
  | "saturation"
  | "vibrance"
  | "sepia"
  | "sharpness"
  | "blur"
  | "vignette"
  | "grain";

export type Adjustments = Record<AdjustKey, number>;

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
  /** Filtro aplicado (id de LOOKS) e sua intensidade (0–100). */
  look: string;
  lookAmount: number;
}

export const ZERO_ADJUSTMENTS: Adjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  fade: 0,
  temperature: 0,
  tint: 0,
  saturation: 0,
  vibrance: 0,
  sepia: 0,
  sharpness: 0,
  blur: 0,
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
  look: "none",
  lookAmount: 100,
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

/** ratio: número fixo, "post" (o espaço máximo no post) ou null (a proporção da própria foto). */
export const ASPECTS: { id: string; label: string; ratio: number | "post" | null }[] = [
  { id: "original", label: "Original", ratio: "post" },
  { id: "native", label: "Foto inteira", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
];

export interface Look {
  id: string;
  label: string;
  adjust: Partial<Adjustments>;
}

export const LOOKS: Look[] = [
  { id: "none", label: "Original", adjust: {} },
  {
    id: "food",
    label: "Apetitoso",
    adjust: { saturation: 18, vibrance: 20, temperature: 12, contrast: 10, sharpness: 20 },
  },
  {
    id: "vivid",
    label: "Vívido",
    adjust: { contrast: 15, saturation: 25, vibrance: 20, sharpness: 15 },
  },
  { id: "warm", label: "Quente", adjust: { temperature: 35, tint: 5, saturation: 8, exposure: 5 } },
  { id: "cool", label: "Frio", adjust: { temperature: -35, saturation: -5, contrast: 8 } },
  {
    id: "soft",
    label: "Suave",
    adjust: { contrast: -12, highlights: -15, shadows: 20, exposure: 6, fade: 10 },
  },
  { id: "fade", label: "Desbotado", adjust: { fade: 40, contrast: -10, saturation: -15 } },
  {
    id: "drama",
    label: "Dramático",
    adjust: { contrast: 35, shadows: -25, highlights: -20, saturation: 15, vignette: 30 },
  },
  {
    id: "vintage",
    label: "Vintage",
    adjust: { temperature: 20, fade: 30, saturation: -10, vignette: 25, grain: 25, tint: 6 },
  },
  { id: "sepia", label: "Sépia", adjust: { sepia: 80, contrast: 5, fade: 15 } },
  { id: "bw", label: "P&B", adjust: { saturation: -100, contrast: 20 } },
  {
    id: "noir",
    label: "Noir",
    adjust: { saturation: -100, contrast: 45, exposure: -10, vignette: 35, grain: 20 },
  },
];

/** Ajustes efetivos: sliders do usuário + o filtro escolhido, proporcional à intensidade. */
export function effectiveAdjustments(e: ImageEdits): Adjustments {
  const look = LOOKS.find((l) => l.id === e.look);
  const k = e.lookAmount / 100;
  const out = { ...ZERO_ADJUSTMENTS };
  (Object.keys(out) as AdjustKey[]).forEach((key) => {
    out[key] = e[key] + (look?.adjust[key] ?? 0) * k;
  });
  return out;
}

/* ------------------------------ Geometria ------------------------------ */

const angleOf = (e: ImageEdits) => ((e.rotation * 90 + e.straighten) * Math.PI) / 180;

export function frameSize(img: HTMLImageElement, e: ImageEdits, outW: number) {
  const quarter = e.rotation % 2 === 1;
  const rw = quarter ? img.naturalHeight : img.naturalWidth;
  const rh = quarter ? img.naturalWidth : img.naturalHeight;
  const def = ASPECTS.find((a) => a.id === e.aspect)?.ratio ?? null;
  const ratio = def === "post" ? postMaxRatio() : (def ?? rw / rh);
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

/* -------------------------------- Render -------------------------------- */

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

/** Desenha a imagem com recorte/rotação e aplica todos os ajustes. Devolve o histograma, se pedido. */
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
  if (!needsPixels) return null;

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
  const vig = adj.vignette / 100;
  const grain = adj.grain / 100;
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
        if (sepia > 0) {
          const sr = 0.393 * r + 0.769 * g + 0.189 * b;
          const sg = 0.349 * r + 0.686 * g + 0.168 * b;
          const sb = 0.272 * r + 0.534 * g + 0.131 * b;
          r += (sr - r) * sepia;
          g += (sg - g) * sepia;
          b += (sb - b) * sepia;
        }
        if (hi !== 0 || sh !== 0) {
          const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const wS = (1 - clamp01(l * 2)) ** 2;
          const wH = clamp01(l * 2 - 1) ** 2;
          const d = sh * 0.35 * wS + hi * 0.35 * wH;
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
  return hist;
}

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
