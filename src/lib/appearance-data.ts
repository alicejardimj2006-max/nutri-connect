// Listas usadas pela personalização: paletas, fontes e modelos prontos de cada cartão.
// Os nomes têm 4 idiomas, na ordem [pt-BR, en, es, fr].
import type { Appearance } from "./appearance";

export type Names = readonly [string, string, string, string];
const LOCALE_ORDER = ["pt-BR", "en", "es", "fr"] as const;

/** Nome no idioma da pessoa (cai no português se o idioma for desconhecido). */
export function pickName(names: Names, locale: string): string {
  const i = LOCALE_ORDER.indexOf(locale as (typeof LOCALE_ORDER)[number]);
  return names[i < 0 ? 0 : i];
}

// ---------------------------------------------------------------------------
// Paletas de cor
// ---------------------------------------------------------------------------

export interface ColorPreset {
  value: string;
  names: Names;
}

export const ACCENT_PRESETS: readonly ColorPreset[] = [
  { value: "#b4532a", names: ["Terracota", "Terracotta", "Terracota", "Terre cuite"] },
  { value: "#e5604d", names: ["Coral", "Coral", "Coral", "Corail"] },
  { value: "#e8710a", names: ["Laranja", "Orange", "Naranja", "Orange"] },
  { value: "#c4821a", names: ["Âmbar", "Amber", "Ámbar", "Ambre"] },
  { value: "#b8860b", names: ["Dourado", "Gold", "Dorado", "Or"] },
  { value: "#6b7a2f", names: ["Oliva", "Olive", "Oliva", "Olive"] },
  { value: "#6e9b13", names: ["Limão", "Lime", "Lima", "Citron vert"] },
  { value: "#1f8a5b", names: ["Esmeralda", "Emerald", "Esmeralda", "Émeraude"] },
  { value: "#1b8a9a", names: ["Turquesa", "Teal", "Turquesa", "Turquoise"] },
  { value: "#2a6f97", names: ["Oceano", "Ocean", "Océano", "Océan"] },
  { value: "#2f80d1", names: ["Céu", "Sky", "Cielo", "Ciel"] },
  { value: "#4f55b8", names: ["Índigo", "Indigo", "Índigo", "Indigo"] },
  { value: "#6a4bd1", names: ["Violeta", "Violet", "Violeta", "Violet"] },
  { value: "#7a3f8f", names: ["Ameixa", "Plum", "Ciruela", "Prune"] },
  { value: "#c2379a", names: ["Magenta", "Magenta", "Magenta", "Magenta"] },
  { value: "#b03a5b", names: ["Framboesa", "Raspberry", "Frambuesa", "Framboise"] },
  { value: "#c53030", names: ["Vermelho", "Red", "Rojo", "Rouge"] },
  { value: "#3d4550", names: ["Grafite", "Graphite", "Grafito", "Graphite"] },
];

export const PRIMARY_PRESETS: readonly ColorPreset[] = [
  { value: "#555f36", names: ["Oliva", "Olive", "Oliva", "Olive"] },
  { value: "#4b5a2a", names: ["Musgo", "Moss", "Musgo", "Mousse"] },
  { value: "#2f6b4f", names: ["Floresta", "Forest", "Bosque", "Forêt"] },
  { value: "#1f5d46", names: ["Pinheiro", "Pine", "Pino", "Pin"] },
  { value: "#236b73", names: ["Petróleo", "Petrol", "Petróleo", "Pétrole"] },
  { value: "#3b5f86", names: ["Azul-aço", "Steel blue", "Azul acero", "Bleu acier"] },
  { value: "#2c4a7c", names: ["Marinho", "Navy", "Marino", "Marine"] },
  { value: "#1d3f8a", names: ["Safira", "Sapphire", "Zafiro", "Saphir"] },
  { value: "#4a2f55", names: ["Berinjela", "Aubergine", "Berenjena", "Aubergine"] },
  { value: "#7c2d3f", names: ["Vinho", "Wine", "Vino", "Vin"] },
  { value: "#8c3f22", names: ["Ferrugem", "Rust", "Óxido", "Rouille"] },
  { value: "#6b4a34", names: ["Cacau", "Cocoa", "Cacao", "Cacao"] },
  { value: "#3d4550", names: ["Grafite", "Graphite", "Grafito", "Graphite"] },
  { value: "#2b2f36", names: ["Carvão", "Charcoal", "Carbón", "Charbon"] },
];

