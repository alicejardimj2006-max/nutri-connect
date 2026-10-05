// Listas do editor de fotos: filtros, cortes, fontes de texto, adesivos, molduras e cores.
// Os nomes têm 4 idiomas, na ordem [pt-BR, en, es, fr].
import type { Adjustments, ImageEdits } from "./image-edit";

export type Names = readonly [string, string, string, string];
const ORDER = ["pt-BR", "en", "es", "fr"] as const;
export function pickName(names: Names, locale: string): string {
  const i = ORDER.indexOf(locale as (typeof ORDER)[number]);
  return names[i < 0 ? 0 : i];
}

// ───────────────────────────── Cortes ─────────────────────────────

/** ratio: número fixo, "post" (o espaço máximo no post), "free" (controle deslizante) ou null (a da foto). */
export interface AspectDef {
  id: string;
  names: Names;
  ratio: number | "post" | "free" | null;
}

export const ASPECTS: AspectDef[] = [
  { id: "original", names: ["Original", "Original", "Original", "Original"], ratio: "post" },
  {
    id: "native",
    names: ["Foto inteira", "Whole photo", "Foto entera", "Photo entière"],
    ratio: null,
  },
  { id: "free", names: ["Livre", "Free", "Libre", "Libre"], ratio: "free" },
  { id: "1:1", names: ["1:1", "1:1", "1:1", "1:1"], ratio: 1 },
  { id: "4:5", names: ["4:5", "4:5", "4:5", "4:5"], ratio: 4 / 5 },
  { id: "5:4", names: ["5:4", "5:4", "5:4", "5:4"], ratio: 5 / 4 },
  { id: "4:3", names: ["4:3", "4:3", "4:3", "4:3"], ratio: 4 / 3 },
  { id: "3:4", names: ["3:4", "3:4", "3:4", "3:4"], ratio: 3 / 4 },
  { id: "3:2", names: ["3:2", "3:2", "3:2", "3:2"], ratio: 3 / 2 },
  { id: "2:3", names: ["2:3", "2:3", "2:3", "2:3"], ratio: 2 / 3 },
  { id: "16:9", names: ["16:9", "16:9", "16:9", "16:9"], ratio: 16 / 9 },
  {
    id: "9:16",
    names: ["9:16 (stories)", "9:16 (stories)", "9:16 (stories)", "9:16 (stories)"],
    ratio: 9 / 16,
  },
  {
    id: "21:9",
    names: ["21:9 (cinema)", "21:9 (cinema)", "21:9 (cine)", "21:9 (cinéma)"],
    ratio: 21 / 9,
  },
  {
    id: "3:1",
    names: ["3:1 (capa)", "3:1 (cover)", "3:1 (portada)", "3:1 (couverture)"],
    ratio: 3,
  },
  {
    id: "circle",
    names: ["Círculo (avatar)", "Circle (avatar)", "Círculo (avatar)", "Cercle (avatar)"],
    ratio: 1,
  },
];

// ───────────────────────────── Filtros ─────────────────────────────

export type LookCategory = "food" | "natural" | "cinema" | "retro" | "bw" | "creative";

export interface Look {
  id: string;
  names: Names;
  category: LookCategory;
  adjust: Partial<Adjustments>;
  /** Cor de colorização do filtro (usa `colorize` em `adjust` como intensidade). */
  colorize?: string;
}

export const LOOK_CATEGORIES: { id: LookCategory; names: Names }[] = [
  { id: "food", names: ["Comida", "Food", "Comida", "Cuisine"] },
  { id: "natural", names: ["Natural", "Natural", "Natural", "Naturel"] },
  { id: "cinema", names: ["Cinema", "Cinema", "Cine", "Cinéma"] },
  { id: "retro", names: ["Retrô", "Retro", "Retro", "Rétro"] },
  { id: "bw", names: ["Preto e branco", "Black & white", "Blanco y negro", "Noir et blanc"] },
  { id: "creative", names: ["Criativos", "Creative", "Creativos", "Créatifs"] },
];

