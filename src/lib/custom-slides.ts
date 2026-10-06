// Slides personalizados da apresentação: montados com blocos (texto, card, Nina, imagem, forma, emoji)
// sobre um papel de parede, com tema, animações por bloco e transição entre slides.
// Ficam no documento de layout (independe do idioma); o texto de cada bloco é guardado por idioma.
import type { NinaAction } from "@/lib/nina-scene";
import type { Locale } from "@/lib/i18n/locales";

export type Loc = Partial<Record<Locale, string>>;
export type BlockType = "text" | "card" | "nina" | "image" | "shape" | "emoji";
export type Anim = "none" | "rise" | "pop" | "drop" | "fade" | "stamp";
export type Transition = "slide" | "fade" | "zoom" | "none";
export type Tone = "ink" | "light" | "primary" | "accent" | "plum" | "card" | "sage" | "peach";
export type Size = "sm" | "md" | "lg" | "xl";
export type Shape = "circle" | "blob" | "rect";

export interface Block {
  id: string;
  type: BlockType;
  /** Posição e tamanho em % do slide. */
  x: number;
  y: number;
  w: number;
  h: number;
  anim: Anim;
  delay: number;
  tone: Tone;
  size: Size;
  align: "left" | "center" | "right";
  title: Loc;
  body: Loc;
  emoji: string;
  pose: NinaAction;
  src: string;
  shape: Shape;
}

export interface CustomSlide {
  id: string;
  part: number;
  name: string;
  background: string;
  transition: Transition;
  blocks: Block[];
}

// ── Papéis de parede prontos ─────────────────────────────────────────────────

export interface Background {
  id: string;
  label: string;
  /** Escuro: o texto padrão vira claro. */
  dark: boolean;
  style: Record<string, string>;
}

export const BACKGROUNDS: Background[] = [
  { id: "creme", label: "Creme", dark: false, style: { background: "#faf6ee" } },
  {
    id: "pessego",
    label: "Pêssego",
    dark: false,
    style: { background: "linear-gradient(135deg,#faece5,#f0b69b)" },
  },
  {
    id: "sage",
    label: "Sálvia",
    dark: false,
    style: { background: "linear-gradient(135deg,#e3e5ce,#b9c28f)" },
  },
  {
    id: "lavanda",
    label: "Lavanda",
    dark: false,
    style: { background: "linear-gradient(135deg,#efe3f3,#c9a3d6)" },
  },
  {
    id: "sol",
    label: "Sol",
    dark: false,
    style: { background: "linear-gradient(135deg,#fbf3c8,#e5cf6b)" },
  },
  {
    id: "pontos",
    label: "Pontos",
    dark: false,
    style: {
      background: "#faf6ee",
      backgroundImage: "radial-gradient(#d8cdb8 1.2px, transparent 1.2px)",
      backgroundSize: "26px 26px",
    },
  },
  {
    id: "listras",
    label: "Listras",
    dark: false,
    style: { background: "repeating-linear-gradient(45deg,#f6efe2 0 14px,#efe5d2 14px 28px)" },
  },
  {
    id: "manchas",
    label: "Manchas",
    dark: false,
    style: {
      background:
        "radial-gradient(circle at 15% 20%,#f0b69b66,transparent 45%),radial-gradient(circle at 85% 75%,#b9c28f88,transparent 50%),#faf6ee",
    },
  },
  {
    id: "noite",
    label: "Noite",
    dark: true,
    style: { background: "linear-gradient(160deg,#2b251d,#1f1b15)" },
  },
  {
    id: "ameixa",
    label: "Ameixa",
    dark: true,
    style: { background: "linear-gradient(160deg,#5a2f6e,#2b1838)" },
  },
  {
    id: "oliva",
    label: "Oliva",
    dark: true,
    style: { background: "linear-gradient(160deg,#555f36,#2d3319)" },
  },
  {
    id: "terracota",
    label: "Terracota",
    dark: true,
    style: { background: "linear-gradient(160deg,#b4532a,#7a3616)" },
  },
];

export const backgroundOf = (id: string): Background =>
  BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];

// ── Temas (cores de texto e de cards) ────────────────────────────────────────

