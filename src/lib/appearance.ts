// Personalização visual: cada pessoa monta o próprio estilo a partir do tema principal do site.
// As escolhas viram variáveis CSS (e alguns atributos) aplicados no <html>; só o que difere do
// tema principal é sobrescrito. As listas de fontes, paletas e modelos prontos ficam em
// appearance-data.ts.
import { BODY_FONTS, HEADING_FONTS, type FontDef } from "./appearance-data";

export type ThemeMode = "light" | "dark" | "system" | "schedule";
export type Density = "compact" | "normal" | "spacious";
export type BorderStyle = "none" | "subtle" | "strong";
export type ShadowStyle = "none" | "soft" | "strong";
export type HeaderStyle = "glass" | "solid" | "tint";

export type HeadingFontId = string;
export type BodyFontId = string;
export type TextAlign = "default" | "left" | "justify";
export type HeadingCase = "normal" | "upper" | "capitalize";

export type ButtonShape = "pill" | "rounded" | "square";
export type InputStyle = "outlined" | "filled" | "underline";
export type AnimationSpeed = "slow" | "normal" | "fast";
export type ScrollbarStyle = "default" | "thin" | "accent";

export type SoundStyle = "suave" | "cristal" | "madeira";
export type ToneId =
  "sino" | "gota" | "digital" | "harpa" | "moeda" | "sopro" | "marimba" | "alerta";

export type ContentWidth = "narrow" | "normal" | "wide";
export type PageBackground = "plain" | "dots" | "grid" | "paper" | "aurora";
export type HomePageId =
  | "espaco"
  | "comunidades"
  | "desafios"
  | "explorar"
  | "nina"
  | "acompanhamento"
  | "receitas"
  | "tema"
  | "notificacoes";

export type DateFormat = "auto" | "dmy" | "mdy" | "ymd" | "long";
export type TimeFormat = "auto" | "24h" | "12h";

export type ColorFilter = "none" | "grayscale" | "sepia" | "invert" | "lowsat" | "highsat";

export type CardStyle = "classic" | "compact";
export type ImageSize = "normal" | "large";
export type ImageCorners = "rounded" | "soft" | "square";
export type AvatarShape = "round" | "square";
export type DefaultAudience = "publico" | "amigos";

export interface Appearance {
  // ── Cores ────────────────────────────────────────────────────────────────
  mode: ThemeMode;
  /** Horário (0–23) em que o modo "agendado" liga o escuro e em que desliga. */
  darkFrom: number;
  darkTo: number;
  /** Cor de destaque (botões principais, links, selos). */
  accent: string;
  /** Cor principal (títulos de seção, elementos de marca). */
  primary: string;
  /** Fundo livre no modo claro / escuro. null = fundo do tema principal. */
  backgroundLight: string | null;
  backgroundDark: string | null;
  /** Preto total no modo escuro (telas OLED). */
  oledBlack: boolean;
  /** Cor do texto. null = automática (a que contrasta com o fundo). */
  textColor: string | null;
  /** Cor dos cartões. null = derivada do fundo. */
  cardColor: string | null;
  /** Intensidade das cores de marca em %, 100 = como escolhidas. */
  colorIntensity: number;
  /** Tom do fundo: negativo = frio, positivo = quente (−40 a 40). */
  warmth: number;
  headerStyle: HeaderStyle;
  /** Último tema pronto aplicado (só para destacar na galeria). */
  themePreset: string | null;

  // ── Texto ────────────────────────────────────────────────────────────────
  headingFont: HeadingFontId;
  bodyFont: BodyFontId;
  /** Tamanho do texto em % (100 = padrão). */
  textScale: number;
  /** Peso dos títulos (0 = padrão do tema). */
  headingWeight: number;
  /** Tamanho dos títulos em % (100 = padrão). */
  headingScale: number;
  headingCase: HeadingCase;
  /** Cor dos títulos. null = automática. */
  headingColor: string | null;
  /** Peso do texto corrido (0 = padrão do tema). */
  bodyWeight: number;
  textAlign: TextAlign;