export const LOOKS: Look[] = [
  {
    id: "none",
    names: ["Original", "Original", "Original", "Original"],
    category: "natural",
    adjust: {},
  },
  {
    id: "food",
    names: ["Apetitoso", "Appetizing", "Apetitoso", "Appétissant"],
    category: "food",
    adjust: { saturation: 18, vibrance: 20, temperature: 12, contrast: 10, sharpness: 20 },
  },
  {
    id: "fresh",
    names: ["Fresco", "Fresh", "Fresco", "Frais"],
    category: "food",
    adjust: {
      saturation: 12,
      vibrance: 18,
      temperature: -8,
      exposure: 8,
      contrast: 8,
      sharpness: 15,
    },
  },
  {
    id: "cozy",
    names: ["Aconchegante", "Cozy", "Acogedor", "Douillet"],
    category: "food",
    adjust: { temperature: 25, saturation: 6, fade: 8, contrast: 6, vignette: 15, exposure: 4 },
  },
  {
    id: "crisp",
    names: ["Nítido", "Crisp", "Nítido", "Net"],
    category: "food",
    adjust: { contrast: 18, clarity: 30, sharpness: 35, saturation: 8 },
  },
  {
    id: "golden",
    names: ["Dourado", "Golden", "Dorado", "Doré"],
    category: "food",
    adjust: { temperature: 40, tint: 6, exposure: 6, saturation: 10, highlights: -10, fade: 6 },
  },
  {
    id: "greens",
    names: ["Verdinho", "Greens", "Verdecito", "Verdoyant"],
    category: "food",
    adjust: { hue: -8, saturation: 14, vibrance: 25, contrast: 6 },
  },
  {
    id: "vivid",
    names: ["Vívido", "Vivid", "Vívido", "Éclatant"],
    category: "natural",
    adjust: { contrast: 15, saturation: 25, vibrance: 20, sharpness: 15 },
  },
  {
    id: "warm",
    names: ["Quente", "Warm", "Cálido", "Chaud"],
    category: "natural",
    adjust: { temperature: 35, tint: 5, saturation: 8, exposure: 5 },
  },
  {
    id: "cool",
    names: ["Frio", "Cool", "Frío", "Froid"],
    category: "natural",
    adjust: { temperature: -35, saturation: -5, contrast: 8 },
  },
  {
    id: "soft",
    names: ["Suave", "Soft", "Suave", "Doux"],
    category: "natural",
    adjust: { contrast: -12, highlights: -15, shadows: 20, exposure: 6, fade: 10 },
  },
  {
    id: "matte",
    names: ["Fosco", "Matte", "Mate", "Mat"],
    category: "natural",
    adjust: { blacks: 30, fade: 35, contrast: -8, saturation: -6 },
  },
  {
    id: "airy",
    names: ["Arejado", "Airy", "Aireado", "Aéré"],
    category: "natural",
    adjust: {
      exposure: 15,
      highlights: -10,
      shadows: 25,
      saturation: -4,
      temperature: -4,
      fade: 12,
    },
  },
  {
    id: "bright",
    names: ["Claro", "Bright", "Claro", "Lumineux"],
    category: "natural",
    adjust: { exposure: 14, contrast: 6, vibrance: 10 },
  },
  {
    id: "deep",
    names: ["Profundo", "Deep", "Profundo", "Profond"],
    category: "natural",
    adjust: { contrast: 28, blacks: -20, shadows: -15, saturation: 12, vignette: 15 },
  },
  {
    id: "drama",
    names: ["Dramático", "Dramatic", "Dramático", "Dramatique"],
    category: "cinema",
    adjust: { contrast: 35, shadows: -25, highlights: -20, saturation: 15, vignette: 30 },
  },
  {
    id: "teal",
    names: ["Cinema frio", "Cool cinema", "Cine frío", "Cinéma froid"],
    category: "cinema",
    adjust: {
      colorize: 24,
      temperature: -6,
      contrast: 22,
      saturation: -6,
      vignette: 20,
      blacks: -10,
    },
    colorize: "#1fa3a3",
  },
  {
    id: "orange",
    names: ["Cinema quente", "Warm cinema", "Cine cálido", "Cinéma chaud"],
    category: "cinema",
    adjust: { colorize: 22, contrast: 18, saturation: -4, vignette: 18 },
    colorize: "#ff8a3d",
  },
  {
    id: "moody",
    names: ["Sombrio", "Moody", "Sombrío", "Sombre"],
    category: "cinema",
    adjust: {
      exposure: -14,
      contrast: 30,
      shadows: -20,
      saturation: -12,
      vignette: 35,
      temperature: -8,
    },
  },
  {
    id: "dream",
    names: ["Sonho", "Dream", "Sueño", "Rêve"],
    category: "cinema",
    adjust: { fade: 30, highlights: -20, exposure: 12, saturation: -8, tint: 6, clarity: -25 },
  },
  {
    id: "vintage",
    names: ["Vintage", "Vintage", "Vintage", "Vintage"],
    category: "retro",
    adjust: { temperature: 20, fade: 30, saturation: -10, vignette: 25, grain: 25, tint: 6 },
  },
  {
    id: "polaroid",
    names: ["Polaroide", "Polaroid", "Polaroid", "Polaroid"],
    category: "retro",
    adjust: {
      temperature: 18,
      fade: 35,
      contrast: -6,
      saturation: -8,
      tint: 8,
      vignette: 18,
      grain: 20,
    },
  },
  {
    id: "film",
    names: ["Filme quente", "Warm film", "Película cálida", "Pellicule chaude"],
    category: "retro",
    adjust: { temperature: 22, saturation: 14, contrast: 12, grain: 25, fade: 15 },
  },
  {
    id: "seventies",
    names: ["Anos 70", "70s", "Años 70", "Années 70"],
    category: "retro",
    adjust: { colorize: 28, fade: 35, saturation: -14, grain: 30, vignette: 20 },
    colorize: "#d8a35b",
  },
  {
    id: "sepia",
    names: ["Sépia", "Sepia", "Sepia", "Sépia"],
    category: "retro",
    adjust: { sepia: 80, contrast: 5, fade: 15 },
  },
  {
    id: "cross",
    names: ["Processo cruzado", "Cross process", "Proceso cruzado", "Traitement croisé"],
    category: "retro",
    adjust: { colorize: 18, contrast: 22, saturation: 18, tint: -10 },
    colorize: "#2fb5a0",
  },
  {
    id: "bw",
    names: ["P&B", "B&W", "B&N", "N&B"],
    category: "bw",
    adjust: { saturation: -100, contrast: 20 },
  },
  {
    id: "noir",
    names: ["Noir", "Noir", "Noir", "Noir"],
    category: "bw",
    adjust: { saturation: -100, contrast: 45, exposure: -10, vignette: 35, grain: 20 },
  },
  {
    id: "silver",
    names: ["Prata", "Silver", "Plata", "Argent"],
    category: "bw",
    adjust: { saturation: -100, contrast: 12, clarity: 35, exposure: 5 },
  },
  {
    id: "highbw",
    names: ["P&B claro", "Light B&W", "B&N claro", "N&B clair"],
    category: "bw",
    adjust: { saturation: -100, exposure: 18, contrast: -4, fade: 12 },
  },
  {
    id: "gritty",
    names: ["P&B granulado", "Grainy B&W", "B&N granulado", "N&B granuleux"],
    category: "bw",
    adjust: { saturation: -100, contrast: 32, grain: 55, vignette: 25 },
  },
  {
    id: "duoPink",
    names: ["Duo rosa", "Pink duotone", "Dúo rosa", "Duo rose"],
    category: "creative",
    adjust: { saturation: -100, colorize: 70, contrast: 14 },
    colorize: "#ff4f9a",
  },
  {
    id: "duoBlue",
    names: ["Duo azul", "Blue duotone", "Dúo azul", "Duo bleu"],
    category: "creative",
    adjust: { saturation: -100, colorize: 70, contrast: 14 },
    colorize: "#3d7bff",
  },
  {
    id: "sunset",
    names: ["Pôr do sol", "Sunset", "Atardecer", "Coucher de soleil"],
    category: "creative",
    adjust: { colorize: 30, temperature: 30, saturation: 18, contrast: 10 },
    colorize: "#ff7a3d",
  },
  {
    id: "mint",
    names: ["Menta", "Mint", "Menta", "Menthe"],
    category: "creative",
    adjust: { colorize: 22, exposure: 6, fade: 10 },
    colorize: "#3dd6b0",
  },
  {
    id: "lilac",
    names: ["Lilás", "Lilac", "Lila", "Lilas"],
    category: "creative",
    adjust: { colorize: 24, fade: 16, saturation: -4 },
    colorize: "#a58bff",
  },
  {
    id: "pop",
    names: ["Pop", "Pop", "Pop", "Pop"],
    category: "creative",
    adjust: { saturation: 45, vibrance: 30, contrast: 22, hue: 6 },
  },
];

