import { Shuffle, Volume2 } from "lucide-react";
import { useEffect } from "react";
import { useAppearance } from "@/hooks/use-appearance";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import {
  BORDER_WIDTH_RANGE,
  COLOR_INTENSITY_RANGE,
  CONTENT_MAX_RANGE,
  CORNER_RANGE,
  DEFAULT_APPEARANCE,
  FEED_PAGE_SIZES,
  HEADING_SCALE_RANGE,
  ICON_STROKE_RANGE,
  LETTER_SPACING_RANGE,
  LINE_HEIGHT_RANGE,
  TEXT_SCALE_RANGE,
  THEME_COLORS,
  WARMTH_RANGE,
  WORD_SPACING_RANGE,
  contrastRatio,
  isHex,
  loadGoogleFont,
  type Appearance,
  type ColorFilter,
  type HomePageId,
  type PageBackground,
  type SoundStyle,
  type ToneId,
} from "@/lib/appearance";
import {
  ACCENT_PRESETS,
  ACCESS_PROFILES,
  BG_DARK_PRESETS,
  BG_LIGHT_PRESETS,
  BODY_FONTS,
  FONT_PAIRS,
  HEADING_FONTS,
  LAYOUT_PRESETS,
  PRIMARY_PRESETS,
  PROFILE_PRESETS,
  SHAPE_PRESETS,
  SOUND_PACKS,
  TEXT_PRESETS,
  THEME_PRESETS,
  type FontDef,
  type FontKind,
  type Names,
} from "@/lib/appearance-data";
import { TONE_IDS, playSound, type SoundKind } from "@/lib/sounds";
import {
  BORDERS,
  BrandColor,
  DEFAULT_BODY_CSS,
  DEFAULT_HEADING_CSS,
  DENSITIES,
  FreeColor,
  Group,
  HOURS,
  MODES,
  Note,
  PresetGallery,
  SHADOWS,
  Section,
  Segmented,
  Select,
  Slider,
  Switch,
  contrastLabel,
  matchesPatch,
  optionClass,
  useTr,
} from "./appearance-editor";

type Edit = (patch: Partial<Appearance>) => void;

// ───────────────────────────── Cores ─────────────────────────────

/** Cartão "Cores": temas prontos, modo, marca, fundos, texto, cartões e cabeçalho. */
export function ColorsSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const tr = useTr();
  const edit: Edit = update;

  const darkNow =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const effectiveBg =
    (darkNow ? a.backgroundDark : a.backgroundLight) ??
    (darkNow ? THEME_COLORS.dark.background : THEME_COLORS.light.background);
  const textContrast = isHex(a.textColor)
    ? contrastLabel(contrastRatio(a.textColor, effectiveBg))
    : null;

  const surprise = () => {
    const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
    edit({ accent: pick(ACCENT_PRESETS).value, primary: pick(PRIMARY_PRESETS).value });
  };

  return (
    <Section title={t("ap.colors")} hint={t("ap.colorsHint")}>
      <Group
        title={tr(["Temas prontos", "Ready-made themes", "Temas listos", "Thèmes prêts"])}
        hint={tr([
          "Um clique aplica cores, fundos e modo de uma vez. Depois ajuste o que quiser.",
          "One click applies colors, backgrounds and mode at once. Then tweak anything.",
          "Un clic aplica colores, fondos y modo a la vez. Luego ajusta lo que quieras.",
          "Un clic applique couleurs, fonds et mode d'un coup. Ajustez ensuite à votre goût.",
        ])}
      >
        <PresetGallery
          presets={THEME_PRESETS}
          columns="grid-cols-2 sm:grid-cols-4"
          isActive={(p) => matchesPatch(a, p.patch)}
          onPick={(p) => edit(p.patch)}
        />
      </Group>

      <Group title={t("ap.mode")}>
        <Segmented
          columns="grid-cols-2 sm:grid-cols-4"
          options={MODES.map((m) =>
            m.id === "schedule"
              ? { ...m, label: tr(["Agendado", "Scheduled", "Programado", "Programmé"]) }
              : m,
          )}
          value={a.mode}
          onChange={(mode) => edit({ mode })}
        />
        {a.mode === "schedule" && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {tr(["Escuro das", "Dark from", "Oscuro desde", "Sombre de"])}
            <Select
              label="from"
              value={a.darkFrom}
              options={HOURS}
              onChange={(darkFrom) => edit({ darkFrom })}
            />
            {tr(["às", "to", "hasta", "à"])}
            <Select
              label="to"
              value={a.darkTo}
              options={HOURS}
              onChange={(darkTo) => edit({ darkTo })}
            />
          </div>
        )}
      </Group>

      <Switch
        checked={a.oledBlack}
        onChange={(oledBlack) => edit({ oledBlack })}
        label={tr([
          "Preto total no modo escuro",
          "True black in dark mode",
          "Negro total en modo oscuro",
          "Noir total en mode sombre",
        ])}
        hint={tr([
          "Fundo totalmente preto: economiza bateria em telas OLED.",
          "Pure black background: saves battery on OLED screens.",
          "Fondo totalmente negro: ahorra batería en pantallas OLED.",
          "Fond entièrement noir : économise la batterie des écrans OLED.",
        ])}
      />

      <Group title={t("ap.accent")} hint={t("ap.accentHint")}>
        <div className="space-y-3">
          <BrandColor
            label={t("ap.accent")}
            presets={ACCENT_PRESETS}
            value={a.accent}
            fallback={DEFAULT_APPEARANCE.accent}
            onChange={(accent) => edit({ accent })}
          />
          <button
            type="button"
            onClick={surprise}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <Shuffle className="h-3.5 w-3.5" />
            {tr(["Surpreenda-me", "Surprise me", "Sorpréndeme", "Surprenez-moi"])}
          </button>
        </div>
      </Group>

      <Group title={t("ap.primary")} hint={t("ap.primaryHint")}>
        <BrandColor
          label={t("ap.primary")}
          presets={PRIMARY_PRESETS}
          value={a.primary}
          fallback={DEFAULT_APPEARANCE.primary}
          onChange={(primary) => edit({ primary })}
        />
      </Group>

      <Group title={t("ap.bgLight")} hint={t("ap.bgLightHint")}>
        <FreeColor
          label={t("ap.bgLight")}
          value={a.backgroundLight}
          fallback={THEME_COLORS.light.background}
          presets={BG_LIGHT_PRESETS}
          onChange={(backgroundLight) => edit({ backgroundLight })}
          resetLabel={t("ap.useThemeBg")}
        />
      </Group>

      <Group title={t("ap.bgDark")}>
        <FreeColor
          label={t("ap.bgDark")}
          value={a.backgroundDark}
          fallback={THEME_COLORS.dark.background}
          presets={BG_DARK_PRESETS}
          onChange={(backgroundDark) => edit({ backgroundDark })}
          resetLabel={t("ap.useThemeBg")}
        />
      </Group>

      <Group title={t("ap.textColor")} hint={t("ap.textColorHint")}>
        <FreeColor
          label={t("ap.textColor")}
          value={a.textColor}
          fallback={darkNow ? THEME_COLORS.dark.text : THEME_COLORS.light.text}
          presets={TEXT_PRESETS}
          onChange={(textColor) => edit({ textColor })}
          resetLabel={t("ap.automatic")}
        />
        {textContrast && (
          <p
            className={`mt-2 text-[11px] font-medium ${
              textContrast.ok ? "text-muted-foreground" : "text-destructive"
            }`}
          >
            {t("ap.contrastWithBg")} {t(textContrast.text)}.
          </p>
        )}
      </Group>

      <Group
        title={tr(["Cor dos cartões", "Card color", "Color de las tarjetas", "Couleur des cartes"])}
        hint={tr([
          "Fundo dos cartões e janelas. Automática = derivada do fundo da página.",
          "Background of cards and dialogs. Automatic = derived from the page background.",
          "Fondo de tarjetas y ventanas. Automático = derivado del fondo de la página.",
          "Fond des cartes et fenêtres. Automatique = dérivé du fond de la page.",
        ])}
      >
        <FreeColor
          label="card"
          value={a.cardColor}
          fallback={darkNow ? "#27221b" : "#fffdfa"}
          onChange={(cardColor) => edit({ cardColor })}
          resetLabel={t("ap.automatic")}
        />
      </Group>

      <Group
        title={tr([
          "Intensidade das cores",
          "Color intensity",
          "Intensidad de los colores",
          "Intensité des couleurs",
        ])}
        hint={tr([
          "Deixa destaque e cor principal mais apagados ou mais vivos.",
          "Makes the accent and primary colors more muted or more vivid.",
          "Hace el acento y el color principal más apagados o más vivos.",
          "Rend l'accent et la couleur principale plus ternes ou plus vifs.",
        ])}
      >
        <Slider
          label="intensity"
          min={COLOR_INTENSITY_RANGE.min}
          max={COLOR_INTENSITY_RANGE.max}
          step={5}
          value={a.colorIntensity}
          onChange={(colorIntensity) => edit({ colorIntensity })}
          display={`${a.colorIntensity}%`}
        />
      </Group>

      <Group
        title={tr(["Tom do fundo", "Background tone", "Tono del fondo", "Teinte du fond"])}
        hint={tr([
          "De frio (azulado) a quente (alaranjado), sem trocar o fundo escolhido.",
          "From cool (bluish) to warm (orange), without replacing the chosen background.",
          "De frío (azulado) a cálido (anaranjado), sin cambiar el fondo elegido.",
          "De froid (bleuté) à chaud (orangé), sans changer le fond choisi.",
        ])}
      >
        <Slider
          label="warmth"
          min={WARMTH_RANGE.min}
          max={WARMTH_RANGE.max}
          step={2}
          value={a.warmth}
          onChange={(warmth) => edit({ warmth })}
          display={
            a.warmth === 0 ? t("pz.default") : a.warmth > 0 ? `+${a.warmth}` : String(a.warmth)
          }
        />
      </Group>

      <Group title={tr(["Cabeçalho", "Header", "Encabezado", "En-tête"])}>
        <Segmented
          columns="grid-cols-3"
          options={[
            { id: "glass" as const, label: tr(["Vidro", "Glass", "Cristal", "Verre"]) },
            { id: "solid" as const, label: tr(["Sólido", "Solid", "Sólido", "Plein"]) },
            { id: "tint" as const, label: tr(["Colorido", "Tinted", "Teñido", "Teinté"]) },
          ]}
          value={a.headerStyle}
          onChange={(headerStyle) => edit({ headerStyle })}
        />
      </Group>
    </Section>
  );
}