export const BG_LIGHT_PRESETS: readonly ColorPreset[] = [
  { value: "#ffffff", names: ["Branco", "White", "Blanco", "Blanc"] },
  { value: "#f7f5ef", names: ["Papel", "Paper", "Papel", "Papier"] },
  { value: "#f5efe3", names: ["Areia", "Sand", "Arena", "Sable"] },
  { value: "#fff3ea", names: ["Pêssego", "Peach", "Melocotón", "Pêche"] },
  { value: "#fbf2f1", names: ["Rosé", "Rosé", "Rosado", "Rosé"] },
  { value: "#f5f2fa", names: ["Lavanda", "Lavender", "Lavanda", "Lavande"] },
  { value: "#f2f5f8", names: ["Névoa", "Mist", "Niebla", "Brume"] },
  { value: "#eef6fb", names: ["Gelo", "Ice", "Hielo", "Glace"] },
  { value: "#f0f6f1", names: ["Menta", "Mint", "Menta", "Menthe"] },
];

export const BG_DARK_PRESETS: readonly ColorPreset[] = [
  { value: "#000000", names: ["Preto", "Black", "Negro", "Noir"] },
  { value: "#16181b", names: ["Grafite", "Graphite", "Grafito", "Graphite"] },
  { value: "#202226", names: ["Cinza", "Gray", "Gris", "Gris"] },
  { value: "#0e1624", names: ["Azul-noite", "Night blue", "Azul noche", "Bleu nuit"] },
  { value: "#0f1a15", names: ["Verde-noite", "Night green", "Verde noche", "Vert nuit"] },
  { value: "#1d1318", names: ["Vinho-noite", "Night wine", "Vino noche", "Vin nuit"] },
  { value: "#17121f", names: ["Roxo-noite", "Night purple", "Morado noche", "Violet nuit"] },
];

export const TEXT_PRESETS: readonly ColorPreset[] = [
  { value: "#111111", names: ["Preto", "Black", "Negro", "Noir"] },
  { value: "#2b2f36", names: ["Grafite", "Graphite", "Grafito", "Graphite"] },
  { value: "#3a2c20", names: ["Marrom", "Brown", "Marrón", "Brun"] },
  { value: "#14213d", names: ["Azul-marinho", "Navy", "Marino", "Marine"] },
  { value: "#1a2e22", names: ["Verde-escuro", "Dark green", "Verde oscuro", "Vert foncé"] },
  { value: "#ffffff", names: ["Branco", "White", "Blanco", "Blanc"] },
  { value: "#f4eee2", names: ["Creme", "Cream", "Crema", "Crème"] },
];

// ---------------------------------------------------------------------------
// Fontes (as do Google Fonts são carregadas só quando alguém as escolhe ou abre o cartão Texto)
// ---------------------------------------------------------------------------

export type FontKind = "serif" | "sans" | "mono" | "display";

export interface FontDef {
  id: string;
  name: string;
  /** Valor de font-family; null = a fonte padrão do tema. */
  css: string | null;
  /** Consulta do Google Fonts (família e pesos); null = não precisa carregar. */
  google: string | null;
  kind: FontKind;
}

const sans = "ui-sans-serif, system-ui, sans-serif";
const serif = "ui-serif, Georgia, serif";

