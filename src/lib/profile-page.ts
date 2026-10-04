// Página do perfil: blocos com posição, tamanho e conteúdo escolhidos por cada pessoa, mais o tema
// visual dela. Tudo é gravado no banco pela Edge Function profile-page (que valida e analisa os
// textos) e todo mundo que visita o perfil vê exatamente o que foi montado, com o tema do dono,
// não o de quem visita.
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_APPEARANCE, loadAppearance, sanitizeAppearance, type Appearance } from "@/lib/appearance";

// ── Modelo ───────────────────────────────────────────────────────────────────

export const GRID_COLUMNS = 12;
/** Altura de cada linha da grade e espaço entre blocos, em px. */
export const ROW_PX = 40;
export const GAP_PX = 16;

export const BLOCK_TYPES = [
  "stats",
  "posts",
  "recipes",
  "challenges",
  "communities",
  "level",
  "pro",
  "about",
  "text",
  "quote",
  "image",
  "links",
  "favorites",
  "sticker",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export type BlockBorder = "none" | "thin" | "accent" | "dashed";
export type BlockAlign = "left" | "center" | "right";
export type BlockPad = "p" | "m" | "g";

export interface BlockStyle {
  /** Cor de fundo do bloco; null = a do cartão do tema. */
  bg: string | null;
  bgOpacity: number;
  border: BlockBorder;
  /** Cantos em px; null = os do tema. */
  radius: number | null;
  align: BlockAlign;
  pad: BlockPad;
  shadow: boolean;
  textColor: string | null;
}

export interface BlockItem {
  label: string;
  url: string;
  emoji: string;
}

export interface Block {
  id: string;
  type: BlockType;
  /** Posição e tamanho na grade de 12 colunas. */
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  text: string;
  /** Foto do bloco "Foto" (endereço de uma foto já aprovada). */
  image: string | null;
  items: BlockItem[];
  opts: { count: number; view: "list" | "grid"; emoji: string; hideTitle: boolean };
  style: BlockStyle;
}

export interface ProfileHeader {
  bannerHeight: number;
  avatarSize: "p" | "m" | "g";
  avatarPos: "left" | "center";
  align: "left" | "center";
  /** Escurece a base da capa para o texto da capa ler bem. */
  dim: boolean;
}

export interface ProfilePage {
  v: 1;
  theme: Partial<Appearance>;
  header: ProfileHeader;
  layout: Block[];
}

export const DEFAULT_STYLE: BlockStyle = {
  bg: null,
  bgOpacity: 100,
  border: "thin",
  radius: null,
  align: "left",
  pad: "m",
  shadow: true,
  textColor: null,
};

export const DEFAULT_HEADER: ProfileHeader = {
  bannerHeight: 208,
  avatarSize: "m",
  avatarPos: "left",
  align: "left",
  dim: true,
};

/** Tamanho inicial de cada tipo de bloco (colunas × linhas). */
export const BLOCK_SIZES: Record<BlockType, { w: number; h: number; minW: number; minH: number }> = {
  stats: { w: 12, h: 3, minW: 4, minH: 2 },
  posts: { w: 8, h: 14, minW: 4, minH: 5 },
  recipes: { w: 8, h: 11, minW: 4, minH: 5 },
  challenges: { w: 4, h: 7, minW: 3, minH: 4 },
  communities: { w: 4, h: 5, minW: 3, minH: 3 },
  level: { w: 4, h: 5, minW: 3, minH: 3 },
  pro: { w: 4, h: 6, minW: 3, minH: 4 },
  about: { w: 6, h: 6, minW: 3, minH: 3 },
  text: { w: 6, h: 5, minW: 2, minH: 2 },
  quote: { w: 6, h: 4, minW: 3, minH: 2 },
  image: { w: 4, h: 8, minW: 2, minH: 3 },
  links: { w: 4, h: 6, minW: 3, minH: 3 },
  favorites: { w: 4, h: 5, minW: 3, minH: 3 },
  sticker: { w: 2, h: 3, minW: 2, minH: 2 },
};

const uid = () => `b${Math.random().toString(36).slice(2, 10)}`;

export function newBlock(type: BlockType, partial: Partial<Block> = {}): Block {
  const size = BLOCK_SIZES[type];
  return {
    id: uid(),
    type,
    x: 0,
    y: 0,
    w: size.w,
    h: size.h,
    title: "",
    text: "",
    image: null,
    items: [],
    opts: { count: 4, view: "list", emoji: type === "sticker" ? "apple" : "", hideTitle: false },
    style: { ...DEFAULT_STYLE },
    ...partial,
  };
}

/** Perfil de quem nunca personalizou: o mesmo desenho de antes, agora com blocos que podem ser mexidos. */
export function defaultPage(isProfessional: boolean): ProfilePage {
  const layout: Block[] = [
    newBlock("stats", { x: 0, y: 0 }),
    newBlock("recipes", { x: 0, y: 3 }),
    newBlock("posts", { x: 0, y: 14 }),
    newBlock("level", { x: 8, y: 3 }),
    newBlock("challenges", { x: 8, y: 8 }),
    newBlock("communities", { x: 8, y: 15 }),
  ];
  if (isProfessional) layout.splice(3, 0, newBlock("pro", { x: 8, y: 3, h: 6 }));
  const page: ProfilePage = { v: 1, theme: {}, header: { ...DEFAULT_HEADER }, layout };
  return { ...page, layout: resolveCollisions(layout) };
}

// ── Leitura segura (o servidor já valida; isto só protege a tela de dados estranhos) ─────────────

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const pick = <T extends string>(v: unknown, list: readonly T[], fallback: T): T =>
  typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;
const hex = (v: unknown) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : null);

