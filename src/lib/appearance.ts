// Personalização visual: cada pessoa monta o próprio estilo a partir do tema principal do site.
// As escolhas viram variáveis CSS (e alguns atributos) aplicados no <html>; só o que difere do
// tema principal é sobrescrito.

export type ThemeMode = "light" | "dark" | "system";
export type Density = "compact" | "normal" | "spacious";
export type BorderStyle = "none" | "subtle" | "strong";
export type ShadowStyle = "none" | "soft" | "strong";

export type HeadingFontId =
  "classica" | "elegante" | "editorial" | "moderna" | "suave" | "marcante" | "tecnica";
export type BodyFontId =
  "plex" | "nunito" | "sistema" | "lora" | "merriweather" | "poppins" | "mono";

export interface Appearance {
  mode: ThemeMode;
  /** Cor de destaque (botões principais, links, selos). */
  accent: string;
  /** Cor principal (títulos de seção, elementos de marca). */
  primary: string;
  /** Fundo livre no modo claro / escuro. null = fundo do tema principal. */
  backgroundLight: string | null;
  backgroundDark: string | null;
  /** Cor do texto. null = automática (a que contrasta com o fundo). */
  textColor: string | null;
  headingFont: HeadingFontId;
  bodyFont: BodyFontId;
  /** Tamanho do texto em % (100 = padrão). */
  textScale: number;
  /** Arredondamento dos cantos em px (16 = padrão). */
  cornerRadius: number;
  density: Density;
  borders: BorderStyle;
  shadows: ShadowStyle;
  reduceMotion: boolean;
}

/** O tema principal do site. */
export const DEFAULT_APPEARANCE: Appearance = {
  mode: "light",
  accent: "#b4532a",
  primary: "#555f36",
  backgroundLight: null,
  backgroundDark: null,
  textColor: null,
  headingFont: "classica",
  bodyFont: "plex",
  textScale: 100,
  cornerRadius: 16,
  density: "normal",
  borders: "subtle",
  shadows: "soft",
  reduceMotion: false,
};

export const TEXT_SCALE_RANGE = { min: 85, max: 130 } as const;
export const CORNER_RANGE = { min: 0, max: 32 } as const;

/** Cores do tema principal em cada modo (referência para contraste e mistura). */
export const THEME_COLORS = {
  light: { background: "#faf7f0", text: "#342d24" },
  dark: { background: "#1f1b15", text: "#f4eee2" },
} as const;

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