// ───────────────────────────── Texto ─────────────────────────────

export type TextFontId =
  "sans" | "serif" | "elegant" | "round" | "impact" | "script" | "hand" | "display" | "mono";

export const TEXT_FONTS: { id: TextFontId; name: string; css: string; google: string | null }[] = [
  {
    id: "sans",
    name: "IBM Plex Sans",
    css: '"IBM Plex Sans", system-ui, sans-serif',
    google: null,
  },
  {
    id: "serif",
    name: "Libre Baskerville",
    css: '"Libre Baskerville", Georgia, serif',
    google: null,
  },
  {
    id: "elegant",
    name: "Playfair Display",
    css: '"Playfair Display", Georgia, serif',
    google: null,
  },
  { id: "round", name: "Nunito", css: '"Nunito", system-ui, sans-serif', google: null },
  { id: "impact", name: "Poppins", css: '"Poppins", system-ui, sans-serif', google: null },
  { id: "script", name: "Pacifico", css: '"Pacifico", cursive', google: "Pacifico" },
  { id: "hand", name: "Caveat", css: '"Caveat", cursive', google: "Caveat:wght@400;700" },
  {
    id: "display",
    name: "Bebas Neue",
    css: '"Bebas Neue", Impact, sans-serif',
    google: "Bebas+Neue",
  },
  { id: "mono", name: "Mono", css: "ui-monospace, SFMono-Regular, Menlo, monospace", google: null },
];