export function readPage(raw: unknown, isProfessional = false): ProfilePage {
  if (!isObj(raw) || !Array.isArray(raw.layout)) return defaultPage(isProfessional);
  const header = isObj(raw.header) ? raw.header : {};
  const layout: Block[] = [];
  for (const b of raw.layout.slice(0, 24)) {
    if (!isObj(b) || !(BLOCK_TYPES as readonly string[]).includes(String(b.type))) continue;
    const type = b.type as BlockType;
    const size = BLOCK_SIZES[type];
    const w = num(b.w, size.minW, GRID_COLUMNS, size.w);
    const style = isObj(b.style) ? b.style : {};
    const opts = isObj(b.opts) ? b.opts : {};
    layout.push({
      id: typeof b.id === "string" ? b.id : uid(),
      type,
      x: num(b.x, 0, GRID_COLUMNS - w, 0),
      y: num(b.y, 0, 400, 0),
      w,
      h: num(b.h, size.minH, 40, size.h),
      title: typeof b.title === "string" ? b.title : "",
      text: typeof b.text === "string" ? b.text : "",
      image: typeof b.image === "string" ? b.image : null,
      items: Array.isArray(b.items)
        ? b.items.filter(isObj).map((it) => ({
            label: String(it.label ?? ""),
            url: String(it.url ?? ""),
            emoji: String(it.emoji ?? ""),
          }))
        : [],
      opts: {
        count: num(opts.count, 1, 12, 4),
        view: pick(opts.view, ["list", "grid"] as const, "list"),
        emoji: typeof opts.emoji === "string" ? opts.emoji : "",
        hideTitle: opts.hideTitle === true,
      },
      style: {
        bg: hex(style.bg),
        bgOpacity: num(style.bgOpacity, 0, 100, 100),
        border: pick(style.border, ["none", "thin", "accent", "dashed"] as const, "thin"),
        radius: style.radius === null || style.radius === undefined ? null : num(style.radius, 0, 40, 24),
        align: pick(style.align, ["left", "center", "right"] as const, "left"),
        pad: pick(style.pad, ["p", "m", "g"] as const, "m"),
        shadow: style.shadow !== false,
        textColor: hex(style.textColor),
      },
    });
  }
  return {
    v: 1,
    theme: isObj(raw.theme) ? (raw.theme as Partial<Appearance>) : {},
    header: {
      bannerHeight: num(header.bannerHeight, 120, 360, 208),
      avatarSize: pick(header.avatarSize, ["p", "m", "g"] as const, "m"),
      avatarPos: pick(header.avatarPos, ["left", "center"] as const, "left"),
      align: pick(header.align, ["left", "center"] as const, "left"),
      dim: header.dim !== false,
    },
    layout,
  };
}

/** Opções da aparência que o perfil pode ter (as mesmas que o servidor aceita; acessibilidade nunca entra). */
export const THEME_KEYS = [
  "mode", "accent", "primary", "backgroundLight", "backgroundDark", "oledBlack", "textColor", "cardColor",
  "colorIntensity", "warmth", "headerStyle", "themePreset", "headingFont", "bodyFont", "textScale",
  "headingWeight", "headingScale", "headingCase", "headingColor", "bodyWeight", "textAlign", "cornerRadius",
  "cardRadius", "buttonShape", "inputStyle", "borderWidth", "density", "borders", "shadows", "iconStroke",
  "pageBackground", "cardStyle", "imageSize", "imageCorners", "avatarShape", "cardAccent",
] as const satisfies readonly (keyof Appearance)[];

/** Copia o tema que a pessoa usa no site para o perfil (só as opções visuais). */
export function importSiteTheme(): Partial<Appearance> {
  const own = loadAppearance() as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of THEME_KEYS) out[key] = own[key];
  if (out.mode !== "dark") out.mode = "light";
  return out as Partial<Appearance>;
}