  // ── Formatos ─────────────────────────────────────────────────────────────
  /** Arredondamento dos cantos em px (16 = padrão). */
  cornerRadius: number;
  /** Arredondamento só dos cartões; null = acompanha os cantos. */
  cardRadius: number | null;
  buttonShape: ButtonShape;
  inputStyle: InputStyle;
  /** Espessura das bordas em px (0 a 4; 1 = padrão). */
  borderWidth: number;
  density: Density;
  borders: BorderStyle;
  shadows: ShadowStyle;
  animationSpeed: AnimationSpeed;
  reduceMotion: boolean;
  /** Espessura dos ícones (1 a 3; 2 = padrão). */
  iconStroke: number;
  scrollbar: ScrollbarStyle;

  // ── Sons (sintetizados no aparelho; nada é baixado) ──────────────────────
  soundsOn: boolean;
  /** Volume geral, 0 a 100. */
  soundVolume: number;
  soundStyle: SoundStyle;
  soundNotification: boolean;
  soundMessage: boolean;
  soundAchievement: boolean;
  soundClicks: boolean;
  soundSend: boolean;
  soundSuccess: boolean;
  soundError: boolean;
  soundSupport: boolean;
  toneNotification: ToneId;
  toneMessage: ToneId;
  toneAchievement: ToneId;
  toneClick: ToneId;
  toneSend: ToneId;
  toneSuccess: ToneId;
  toneError: ToneId;
  toneSupport: ToneId;
  /** Horário de silêncio: nenhum som entre `quietFrom` e `quietTo` (horas 0–23). */
  quietOn: boolean;
  quietFrom: number;
  quietTo: number;
  /** Vibração curta em celulares junto com notificações e mensagens. */
  vibration: boolean;

  // ── Layout e início ──────────────────────────────────────────────────────
  contentWidth: ContentWidth;
  /** Largura máxima do conteúdo em px; 0 = usa a opção acima. */
  contentMaxPx: number;
  /** Página que abre ao entrar no site. */
  homePage: HomePageId;
  /** Painéis laterais do Espaço (perfil/conquistas e sugestões). */
  sidePanels: boolean;
  pageBackground: PageBackground;
  /** Cabeçalho fixo no topo ao rolar. */
  headerSticky: boolean;
  smoothScroll: boolean;
  /** Botão "voltar ao topo". */
  backToTop: boolean;
  /** Quantas publicações o Espaço carrega por vez. */
  feedPageSize: number;

  // ── Acessibilidade ───────────────────────────────────────────────────────
  highContrast: boolean;
  /** Fonte de leitura facilitada (Lexend) no site todo. */
  readableFont: boolean;
  strongFocus: boolean;
  underlineLinks: boolean;
  /** Espaço entre letras, de 0 a 10 (centésimos de em). */
  letterSpacing: number;
  /** Espaço entre palavras, de 0 a 10 (vigésimos de em). */
  wordSpacing: number;
  /** Altura da linha em %: 0 = padrão do tema, de 130 a 200. */
  lineHeight: number;
  bigCursor: boolean;
  /** Botões e campos com área de toque maior. */
  largeTargets: boolean;
  colorFilter: ColorFilter;
  /** Faixa que acompanha o mouse para guiar a leitura. */
  readingGuide: boolean;
  /** Botão "Ouvir" ao selecionar um texto (voz do navegador). */
  speakSelection: boolean;

  // ── Perfil e posts ───────────────────────────────────────────────────────
  cardStyle: CardStyle;
  imageSize: ImageSize;
  imageCorners: ImageCorners;
  avatarShape: AvatarShape;
  /** Mostra os números de curtidas, apoios e comentários. */
  showCounts: boolean;
  /** Posts abertos por inteiro, sem "Ver mais". */
  expandPosts: boolean;
  showTags: boolean;
  /** Faixa de destaque na lateral dos cartões de post. */
  cardAccent: boolean;
  /** Quem vê uma publicação nova, por padrão. */
  defaultAudience: DefaultAudience;

  // ── Idioma e região ──────────────────────────────────────────────────────
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  /** Fuso horário (nome IANA) ou "auto" = o do aparelho. */
  timeZone: string;