/** Estilos prontos de texto (aplicados sobre o texto atual). */
export interface TextStyle {
  id: string;
  names: Names;
  patch: {
    size?: number;
    font?: TextFontId;
    bold?: boolean;
    italic?: boolean;
    color?: string;
    bg?: string | null;
    outline?: string | null;
    shadow?: boolean;
    rotation?: number;
    letterSpacing?: number;
    align?: "left" | "center" | "right";
    y?: number;
  };
}

export const TEXT_STYLES: TextStyle[] = [
  {
    id: "caption",
    names: ["Legenda", "Caption", "Leyenda", "Légende"],
    patch: {
      size: 0.05,
      font: "sans",
      bold: false,
      color: "#ffffff",
      bg: "rgba(0,0,0,0.55)",
      outline: null,
      shadow: false,
      rotation: 0,
      letterSpacing: 0,
      align: "center",
      y: 0.9,
    },
  },
  {
    id: "title",
    names: ["Título", "Title", "Título", "Titre"],
    patch: {
      size: 0.1,
      font: "elegant",
      bold: true,
      italic: false,
      color: "#ffffff",
      bg: null,
      outline: null,
      shadow: true,
      rotation: 0,
      letterSpacing: 0,
      align: "center",
      y: 0.22,
    },
  },
  {
    id: "neon",
    names: ["Neon", "Neon", "Neón", "Néon"],
    patch: {
      size: 0.09,
      font: "script",
      bold: false,
      italic: false,
      color: "#ffffff",
      bg: null,
      outline: "#ff4f9a",
      shadow: true,
      rotation: -4,
      letterSpacing: 0,
      align: "center",
    },
  },
  {
    id: "label",
    names: ["Etiqueta", "Label", "Etiqueta", "Étiquette"],
    patch: {
      size: 0.06,
      font: "display",
      bold: false,
      italic: false,
      color: "#111111",
      bg: "#ffd54f",
      outline: null,
      shadow: false,
      rotation: 0,
      letterSpacing: 2,
      align: "center",
    },
  },
  {
    id: "handwritten",
    names: ["Manuscrito", "Handwritten", "Manuscrito", "Manuscrit"],
    patch: {
      size: 0.08,
      font: "hand",
      bold: true,
      italic: false,
      color: "#ffffff",
      bg: null,
      outline: null,
      shadow: true,
      rotation: -6,
      letterSpacing: 0,
      align: "center",
    },
  },
  {
    id: "recipe",
    names: ["Receita", "Recipe", "Receta", "Recette"],
    patch: {
      size: 0.065,
      font: "serif",
      bold: false,
      italic: true,
      color: "#3b2f23",
      bg: "#faf3e3",
      outline: null,
      shadow: false,
      rotation: 0,
      letterSpacing: 0,
      align: "center",
    },
  },
  {
    id: "badge",
    names: ["Selo", "Badge", "Sello", "Badge"],
    patch: {
      size: 0.05,
      font: "impact",
      bold: true,
      italic: false,
      color: "#ffffff",
      bg: "#b4532a",
      outline: null,
      shadow: false,
      rotation: 0,
      letterSpacing: 3,
      align: "center",
    },
  },
  {
    id: "outline",
    names: ["Contorno", "Outline", "Contorno", "Contour"],
    patch: {
      size: 0.11,
      font: "impact",
      bold: true,
      italic: false,
      color: "#ffffff",
      bg: null,
      outline: "#000000",
      shadow: false,
      rotation: 0,
      letterSpacing: 0,
      align: "center",
    },
  },
];

