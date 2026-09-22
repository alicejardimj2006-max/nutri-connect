// Confetes em canvas, sem dependências. Cada disparo cria uma camada temporária sobre a página.

export interface ConfettiOptions {
  /** Origem, em fração da tela (0–1). Padrão: centro, um pouco acima. */
  x?: number;
  y?: number;
  count?: number;
  /** Abertura do disparo, em graus, centrada em `angle`. */
  spread?: number;
  /** Direção do disparo, em graus (270 = para cima). */
  angle?: number;
  /** Velocidade inicial (px por quadro). */
  power?: number;
  colors?: string[];
  /** Emojis sorteados junto com os pedaços de papel. */
  emojis?: string[];
  gravity?: number;
  /** Tamanho base dos pedaços. */
  size?: number;
  zIndex?: number;
}

export const CONFETTI_COLORS = ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#a78bfa", "#f472b6"];
export const GOLD_COLORS = ["#fde047", "#facc15", "#fbbf24", "#f59e0b", "#fff7c2", "#ffffff"];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  shape: "rect" | "circle" | "strip" | "emoji";
  emoji?: string;
  wobble: number;
  vw: number;
  life: number;
}

const reducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce");

export function fireConfetti(options: ConfettiOptions = {}) {
  if (typeof window === "undefined" || reducedMotion()) return;
  const {
    x = 0.5,
    y = 0.4,
    count = 90,
    spread = 70,
    angle = 270,
    power = 14,
    colors = CONFETTI_COLORS,
    emojis = [],
    gravity = 0.32,
    size = 9,
    zIndex = 9999,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: String(zIndex),
  });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const pieces: Piece[] = Array.from({ length: count }, () => {
    const dir = rad(angle + (Math.random() - 0.5) * spread);
    const speed = power * (0.45 + Math.random() * 0.75);
    const useEmoji = emojis.length > 0 && Math.random() < 0.22;
    const shapes: Piece["shape"][] = ["rect", "rect", "circle", "strip"];
    return {
      x: x * window.innerWidth,
      y: y * window.innerHeight,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      size: (useEmoji ? size * 2.2 : size) * (0.7 + Math.random() * 0.7),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: useEmoji ? "emoji" : shapes[Math.floor(Math.random() * shapes.length)],
      emoji: useEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
      wobble: Math.random() * Math.PI * 2,
      vw: 0.08 + Math.random() * 0.12,
      life: 0,
    };
  });

  const MAX_LIFE = 170;
  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of pieces) {
      p.life++;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + gravity;
      p.x += p.vx + Math.sin(p.wobble) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      p.wobble += p.vw;
      const fade = p.life > MAX_LIFE - 40 ? Math.max(0, (MAX_LIFE - p.life) / 40) : 1;
      if (p.life >= MAX_LIFE || p.y > window.innerHeight + 40) continue;
      alive++;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      // Simula o giro em 3D achatando o pedaço
      const flip = Math.cos(p.wobble * 1.4);
      if (p.shape === "emoji") {
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji ?? "✨", 0, 0);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "strip") {
        ctx.scale(1, flip);
        ctx.fillRect(-p.size * 0.9, -p.size * 0.2, p.size * 1.8, p.size * 0.4);
      } else {
        ctx.scale(1, flip);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      }
      ctx.restore();
    }
    if (alive > 0) frame = requestAnimationFrame(tick);
    else {
      cancelAnimationFrame(frame);
      canvas.remove();
    }
  };
  frame = requestAnimationFrame(tick);
}

/** Explosão grande de comemoração: dois canhões laterais e uma chuva central. */
export function celebrate(kind: "level" | "gold" | "levelup" = "level") {
  if (kind === "gold") {
    const emojis = ["⭐", "✨", "🏅", "🪙"];
    fireConfetti({
      x: 0.5,
      y: 0.45,
      count: 140,
      spread: 360,
      power: 17,
      colors: GOLD_COLORS,
      emojis,
    });
    window.setTimeout(
      () =>
        fireConfetti({
          x: 0.15,
          y: 0.75,
          angle: 300,
          spread: 60,
          count: 80,
          power: 20,
          colors: GOLD_COLORS,
          emojis,
        }),
      250,
    );
    window.setTimeout(
      () =>
        fireConfetti({
          x: 0.85,
          y: 0.75,
          angle: 240,
          spread: 60,
          count: 80,
          power: 20,
          colors: GOLD_COLORS,
          emojis,
        }),
      250,
    );
    window.setTimeout(
      () =>
        fireConfetti({
          x: 0.5,
          y: -0.05,
          angle: 90,
          spread: 140,
          count: 100,
          power: 6,
          colors: GOLD_COLORS,
          emojis,
        }),
      600,
    );
    return;
  }
  const emojis =
    kind === "levelup" ? ["🌟", "🎉", "🥑", "🍎", "🥦"] : ["🍎", "🥕", "🥑", "🥦", "🍊"];
  fireConfetti({ x: 0.2, y: 0.8, angle: 300, spread: 55, count: 70, power: 19, emojis });
  fireConfetti({ x: 0.8, y: 0.8, angle: 240, spread: 55, count: 70, power: 19, emojis });
  window.setTimeout(
    () => fireConfetti({ x: 0.5, y: -0.05, angle: 90, spread: 150, count: 90, power: 5, emojis }),
    350,
  );
}

/** Pequeno estouro para um acerto, saindo de um elemento da tela. */
export function burstFrom(el: Element | null, colors = CONFETTI_COLORS) {
  if (!el || typeof window === "undefined") return;
  const r = el.getBoundingClientRect();
  fireConfetti({
    x: (r.left + r.width / 2) / window.innerWidth,
    y: (r.top + r.height / 2) / window.innerHeight,
    count: 26,
    spread: 120,
    power: 8,
    size: 7,
    colors,
    gravity: 0.28,
  });
}