// ───────────────────────────── Texto ─────────────────────────────

const KIND_LABELS: Record<FontKind, Names> = {
  serif: ["Com serifa", "Serif", "Con serifa", "Avec empattements"],
  sans: ["Sem serifa", "Sans-serif", "Sin serifa", "Sans empattements"],
  mono: ["Monoespaçadas", "Monospace", "Monoespaciadas", "Monospace"],
  display: ["Decorativas", "Decorative", "Decorativas", "Décoratives"],
};

function fontLabel(f: FontDef, t: (k: DictKey) => string): string {
  if (f.id === "sistema" || f.id === "mono") return t(`ap.bfont.${f.id}` as DictKey);
  if (f.id === "tecnica") return t("ap.hfont.tecnica");
  return f.name;
}

function FontGrid({
  fonts,
  value,
  onPick,
  fallbackCss,
  bold,
}: {
  fonts: readonly FontDef[];
  value: string;
  onPick: (id: string) => void;
  fallbackCss: string;
  bold?: boolean;
}) {
  const { t } = useI18n();
  const tr = useTr();
  const kinds = (["serif", "sans", "mono", "display"] as FontKind[]).filter((k) =>
    fonts.some((f) => f.kind === k),
  );
  return (
    <div className="space-y-4">
      {kinds.map((kind) => (
        <div key={kind}>
          <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
            {tr(KIND_LABELS[kind])}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {fonts
              .filter((f) => f.kind === kind)
              .map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={value === f.id}
                  onClick={() => onPick(f.id)}
                  className={optionClass(value === f.id)}
                >
                  <span
                    className={`block text-lg leading-tight text-foreground ${bold ? "font-bold" : ""}`}
                    style={{ fontFamily: f.css ?? fallbackCss }}
                  >
                    Aa
                  </span>
                  {fontLabel(f, t)}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const WEIGHT_NAMES: Record<number, Names> = {
  0: ["Padrão", "Default", "Predeterminado", "Par défaut"],
  500: ["Médio", "Medium", "Medio", "Moyen"],
  600: ["Seminegrito", "Semibold", "Seminegrita", "Demi-gras"],
  700: ["Negrito", "Bold", "Negrita", "Gras"],
  800: ["Extranegrito", "Extra bold", "Extranegrita", "Extra-gras"],
  900: ["Preto", "Black", "Negra", "Noir"],
};

/** Cartão "Texto": combinações, fontes de títulos e de corpo, pesos, tamanhos e alinhamento. */
export function TextSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const tr = useTr();

  // As fontes do Google só são baixadas quando este cartão está aberto (para mostrar as amostras).
  useEffect(() => {
    for (const f of HEADING_FONTS) loadGoogleFont(f);
    for (const f of BODY_FONTS) loadGoogleFont(f);
  }, []);

  const cssOf = (list: readonly FontDef[], id: string, fallback: string) =>
    list.find((f) => f.id === id)?.css ?? fallback;

  return (
    <Section title={t("ap.text")} hint={t("ap.textHint")}>
      <Group
        title={tr([
          "Combinações prontas",
          "Ready-made pairings",
          "Combinaciones listas",
          "Associations prêtes",
        ])}
        hint={tr([
          "Fonte dos títulos + fonte do texto, escolhidas para combinar.",
          "Heading font + body font, picked to go together.",
          "Fuente de títulos + fuente del texto, elegidas para combinar.",
          "Police des titres + police du texte, choisies pour s'accorder.",
        ])}
      >
        <PresetGallery
          presets={FONT_PAIRS}
          columns="grid-cols-2 sm:grid-cols-5"
          isActive={(p) => a.headingFont === p.patch.headingFont && a.bodyFont === p.patch.bodyFont}
          onPick={(p) => update(p.patch)}
          preview={(p) => (
            <span className="block rounded-lg border border-border/60 bg-card px-2 py-1.5">
              <span
                className="block text-base font-bold leading-tight text-foreground"
                style={{
                  fontFamily: cssOf(
                    HEADING_FONTS,
                    String(p.patch.headingFont),
                    DEFAULT_HEADING_CSS,
                  ),
                }}
              >
                Aa
              </span>
              <span
                className="block text-[11px] text-muted-foreground"
                style={{
                  fontFamily: cssOf(BODY_FONTS, String(p.patch.bodyFont), DEFAULT_BODY_CSS),
                }}
              >
                abc 123
              </span>
            </span>
          )}
        />
      </Group>

      <Group title={t("ap.headingFont")}>
        <FontGrid
          fonts={HEADING_FONTS}
          value={a.headingFont}
          onPick={(headingFont) => update({ headingFont })}
          fallbackCss={DEFAULT_HEADING_CSS}
          bold
        />
      </Group>

      <Group title={t("ap.bodyFont")}>
        <FontGrid
          fonts={BODY_FONTS}
          value={a.bodyFont}
          onPick={(bodyFont) => update({ bodyFont })}
          fallbackCss={DEFAULT_BODY_CSS}
        />
      </Group>

      <Group
        title={tr([
          "Peso dos títulos",
          "Heading weight",
          "Grosor de los títulos",
          "Graisse des titres",
        ])}
      >
        <Segmented
          columns="grid-cols-3 sm:grid-cols-6"
          options={[0, 500, 600, 700, 800, 900].map((w) => ({ id: w, label: tr(WEIGHT_NAMES[w]) }))}
          value={a.headingWeight}
          onChange={(headingWeight) => update({ headingWeight })}
        />
      </Group>

      <Group
        title={tr([
          "Tamanho dos títulos",
          "Heading size",
          "Tamaño de los títulos",
          "Taille des titres",
        ])}
      >
        <Slider
          label="heading size"
          min={HEADING_SCALE_RANGE.min}
          max={HEADING_SCALE_RANGE.max}
          step={5}
          value={a.headingScale}
          onChange={(headingScale) => update({ headingScale })}
          display={`${a.headingScale}%`}
        />
      </Group>

      <Group
        title={tr([
          "Letras dos títulos",
          "Heading letters",
          "Letras de los títulos",
          "Lettres des titres",
        ])}
      >
        <Segmented
          columns="grid-cols-3"
          options={[
            { id: "normal" as const, label: tr(["Normal", "Normal", "Normal", "Normal"]) },
            {
              id: "upper" as const,
              label: tr(["MAIÚSCULAS", "UPPERCASE", "MAYÚSCULAS", "MAJUSCULES"]),
            },
            {
              id: "capitalize" as const,
              label: tr(["Cada Palavra", "Each Word", "Cada Palabra", "Chaque Mot"]),
            },
          ]}
          value={a.headingCase}
          onChange={(headingCase) => update({ headingCase })}
        />
      </Group>

      <Group
        title={tr([
          "Cor dos títulos",
          "Heading color",
          "Color de los títulos",
          "Couleur des titres",
        ])}
      >
        <FreeColor
          label="heading color"
          value={a.headingColor}
          fallback={THEME_COLORS.light.text}
          presets={TEXT_PRESETS}
          onChange={(headingColor) => update({ headingColor })}
          resetLabel={t("ap.automatic")}
        />
      </Group>

      <Group title={t("ap.textSize")} hint={t("ap.textSizeHint")}>
        <Slider
          label={t("ap.textSize")}
          min={TEXT_SCALE_RANGE.min}
          max={TEXT_SCALE_RANGE.max}
          step={5}
          value={a.textScale}
          onChange={(textScale) => update({ textScale })}
          display={`${a.textScale}%`}
        />
      </Group>

      <Group title={tr(["Peso do texto", "Body weight", "Grosor del texto", "Graisse du texte"])}>
        <Segmented
          columns="grid-cols-4"
          options={[0, 500, 600, 700].map((w) => ({ id: w, label: tr(WEIGHT_NAMES[w]) }))}
          value={a.bodyWeight}
          onChange={(bodyWeight) => update({ bodyWeight })}
        />
      </Group>

      <Group
        title={tr([
          "Alinhamento do texto",
          "Text alignment",
          "Alineación del texto",
          "Alignement du texte",
        ])}
        hint={tr([
          "Padrão = como cada tela foi desenhada.",
          "Default = as each screen was designed.",
          "Predeterminado = como se diseñó cada pantalla.",
          "Par défaut = comme chaque écran a été conçu.",
        ])}
      >
        <Segmented
          columns="grid-cols-3"
          options={[
            {
              id: "default" as const,
              label: tr(["Padrão", "Default", "Predeterminado", "Par défaut"]),
            },
            { id: "left" as const, label: tr(["À esquerda", "Left", "Izquierda", "À gauche"]) },
            {
              id: "justify" as const,
              label: tr(["Justificado", "Justified", "Justificado", "Justifié"]),
            },
          ]}
          value={a.textAlign}
          onChange={(textAlign) => update({ textAlign })}
        />
      </Group>

      <Note>
        {tr([
          "Dica: espaço entre letras, palavras e linhas ficam em Acessibilidade.",
          "Tip: letter, word and line spacing are in Accessibility.",
          "Consejo: el espaciado de letras, palabras y líneas está en Accesibilidad.",
          "Astuce : l'espacement des lettres, mots et lignes est dans Accessibilité.",
        ])}
      </Note>
    </Section>
  );
}

// ───────────────────────────── Formatos ─────────────────────────────

/** Cartão "Formatos": estilos prontos, cantos, botões, campos, bordas, sombras e ícones. */
export function ShapesSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const tr = useTr();

  return (
    <Section title={t("ap.shapes")} hint={t("ap.shapesHint")}>
      <Group title={tr(["Estilos prontos", "Ready-made styles", "Estilos listos", "Styles prêts"])}>
        <PresetGallery
          presets={SHAPE_PRESETS}
          columns="grid-cols-2 sm:grid-cols-3"
          isActive={(p) => matchesPatch(a, p.patch)}
          onPick={(p) => update(p.patch)}
          preview={(p) => (
            <span className="flex h-10 items-center justify-center rounded-lg bg-secondary/60">
              <span
                className="h-6 w-14 bg-card"
                style={{
                  borderRadius: `${Math.min(24, (Number(p.patch.cornerRadius) || 0) * 0.75)}px`,
                  border: `${Math.max(1, Number(p.patch.borderWidth) || 1)}px solid var(--foreground)`,
                  boxShadow: p.patch.shadows === "none" ? "none" : "0 4px 10px rgb(0 0 0 / .18)",
                }}
              />
            </span>
          )}
        />
      </Group>

      <Group title={t("ap.corners")}>
        <Slider
          label={t("ap.corners")}
          min={CORNER_RANGE.min}
          max={CORNER_RANGE.max}
          step={2}
          value={a.cornerRadius}
          onChange={(cornerRadius) => update({ cornerRadius })}
          display={`${a.cornerRadius}px`}
        />
        <div
          className="mt-3 h-10 w-full border-2 border-foreground/30 bg-secondary"
          style={{ borderRadius: `${a.cornerRadius * 1.5}px` }}
        />
      </Group>

      <Group
        title={tr([
          "Cantos dos cartões",
          "Card corners",
          "Esquinas de las tarjetas",
          "Coins des cartes",
        ])}
        hint={tr([
          "Por padrão acompanham os cantos gerais.",
          "By default they follow the general corners.",
          "Por defecto siguen las esquinas generales.",
          "Par défaut, ils suivent les coins généraux.",
        ])}
      >
        <Switch
          checked={a.cardRadius !== null}
          onChange={(on) => update({ cardRadius: on ? a.cornerRadius : null })}
          label={tr([
            "Definir separadamente",
            "Set separately",
            "Definir por separado",
            "Définir séparément",
          ])}
          hint=""
        />
        {a.cardRadius !== null && (
          <div className="mt-3">
            <Slider
              label="card radius"
              min={CORNER_RANGE.min}
              max={CORNER_RANGE.max}
              step={2}
              value={a.cardRadius}
              onChange={(cardRadius) => update({ cardRadius })}
              display={`${a.cardRadius}px`}
            />
          </div>
        )}
      </Group>

      <Group
        title={tr([
          "Formato dos botões",
          "Button shape",
          "Forma de los botones",
          "Forme des boutons",
        ])}
      >
        <Segmented
          columns="grid-cols-3"
          options={[
            { id: "pill" as const, label: tr(["Pílula", "Pill", "Píldora", "Pilule"]) },
            {
              id: "rounded" as const,
              label: tr(["Arredondado", "Rounded", "Redondeado", "Arrondi"]),
            },
            { id: "square" as const, label: tr(["Quadrado", "Square", "Cuadrado", "Carré"]) },
          ]}
          value={a.buttonShape}
          onChange={(buttonShape) => update({ buttonShape })}
        />
      </Group>

      <Group
        title={tr(["Estilo dos campos", "Field style", "Estilo de los campos", "Style des champs"])}
      >
        <Segmented
          columns="grid-cols-3"
          options={[
            {
              id: "outlined" as const,
              label: tr(["Contorno", "Outlined", "Con borde", "Contour"]),
            },
            { id: "filled" as const, label: tr(["Preenchido", "Filled", "Relleno", "Rempli"]) },
            { id: "underline" as const, label: tr(["Linha", "Underline", "Línea", "Ligne"]) },
          ]}
          value={a.inputStyle}
          onChange={(inputStyle) => update({ inputStyle })}
        />
      </Group>

      <Group title={t("ap.borders")}>
        <Segmented
          columns="grid-cols-3"
          options={BORDERS}
          value={a.borders}
          onChange={(borders) => update({ borders })}
        />
      </Group>

      <Group
        title={tr([
          "Espessura das bordas",
          "Border thickness",
          "Grosor de los bordes",
          "Épaisseur des bordures",
        ])}
      >
        <Slider
          label="border width"
          min={BORDER_WIDTH_RANGE.min}
          max={BORDER_WIDTH_RANGE.max}
          step={1}
          value={a.borderWidth}
          onChange={(borderWidth) => update({ borderWidth })}
          display={`${a.borderWidth}px`}
        />
      </Group>

      <Group title={t("ap.shadows")}>
        <Segmented
          columns="grid-cols-3"
          options={SHADOWS}
          value={a.shadows}
          onChange={(shadows) => update({ shadows })}
        />
      </Group>

      <Group title={t("ap.density")} hint={t("ap.densityHint")}>
        <Segmented
          columns="grid-cols-3"
          options={DENSITIES}
          value={a.density}
          onChange={(density) => update({ density })}
        />
      </Group>

      <Group
        title={tr([
          "Espessura dos ícones",
          "Icon thickness",
          "Grosor de los iconos",
          "Épaisseur des icônes",
        ])}
      >
        <Slider
          label="icon stroke"
          min={ICON_STROKE_RANGE.min}
          max={ICON_STROKE_RANGE.max}
          step={0.25}
          value={a.iconStroke}
          onChange={(iconStroke) => update({ iconStroke })}
          display={String(a.iconStroke)}
        />
      </Group>

      <Group
        title={tr([
          "Velocidade das animações",
          "Animation speed",
          "Velocidad de las animaciones",
          "Vitesse des animations",
        ])}
      >
        <Segmented
          columns="grid-cols-3"
          options={[
            { id: "slow" as const, label: tr(["Lenta", "Slow", "Lenta", "Lente"]) },
            { id: "normal" as const, label: tr(["Normal", "Normal", "Normal", "Normale"]) },
            { id: "fast" as const, label: tr(["Rápida", "Fast", "Rápida", "Rapide"]) },
          ]}
          value={a.animationSpeed}
          onChange={(animationSpeed) => update({ animationSpeed })}
        />
      </Group>

      <Group
        title={tr([
          "Barras de rolagem",
          "Scrollbars",
          "Barras de desplazamiento",
          "Barres de défilement",
        ])}
      >
        <Segmented
          columns="grid-cols-3"
          options={[
            {
              id: "default" as const,
              label: tr(["Padrão", "Default", "Predeterminado", "Par défaut"]),
            },
            { id: "thin" as const, label: tr(["Finas", "Thin", "Finas", "Fines"]) },
            {
              id: "accent" as const,
              label: tr(["Coloridas", "Colored", "Coloreadas", "Colorées"]),
            },
          ]}
          value={a.scrollbar}
          onChange={(scrollbar) => update({ scrollbar })}
        />
      </Group>
    </Section>
  );
}

// ───────────────────────────── Sons ─────────────────────────────

const SOUND_STYLES: { id: SoundStyle; names: Names }[] = [
  { id: "suave", names: ["Suave", "Soft", "Suave", "Doux"] },
  { id: "cristal", names: ["Cristalino", "Crystal", "Cristalino", "Cristallin"] },
  { id: "madeira", names: ["Madeira", "Wood", "Madera", "Bois"] },
];

const TONE_NAMES: Record<ToneId, Names> = {
  sino: ["Sino", "Bell", "Campana", "Cloche"],
  gota: ["Gota", "Drop", "Gota", "Goutte"],
  digital: ["Digital", "Digital", "Digital", "Numérique"],
  harpa: ["Harpa", "Harp", "Arpa", "Harpe"],
  moeda: ["Moeda", "Coin", "Moneda", "Pièce"],
  sopro: ["Sopro", "Soft puff", "Soplo", "Souffle"],
  marimba: ["Marimba", "Marimba", "Marimba", "Marimba"],
  alerta: ["Alerta", "Alert", "Alerta", "Alerte"],
};

const SOUND_EVENTS: {
  kind: SoundKind;
  on: keyof Appearance;
  tone: keyof Appearance;
  names: Names;
}[] = [
  {
    kind: "notification",
    on: "soundNotification",
    tone: "toneNotification",
    names: [
      "Novas notificações",
      "New notifications",
      "Nuevas notificaciones",
      "Nouvelles notifications",
    ],
  },
  {
    kind: "message",
    on: "soundMessage",
    tone: "toneMessage",
    names: ["Novas mensagens", "New messages", "Nuevos mensajes", "Nouveaux messages"],
  },
  {
    kind: "send",
    on: "soundSend",
    tone: "toneSend",
    names: ["Mensagem enviada", "Message sent", "Mensaje enviado", "Message envoyé"],
  },
  {
    kind: "support",
    on: "soundSupport",
    tone: "toneSupport",
    names: [
      "Apoiar um post",
      "Supporting a post",
      "Apoyar una publicación",
      "Soutenir une publication",
    ],
  },
  {
    kind: "success",
    on: "soundSuccess",
    tone: "toneSuccess",
    names: ["Avisos de sucesso", "Success notices", "Avisos de éxito", "Avis de succès"],
  },
  {
    kind: "error",
    on: "soundError",
    tone: "toneError",
    names: ["Avisos de erro", "Error notices", "Avisos de error", "Avis d'erreur"],
  },
  {
    kind: "achievement",
    on: "soundAchievement",
    tone: "toneAchievement",
    names: [
      "Conquistas e níveis",
      "Achievements and levels",
      "Logros y niveles",
      "Succès et niveaux",
    ],
  },
  {
    kind: "click",
    on: "soundClicks",
    tone: "toneClick",
    names: [
      "Cliques em botões e links",
      "Clicks on buttons and links",
      "Clics en botones y enlaces",
      "Clics sur boutons et liens",
    ],
  },
];

/** Cartão "Sons": pacotes prontos, volume, estilo, melodia de cada evento e silêncio programado. */
export function SoundsSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const tr = useTr();
  const preview = (kind: SoundKind, tone?: ToneId) =>
    playSound(kind, { style: a.soundStyle, volume: a.soundVolume, tone });

  const playAll = () => {
    SOUND_EVENTS.forEach((ev, i) => window.setTimeout(() => preview(ev.kind), i * 900));
  };

  return (
    <Section title={t("pz.sounds.title")} hint={t("pz.sounds.hint")}>
      <Group title={tr(["Pacotes prontos", "Ready-made packs", "Paquetes listos", "Packs prêts"])}>
        <PresetGallery
          presets={SOUND_PACKS}
          columns="grid-cols-2 sm:grid-cols-4"
          isActive={(p) => matchesPatch(a, p.patch)}
          onPick={(p) => {
            update(p.patch);
            if (p.patch.soundsOn) window.setTimeout(() => playSound("notification"), 60);
          }}
          preview={(p) => (
            <span className="flex h-9 items-center justify-center rounded-lg bg-secondary/60 text-accent">
              <Volume2 className={p.patch.soundsOn ? "h-5 w-5" : "h-5 w-5 opacity-40"} />
            </span>
          )}
        />
      </Group>

      <Switch
        checked={a.soundsOn}
        onChange={(soundsOn) => {
          update({ soundsOn });
          if (soundsOn) window.setTimeout(() => playSound("notification"), 60);
        }}
        label={t("pz.sounds.enable")}
        hint={t("pz.sounds.enableHint")}
      />

      <div className={a.soundsOn ? "space-y-7" : "pointer-events-none space-y-7 opacity-50"}>
        <Group title={t("pz.sounds.volume")}>
          <Slider
            label={t("pz.sounds.volume")}
            min={0}
            max={100}
            step={5}
            value={a.soundVolume}
            onChange={(soundVolume) => update({ soundVolume })}
            display={`${a.soundVolume}%`}
          />
        </Group>

        <Group title={t("pz.sounds.style")}>
          <Segmented
            columns="grid-cols-3"
            options={SOUND_STYLES.map((s) => ({ id: s.id, label: tr(s.names) }))}
            value={a.soundStyle}
            onChange={(soundStyle) => {
              update({ soundStyle });
              playSound("notification", { style: soundStyle, volume: a.soundVolume });
            }}
          />
        </Group>

        <Group
          title={t("pz.sounds.when")}
          hint={tr([
            "Para cada evento: ligar, escolher a melodia e ouvir.",
            "For each event: turn on, pick the melody and listen.",
            "Para cada evento: activar, elegir la melodía y escucharla.",
            "Pour chaque événement : activer, choisir la mélodie et l'écouter.",
          ])}
        >
          <div className="space-y-4">
            {SOUND_EVENTS.map((ev) => (
              <div key={ev.kind} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="min-w-[12rem] flex-1">
                  <Switch
                    checked={a[ev.on] as boolean}
                    onChange={(value) => update({ [ev.on]: value } as Partial<Appearance>)}
                    label={tr(ev.names)}
                    hint=""
                  />
                </div>
                <Select
                  label={tr(["Melodia", "Melody", "Melodía", "Mélodie"])}
                  value={a[ev.tone] as ToneId}
                  options={TONE_IDS.map((id) => ({ id, label: tr(TONE_NAMES[id]) }))}
                  onChange={(tone) => {
                    update({ [ev.tone]: tone } as Partial<Appearance>);
                    preview(ev.kind, tone);
                  }}
                />
                <button
                  type="button"
                  onClick={() => preview(ev.kind)}
                  aria-label={`${t("pz.sounds.listen")}: ${tr(ev.names)}`}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <Volume2 className="h-3.5 w-3.5" /> {t("pz.sounds.listen")}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={playAll}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground"
          >
            <Volume2 className="h-3.5 w-3.5" />
            {tr(["Ouvir todos", "Play all", "Escuchar todos", "Tout écouter"])}
          </button>
        </Group>

        <Group
          title={tr([
            "Horário de silêncio",
            "Quiet hours",
            "Horario de silencio",
            "Heures de silence",
          ])}
          hint={tr([
            "Nenhum som toca nesse intervalo.",
            "No sound plays in this window.",
            "No suena ningún sonido en este intervalo.",
            "Aucun son ne joue pendant cet intervalle.",
          ])}
        >
          <Switch
            checked={a.quietOn}
            onChange={(quietOn) => update({ quietOn })}
            label={tr([
              "Ativar horário de silêncio",
              "Turn on quiet hours",
              "Activar horario de silencio",
              "Activer les heures de silence",
            ])}
            hint=""
          />
          {a.quietOn && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {tr(["Silêncio das", "Quiet from", "Silencio desde", "Silence de"])}
              <Select
                label="from"
                value={a.quietFrom}
                options={HOURS}
                onChange={(quietFrom) => update({ quietFrom })}
              />
              {tr(["às", "to", "hasta", "à"])}
              <Select
                label="to"
                value={a.quietTo}
                options={HOURS}
                onChange={(quietTo) => update({ quietTo })}
              />
            </div>
          )}
        </Group>

        <Switch
          checked={a.vibration}
          onChange={(vibration) => update({ vibration })}
          label={tr([
            "Vibração no celular",
            "Vibration on phones",
            "Vibración en el móvil",
            "Vibration sur mobile",
          ])}
          hint={tr([
            "Vibração curta com notificações e mensagens, nos aparelhos que permitem.",
            "Short vibration with notifications and messages, on devices that allow it.",
            "Vibración corta con notificaciones y mensajes, en los dispositivos que lo permiten.",
            "Courte vibration avec notifications et messages, sur les appareils compatibles.",
          ])}
        />
      </div>
    </Section>
  );
}

// ───────────────────────────── Layout e início ─────────────────────────────

const HOME_PAGES: { id: HomePageId; names: Names }[] = [
  { id: "espaco", names: ["Espaço", "Space", "Espacio", "Espace"] },
  { id: "comunidades", names: ["Comunidades", "Communities", "Comunidades", "Communautés"] },
  { id: "desafios", names: ["Desafios", "Challenges", "Desafíos", "Défis"] },
  { id: "explorar", names: ["Explorar", "Explore", "Explorar", "Explorer"] },
  { id: "receitas", names: ["Receitas", "Recipes", "Recetas", "Recettes"] },
  {
    id: "tema",
    names: ["Tema da semana", "Weekly theme", "Tema de la semana", "Thème de la semaine"],
  },
  { id: "nina", names: ["Nina", "Nina", "Nina", "Nina"] },
  {
    id: "notificacoes",
    names: ["Notificações", "Notifications", "Notificaciones", "Notifications"],
  },
];

const PAGE_BACKGROUNDS: { id: PageBackground; names: Names; css: string }[] = [
  { id: "plain", names: ["Liso", "Plain", "Liso", "Uni"], css: "none" },
  {
    id: "dots",
    names: ["Pontos", "Dots", "Puntos", "Points"],
    css: "radial-gradient(color-mix(in oklab, var(--foreground) 22%, transparent) 1.2px, transparent 1.2px) 0 0 / 10px 10px",
  },
  {
    id: "grid",
    names: ["Grade", "Grid", "Cuadrícula", "Grille"],
    css: "linear-gradient(color-mix(in oklab, var(--foreground) 14%, transparent) 1px, transparent 1px) 0 0 / 12px 12px, linear-gradient(90deg, color-mix(in oklab, var(--foreground) 14%, transparent) 1px, transparent 1px) 0 0 / 12px 12px",
  },
  {
    id: "paper",
    names: ["Papel", "Paper", "Papel", "Papier"],
    css: "radial-gradient(color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px) 0 0 / 4px 4px",
  },
  {
    id: "aurora",
    names: ["Aurora", "Aurora", "Aurora", "Aurore"],
    css: "radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--accent) 40%, transparent), transparent 60%), radial-gradient(circle at 90% 10%, color-mix(in oklab, var(--primary) 36%, transparent), transparent 60%)",
  },
];

/** Cartão "Layout e início". */
export function LayoutSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const tr = useTr();
  const customWidth = a.contentMaxPx > 0;

  return (
    <Section title={t("pz.layout.title")} hint={t("pz.layout.hint")}>
      <Group
        title={tr([
          "Layouts prontos",
          "Ready-made layouts",
          "Diseños listos",
          "Mises en page prêtes",
        ])}
      >
        <PresetGallery
          presets={LAYOUT_PRESETS}
          columns="grid-cols-2 sm:grid-cols-5"
          isActive={(p) => matchesPatch(a, p.patch)}
          onPick={(p) => update(p.patch)}
          preview={() => null}
        />
      </Group>

      <Group title={t("pz.layout.width")} hint={t("pz.layout.widthHint")}>
        <Segmented
          columns="grid-cols-3"
          options={[
            { id: "narrow" as const, label: t("pz.layout.narrow") },
            { id: "normal" as const, label: t("pz.layout.normal") },
            { id: "wide" as const, label: t("pz.layout.wide") },
          ]}
          value={a.contentWidth}
          onChange={(contentWidth) => update({ contentWidth, contentMaxPx: 0 })}
        />
        <div className="mt-3 space-y-3">
          <Switch
            checked={customWidth}
            onChange={(on) => update({ contentMaxPx: on ? 960 : 0 })}
            label={tr(["Largura exata", "Exact width", "Ancho exacto", "Largeur exacte"])}
            hint={tr([
              "Define a largura máxima em pixels.",
              "Sets the maximum width in pixels.",
              "Define el ancho máximo en píxeles.",
              "Définit la largeur maximale en pixels.",
            ])}
          />
          {customWidth && (
            <Slider
              label="max width"
              min={CONTENT_MAX_RANGE.min}
              max={CONTENT_MAX_RANGE.max}
              step={20}
              value={a.contentMaxPx}
              onChange={(contentMaxPx) => update({ contentMaxPx })}
              display={`${a.contentMaxPx}px`}
            />
          )}
        </div>
      </Group>

      <Group title={t("pz.layout.home")} hint={t("pz.layout.homeHint")}>
        <Segmented
          columns="grid-cols-2 sm:grid-cols-3"
          options={HOME_PAGES.map((h) => ({ id: h.id, label: tr(h.names) }))}
          value={a.homePage}
          onChange={(homePage) => update({ homePage })}
        />
      </Group>

      <Switch
        checked={a.sidePanels}
        onChange={(sidePanels) => update({ sidePanels })}
        label={t("pz.layout.panels")}
        hint={t("pz.layout.panelsHint")}
      />

      <Group
        title={tr(["Fundo da página", "Page background", "Fondo de la página", "Fond de la page"])}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PAGE_BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={a.pageBackground === b.id}
              onClick={() => update({ pageBackground: b.id })}
              className={optionClass(a.pageBackground === b.id)}
            >
              <span
                className="mb-1.5 block h-10 rounded-lg border border-border bg-background"
                style={{ background: b.css === "none" ? undefined : b.css }}
              />
              {tr(b.names)}
            </button>
          ))}
        </div>
      </Group>

      <Switch
        checked={a.headerSticky}
        onChange={(headerSticky) => update({ headerSticky })}
        label={tr(["Cabeçalho fixo", "Sticky header", "Encabezado fijo", "En-tête fixe"])}
        hint={tr([
          "Mantém o menu do topo visível ao rolar.",
          "Keeps the top menu visible while scrolling.",
          "Mantiene el menú superior visible al desplazarse.",
          "Garde le menu du haut visible pendant le défilement.",
        ])}
      />
      <Switch
        checked={a.scrollbars}
        onChange={(scrollbars) => update({ scrollbars })}
        label={tr([
          "Mostrar barras de rolagem",
          "Show scrollbars",
          "Mostrar barras de desplazamiento",
          "Afficher les barres de défilement",
        ])}
        hint={tr([
          "Por padrão elas ficam escondidas (a rolagem funciona igual).",
          "Hidden by default (scrolling works the same).",
          "Ocultas por defecto (el desplazamiento funciona igual).",
          "Masquées par défaut (le défilement fonctionne pareil).",
        ])}
      />
      <Switch
        checked={a.smoothScroll}
        onChange={(smoothScroll) => update({ smoothScroll })}
        label={tr([
          "Rolagem suave",
          "Smooth scrolling",
          "Desplazamiento suave",
          "Défilement fluide",
        ])}
        hint=""
      />
      <Switch
        checked={a.backToTop}
        onChange={(backToTop) => update({ backToTop })}
        label={tr([
          "Botão “voltar ao topo”",
          "“Back to top” button",
          "Botón “volver arriba”",
          "Bouton « haut de page »",
        ])}
        hint=""
      />

      <Group
        title={tr([
          "Publicações por carregamento",
          "Posts per load",
          "Publicaciones por carga",
          "Publications par chargement",
        ])}
        hint={tr([
          "Quantos posts o Espaço traz de uma vez.",
          "How many posts Space brings at once.",
          "Cuántas publicaciones trae el Espacio de una vez.",
          "Combien de publications l'Espace charge d'un coup.",
        ])}
      >
        <Segmented
          columns="grid-cols-5"
          options={FEED_PAGE_SIZES.map((n) => ({ id: n, label: String(n) }))}
          value={a.feedPageSize}
          onChange={(feedPageSize) => update({ feedPageSize })}
        />
      </Group>
    </Section>
  );
}

// ───────────────────────────── Acessibilidade ─────────────────────────────

const COLOR_FILTERS: { id: ColorFilter; names: Names }[] = [
  { id: "none", names: ["Nenhum", "None", "Ninguno", "Aucun"] },
  {
    id: "grayscale",
    names: ["Escala de cinza", "Grayscale", "Escala de grises", "Niveaux de gris"],
  },
  { id: "sepia", names: ["Sépia", "Sepia", "Sepia", "Sépia"] },
  { id: "lowsat", names: ["Menos cor", "Less color", "Menos color", "Moins de couleur"] },
  { id: "highsat", names: ["Mais cor", "More color", "Más color", "Plus de couleur"] },
  { id: "invert", names: ["Invertido", "Inverted", "Invertido", "Inversé"] },
];

/** Cartão "Acessibilidade". */
export function AccessSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const tr = useTr();
  return (
    <Section title={t("ap.accessibility")} hint={t("pz.a11y.hint")}>
      <Group
        title={tr(["Perfis prontos", "Ready-made profiles", "Perfiles listos", "Profils prêts"])}
        hint={tr([
          "Combinam várias opções para uma necessidade. Dá para ajustar depois.",
          "Combine several options for one need. You can tweak them afterwards.",
          "Combinan varias opciones para una necesidad. Puedes ajustarlas después.",
          "Combinent plusieurs options pour un besoin. Vous pouvez les ajuster ensuite.",
        ])}
      >
        <PresetGallery
          presets={ACCESS_PROFILES}
          columns="grid-cols-2 sm:grid-cols-3"
          isActive={(p) => matchesPatch(a, p.patch)}
          onPick={(p) => update(p.patch)}
          preview={() => null}
        />
      </Group>

      <Switch
        checked={a.reduceMotion}
        onChange={(reduceMotion) => update({ reduceMotion })}
        label={t("ap.reduceMotion")}
        hint={t("ap.reduceMotionHint")}
      />
      <Switch
        checked={a.highContrast}
        onChange={(highContrast) => update({ highContrast })}
        label={t("pz.a11y.contrast")}
        hint={t("pz.a11y.contrastHint")}
      />
      <Switch
        checked={a.readableFont}
        onChange={(readableFont) => update({ readableFont })}
        label={t("pz.a11y.readable")}
        hint={t("pz.a11y.readableHint")}
      />
      <Switch
        checked={a.strongFocus}
        onChange={(strongFocus) => update({ strongFocus })}
        label={t("pz.a11y.focus")}
        hint={t("pz.a11y.focusHint")}
      />
      <Switch
        checked={a.underlineLinks}
        onChange={(underlineLinks) => update({ underlineLinks })}
        label={t("pz.a11y.links")}
        hint={t("pz.a11y.linksHint")}
      />
      <Switch
        checked={a.bigCursor}
        onChange={(bigCursor) => update({ bigCursor })}
        label={tr(["Cursor grande", "Large cursor", "Cursor grande", "Grand curseur"])}
        hint={tr([
          "Aumenta o ponteiro do mouse.",
          "Makes the mouse pointer bigger.",
          "Agranda el puntero del ratón.",
          "Agrandit le pointeur de la souris.",
        ])}
      />
      <Switch
        checked={a.largeTargets}
        onChange={(largeTargets) => update({ largeTargets })}
        label={tr([
          "Áreas de toque maiores",
          "Larger touch targets",
          "Áreas táctiles más grandes",
          "Zones tactiles plus grandes",
        ])}
        hint={tr([
          "Botões e campos mais altos, mais fáceis de acertar.",
          "Taller buttons and fields, easier to hit.",
          "Botones y campos más altos, más fáciles de pulsar.",
          "Boutons et champs plus hauts, plus faciles à toucher.",
        ])}
      />
      <Switch
        checked={a.readingGuide}
        onChange={(readingGuide) => update({ readingGuide })}
        label={tr(["Guia de leitura", "Reading guide", "Guía de lectura", "Guide de lecture"])}
        hint={tr([
          "Uma faixa acompanha o mouse e escurece o resto da tela.",
          "A band follows the mouse and dims the rest of the screen.",
          "Una franja sigue al ratón y oscurece el resto de la pantalla.",
          "Une bande suit la souris et assombrit le reste de l'écran.",
        ])}
      />
      <Switch
        checked={a.speakSelection}
        onChange={(speakSelection) => update({ speakSelection })}
        label={tr([
          "Ouvir texto selecionado",
          "Read selected text aloud",
          "Escuchar texto seleccionado",
          "Écouter le texte sélectionné",
        ])}
        hint={tr([
          "Ao selecionar um texto aparece um botão “Ouvir” (voz do navegador).",
          "Selecting text shows a “Listen” button (browser voice).",
          "Al seleccionar un texto aparece un botón “Escuchar” (voz del navegador).",
          "En sélectionnant un texte, un bouton « Écouter » apparaît (voix du navigateur).",
        ])}
      />

      <Group title={t("ap.textSize")} hint={t("ap.textSizeHint")}>
        <Slider
          label={t("ap.textSize")}
          min={TEXT_SCALE_RANGE.min}
          max={TEXT_SCALE_RANGE.max}
          step={5}
          value={a.textScale}
          onChange={(textScale) => update({ textScale })}
          display={`${a.textScale}%`}
        />
      </Group>

      <Group title={t("pz.a11y.letter")} hint={t("pz.a11y.letterHint")}>
        <Slider
          label={t("pz.a11y.letter")}
          min={LETTER_SPACING_RANGE.min}
          max={LETTER_SPACING_RANGE.max}
          step={1}
          value={a.letterSpacing}
          onChange={(letterSpacing) => update({ letterSpacing })}
          display={a.letterSpacing === 0 ? t("pz.default") : `${a.letterSpacing / 100}em`}
        />
      </Group>

      <Group
        title={tr([
          "Espaço entre palavras",
          "Word spacing",
          "Espacio entre palabras",
          "Espacement des mots",
        ])}
      >
        <Slider
          label="word spacing"
          min={WORD_SPACING_RANGE.min}
          max={WORD_SPACING_RANGE.max}
          step={1}
          value={a.wordSpacing}
          onChange={(wordSpacing) => update({ wordSpacing })}
          display={a.wordSpacing === 0 ? t("pz.default") : `${a.wordSpacing / 20}em`}
        />
      </Group>

      <Group title={t("pz.a11y.line")} hint={t("pz.a11y.lineHint")}>
        <Slider
          label={t("pz.a11y.line")}
          min={LINE_HEIGHT_RANGE.min - 10}
          max={LINE_HEIGHT_RANGE.max}
          step={10}
          value={a.lineHeight === 0 ? LINE_HEIGHT_RANGE.min - 10 : a.lineHeight}
          onChange={(v) => update({ lineHeight: v < LINE_HEIGHT_RANGE.min ? 0 : v })}
          display={a.lineHeight === 0 ? t("pz.default") : `${a.lineHeight}%`}
        />
      </Group>

      <Group
        title={tr([
          "Filtro de cor da tela",
          "Screen color filter",
          "Filtro de color de la pantalla",
          "Filtre de couleur de l'écran",
        ])}
      >
        <Segmented
          columns="grid-cols-2 sm:grid-cols-3"
          options={COLOR_FILTERS.map((f) => ({ id: f.id, label: tr(f.names) }))}
          value={a.colorFilter}
          onChange={(colorFilter) => update({ colorFilter })}
        />
      </Group>
    </Section>
  );
}