// ───────────────────────────── Adesivos ─────────────────────────────

export type ShapeId =
  | "heart"
  | "star"
  | "circle"
  | "ring"
  | "drop"
  | "burst"
  | "sparkle"
  | "arrow"
  | "bubble"
  | "check"
  | "leaf";

export const SHAPES: { id: ShapeId; names: Names }[] = [
  { id: "heart", names: ["Coração", "Heart", "Corazón", "Cœur"] },
  { id: "star", names: ["Estrela", "Star", "Estrella", "Étoile"] },
  { id: "circle", names: ["Círculo", "Circle", "Círculo", "Cercle"] },
  { id: "ring", names: ["Anel", "Ring", "Anillo", "Anneau"] },
  { id: "drop", names: ["Gota", "Drop", "Gota", "Goutte"] },
  { id: "burst", names: ["Explosão", "Burst", "Explosión", "Éclat"] },
  { id: "sparkle", names: ["Brilho", "Sparkle", "Brillo", "Éclat"] },
  { id: "arrow", names: ["Seta", "Arrow", "Flecha", "Flèche"] },
  { id: "bubble", names: ["Balão", "Bubble", "Globo", "Bulle"] },
  { id: "check", names: ["Certo", "Check", "Correcto", "Valider"] },
  { id: "leaf", names: ["Folha", "Leaf", "Hoja", "Feuille"] },
];

export const STICKER_GROUPS: { id: string; names: Names; glyphs: string[] }[] = [
  {
    id: "food",
    names: ["Comida", "Food", "Comida", "Cuisine"],
    glyphs: [
      ..."🍎🍐🍊🍋🍌🍉🍇🍓🫐🍑🥭🍍🥥🥝🍅🥑🥦🥬🥒🌽🥕🧄🧅🥔🍠🍞🥐🥖🧀🥚🍳🥗🍲🍜🍝🍣🍤🍚🍛🥘🍕🍔🌮🥪🍰🧁🍫🍯🥛☕🍵",
    ].filter(Boolean),
  },
  {
    id: "health",
    names: ["Saúde", "Health", "Salud", "Santé"],
    glyphs: [..."💪🏃🧘🚴🏊🥇🏆❤🫀🧠🦷😴🩺💊🧪⚖📏🌿🌱🍀☀🌙⭐💧"].filter(Boolean),
  },
  {
    id: "reactions",
    names: ["Reações", "Reactions", "Reacciones", "Réactions"],
    glyphs: [..."😋😍🥰😊😎🤩😅🤔👍👏🙌🔥✨🎉💯💚🧡💛💙💜🤍✅❗❓💡"].filter(Boolean),
  },
];

// ───────────────────────────── Desenho ─────────────────────────────

export type DrawTool = "pen" | "marker" | "neon" | "line" | "arrow" | "rect" | "ellipse" | "erase";

export const DRAW_TOOLS: { id: DrawTool; names: Names }[] = [
  { id: "pen", names: ["Caneta", "Pen", "Bolígrafo", "Stylo"] },
  { id: "marker", names: ["Marcador", "Marker", "Marcador", "Marqueur"] },
  { id: "neon", names: ["Neon", "Neon", "Neón", "Néon"] },
  { id: "line", names: ["Linha", "Line", "Línea", "Ligne"] },
  { id: "arrow", names: ["Seta", "Arrow", "Flecha", "Flèche"] },
  { id: "rect", names: ["Retângulo", "Rectangle", "Rectángulo", "Rectangle"] },
  { id: "ellipse", names: ["Elipse", "Ellipse", "Elipse", "Ellipse"] },
  { id: "erase", names: ["Borracha", "Eraser", "Goma", "Gomme"] },
];

export type CensorMode = "blur" | "pixel" | "black";

export const CENSOR_MODES: { id: CensorMode; names: Names }[] = [
  { id: "blur", names: ["Borrar", "Blur", "Desenfocar", "Flouter"] },
  { id: "pixel", names: ["Pixelar", "Pixelate", "Pixelar", "Pixeliser"] },
  { id: "black", names: ["Tarja preta", "Black bar", "Barra negra", "Barre noire"] },
];