export const HEADING_FONTS: readonly FontDef[] = [
  { id: "classica", name: "Libre Baskerville", css: null, google: null, kind: "serif" },
  { id: "elegante", name: "Playfair Display", css: `"Playfair Display", ${serif}`, google: "Playfair+Display:wght@400;700;800", kind: "serif" },
  { id: "editorial", name: "Merriweather", css: `"Merriweather", ${serif}`, google: "Merriweather:wght@400;700;900", kind: "serif" },
  { id: "lora", name: "Lora", css: `"Lora", ${serif}`, google: "Lora:wght@400;600;700", kind: "serif" },
  { id: "cormorant", name: "Cormorant Garamond", css: `"Cormorant Garamond", ${serif}`, google: "Cormorant+Garamond:wght@400;600;700", kind: "serif" },
  { id: "crimson", name: "Crimson Pro", css: `"Crimson Pro", ${serif}`, google: "Crimson+Pro:wght@400;600;800", kind: "serif" },
  { id: "dmserif", name: "DM Serif Display", css: `"DM Serif Display", ${serif}`, google: "DM+Serif+Display", kind: "serif" },
  { id: "bitter", name: "Bitter", css: `"Bitter", ${serif}`, google: "Bitter:wght@400;600;800", kind: "serif" },
  { id: "sourceserif", name: "Source Serif 4", css: `"Source Serif 4", ${serif}`, google: "Source+Serif+4:wght@400;600;800", kind: "serif" },
  { id: "fraunces", name: "Fraunces", css: `"Fraunces", ${serif}`, google: "Fraunces:wght@400;600;800", kind: "serif" },
  { id: "zilla", name: "Zilla Slab", css: `"Zilla Slab", ${serif}`, google: "Zilla+Slab:wght@400;600;700", kind: "serif" },
  { id: "moderna", name: "IBM Plex Sans", css: `"IBM Plex Sans", ${sans}`, google: null, kind: "sans" },
  { id: "suave", name: "Nunito", css: `"Nunito", ${sans}`, google: null, kind: "sans" },
  { id: "marcante", name: "Poppins", css: `"Poppins", ${sans}`, google: null, kind: "sans" },
  { id: "montserrat", name: "Montserrat", css: `"Montserrat", ${sans}`, google: "Montserrat:wght@400;600;800", kind: "sans" },
  { id: "raleway", name: "Raleway", css: `"Raleway", ${sans}`, google: "Raleway:wght@400;600;800", kind: "sans" },
  { id: "quicksand", name: "Quicksand", css: `"Quicksand", ${sans}`, google: "Quicksand:wght@400;600;700", kind: "sans" },
  { id: "josefin", name: "Josefin Sans", css: `"Josefin Sans", ${sans}`, google: "Josefin+Sans:wght@400;600;700", kind: "sans" },
  { id: "outfit", name: "Outfit", css: `"Outfit", ${sans}`, google: "Outfit:wght@400;600;800", kind: "sans" },
  { id: "sora", name: "Sora", css: `"Sora", ${sans}`, google: "Sora:wght@400;600;800", kind: "sans" },
  { id: "spacegrotesk", name: "Space Grotesk", css: `"Space Grotesk", ${sans}`, google: "Space+Grotesk:wght@400;600;700", kind: "sans" },
  { id: "oswald", name: "Oswald", css: `"Oswald", ${sans}`, google: "Oswald:wght@400;600;700", kind: "sans" },
  { id: "lexend", name: "Lexend", css: `"Lexend", ${sans}`, google: null, kind: "sans" },
  { id: "tecnica", name: "Monoespaçada", css: "ui-monospace, SFMono-Regular, Menlo, monospace", google: null, kind: "mono" },
  { id: "jetbrains", name: "JetBrains Mono", css: `"JetBrains Mono", ui-monospace, monospace`, google: "JetBrains+Mono:wght@400;700", kind: "mono" },
  { id: "pacifico", name: "Pacifico", css: `"Pacifico", cursive`, google: "Pacifico", kind: "display" },
  { id: "caveat", name: "Caveat", css: `"Caveat", cursive`, google: "Caveat:wght@400;700", kind: "display" },
  { id: "bebas", name: "Bebas Neue", css: `"Bebas Neue", ${sans}`, google: "Bebas+Neue", kind: "display" },
];

