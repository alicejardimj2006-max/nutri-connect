// Personalização visual: cada pessoa monta o próprio estilo a partir do tema principal do site.
// As escolhas viram variáveis CSS aplicadas no <html>; só o que difere do padrão é sobrescrito.

export type ThemeMode = "light" | "dark" | "system";
export type TextSize = "small" | "medium" | "large";
export type CornerStyle = "sharp" | "soft" | "round";

export interface Appearance {
  mode: ThemeMode;
  /** Cor de destaque (botões principais, links, selos). */
  accent: string;
  /** Cor principal (títulos de seção, elementos de marca). */
  primary: string;
  background: BackgroundId;
  headingFont: HeadingFontId;
  bodyFont: BodyFontId;
  textSize: TextSize;
  corners: CornerStyle;
}

export type BackgroundId = "creme" | "branco" | "nevoa" | "menta" | "rose";
export type HeadingFontId = "classica" | "elegante" | "moderna" | "suave";
export type BodyFontId = "plex" | "nunito" | "sistema" | "lora";

/** O tema principal do site. */
export const DEFAULT_APPEARANCE: Appearance = {
  mode: "light",
  accent: "#b4532a",
  primary: "#555f36",
  background: "creme",
  headingFont: "classica",
  bodyFont: "plex",
  textSize: "medium",
  corners: "soft",
};

export const ACCENT_PRESETS = [
  { name: "Terracota", value: "#b4532a" },
  { name: "Framboesa", value: "#b03a5b" },
  { name: "Âmbar", value: "#c4821a" },
  { name: "Oliva", value: "#6b7a2f" },
  { name: "Oceano", value: "#2a6f97" },
  { name: "Índigo", value: "#4f55b8" },
  { name: "Ameixa", value: "#7a3f8f" },
  { name: "Grafite", value: "#3d4550" },
] as const;

export const PRIMARY_PRESETS = [
  { name: "Oliva", value: "#555f36" },
  { name: "Floresta", value: "#2f6b4f" },
  { name: "Petróleo", value: "#236b73" },
  { name: "Marinho", value: "#2c4a7c" },
  { name: "Vinho", value: "#7c2d3f" },
  { name: "Cacau", value: "#6b4a34" },
  { name: "Grafite", value: "#3d4550" },
] as const;

interface BackgroundPreset {
  id: BackgroundId;
  name: string;
  /** null = usa os valores originais do CSS. */
  light: Record<string, string> | null;
  dark: Record<string, string> | null;
  swatch: { light: string; card: string };
}

const surface = (bg: string, card: string, secondary: string, border: string) => ({
  "--background": bg,
  "--card": card,
  "--popover": card,
  "--secondary": secondary,
  "--muted": secondary,
  "--border": border,
  "--input": border,
});

export const BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "creme",
    name: "Creme",
    light: null,
    dark: null,
    swatch: { light: "#faf7f0", card: "#fffdfa" },
  },
  {
    id: "branco",
    name: "Branco",
    light: surface("#fafafa", "#ffffff", "#f1f1f2", "#e5e5e7"),
    dark: surface("#141414", "#1c1c1c", "#262626", "#333333"),
    swatch: { light: "#fafafa", card: "#ffffff" },
  },
  {
    id: "nevoa",
    name: "Névoa",
    light: surface("#f2f5f8", "#ffffff", "#e8eef4", "#d9e2ec"),
    dark: surface("#12171d", "#1a2129", "#232c36", "#303b48"),
    swatch: { light: "#f2f5f8", card: "#ffffff" },
  },
  {
    id: "menta",
    name: "Menta",
    light: surface("#f0f6f1", "#fbfefb", "#e4eee6", "#d3e2d6"),
    dark: surface("#131a15", "#1b241d", "#243027", "#33443a"),
    swatch: { light: "#f0f6f1", card: "#fbfefb" },
  },
  {
    id: "rose",
    name: "Rosé",
    light: surface("#fbf2f1", "#fffafa", "#f5e6e4", "#ead6d3"),
    dark: surface("#1d1516", "#261c1d", "#322425", "#443134"),
    swatch: { light: "#fbf2f1", card: "#fffafa" },
  },
];