export const TONES: Record<Tone, { label: string; bg: string; fg: string }> = {
  ink: { label: "Tinta", bg: "transparent", fg: "#342d24" },
  light: { label: "Claro", bg: "transparent", fg: "#fffdf8" },
  primary: { label: "Terracota", bg: "#b4532a", fg: "#fffdf8" },
  accent: { label: "Sálvia escura", bg: "#555f36", fg: "#fffdf8" },
  plum: { label: "Ameixa", bg: "#7a3f8f", fg: "#fffdf8" },
  card: { label: "Cartão", bg: "#fffdf8", fg: "#342d24" },
  sage: { label: "Sálvia", bg: "#e3e5ce", fg: "#342d24" },
  peach: { label: "Pêssego", bg: "#faece5", fg: "#342d24" },
};

export const ANIMS: { id: Anim; label: string; cls: string }[] = [
  { id: "none", label: "Sem animação", cls: "" },
  { id: "rise", label: "Subir", cls: "nc-rise" },
  { id: "pop", label: "Pular", cls: "nc-pop" },
  { id: "drop", label: "Cair", cls: "nc-drop-in" },
  { id: "fade", label: "Surgir", cls: "nc-rise-fade" },
  { id: "stamp", label: "Carimbar", cls: "nc-stamp" },
];

export const TRANSITIONS: { id: Transition; label: string }[] = [
  { id: "slide", label: "Deslizar" },
  { id: "fade", label: "Desvanecer" },
  { id: "zoom", label: "Zoom" },
  { id: "none", label: "Sem transição" },
];

export const POSES: { id: NinaAction; label: string }[] = [
  { id: "idle", label: "Parada" },
  { id: "talk", label: "Falando" },
  { id: "wave", label: "Acenando" },
  { id: "happy", label: "Feliz" },
  { id: "cheer", label: "Comemorando" },
  { id: "dance", label: "Dançando" },
];

export const BLOCK_LABEL: Record<BlockType, string> = {
  text: "Texto",
  card: "Card",
  nina: "Nina",
  image: "Imagem",
  shape: "Forma",
  emoji: "Emoji",
};

export const SIZE_CLASS: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-xl sm:text-3xl",
  xl: "text-3xl sm:text-5xl",
};

// ── Criação ─────────────────────────────────────────────────────────────────

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_BLOCK: Omit<Block, "id" | "type"> = {
  x: 10,
  y: 10,
  w: 30,
  h: 20,
  anim: "rise",
  delay: 0,
  tone: "ink",
  size: "md",
  align: "left",
  title: {},
  body: {},
  emoji: "✨",
  pose: "talk",
  src: "",
  shape: "circle",
};

const SIZES: Partial<Record<BlockType, { w: number; h: number }>> = {
  text: { w: 40, h: 22 },
  card: { w: 26, h: 36 },
  nina: { w: 28, h: 60 },
  image: { w: 34, h: 42 },
  shape: { w: 18, h: 30 },
  emoji: { w: 12, h: 20 },
};

export function makeBlock(type: BlockType, patch: Partial<Block> = {}): Block {
  const size = SIZES[type] ?? { w: 30, h: 20 };
  const tone: Tone = type === "card" ? "card" : type === "shape" ? "sage" : "ink";
  return { ...DEFAULT_BLOCK, id: rid("b"), type, ...size, tone, ...patch };
}