export const HEADING_FONTS: { id: HeadingFontId; name: string; css: string | null }[] = [
  { id: "classica", name: "Clássica", css: null },
  { id: "elegante", name: "Elegante", css: '"Playfair Display", ui-serif, Georgia, serif' },
  { id: "editorial", name: "Editorial", css: '"Merriweather", ui-serif, Georgia, serif' },
  { id: "moderna", name: "Moderna", css: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' },
  { id: "suave", name: "Suave", css: '"Nunito", ui-sans-serif, system-ui, sans-serif' },
  { id: "marcante", name: "Marcante", css: '"Poppins", ui-sans-serif, system-ui, sans-serif' },
  { id: "tecnica", name: "Técnica", css: "ui-monospace, SFMono-Regular, Menlo, monospace" },
];

export const BODY_FONTS: { id: BodyFontId; name: string; css: string | null }[] = [
  { id: "plex", name: "Plex Sans", css: null },
  { id: "nunito", name: "Nunito", css: '"Nunito", ui-sans-serif, system-ui, sans-serif' },
  { id: "poppins", name: "Poppins", css: '"Poppins", ui-sans-serif, system-ui, sans-serif' },
  { id: "sistema", name: "Do sistema", css: "ui-sans-serif, system-ui, -apple-system, sans-serif" },
  { id: "lora", name: "Lora", css: '"Lora", ui-serif, Georgia, serif' },
  { id: "merriweather", name: "Merriweather", css: '"Merriweather", ui-serif, Georgia, serif' },
  { id: "mono", name: "Monoespaçada", css: "ui-monospace, SFMono-Regular, Menlo, monospace" },
];

const DENSITY_SPACING: Record<Density, string | null> = {
  compact: "0.22rem",
  normal: null,
  spacious: "0.29rem",
};

export const STORAGE_KEY = "nutriconnect_appearance";
/** Variáveis já calculadas por modo: permite ao script inicial aplicar tudo sem recalcular. */
export const CSS_STORAGE_KEY = "nutriconnect_appearance_css";
const LEGACY_THEME_KEY = "nutriconect-theme";
export const APPEARANCE_EVENT = "appearance-change";

// ---------------------------------------------------------------------------
// Cores
// ---------------------------------------------------------------------------

export function isHex(value: string | null | undefined): value is string {
  return !!value && /^#[0-9a-f]{6}$/i.test(value);
}

function parseHex(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
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

/** Razão de contraste WCAG entre duas cores (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Texto claro ou escuro, o que tiver mais contraste sobre `bg`. */
function readableOn(bg: string): string {
  return luminance(bg) > 0.4 ? "#221008" : "#fffaf7";
}

/** Variáveis derivadas de uma cor de marca (destaque ou principal) para um modo. */
function brandVars(kind: "accent" | "primary", color: string, dark: boolean, base: string) {
  // No escuro, cores densas ficam ilegíveis: clareia até haver contraste com o fundo.
  const tone = dark && luminance(color) < 0.25 ? mix(color, "#ffffff", 0.35) : color;
  const vars: Record<string, string> = {
    [`--${kind}`]: tone,
    [`--${kind}-foreground`]: readableOn(tone),
    [`--${kind}-hover`]: mix(tone, dark ? "#ffffff" : "#000000", 0.14),
    [`--${kind}-soft`]: mix(tone, base, dark ? 0.78 : 0.86),
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
  /** Atributos do <html> (iguais nos dois modos), usados por regras em styles.css. */
  attrs: Record<string, string>;
}

/** Só as diferenças em relação ao tema principal viram variáveis. */
export function computeAppearanceCss(a: Appearance): AppearanceCss {
  const build = (dark: boolean) => {
    const theme = dark ? THEME_COLORS.dark : THEME_COLORS.light;
    const vars: Record<string, string> = {};
    let bg: string = theme.background;
    let text: string = theme.text;
    let card: string = dark ? "#27221b" : "#fffdfa";
    // O que conta para as cores de marca é se a superfície final é escura, não o modo escolhido.
    let surfaceIsDark = dark;

    // Fundo livre: superfícies, bordas e texto são derivados dele, então nada fica ilegível.
    const customBg = dark ? a.backgroundDark : a.backgroundLight;
    if (isHex(customBg)) {
      bg = customBg;
      const bgIsDark = luminance(bg) < 0.4;
      surfaceIsDark = bgIsDark;
      card = bgIsDark ? mix(bg, "#ffffff", 0.06) : mix(bg, "#ffffff", 0.6);
      const secondary = bgIsDark ? mix(bg, "#ffffff", 0.1) : mix(bg, "#000000", 0.05);
      const border = bgIsDark ? mix(bg, "#ffffff", 0.18) : mix(bg, "#000000", 0.1);
      text = bgIsDark ? THEME_COLORS.dark.text : THEME_COLORS.light.text;
      Object.assign(vars, {
        "--background": bg,
        "--card": card,
        "--popover": card,
        "--secondary": secondary,
        "--muted": secondary,
        "--border": border,
        "--input": border,
      });
    }

    if (isHex(a.textColor)) text = a.textColor;
    if (isHex(customBg) || isHex(a.textColor)) {
      const muted = mix(text, bg, 0.42);
      Object.assign(vars, {
        "--foreground": text,
        "--card-foreground": text,
        "--popover-foreground": text,
        "--secondary-foreground": text,
        "--muted-foreground": muted,
      });
    }

    if (a.borders === "none") vars["--border"] = "transparent";
    if (a.borders === "strong") vars["--border"] = mix(text, bg, 0.72);

    // Com fundo livre, os tons de marca são sempre recalculados para casar com a nova superfície.
    const recolor = isHex(customBg);
    if (isHex(a.accent) && (recolor || a.accent.toLowerCase() !== DEFAULT_APPEARANCE.accent)) {
      Object.assign(vars, brandVars("accent", a.accent, surfaceIsDark, card));
    }
    if (isHex(a.primary) && (recolor || a.primary.toLowerCase() !== DEFAULT_APPEARANCE.primary)) {
      Object.assign(vars, brandVars("primary", a.primary, surfaceIsDark, card));
    }

    const heading = HEADING_FONTS.find((f) => f.id === a.headingFont)?.css;
    if (heading) vars["--user-font-display"] = heading;
    const body = BODY_FONTS.find((f) => f.id === a.bodyFont)?.css;
    if (body) vars["--user-font-sans"] = body;

    if (a.textScale !== DEFAULT_APPEARANCE.textScale) vars["font-size"] = `${a.textScale}%`;
    if (a.cornerRadius !== DEFAULT_APPEARANCE.cornerRadius) {
      vars["--radius"] = `${a.cornerRadius / 16}rem`;
      vars["--radius-3xl"] = `${(a.cornerRadius * 1.5) / 16}rem`;
    }
    const spacing = DENSITY_SPACING[a.density];
    if (spacing) vars["--spacing"] = spacing;
    return vars;
  };

  const attrs: Record<string, string> = {};
  if (a.shadows !== "soft") attrs["data-shadows"] = a.shadows;
  if (a.reduceMotion) attrs["data-motion"] = "reduce";

  return { mode: a.mode, light: build(false), dark: build(true), attrs };
}

/** Tudo o que este módulo pode ter definido (para limpar antes de reaplicar). */
const MANAGED_PROPS = [
  "--background",
  "--card",
  "--popover",
  "--secondary",
  "--muted",
  "--border",
  "--input",
  "--foreground",
  "--card-foreground",
  "--popover-foreground",
  "--secondary-foreground",
  "--muted-foreground",
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
  "--spacing",
  "font-size",
];
const MANAGED_ATTRS = ["data-shadows", "data-motion"];

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyCss(css: AppearanceCss) {
  const root = document.documentElement;
  const dark = css.mode === "dark" || (css.mode === "system" && prefersDark());
  root.classList.toggle("dark", dark);
  for (const prop of MANAGED_PROPS) root.style.removeProperty(prop);
  for (const attr of MANAGED_ATTRS) root.removeAttribute(attr);
  for (const [prop, value] of Object.entries(dark ? css.dark : css.light)) {
    root.style.setProperty(prop, value);
  }
  for (const [attr, value] of Object.entries(css.attrs ?? {})) root.setAttribute(attr, value);
  root.style.colorScheme = dark ? "dark" : "light";
}

function storeCss(css: AppearanceCss) {
  try {
    window.localStorage.setItem(CSS_STORAGE_KEY, JSON.stringify(css));
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
}

// Formato antigo (fundos prontos e opções em categorias): converte para o atual.
const OLD_BACKGROUNDS: Record<string, string> = {
  branco: "#fafafa",
  nevoa: "#f2f5f8",
  menta: "#f0f6f1",
  rose: "#fbf2f1",
};
const OLD_TEXT_SIZE: Record<string, number> = { small: 94, medium: 100, large: 112 };
const OLD_CORNERS: Record<string, number> = { sharp: 4, soft: 16, round: 24 };

function migrate(raw: Record<string, unknown>): Partial<Appearance> {
  const out = { ...raw } as Partial<Appearance> & Record<string, unknown>;
  if (typeof raw.background === "string") {
    out.backgroundLight ??= OLD_BACKGROUNDS[raw.background] ?? null;
    delete out.background;
  }
  if (typeof raw.textSize === "string") {
    out.textScale ??= OLD_TEXT_SIZE[raw.textSize] ?? 100;
    delete out.textSize;
  }
  if (typeof raw.corners === "string") {
    out.cornerRadius ??= OLD_CORNERS[raw.corners] ?? 16;
    delete out.corners;
  }
  return out;
}

export function loadAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEFAULT_APPEARANCE,
          ...migrate(parsed as Record<string, unknown>),
        };
      }
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
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
  storeCss(css);
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
  const apply = () => {
    const css = computeAppearanceCss(loadAppearance());
    applyCss(css);
    storeCss(css); // atualiza o cache lido pelo script inicial
  };
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
export const APPEARANCE_INIT_SCRIPT = `(function(){try{var r=document.documentElement,s=localStorage,c=JSON.parse(s.getItem("${CSS_STORAGE_KEY}")||"null"),d=false;if(c){d=c.mode==="dark"||(c.mode==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var v=d?c.dark:c.light;for(var k in v)r.style.setProperty(k,v[k]);var t=c.attrs||{};for(var a in t)r.setAttribute(a,t[a]);}else{d=s.getItem("${LEGACY_THEME_KEY}")==="dark";}r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