  // ── Notificações ─────────────────────────────────────────────────────────
  /** Mostra o texto da notificação do navegador (desligado = só "Você tem uma novidade"). */
  notifPreview: boolean;
}

/** O tema principal do site. */
export const DEFAULT_APPEARANCE: Appearance = {
  mode: "light",
  darkFrom: 19,
  darkTo: 6,
  accent: "#b4532a",
  primary: "#555f36",
  backgroundLight: null,
  backgroundDark: null,
  oledBlack: false,
  textColor: null,
  cardColor: null,
  colorIntensity: 100,
  warmth: 0,
  headerStyle: "glass",
  themePreset: null,

  headingFont: "classica",
  bodyFont: "plex",
  textScale: 100,
  headingWeight: 0,
  headingScale: 100,
  headingCase: "normal",
  headingColor: null,
  bodyWeight: 0,
  textAlign: "default",

  cornerRadius: 16,
  cardRadius: null,
  buttonShape: "pill",
  inputStyle: "outlined",
  borderWidth: 1,
  density: "normal",
  borders: "subtle",
  shadows: "soft",
  animationSpeed: "normal",
  reduceMotion: false,
  iconStroke: 2,
  scrollbar: "default",

  soundsOn: false,
  soundVolume: 60,
  soundStyle: "suave",
  soundNotification: true,
  soundMessage: true,
  soundAchievement: true,
  soundClicks: false,
  soundSend: true,
  soundSuccess: true,
  soundError: true,
  soundSupport: true,
  toneNotification: "sino",
  toneMessage: "gota",
  toneAchievement: "harpa",
  toneClick: "sopro",
  toneSend: "gota",
  toneSuccess: "moeda",
  toneError: "alerta",
  toneSupport: "marimba",
  quietOn: false,
  quietFrom: 22,
  quietTo: 7,
  vibration: false,

  contentWidth: "normal",
  contentMaxPx: 0,
  homePage: "espaco",
  sidePanels: true,
  pageBackground: "plain",
  headerSticky: true,
  smoothScroll: false,
  backToTop: false,
  feedPageSize: 20,

  highContrast: false,
  readableFont: false,
  strongFocus: false,
  underlineLinks: false,
  letterSpacing: 0,
  wordSpacing: 0,
  lineHeight: 0,
  bigCursor: false,
  largeTargets: false,
  colorFilter: "none",
  readingGuide: false,
  speakSelection: false,

  cardStyle: "classic",
  imageSize: "normal",
  imageCorners: "rounded",
  avatarShape: "round",
  showCounts: true,
  expandPosts: false,
  showTags: true,
  cardAccent: false,
  defaultAudience: "publico",

  dateFormat: "auto",
  timeFormat: "auto",
  timeZone: "auto",

  notifPreview: true,
};

export const TEXT_SCALE_RANGE = { min: 85, max: 140 } as const;
export const HEADING_SCALE_RANGE = { min: 80, max: 140 } as const;
export const CORNER_RANGE = { min: 0, max: 40 } as const;
export const BORDER_WIDTH_RANGE = { min: 0, max: 4 } as const;
export const ICON_STROKE_RANGE = { min: 1, max: 3 } as const;
export const LETTER_SPACING_RANGE = { min: 0, max: 10 } as const;
export const WORD_SPACING_RANGE = { min: 0, max: 10 } as const;
export const LINE_HEIGHT_RANGE = { min: 130, max: 200 } as const;
export const COLOR_INTENSITY_RANGE = { min: 40, max: 160 } as const;
export const WARMTH_RANGE = { min: -40, max: 40 } as const;
export const CONTENT_MAX_RANGE = { min: 560, max: 1400 } as const;
export const FEED_PAGE_SIZES = [10, 15, 20, 30, 40] as const;

/** Rota aberta ao entrar no site, por escolha da pessoa. */
export const HOME_ROUTES: Record<HomePageId, string> = {
  espaco: "/espaco",
  comunidades: "/comunidades",
  desafios: "/desafios",
  explorar: "/explorar",
  nina: "/nina",
  acompanhamento: "/acompanhamento",
  receitas: "/receitas",
  tema: "/tema-da-semana",
  notificacoes: "/notificacoes",
};