export const TEMPLATES: { id: string; label: string; blocks: () => Block[] }[] = [
  { id: "vazio", label: "Em branco", blocks: () => [] },
  {
    id: "titulo",
    label: "Título e texto",
    blocks: () => [
      makeBlock("text", {
        x: 8,
        y: 22,
        w: 60,
        h: 18,
        size: "xl",
        title: { "pt-BR": "Seu título aqui" },
        anim: "rise",
      }),
      makeBlock("text", {
        x: 8,
        y: 44,
        w: 52,
        h: 16,
        size: "md",
        body: { "pt-BR": "Um parágrafo curto explicando a ideia." },
        anim: "rise",
        delay: 250,
      }),
    ],
  },
  {
    id: "tres",
    label: "Três cards",
    blocks: () => [
      makeBlock("text", {
        x: 8,
        y: 8,
        w: 84,
        h: 12,
        size: "lg",
        title: { "pt-BR": "Três pontos" },
        anim: "rise",
      }),
      makeBlock("card", {
        x: 8,
        y: 30,
        w: 26,
        h: 44,
        emoji: "🥑",
        title: { "pt-BR": "Primeiro" },
        body: { "pt-BR": "Explique aqui." },
        anim: "pop",
        delay: 150,
      }),
      makeBlock("card", {
        x: 37,
        y: 30,
        w: 26,
        h: 44,
        emoji: "🍓",
        title: { "pt-BR": "Segundo" },
        body: { "pt-BR": "Explique aqui." },
        anim: "pop",
        delay: 300,
      }),
      makeBlock("card", {
        x: 66,
        y: 30,
        w: 26,
        h: 44,
        emoji: "🥕",
        title: { "pt-BR": "Terceiro" },
        body: { "pt-BR": "Explique aqui." },
        anim: "pop",
        delay: 450,
      }),
    ],
  },
  {
    id: "nina",
    label: "Nina e fala",
    blocks: () => [
      makeBlock("text", {
        x: 6,
        y: 18,
        w: 48,
        h: 16,
        size: "xl",
        title: { "pt-BR": "Uma dica da Nina" },
        anim: "rise",
      }),
      makeBlock("text", {
        x: 6,
        y: 38,
        w: 44,
        h: 18,
        size: "md",
        body: { "pt-BR": "Escreva a fala da Nina aqui." },
        anim: "rise",
        delay: 250,
      }),
      makeBlock("nina", { x: 60, y: 14, w: 32, h: 72, pose: "wave", anim: "drop", delay: 100 }),
    ],
  },
  {
    id: "imagem",
    label: "Imagem e texto",
    blocks: () => [
      makeBlock("image", { x: 6, y: 16, w: 40, h: 68, anim: "fade" }),
      makeBlock("text", {
        x: 52,
        y: 26,
        w: 42,
        h: 16,
        size: "xl",
        title: { "pt-BR": "Título" },
        anim: "rise",
        delay: 200,
      }),
      makeBlock("text", {
        x: 52,
        y: 46,
        w: 40,
        h: 18,
        size: "md",
        body: { "pt-BR": "Texto de apoio." },
        anim: "rise",
        delay: 350,
      }),
    ],
  },
];

export function makeSlide(part: number, template: string, name: string): CustomSlide {
  const t = TEMPLATES.find((x) => x.id === template) ?? TEMPLATES[0];
  return {
    id: rid("custom"),
    part,
    name,
    background: "creme",
    transition: "slide",
    blocks: t.blocks(),
  };
}

export function duplicateSlide(slide: CustomSlide): CustomSlide {
  return {
    ...slide,
    id: rid("custom"),
    name: `${slide.name} (cópia)`,
    blocks: slide.blocks.map((b) => ({ ...b, id: rid("b") })),
  };
}

/** Texto do bloco no idioma pedido; cai para o português e depois para qualquer um preenchido. */
export function localized(loc: Loc, locale: Locale): string {
  return loc[locale] ?? loc["pt-BR"] ?? Object.values(loc).find((v) => v) ?? "";
}

// ── Leitura tolerante (o que vem do banco pode ser de versão antiga) ──────────

function asLoc(v: unknown): Loc {
  if (!v || typeof v !== "object") return {};
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).filter(([, s]) => typeof s === "string"),
  ) as Loc;
}

export function readBlock(raw: unknown): Block | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Block>;
  if (!r.id || !r.type) return null;
  return {
    ...DEFAULT_BLOCK,
    id: String(r.id),
    type: r.type,
    x: Number(r.x ?? 10),
    y: Number(r.y ?? 10),
    w: Number(r.w ?? 30),
    h: Number(r.h ?? 20),
    anim: r.anim ?? "rise",
    delay: Number(r.delay ?? 0),
    tone: r.tone ?? "ink",
    size: r.size ?? "md",
    align: r.align ?? "left",
    title: asLoc(r.title),
    body: asLoc(r.body),
    emoji: typeof r.emoji === "string" ? r.emoji : "✨",
    pose: r.pose ?? "talk",
    src: typeof r.src === "string" ? r.src : "",
    shape: r.shape ?? "circle",
  };
}

export function readCustom(raw: unknown): CustomSlide[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((s): CustomSlide[] => {
    if (!s || typeof s !== "object") return [];
    const r = s as Partial<CustomSlide>;
    if (!r.id) return [];
    return [
      {
        id: String(r.id),
        part: Number(r.part ?? 0),
        name: typeof r.name === "string" ? r.name : "Slide",
        background: r.background ?? "creme",
        transition: r.transition ?? "slide",
        blocks: Array.isArray(r.blocks)
          ? r.blocks.map(readBlock).filter((b): b is Block => b !== null)
          : [],
      },
    ];
  });
}