// ───────────────────────────── Perfil e posts ─────────────────────────────

/** Cartão "Perfil e posts". */
export function ProfileSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const tr = useTr();
  return (
    <Section title={t("pz.profile.title")} hint={t("pz.profile.hint")}>
      <Group title={tr(["Estilos prontos", "Ready-made styles", "Estilos listos", "Styles prêts"])}>
        <PresetGallery
          presets={PROFILE_PRESETS}
          columns="grid-cols-2 sm:grid-cols-5"
          isActive={(p) => matchesPatch(a, p.patch)}
          onPick={(p) => update(p.patch)}
          preview={() => null}
        />
      </Group>

      <Group title={t("pz.profile.cards")} hint={t("pz.profile.cardsHint")}>
        <Segmented
          columns="grid-cols-2"
          options={[
            { id: "classic" as const, label: t("pz.profile.classic") },
            { id: "compact" as const, label: t("pz.profile.compact") },
          ]}
          value={a.cardStyle}
          onChange={(cardStyle) => update({ cardStyle })}
        />
      </Group>

      <Switch
        checked={a.cardAccent}
        onChange={(cardAccent) => update({ cardAccent })}
        label={tr([
          "Faixa de destaque nos posts",
          "Accent stripe on posts",
          "Franja de acento en publicaciones",
          "Bande d'accent sur les publications",
        ])}
        hint={tr([
          "Uma barra na cor de destaque na lateral de cada post.",
          "A bar in the accent color along the side of each post.",
          "Una barra del color de acento en el lateral de cada publicación.",
          "Une barre de la couleur d'accent sur le côté de chaque publication.",
        ])}
      />

      <Group title={t("pz.profile.images")} hint={t("pz.profile.imagesHint")}>
        <Segmented
          columns="grid-cols-2"
          options={[
            { id: "normal" as const, label: t("pz.profile.imgNormal") },
            { id: "large" as const, label: t("pz.profile.imgLarge") },
          ]}
          value={a.imageSize}
          onChange={(imageSize) => update({ imageSize })}
        />
      </Group>

      <Group
        title={tr([
          "Cantos das imagens",
          "Image corners",
          "Esquinas de las imágenes",
          "Coins des images",
        ])}
      >
        <Segmented
          columns="grid-cols-3"
          options={[
            {
              id: "rounded" as const,
              label: tr(["Arredondados", "Rounded", "Redondeadas", "Arrondis"]),
            },
            { id: "soft" as const, label: tr(["Suaves", "Soft", "Suaves", "Doux"]) },
            { id: "square" as const, label: tr(["Retos", "Square", "Rectas", "Droits"]) },
          ]}
          value={a.imageCorners}
          onChange={(imageCorners) => update({ imageCorners })}
        />
      </Group>

      <Group title={t("pz.profile.avatar")}>
        <Segmented
          columns="grid-cols-2"
          options={[
            { id: "round" as const, label: t("pz.profile.round") },
            { id: "square" as const, label: t("pz.profile.square") },
          ]}
          value={a.avatarShape}
          onChange={(avatarShape) => update({ avatarShape })}
        />
      </Group>

      <Switch
        checked={a.showCounts}
        onChange={(showCounts) => update({ showCounts })}
        label={t("pz.profile.counts")}
        hint={t("pz.profile.countsHint")}
      />
      <Switch
        checked={a.expandPosts}
        onChange={(expandPosts) => update({ expandPosts })}
        label={tr([
          "Posts abertos por inteiro",
          "Posts fully expanded",
          "Publicaciones abiertas por completo",
          "Publications entièrement ouvertes",
        ])}
        hint={tr([
          "Sem o corte com “Ver mais”: o post longo aparece inteiro.",
          "No “See more” cut: long posts show in full.",
          "Sin el corte “Ver más”: la publicación larga se ve completa.",
          "Sans coupure « Voir plus » : les longues publications s'affichent en entier.",
        ])}
      />
      <Switch
        checked={a.showTags}
        onChange={(showTags) => update({ showTags })}
        label={tr([
          "Mostrar etiquetas (#)",
          "Show tags (#)",
          "Mostrar etiquetas (#)",
          "Afficher les étiquettes (#)",
        ])}
        hint=""
      />

      <Group
        title={tr([
          "Quem vê um post novo",
          "Who sees a new post",
          "Quién ve una publicación nueva",
          "Qui voit une nouvelle publication",
        ])}
        hint={tr([
          "Escolha inicial ao publicar (você pode mudar em cada post).",
          "Starting choice when posting (you can change it for each post).",
          "Elección inicial al publicar (puedes cambiarla en cada publicación).",
          "Choix initial à la publication (modifiable pour chaque publication).",
        ])}
      >
        <Segmented
          columns="grid-cols-2"
          options={[
            { id: "publico" as const, label: tr(["Público", "Public", "Público", "Public"]) },
            {
              id: "amigos" as const,
              label: tr(["Só amigos", "Friends only", "Solo amigos", "Amis seulement"]),
            },
          ]}
          value={a.defaultAudience}
          onChange={(defaultAudience) => update({ defaultAudience })}
        />
      </Group>
    </Section>
  );
}