// ───────────────────────────── Molduras ─────────────────────────────

export type FrameStyle = "none" | "simple" | "double" | "matte" | "polaroid" | "film";

export interface FramePreset {
  id: string;
  names: Names;
  patch: Pick<ImageEdits, "frameStyle" | "frameWidth" | "frameColor" | "frameRadius">;
}

export const FRAME_STYLES: { id: FrameStyle; names: Names }[] = [
  { id: "none", names: ["Nenhuma", "None", "Ninguna", "Aucun"] },
  { id: "simple", names: ["Simples", "Simple", "Simple", "Simple"] },
  { id: "double", names: ["Dupla", "Double", "Doble", "Double"] },
  { id: "matte", names: ["Passe-partout", "Matte", "Passe-partout", "Passe-partout"] },
  { id: "polaroid", names: ["Polaroide", "Polaroid", "Polaroid", "Polaroid"] },
  { id: "film", names: ["Filme", "Film", "Película", "Pellicule"] },
];

export const FRAME_PRESETS: FramePreset[] = [
  {
    id: "none",
    names: ["Sem moldura", "No frame", "Sin marco", "Sans cadre"],
    patch: { frameStyle: "none", frameWidth: 0, frameColor: "#ffffff", frameRadius: 0 },
  },
  {
    id: "thinWhite",
    names: ["Fina branca", "Thin white", "Fina blanca", "Fine blanche"],
    patch: { frameStyle: "simple", frameWidth: 3, frameColor: "#ffffff", frameRadius: 0 },
  },
  {
    id: "thinBlack",
    names: ["Fina preta", "Thin black", "Fina negra", "Fine noire"],
    patch: { frameStyle: "simple", frameWidth: 3, frameColor: "#000000", frameRadius: 0 },
  },
  {
    id: "gold",
    names: ["Dupla dourada", "Double gold", "Doble dorada", "Double dorée"],
    patch: { frameStyle: "double", frameWidth: 6, frameColor: "#d4a63a", frameRadius: 0 },
  },
  {
    id: "cream",
    names: ["Passe-partout creme", "Cream matte", "Passe-partout crema", "Passe-partout crème"],
    patch: { frameStyle: "matte", frameWidth: 10, frameColor: "#f6efe0", frameRadius: 0 },
  },
  {
    id: "wood",
    names: ["Madeira", "Wood", "Madera", "Bois"],
    patch: { frameStyle: "matte", frameWidth: 8, frameColor: "#8b5a2b", frameRadius: 0 },
  },
  {
    id: "polaroid",
    names: ["Polaroide", "Polaroid", "Polaroid", "Polaroid"],
    patch: { frameStyle: "polaroid", frameWidth: 7, frameColor: "#ffffff", frameRadius: 0 },
  },
  {
    id: "film",
    names: ["Filme", "Film", "Película", "Pellicule"],
    patch: { frameStyle: "film", frameWidth: 9, frameColor: "#111111", frameRadius: 0 },
  },
  {
    id: "pastel",
    names: ["Pastel rosa", "Pastel pink", "Pastel rosa", "Pastel rose"],
    patch: { frameStyle: "matte", frameWidth: 9, frameColor: "#f7c6d4", frameRadius: 0 },
  },
  {
    id: "rounded",
    names: ["Cantos arredondados", "Rounded corners", "Esquinas redondeadas", "Coins arrondis"],
    patch: { frameStyle: "none", frameWidth: 0, frameColor: "#ffffff", frameRadius: 12 },
  },
  {
    id: "roundedWhite",
    names: [
      "Arredondada com borda",
      "Rounded with border",
      "Redondeada con borde",
      "Arrondie avec bord",
    ],
    patch: { frameStyle: "simple", frameWidth: 4, frameColor: "#ffffff", frameRadius: 10 },
  },
  {
    id: "circle",
    names: ["Círculo", "Circle", "Círculo", "Cercle"],
    patch: { frameStyle: "none", frameWidth: 0, frameColor: "#ffffff", frameRadius: 50 },
  },
];

// ───────────────────────────── Cores ─────────────────────────────

export const PALETTE: string[] = [
  "#ffffff",
  "#000000",
  "#ff4f4f",
  "#ff8a3d",
  "#ffd54f",
  "#7ed957",
  "#1f8a5b",
  "#35c4e0",
  "#3d7bff",
  "#8e5bff",
  "#ff4f9a",
  "#8b5a2b",
];