/** Tema do perfil como aparência completa (o perfil é sempre claro ou escuro, nunca "automático"). */
export function themeToAppearance(theme: Partial<Appearance>): Appearance {
  const merged = sanitizeAppearance({ ...DEFAULT_APPEARANCE, ...theme });
  return { ...merged, mode: merged.mode === "dark" ? "dark" : "light" };
}

// ── Grade: colisões e posições livres ────────────────────────────────────────

const overlaps = (a: Block, b: Block) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * Garante que nenhum bloco fique sobre outro: o bloco que a pessoa está mexendo (`pinnedId`) fica
 * onde está e os demais descem o necessário. Não puxa ninguém para cima (a pessoa pode deixar vãos).
 */
export function resolveCollisions(layout: Block[], pinnedId?: string): Block[] {
  const pinned = layout.find((b) => b.id === pinnedId);
  const rest = layout
    .filter((b) => b.id !== pinnedId)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: Block[] = pinned ? [{ ...pinned }] : [];
  for (const block of rest) {
    let moved = true;
    while (moved) {
      moved = false;
      for (const other of placed) {
        if (overlaps(block, other)) {
          block.y = other.y + other.h;
          moved = true;
        }
      }
    }
    placed.push(block);
  }
  const byId = new Map(placed.map((b) => [b.id, b]));
  return layout.map((b) => byId.get(b.id) ?? b);
}

/**
 * Puxa cada bloco para cima até encostar em outro (ou no topo). Vale para quem visita e para o que é
 * salvo: sobram vãos só enquanto a pessoa está editando.
 */
export function compactLayout(layout: Block[]): Block[] {
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: Block[] = [];
  for (const block of sorted) {
    const candidates = [0, ...placed.map((p) => p.y + p.h)]
      .filter((y) => y <= block.y)
      .sort((a, b) => a - b);
    const y = candidates.find((cy) => !placed.some((p) => overlaps({ ...block, y: cy }, p))) ?? block.y;
    placed.push({ ...block, y });
  }
  const byId = new Map(placed.map((b) => [b.id, b]));
  return layout.map((b) => byId.get(b.id) ?? b);
}

/** Primeira posição livre na coluna da esquerda, abaixo de tudo. */
export function freeSpot(layout: Block[]): { x: number; y: number } {
  const bottom = layout.reduce((max, b) => Math.max(max, b.y + b.h), 0);
  return { x: 0, y: bottom };
}

// ── Banco e Edge Functions ───────────────────────────────────────────────────

export interface ProfilePageRecord {
  banner_url: string | null;
  page: unknown;
  can_view_content: boolean;
}

export async function fetchProfilePage(userId: string): Promise<ProfilePageRecord | null> {
  const { data, error } = await supabase.rpc("get_profile_page", { p_user: userId });
  if (error) throw new Error(error.message);
  return (data as unknown as ProfilePageRecord | null) ?? null;
}

export class ProfileRejectedError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ProfileRejectedError";
  }
}

interface FunctionReply {
  ok?: boolean;
  approved?: boolean;
  message?: string;
  code?: string;
  url?: string;
  page?: unknown;
}

async function invoke(name: string, body: Record<string, unknown>): Promise<FunctionReply> {
  const { data, error } = await supabase.functions.invoke<FunctionReply>(name, { body });
  if (error) {
    let message = "Não foi possível concluir agora. Tente de novo em instantes.";
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      if (payload?.error) message = payload.error;
    }
    throw new Error(message);
  }
  if (!data || data.ok === false) throw new Error(data?.message || "Não foi possível concluir agora.");
  if (data.approved === false) throw new ProfileRejectedError(data.message || "Conteúdo não aprovado.", data.code);
  return data;
}

/** Envia uma foto (foto de perfil, capa ou foto de bloco): a IA analisa antes de qualquer coisa ser salva. */
export async function uploadProfileImage(
  target: "avatar" | "banner" | "image",
  dataUrl: string,
): Promise<string> {
  const reply = await invoke("profile-image", { target, image: dataUrl });
  if (!reply.url) throw new Error("Não foi possível salvar a imagem.");
  return reply.url;
}

export async function saveProfilePage(page: ProfilePage): Promise<ProfilePage> {
  const reply = await invoke("profile-page", { page });
  return readPage(reply.page);
}

export const PROFILE_PAGE_KEY = (userId: string) => ["profile-page", userId] as const;

export function useProfilePage(userId: string | undefined) {
  return useQuery({
    queryKey: PROFILE_PAGE_KEY(userId ?? ""),
    queryFn: () => fetchProfilePage(userId!),
    enabled: !!userId,
    staleTime: 30_000,
    // Sem a página salva (ou sem rede) mostra o perfil padrão na hora, sem ficar tentando de novo.
    retry: false,
  });
}

export function useSaveProfilePage(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveProfilePage,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_PAGE_KEY(userId) }),
  });
}