export const HEADING_FONTS: { id: HeadingFontId; name: string; css: string | null }[] = [
  { id: "classica", name: "Clássica", css: null },
  { id: "elegante", name: "Elegante", css: '"Playfair Display", ui-serif, Georgia, serif' },
  { id: "moderna", name: "Moderna", css: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' },
  { id: "suave", name: "Suave", css: '"Nunito", ui-sans-serif, system-ui, sans-serif' },
];

export const BODY_FONTS: { id: BodyFontId; name: string; css: string | null }[] = [
  { id: "plex", name: "Plex Sans", css: null },
  { id: "nunito", name: "Nunito", css: '"Nunito", ui-sans-serif, system-ui, sans-serif' },
  { id: "sistema", name: "Do sistema", css: "ui-sans-serif, system-ui, -apple-system, sans-serif" },
  { id: "lora", name: "Lora", css: '"Lora", ui-serif, Georgia, serif' },
];

const TEXT_SIZES: Record<TextSize, string | null> = {
  small: "93.75%",
  medium: null,
  large: "112.5%",
};

const CORNERS: Record<CornerStyle, Record<string, string> | null> = {
  sharp: { "--radius": "0.25rem", "--radius-3xl": "0.5rem" },
  soft: null,
  round: { "--radius": "1.5rem", "--radius-3xl": "2.25rem" },
};

export const STORAGE_KEY = "nutriconnect_appearance";
/** Variáveis já calculadas por modo: permite ao script inicial aplicar tudo sem recalcular. */
export const CSS_STORAGE_KEY = "nutriconnect_appearance_css";
const LEGACY_THEME_KEY = "nutriconect-theme";
export const APPEARANCE_EVENT = "appearance-change";

// ---------------------------------------------------------------------------
// Cores
// ---------------------------------------------------------------------------

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/** Mistura `a` com `b` (t = 0 → a, t = 1 → b). */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

function luminance(hex: string): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = parseHex(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Texto claro ou escuro, o que tiver mais contraste sobre `bg`. */
function readableOn(bg: string): string {
  return luminance(bg) > 0.4 ? "#221008" : "#fffaf7";
}

function isHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

/** Variáveis derivadas de uma cor de marca (destaque ou principal) para um modo. */
function brandVars(kind: "accent" | "primary", color: string, dark: boolean, base: string) {
  // No escuro, cores densas ficam ilegíveis: clareia até haver contraste com o fundo.
  const tone = dark && luminance(color) < 0.25 ? mix(color, "#ffffff", 0.35) : color;
  const soft = mix(tone, base, dark ? 0.78 : 0.86);
  const vars: Record<string, string> = {
    [`--${kind}`]: tone,
    [`--${kind}-foreground`]: readableOn(tone),
    [`--${kind}-hover`]: mix(tone, dark ? "#ffffff" : "#000000", 0.14),
    [`--${kind}-soft`]: soft,
  };
  if (kind === "accent") vars["--ring"] = tone;
  if (kind === "primary") {
    vars["--chart-1"] = tone;
    vars["--sidebar-primary"] = tone;
  }
  return vars;
}

// ---------------------------------------------------------------------------
// Cálculo e aplicação
// ---------------------------------------------------------------------------

export interface AppearanceCss {
  mode: ThemeMode;
  light: Record<string, string>;
  dark: Record<string, string>;
}

/** Só as diferenças em relação ao tema principal viram variáveis. */
export function computeAppearanceCss(a: Appearance): AppearanceCss {
  const build = (dark: boolean) => {
    const bg = BACKGROUNDS.find((b) => b.id === a.background) ?? BACKGROUNDS[0];
    const surfaceVars = (dark ? bg.dark : bg.light) ?? {};
    const base = dark ? (surfaceVars["--card"] ?? "#27221b") : (surfaceVars["--card"] ?? "#fffdfa");
    const vars: Record<string, string> = { ...surfaceVars };

    if (isHex(a.accent) && a.accent.toLowerCase() !== DEFAULT_APPEARANCE.accent) {
      Object.assign(vars, brandVars("accent", a.accent, dark, base));
    }
    if (isHex(a.primary) && a.primary.toLowerCase() !== DEFAULT_APPEARANCE.primary) {
      Object.assign(vars, brandVars("primary", a.primary, dark, base));
    }

    const heading = HEADING_FONTS.find((f) => f.id === a.headingFont)?.css;
    if (heading) vars["--user-font-display"] = heading;
    const body = BODY_FONTS.find((f) => f.id === a.bodyFont)?.css;
    if (body) vars["--user-font-sans"] = body;

    const size = TEXT_SIZES[a.textSize];
    if (size) vars["font-size"] = size;
    Object.assign(vars, CORNERS[a.corners] ?? {});
    return vars;
  };
  return { mode: a.mode, light: build(false), dark: build(true) };
}

/** Todas as propriedades que este módulo pode ter definido (para limpar antes de reaplicar). */
const MANAGED_PROPS = [
  "--background",
  "--card",
  "--popover",
  "--secondary",
  "--muted",
  "--border",
  "--input",
  "--accent",
  "--accent-foreground",
  "--accent-hover",
  "--accent-soft",
  "--ring",
  "--primary",
  "--primary-foreground",
  "--primary-hover",
  "--primary-soft",
  "--chart-1",
  "--sidebar-primary",
  "--user-font-display",
  "--user-font-sans",
  "--radius",
  "--radius-3xl",
  "font-size",
];

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyCss(css: AppearanceCss) {
  const root = document.documentElement;
  const dark = css.mode === "dark" || (css.mode === "system" && prefersDark());
  root.classList.toggle("dark", dark);
  for (const prop of MANAGED_PROPS) root.style.removeProperty(prop);
  for (const [prop, value] of Object.entries(dark ? css.dark : css.light)) {
    root.style.setProperty(prop, value);
  }
  root.style.colorScheme = dark ? "dark" : "light";
}

function isAppearance(value: unknown): value is Appearance {
  return !!value && typeof value === "object" && "accent" in value && "mode" in value;
}

export function loadAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isAppearance(parsed)) return { ...DEFAULT_APPEARANCE, ...parsed };
    }
    // Migra a escolha antiga de claro/escuro.
    const legacy = window.localStorage.getItem(LEGACY_THEME_KEY);
    if (legacy === "dark" || legacy === "light") return { ...DEFAULT_APPEARANCE, mode: legacy };
  } catch {
    // armazenamento indisponível: segue com o tema principal
  }
  return DEFAULT_APPEARANCE;
}