export const BODY_FONTS: readonly FontDef[] = [
  { id: "plex", name: "IBM Plex Sans", css: null, google: null, kind: "sans" },
  { id: "nunito", name: "Nunito", css: `"Nunito", ${sans}`, google: null, kind: "sans" },
  { id: "poppins", name: "Poppins", css: `"Poppins", ${sans}`, google: null, kind: "sans" },
  { id: "inter", name: "Inter", css: `"Inter", ${sans}`, google: "Inter:wght@400;500;600;700", kind: "sans" },
  { id: "opensans", name: "Open Sans", css: `"Open Sans", ${sans}`, google: "Open+Sans:wght@400;500;600;700", kind: "sans" },
  { id: "roboto", name: "Roboto", css: `"Roboto", ${sans}`, google: "Roboto:wght@400;500;700", kind: "sans" },
  { id: "sourcesans", name: "Source Sans 3", css: `"Source Sans 3", ${sans}`, google: "Source+Sans+3:wght@400;500;600;700", kind: "sans" },
  { id: "worksans", name: "Work Sans", css: `"Work Sans", ${sans}`, google: "Work+Sans:wght@400;500;600;700", kind: "sans" },
  { id: "dmsans", name: "DM Sans", css: `"DM Sans", ${sans}`, google: "DM+Sans:wght@400;500;600;700", kind: "sans" },
  { id: "karla", name: "Karla", css: `"Karla", ${sans}`, google: "Karla:wght@400;500;600;700", kind: "sans" },
  { id: "mulish", name: "Mulish", css: `"Mulish", ${sans}`, google: "Mulish:wght@400;500;600;700", kind: "sans" },
  { id: "figtree", name: "Figtree", css: `"Figtree", ${sans}`, google: "Figtree:wght@400;500;600;700", kind: "sans" },
  { id: "librefranklin", name: "Libre Franklin", css: `"Libre Franklin", ${sans}`, google: "Libre+Franklin:wght@400;500;600;700", kind: "sans" },
  { id: "atkinson", name: "Atkinson Hyperlegible", css: `"Atkinson Hyperlegible", ${sans}`, google: "Atkinson+Hyperlegible:wght@400;700", kind: "sans" },
  { id: "lexendbody", name: "Lexend", css: `"Lexend", ${sans}`, google: null, kind: "sans" },
  { id: "sistema", name: "Do sistema", css: `ui-sans-serif, system-ui, -apple-system, sans-serif`, google: null, kind: "sans" },
  { id: "lora", name: "Lora", css: `"Lora", ${serif}`, google: "Lora:wght@400;500;600;700", kind: "serif" },
  { id: "merriweather", name: "Merriweather", css: `"Merriweather", ${serif}`, google: "Merriweather:wght@400;700", kind: "serif" },
  { id: "crimsonbody", name: "Crimson Pro", css: `"Crimson Pro", ${serif}`, google: "Crimson+Pro:wght@400;500;600", kind: "serif" },
  { id: "literata", name: "Literata", css: `"Literata", ${serif}`, google: "Literata:wght@400;500;600;700", kind: "serif" },
  { id: "sourceserifbody", name: "Source Serif 4", css: `"Source Serif 4", ${serif}`, google: "Source+Serif+4:wght@400;500;600", kind: "serif" },
  { id: "mono", name: "Monoespaçada", css: "ui-monospace, SFMono-Regular, Menlo, monospace", google: null, kind: "mono" },
  { id: "jetbrainsbody", name: "JetBrains Mono", css: `"JetBrains Mono", ui-monospace, monospace`, google: "JetBrains+Mono:wght@400;500;700", kind: "mono" },
];

/** Nomes traduzidos que já existiam (ids antigos). */
export const LEGACY_FONT_KEYS: Record<string, string> = {
  classica: "ap.hfont.classica",
  elegante: "ap.hfont.elegante",
  editorial: "ap.hfont.editorial",
  moderna: "ap.hfont.moderna",
  suave: "ap.hfont.suave",
  marcante: "ap.hfont.marcante",
  tecnica: "ap.hfont.tecnica",
};

// ---------------------------------------------------------------------------
// Modelos prontos
// ---------------------------------------------------------------------------

export interface Preset {
  id: string;
  names: Names;
  /** Três cores para a miniatura (ou null quando não há cores). */
  swatch?: readonly [string, string, string];
  patch: Partial<Appearance>;
}