/** Cores do tema principal em cada modo (referência para contraste e mistura). */
export const THEME_COLORS = {
  light: { background: "#faf7f0", text: "#342d24" },
  dark: { background: "#1f1b15", text: "#f4eee2" },
} as const;

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
  return `#${[r, g, b]
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Mistura `a` com `b` (t = 0 → a, t = 1 → b). */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/** Multiplica a saturação (HSL) de uma cor: 0.5 = mais apagada, 1.5 = mais viva. */
function scaleSaturation(hex: string, factor: number): string {
  const [r, g, b] = parseHex(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return hex;
  let s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  s = Math.min(1, Math.max(0, s * factor));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255]);
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

/** true se a hora atual cai dentro da janela [from, to) (que pode virar a meia-noite). */
export function inHourWindow(from: number, to: number, hour = new Date().getHours()): boolean {
  if (from === to) return false;
  return from > to ? hour >= from || hour < to : hour >= from && hour < to;
}

// ---------------------------------------------------------------------------
// Cálculo e aplicação
// ---------------------------------------------------------------------------

export interface AppearanceCss {
  mode: ThemeMode;
  /** Janela do modo "agendado". */
  from?: number;
  to?: number;
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

    let customBg: string | null = dark ? a.backgroundDark : a.backgroundLight;
    if (!isHex(customBg) && dark && a.oledBlack) customBg = "#000000";
    if (a.warmth !== 0) {
      const base = isHex(customBg) ? customBg : theme.background;
      customBg = mix(base, a.warmth > 0 ? "#ffb347" : "#7fb2ff", Math.abs(a.warmth) / 160);
    }

    // Fundo livre: superfícies, bordas e texto são derivados dele, então nada fica ilegível.
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

    if (isHex(a.cardColor)) {
      card = a.cardColor;
      vars["--card"] = card;
      vars["--popover"] = card;
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

    // Alto contraste: texto e bordas no máximo possível sobre o fundo que está valendo.
    if (a.highContrast) {
      const hc = luminance(bg) < 0.4 ? "#ffffff" : "#000000";
      text = hc;
      Object.assign(vars, {
        "--foreground": hc,
        "--card-foreground": hc,
        "--popover-foreground": hc,
        "--secondary-foreground": hc,
        "--muted-foreground": mix(hc, bg, 0.1),
        "--border": mix(hc, bg, 0.6),
        "--input": mix(hc, bg, 0.6),
      });
    }

    // Com fundo livre ou intensidade alterada, os tons de marca são recalculados para a superfície.
    const recolor = isHex(customBg) || isHex(a.cardColor);
    const factor = a.colorIntensity / 100;
    const tint = (hex: string) => (factor !== 1 ? scaleSaturation(hex, factor) : hex);
    if (isHex(a.accent) && (recolor || factor !== 1 || a.accent.toLowerCase() !== DEFAULT_APPEARANCE.accent)) {
      Object.assign(vars, brandVars("accent", tint(a.accent), surfaceIsDark, card));
    }
    if (isHex(a.primary) && (recolor || factor !== 1 || a.primary.toLowerCase() !== DEFAULT_APPEARANCE.primary)) {
      Object.assign(vars, brandVars("primary", tint(a.primary), surfaceIsDark, card));
    }

    const heading = HEADING_FONTS.find((f) => f.id === a.headingFont)?.css;
    if (heading) vars["--user-font-display"] = heading;
    const body = BODY_FONTS.find((f) => f.id === a.bodyFont)?.css;
    if (body) vars["--user-font-sans"] = body;
    if (a.readableFont) {
      const readable = '"Lexend", ui-sans-serif, system-ui, sans-serif';
      vars["--user-font-display"] = readable;
      vars["--user-font-sans"] = readable;
    }
    if (isHex(a.headingColor)) vars["--user-heading-color"] = a.headingColor;
    if (a.headingWeight > 0) vars["--user-hw"] = String(a.headingWeight);
    if (a.headingScale !== 100) vars["--user-hs"] = String(a.headingScale / 100);
    if (a.bodyWeight > 0) vars["--user-bodyw"] = String(a.bodyWeight);
    if (a.letterSpacing > 0) vars["letter-spacing"] = `${a.letterSpacing / 100}em`;
    if (a.wordSpacing > 0) vars["word-spacing"] = `${a.wordSpacing / 20}em`;
    if (a.lineHeight > 0) vars["line-height"] = String(a.lineHeight / 100);

    if (a.textScale !== DEFAULT_APPEARANCE.textScale) vars["font-size"] = `${a.textScale}%`;
    if (a.cornerRadius !== DEFAULT_APPEARANCE.cornerRadius) {
      vars["--radius"] = `${a.cornerRadius / 16}rem`;
      vars["--radius-3xl"] = `${(a.cornerRadius * 1.5) / 16}rem`;
    }
    if (a.cardRadius !== null) {
      vars["--radius-2xl"] = `${a.cardRadius / 16}rem`;
      vars["--radius-3xl"] = `${(a.cardRadius * 1.25) / 16}rem`;
    }
    const spacing = DENSITY_SPACING[a.density];
    if (spacing) vars["--spacing"] = spacing;
    if (a.borderWidth !== 1) vars["--user-bwidth"] = `${a.borderWidth}px`;
    if (a.iconStroke !== 2) vars["--user-icon-stroke"] = String(a.iconStroke);
    if (a.contentMaxPx > 0) vars["--user-content-max"] = `${a.contentMaxPx}px`;
    return vars;
  };

  const attrs: Record<string, string> = {};
  if (a.shadows !== "soft") attrs["data-shadows"] = a.shadows;
  if (a.reduceMotion) attrs["data-motion"] = "reduce";
  if (a.animationSpeed !== "normal") attrs["data-anim"] = a.animationSpeed;
  if (a.contentWidth !== "normal") attrs["data-width"] = a.contentWidth;
  if (a.contentMaxPx > 0) attrs["data-maxw"] = "on";
  if (a.strongFocus) attrs["data-focus"] = "strong";
  if (a.underlineLinks) attrs["data-links"] = "underline";
  if (a.cardStyle === "compact") attrs["data-cards"] = "compact";
  if (a.imageSize === "large") attrs["data-images"] = "large";
  if (a.imageCorners !== "rounded") attrs["data-imgc"] = a.imageCorners;
  if (a.avatarShape === "square") attrs["data-avatar"] = "square";
  if (!a.showCounts) attrs["data-counts"] = "hide";
  if (!a.showTags) attrs["data-tags"] = "hide";
  if (a.expandPosts) attrs["data-expand"] = "on";
  if (a.cardAccent) attrs["data-cardaccent"] = "on";
  if (a.headerStyle !== "glass") attrs["data-header"] = a.headerStyle;
  if (!a.headerSticky) attrs["data-sticky"] = "off";
  if (a.smoothScroll) attrs["data-smooth"] = "on";
  if (a.pageBackground !== "plain") attrs["data-pagebg"] = a.pageBackground;
  if (isHex(a.headingColor)) attrs["data-hcolor"] = "on";
  if (a.headingWeight > 0) attrs["data-hw"] = "on";
  if (a.headingScale !== 100) attrs["data-hs"] = "on";
  if (a.headingCase !== "normal") attrs["data-hcase"] = a.headingCase;
  if (a.bodyWeight > 0) attrs["data-bodyw"] = "on";
  if (a.textAlign !== "default") attrs["data-talign"] = a.textAlign;
  if (a.buttonShape !== "pill") attrs["data-buttons"] = a.buttonShape;
  if (a.inputStyle !== "outlined") attrs["data-inputs"] = a.inputStyle;
  if (a.borderWidth !== 1) attrs["data-bwidth"] = "on";
  if (a.iconStroke !== 2) attrs["data-icons"] = "on";
  if (a.scrollbar !== "default") attrs["data-scroll"] = a.scrollbar;
  if (a.bigCursor) attrs["data-cursor"] = "big";
  if (a.largeTargets) attrs["data-targets"] = "large";
  if (a.colorFilter !== "none") attrs["data-cfilter"] = a.colorFilter;

  return {
    mode: a.mode,
    from: a.darkFrom,
    to: a.darkTo,
    light: build(false),
    dark: build(true),
    attrs,
  };
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
  "--user-heading-color",
  "--user-hw",
  "--user-hs",
  "--user-bodyw",
  "--user-bwidth",
  "--user-icon-stroke",
  "--user-content-max",
  "--radius",
  "--radius-2xl",
  "--radius-3xl",
  "--spacing",
  "font-size",
  "letter-spacing",
  "word-spacing",
  "line-height",
];
const MANAGED_ATTRS = [
  "data-shadows",
  "data-motion",
  "data-anim",
  "data-width",
  "data-maxw",
  "data-focus",
  "data-links",
  "data-cards",
  "data-images",
  "data-imgc",
  "data-avatar",
  "data-counts",
  "data-tags",
  "data-expand",
  "data-cardaccent",
  "data-header",
  "data-sticky",
  "data-smooth",
  "data-pagebg",
  "data-hcolor",
  "data-hw",
  "data-hs",
  "data-hcase",
  "data-bodyw",
  "data-talign",
  "data-buttons",
  "data-inputs",
  "data-bwidth",
  "data-icons",
  "data-scroll",
  "data-cursor",
  "data-targets",
  "data-cfilter",
];

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function isDarkNow(css: AppearanceCss): boolean {
  if (css.mode === "dark") return true;
  if (css.mode === "system") return prefersDark();
  if (css.mode === "schedule") return inHourWindow(css.from ?? 19, css.to ?? 6);
  return false;
}

function applyCss(css: AppearanceCss) {
  const root = document.documentElement;
  const dark = isDarkNow(css);
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

// ---------------------------------------------------------------------------
// Fontes do Google: carregadas só quando alguém as usa
// ---------------------------------------------------------------------------

const loadedFonts = new Set<string>();

export function loadGoogleFont(font: Pick<FontDef, "google">) {
  if (typeof document === "undefined" || !font.google || loadedFonts.has(font.google)) return;
  loadedFonts.add(font.google);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
  document.head.appendChild(link);
}

function ensureFonts(a: Appearance) {
  const h = HEADING_FONTS.find((f) => f.id === a.headingFont);
  const b = BODY_FONTS.find((f) => f.id === a.bodyFont);
  if (h) loadGoogleFont(h);
  if (b) loadGoogleFont(b);
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

/** Aceita só campos conhecidos do tipo certo (dados vindos da conta podem estar desatualizados). */
export function sanitizeAppearance(raw: unknown): Appearance {
  if (!raw || typeof raw !== "object") return DEFAULT_APPEARANCE;
  const incoming = migrate(raw as Record<string, unknown>) as Record<string, unknown>;
  const out: Record<string, unknown> = { ...DEFAULT_APPEARANCE };
  for (const key of Object.keys(DEFAULT_APPEARANCE)) {
    const fallback = (DEFAULT_APPEARANCE as unknown as Record<string, unknown>)[key];
    const value = incoming[key];
    if (value === undefined) continue;
    const sameType = typeof value === typeof fallback;
    const nullable =
      fallback === null &&
      (value === null || typeof value === "string" || typeof value === "number");
    if (sameType || nullable) out[key] = value;
  }
  return out as unknown as Appearance;
}

export function loadAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return sanitizeAppearance(parsed);
    }
    // Migra a escolha antiga de claro/escuro.
    const legacy = window.localStorage.getItem(LEGACY_THEME_KEY);
    if (legacy === "dark" || legacy === "light") return { ...DEFAULT_APPEARANCE, mode: legacy };
  } catch {
    // armazenamento indisponível: segue com o tema principal
  }
  return DEFAULT_APPEARANCE;
}

/** Aparência de OUTRA pessoa (perfil) em exibição agora, ou null. Não é gravada em lugar nenhum. */
let scopedTheme: Appearance | null = null;

/**
 * Opções que continuam sendo de quem VISITA o perfil: acessibilidade e conforto de leitura nunca são
 * trocados pelo tema de outra pessoa.
 */
const VIEWER_KEYS = [
  "highContrast",
  "readableFont",
  "strongFocus",
  "underlineLinks",
  "letterSpacing",
  "wordSpacing",
  "lineHeight",
  "bigCursor",
  "largeTargets",
  "colorFilter",
  "readingGuide",
  "speakSelection",
  "reduceMotion",
  "animationSpeed",
  "scrollbar",
] as const;

function applyScopedNow(viewer: Appearance) {
  if (!scopedTheme) return;
  const merged = { ...scopedTheme } as unknown as Record<string, unknown>;
  for (const key of VIEWER_KEYS) merged[key] = viewer[key];
  // Quem aumentou o texto para enxergar melhor mantém o tamanho dele.
  if (viewer.textScale !== 100) merged.textScale = viewer.textScale;
  let css: AppearanceCss;
  try {
    css = computeAppearanceCss(merged as unknown as Appearance);
  } catch {
    css = computeAppearanceCss({ ...DEFAULT_APPEARANCE, ...viewerOnly(viewer) });
  }
  applyCss(css);
  ensureFonts(merged as unknown as Appearance);
}

function viewerOnly(viewer: Appearance): Partial<Appearance> {
  const out: Record<string, unknown> = {};
  for (const key of VIEWER_KEYS) out[key] = viewer[key];
  return out as Partial<Appearance>;
}

/**
 * Mostra a aparência escolhida por quem montou um perfil enquanto a página estiver aberta, sem tocar
 * nas escolhas de quem visita (que voltam ao chamar com null). Assim o perfil aparece para todos
 * exatamente como foi decorado.
 */
export function applyScopedAppearance(theme: Appearance | null) {
  scopedTheme = theme;
  const own = loadAppearance();
  if (theme) applyScopedNow(own);
  else applyAppearance(own);
}

function applyAppearance(a: Appearance) {
  const css = computeAppearanceCss(a);
  storeCss(css); // cache lido pelo script inicial (sempre o da própria pessoa)
  if (scopedTheme) {
    applyScopedNow(a);
    return;
  }
  applyCss(css);
  ensureFonts(a);
}

/** Salva as escolhas e aplica na hora. `source: "remote"` = veio da conta (não reenviar). */
export function saveAppearance(a: Appearance, source: "local" | "remote" = "local") {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
  applyAppearance(a);
  window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT, { detail: { source } }));
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
  window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT, { detail: { source: "local" } }));
}

/** Aplica as escolhas salvas e acompanha o modo "automático" e o "agendado". Retorna a limpeza. */
export function initAppearance(): () => void {
  const apply = () => applyAppearance(loadAppearance());
  apply();
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (loadAppearance().mode === "system") apply();
  };
  media.addEventListener("change", onSystemChange);
  // O modo agendado troca de claro para escuro sozinho, sem precisar recarregar a página.
  const timer = window.setInterval(() => {
    if (loadAppearance().mode === "schedule") apply();
  }, 60_000);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.clearInterval(timer);
  };
}

/**
 * Script executado no <head>, antes da primeira pintura, para não piscar o tema padrão.
 * Usa as variáveis já calculadas em CSS_STORAGE_KEY (sem repetir a lógica de cores).
 */
export const APPEARANCE_INIT_SCRIPT = `(function(){try{var r=document.documentElement,s=localStorage,c=JSON.parse(s.getItem("${CSS_STORAGE_KEY}")||"null"),d=false;if(c){var h=new Date().getHours(),f=c.from==null?19:c.from,e=c.to==null?6:c.to;d=c.mode==="dark"||(c.mode==="system"&&matchMedia("(prefers-color-scheme: dark)").matches)||(c.mode==="schedule"&&f!==e&&(f>e?(h>=f||h<e):(h>=f&&h<e)));var v=d?c.dark:c.light;for(var k in v)r.style.setProperty(k,v[k]);var t=c.attrs||{};for(var a in t)r.setAttribute(a,t[a]);}else{d=s.getItem("${LEGACY_THEME_KEY}")==="dark";}r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(x){}})();`;