/** Salva as escolhas e aplica na hora. */
export function saveAppearance(a: Appearance) {
  const css = computeAppearanceCss(a);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
    window.localStorage.setItem(CSS_STORAGE_KEY, JSON.stringify(css));
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
  applyCss(css);
  window.dispatchEvent(new Event(APPEARANCE_EVENT));
}

export function resetAppearance() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(CSS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {
    // ignora
  }
  applyCss(computeAppearanceCss(DEFAULT_APPEARANCE));
  window.dispatchEvent(new Event(APPEARANCE_EVENT));
}

/** Aplica as escolhas salvas e acompanha o modo "automático" do sistema. Retorna a limpeza. */
export function initAppearance(): () => void {
  const apply = () => applyCss(computeAppearanceCss(loadAppearance()));
  apply();
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (loadAppearance().mode === "system") apply();
  };
  media.addEventListener("change", onSystemChange);
  return () => media.removeEventListener("change", onSystemChange);
}

/**
 * Script executado no <head>, antes da primeira pintura, para não piscar o tema padrão.
 * Usa as variáveis já calculadas em CSS_STORAGE_KEY (sem repetir a lógica de cores).
 */
export const APPEARANCE_INIT_SCRIPT = `(function(){try{var r=document.documentElement,s=localStorage,c=JSON.parse(s.getItem("${CSS_STORAGE_KEY}")||"null"),d=false;if(c){d=c.mode==="dark"||(c.mode==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var v=d?c.dark:c.light;for(var k in v)r.style.setProperty(k,v[k]);}else{d=s.getItem("${LEGACY_THEME_KEY}")==="dark";}r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