/** Temas completos de cor. */
export const THEME_PRESETS: readonly Preset[] = [
  {
    id: "oliva",
    names: ["Oliva (padrão)", "Olive (default)", "Oliva (predeterminado)", "Olive (par défaut)"],
    swatch: ["#faf7f0", "#b4532a", "#555f36"],
    patch: { mode: "light", accent: "#b4532a", primary: "#555f36", backgroundLight: null, backgroundDark: null, textColor: null, cardColor: null, oledBlack: false, highContrast: false, warmth: 0, colorIntensity: 100 },
  },
  {
    id: "oceano",
    names: ["Oceano", "Ocean", "Océano", "Océan"],
    swatch: ["#f1f6fa", "#2a6f97", "#1d4e6b"],
    patch: { mode: "light", accent: "#2a6f97", primary: "#1d4e6b", backgroundLight: "#f1f6fa", backgroundDark: "#0f1c26", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "porDoSol",
    names: ["Pôr do sol", "Sunset", "Atardecer", "Coucher de soleil"],
    swatch: ["#fff4ea", "#d9622b", "#8a3b57"],
    patch: { mode: "light", accent: "#d9622b", primary: "#8a3b57", backgroundLight: "#fff4ea", backgroundDark: "#261611", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "floresta",
    names: ["Floresta", "Forest", "Bosque", "Forêt"],
    swatch: ["#f0f6f1", "#3f8f5c", "#2f6b4f"],
    patch: { mode: "light", accent: "#3f8f5c", primary: "#2f6b4f", backgroundLight: "#f0f6f1", backgroundDark: "#111c15", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "lavanda",
    names: ["Lavanda", "Lavender", "Lavanda", "Lavande"],
    swatch: ["#f6f2fb", "#7a4fb0", "#4a3f8f"],
    patch: { mode: "light", accent: "#7a4fb0", primary: "#4a3f8f", backgroundLight: "#f6f2fb", backgroundDark: "#1b1626", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "quartzo",
    names: ["Rosa quartzo", "Rose quartz", "Cuarzo rosa", "Quartz rose"],
    swatch: ["#fdf1f4", "#c2457a", "#8a3d5c"],
    patch: { mode: "light", accent: "#c2457a", primary: "#8a3d5c", backgroundLight: "#fdf1f4", backgroundDark: "#261520", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "cafe",
    names: ["Café", "Coffee", "Café", "Café"],
    swatch: ["#f6efe7", "#a0623a", "#5b3b28"],
    patch: { mode: "light", accent: "#a0623a", primary: "#5b3b28", backgroundLight: "#f6efe7", backgroundDark: "#1d1510", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "menta",
    names: ["Menta", "Mint", "Menta", "Menthe"],
    swatch: ["#eef8f5", "#1f9d8a", "#1c6b61"],
    patch: { mode: "light", accent: "#1f9d8a", primary: "#1c6b61", backgroundLight: "#eef8f5", backgroundDark: "#0f1d1a", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "pastel",
    names: ["Pastel", "Pastel", "Pastel", "Pastel"],
    swatch: ["#f8f6fb", "#e07a9f", "#6b9ac4"],
    patch: { mode: "light", accent: "#e07a9f", primary: "#6b9ac4", backgroundLight: "#f8f6fb", backgroundDark: "#1c1a22", textColor: "#3a3548", cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "limao",
    names: ["Limão", "Lime", "Lima", "Citron"],
    swatch: ["#f8faee", "#7d9a1a", "#4d6a1e"],
    patch: { mode: "light", accent: "#7d9a1a", primary: "#4d6a1e", backgroundLight: "#f8faee", backgroundDark: "#161a0d", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "grafite",
    names: ["Grafite", "Graphite", "Grafito", "Graphite"],
    swatch: ["#f3f4f6", "#3d4550", "#232a33"],
    patch: { mode: "light", accent: "#3d4550", primary: "#232a33", backgroundLight: "#f3f4f6", backgroundDark: "#14171a", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "sepia",
    names: ["Sépia (leitura)", "Sepia (reading)", "Sepia (lectura)", "Sépia (lecture)"],
    swatch: ["#f4ecd8", "#8a5a2b", "#5c4630"],
    patch: { mode: "light", accent: "#8a5a2b", primary: "#5c4630", backgroundLight: "#f4ecd8", backgroundDark: "#1f1a10", textColor: "#3b2f23", cardColor: "#fbf5e6", oledBlack: false, highContrast: false },
  },
  {
    id: "noiteAzul",
    names: ["Noite azul", "Blue night", "Noche azul", "Nuit bleue"],
    swatch: ["#0b1220", "#5aa9ff", "#7aa2e0"],
    patch: { mode: "dark", accent: "#5aa9ff", primary: "#7aa2e0", backgroundDark: "#0b1220", textColor: null, cardColor: null, oledBlack: false, highContrast: false },
  },
  {
    id: "oled",
    names: ["Preto total (OLED)", "True black (OLED)", "Negro total (OLED)", "Noir total (OLED)"],
    swatch: ["#000000", "#ff8a4c", "#9ba86a"],
    patch: { mode: "dark", accent: "#ff8a4c", primary: "#9ba86a", backgroundDark: null, oledBlack: true, textColor: null, cardColor: null, highContrast: false },
  },
  {
    id: "contrasteClaro",
    names: ["Alto contraste claro", "High contrast light", "Alto contraste claro", "Contraste élevé clair"],
    swatch: ["#ffffff", "#0033cc", "#000000"],
    patch: { mode: "light", accent: "#0033cc", primary: "#000000", backgroundLight: "#ffffff", textColor: "#000000", cardColor: null, oledBlack: false, highContrast: true, borders: "strong" },
  },
  {
    id: "contrasteEscuro",
    names: ["Alto contraste escuro", "High contrast dark", "Alto contraste oscuro", "Contraste élevé sombre"],
    swatch: ["#000000", "#ffd400", "#ffffff"],
    patch: { mode: "dark", accent: "#ffd400", primary: "#ffffff", backgroundDark: "#000000", textColor: "#ffffff", cardColor: null, oledBlack: false, highContrast: true, borders: "strong" },
  },
];

/** Combinações prontas de fonte de títulos + texto. */
export const FONT_PAIRS: readonly Preset[] = [
  { id: "classico", names: ["Clássico", "Classic", "Clásico", "Classique"], patch: { headingFont: "classica", bodyFont: "plex", headingWeight: 0, headingCase: "normal" } },
  { id: "moderno", names: ["Moderno", "Modern", "Moderno", "Moderne"], patch: { headingFont: "montserrat", bodyFont: "inter", headingWeight: 800, headingCase: "normal" } },
  { id: "editorial", names: ["Editorial", "Editorial", "Editorial", "Éditorial"], patch: { headingFont: "elegante", bodyFont: "sourcesans", headingWeight: 0, headingCase: "normal" } },
  { id: "amigavel", names: ["Amigável", "Friendly", "Amigable", "Amical"], patch: { headingFont: "quicksand", bodyFont: "nunito", headingWeight: 700, headingCase: "normal" } },
  { id: "elegante", names: ["Elegante", "Elegant", "Elegante", "Élégant"], patch: { headingFont: "cormorant", bodyFont: "lora", headingWeight: 700, headingCase: "normal" } },
  { id: "tecnico", names: ["Técnico", "Technical", "Técnico", "Technique"], patch: { headingFont: "spacegrotesk", bodyFont: "dmsans", headingWeight: 700, headingCase: "normal" } },
  { id: "impacto", names: ["Impacto", "Impact", "Impacto", "Impact"], patch: { headingFont: "oswald", bodyFont: "opensans", headingWeight: 700, headingCase: "upper" } },
  { id: "leitura", names: ["Leitura fácil", "Easy reading", "Lectura fácil", "Lecture facile"], patch: { headingFont: "lexend", bodyFont: "atkinson", headingWeight: 700, headingCase: "normal" } },
  { id: "livro", names: ["Livro", "Book", "Libro", "Livre"], patch: { headingFont: "crimson", bodyFont: "literata", headingWeight: 700, headingCase: "normal" } },
  { id: "manuscrito", names: ["Manuscrito", "Handwritten", "Manuscrito", "Manuscrit"], patch: { headingFont: "caveat", bodyFont: "karla", headingWeight: 700, headingCase: "normal" } },
];

/** Estilos prontos de formato. */
export const SHAPE_PRESETS: readonly Preset[] = [
  { id: "suave", names: ["Suave (padrão)", "Soft (default)", "Suave (predeterminado)", "Doux (par défaut)"], patch: { cornerRadius: 16, cardRadius: null, buttonShape: "pill", inputStyle: "outlined", borders: "subtle", shadows: "soft", borderWidth: 1, density: "normal", iconStroke: 2 } },
  { id: "quadrado", names: ["Quadrado", "Square", "Cuadrado", "Carré"], patch: { cornerRadius: 2, cardRadius: null, buttonShape: "square", inputStyle: "outlined", borders: "strong", shadows: "none", borderWidth: 2, density: "normal", iconStroke: 2 } },
  { id: "pilula", names: ["Pílula", "Pill", "Píldora", "Pilule"], patch: { cornerRadius: 28, cardRadius: 28, buttonShape: "pill", inputStyle: "filled", borders: "none", shadows: "soft", borderWidth: 1, density: "spacious", iconStroke: 2 } },
  { id: "minimal", names: ["Minimalista", "Minimal", "Minimalista", "Minimaliste"], patch: { cornerRadius: 8, cardRadius: null, buttonShape: "rounded", inputStyle: "underline", borders: "subtle", shadows: "none", borderWidth: 1, density: "compact", iconStroke: 1.5 } },
  { id: "contraste", names: ["Contraste", "Contrast", "Contraste", "Contraste"], patch: { cornerRadius: 6, cardRadius: null, buttonShape: "rounded", inputStyle: "outlined", borders: "strong", shadows: "strong", borderWidth: 2, density: "normal", iconStroke: 2.5 } },
  { id: "macio", names: ["Macio", "Cozy", "Acogedor", "Douillet"], patch: { cornerRadius: 24, cardRadius: 24, buttonShape: "rounded", inputStyle: "filled", borders: "none", shadows: "soft", borderWidth: 1, density: "spacious", iconStroke: 1.75 } },
];

/** Pacotes de som. */
export const SOUND_PACKS: readonly Preset[] = [
  { id: "silencio", names: ["Silencioso", "Silent", "Silencioso", "Silencieux"], patch: { soundsOn: false } },
  { id: "discreto", names: ["Discreto", "Discreet", "Discreto", "Discret"], patch: { soundsOn: true, soundVolume: 40, soundStyle: "suave", soundNotification: true, soundMessage: true, soundAchievement: true, soundClicks: false, soundSend: false, soundSuccess: false, soundError: true, soundSupport: false, toneNotification: "sino", toneMessage: "gota", toneAchievement: "harpa", toneClick: "sopro", toneSend: "gota", toneSuccess: "moeda", toneError: "alerta", toneSupport: "gota" } },
  { id: "divertido", names: ["Divertido", "Playful", "Divertido", "Ludique"], patch: { soundsOn: true, soundVolume: 65, soundStyle: "cristal", soundNotification: true, soundMessage: true, soundAchievement: true, soundClicks: true, soundSend: true, soundSuccess: true, soundError: true, soundSupport: true, toneNotification: "marimba", toneMessage: "moeda", toneAchievement: "harpa", toneClick: "sopro", toneSend: "gota", toneSuccess: "moeda", toneError: "alerta", toneSupport: "marimba" } },
  { id: "retro", names: ["Retrô", "Retro", "Retro", "Rétro"], patch: { soundsOn: true, soundVolume: 50, soundStyle: "madeira", soundNotification: true, soundMessage: true, soundAchievement: true, soundClicks: true, soundSend: true, soundSuccess: true, soundError: true, soundSupport: true, toneNotification: "digital", toneMessage: "digital", toneAchievement: "digital", toneClick: "digital", toneSend: "digital", toneSuccess: "moeda", toneError: "alerta", toneSupport: "digital" } },
];

/** Layouts prontos. */
export const LAYOUT_PRESETS: readonly Preset[] = [
  { id: "padrao", names: ["Padrão", "Default", "Predeterminado", "Par défaut"], patch: { contentWidth: "normal", contentMaxPx: 0, sidePanels: true, pageBackground: "plain", headerSticky: true, smoothScroll: false, backToTop: false } },
  { id: "foco", names: ["Foco", "Focus", "Enfoque", "Concentration"], patch: { contentWidth: "narrow", contentMaxPx: 0, sidePanels: false, pageBackground: "plain", headerSticky: false, smoothScroll: true, backToTop: true } },
  { id: "amplo", names: ["Amplo", "Spacious", "Amplio", "Large"], patch: { contentWidth: "wide", contentMaxPx: 0, sidePanels: true, pageBackground: "plain", headerSticky: true, smoothScroll: false, backToTop: false } },
  { id: "pontilhado", names: ["Pontilhado", "Dotted", "Punteado", "Pointillé"], patch: { contentWidth: "normal", contentMaxPx: 0, sidePanels: true, pageBackground: "dots", headerSticky: true } },
  { id: "aurora", names: ["Aurora", "Aurora", "Aurora", "Aurore"], patch: { contentWidth: "normal", contentMaxPx: 0, sidePanels: true, pageBackground: "aurora", headerSticky: true } },
];

/** Perfis de acessibilidade. */
export const ACCESS_PROFILES: readonly Preset[] = [
  { id: "nenhum", names: ["Nenhum (padrão)", "None (default)", "Ninguno (predeterminado)", "Aucun (par défaut)"], patch: { highContrast: false, readableFont: false, strongFocus: false, underlineLinks: false, letterSpacing: 0, wordSpacing: 0, lineHeight: 0, reduceMotion: false, bigCursor: false, largeTargets: false, colorFilter: "none", readingGuide: false, speakSelection: false, textScale: 100, textAlign: "default" } },
  { id: "baixaVisao", names: ["Baixa visão", "Low vision", "Baja visión", "Basse vision"], patch: { highContrast: true, strongFocus: true, underlineLinks: true, bigCursor: true, largeTargets: true, textScale: 125, letterSpacing: 2, lineHeight: 170, speakSelection: true } },
  { id: "dislexia", names: ["Dislexia", "Dyslexia", "Dislexia", "Dyslexie"], patch: { readableFont: true, letterSpacing: 3, wordSpacing: 4, lineHeight: 180, textAlign: "left", readingGuide: true, underlineLinks: false } },
  { id: "movimento", names: ["Sensível a movimento", "Motion sensitive", "Sensible al movimiento", "Sensible au mouvement"], patch: { reduceMotion: true, animationSpeed: "slow", smoothScroll: false } },
  { id: "leituraConfortavel", names: ["Leitura confortável", "Comfortable reading", "Lectura cómoda", "Lecture confortable"], patch: { lineHeight: 165, textAlign: "left", textScale: 108, underlineLinks: true, wordSpacing: 2 } },
  { id: "motor", names: ["Mobilidade reduzida", "Reduced mobility", "Movilidad reducida", "Mobilité réduite"], patch: { largeTargets: true, strongFocus: true, bigCursor: true, smoothScroll: true } },
];

/** Estilos prontos para perfil e posts. */
export const PROFILE_PRESETS: readonly Preset[] = [
  { id: "classico", names: ["Clássico (padrão)", "Classic (default)", "Clásico (predeterminado)", "Classique (par défaut)"], patch: { cardStyle: "classic", imageSize: "normal", avatarShape: "round", showCounts: true, expandPosts: false, showTags: true, imageCorners: "rounded", cardAccent: false } },
  { id: "compacto", names: ["Compacto", "Compact", "Compacto", "Compact"], patch: { cardStyle: "compact", imageSize: "normal", avatarShape: "round", showCounts: true, expandPosts: false, showTags: false, imageCorners: "soft", cardAccent: false } },
  { id: "galeria", names: ["Galeria", "Gallery", "Galería", "Galerie"], patch: { cardStyle: "classic", imageSize: "large", avatarShape: "square", showCounts: false, expandPosts: false, showTags: false, imageCorners: "square", cardAccent: false } },
  { id: "leitura", names: ["Leitura completa", "Full reading", "Lectura completa", "Lecture complète"], patch: { cardStyle: "classic", imageSize: "normal", avatarShape: "round", showCounts: true, expandPosts: true, showTags: true, imageCorners: "rounded", cardAccent: false } },
  { id: "destaque", names: ["Destaque", "Highlight", "Destacado", "Mise en avant"], patch: { cardStyle: "classic", imageSize: "large", avatarShape: "round", showCounts: true, expandPosts: false, showTags: true, imageCorners: "rounded", cardAccent: true } },
];
