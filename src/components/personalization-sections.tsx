import { Volume2 } from "lucide-react";
import { useAppearance } from "@/hooks/use-appearance";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import {
  ACCENT_PRESETS,
  BODY_FONTS,
  CORNER_RANGE,
  DEFAULT_APPEARANCE,
  HEADING_FONTS,
  LETTER_SPACING_RANGE,
  LINE_HEIGHT_RANGE,
  PRIMARY_PRESETS,
  TEXT_SCALE_RANGE,
  THEME_COLORS,
  contrastRatio,
  isHex,
  type AvatarShape,
  type CardStyle,
  type ContentWidth,
  type HomePageId,
  type ImageSize,
  type SoundStyle,
} from "@/lib/appearance";
import { playSound, type SoundKind } from "@/lib/sounds";
import {
  BORDERS,
  BrandColor,
  DEFAULT_BODY_CSS,
  DEFAULT_HEADING_CSS,
  DENSITIES,
  FreeColor,
  Group,
  MODES,
  SHADOWS,
  Section,
  Segmented,
  Slider,
  Switch,
  contrastLabel,
  optionClass,
} from "./appearance-editor";

/** Cartão "Cores": modo, destaque, principal, fundos e texto. */
export function ColorsSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const darkNow =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const effectiveBg =
    (darkNow ? a.backgroundDark : a.backgroundLight) ??
    (darkNow ? THEME_COLORS.dark.background : THEME_COLORS.light.background);
  const textContrast = isHex(a.textColor)
    ? contrastLabel(contrastRatio(a.textColor, effectiveBg))
    : null;

  return (
    <Section title={t("ap.colors")} hint={t("ap.colorsHint")}>
      <Group title={t("ap.mode")}>
        <Segmented
          columns="grid-cols-3"
          options={MODES}
          value={a.mode}
          onChange={(mode) => update({ mode })}
        />
      </Group>

      <Group title={t("ap.accent")} hint={t("ap.accentHint")}>
        <BrandColor
          label={t("ap.accent")}
          presets={ACCENT_PRESETS}
          value={a.accent}
          fallback={DEFAULT_APPEARANCE.accent}
          onChange={(accent) => update({ accent })}
        />
      </Group>

      <Group title={t("ap.primary")} hint={t("ap.primaryHint")}>
        <BrandColor
          label={t("ap.primary")}
          presets={PRIMARY_PRESETS}
          value={a.primary}
          fallback={DEFAULT_APPEARANCE.primary}
          onChange={(primary) => update({ primary })}
        />
      </Group>

      <Group title={t("ap.bgLight")} hint={t("ap.bgLightHint")}>
        <FreeColor
          label={t("ap.bgLight")}
          value={a.backgroundLight}
          fallback={THEME_COLORS.light.background}
          onChange={(backgroundLight) => update({ backgroundLight })}
          resetLabel={t("ap.useThemeBg")}
        />
      </Group>

      <Group title={t("ap.bgDark")}>
        <FreeColor
          label={t("ap.bgDark")}
          value={a.backgroundDark}
          fallback={THEME_COLORS.dark.background}
          onChange={(backgroundDark) => update({ backgroundDark })}
          resetLabel={t("ap.useThemeBg")}
        />
      </Group>

      <Group title={t("ap.textColor")} hint={t("ap.textColorHint")}>
        <FreeColor
          label={t("ap.textColor")}
          value={a.textColor}
          fallback={darkNow ? THEME_COLORS.dark.text : THEME_COLORS.light.text}
          onChange={(textColor) => update({ textColor })}
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
    </Section>
  );
}

/** Cartão "Texto": fontes e tamanho. */
export function TextSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  return (
    <Section title={t("ap.text")} hint={t("ap.textHint")}>
      <Group title={t("ap.headingFont")}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {HEADING_FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={a.headingFont === f.id}
              onClick={() => update({ headingFont: f.id })}
              className={optionClass(a.headingFont === f.id)}
            >
              <span
                className="block text-lg font-bold leading-tight text-foreground"
                style={{ fontFamily: f.css ?? DEFAULT_HEADING_CSS }}
              >
                Aa
              </span>
              {t(`ap.hfont.${f.id}` as DictKey)}
            </button>
          ))}
        </div>
      </Group>

      <Group title={t("ap.bodyFont")}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BODY_FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={a.bodyFont === f.id}
              onClick={() => update({ bodyFont: f.id })}
              className={optionClass(a.bodyFont === f.id)}
            >
              <span
                className="block text-lg leading-tight text-foreground"
                style={{ fontFamily: f.css ?? DEFAULT_BODY_CSS }}
              >
                Aa
              </span>
              {f.id === "sistema" || f.id === "mono" ? t(`ap.bfont.${f.id}` as DictKey) : f.name}
            </button>
          ))}
        </div>
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
    </Section>
  );
}

/** Cartão "Formatos": cantos, densidade, bordas e sombras. */
export function ShapesSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  return (
    <Section title={t("ap.shapes")} hint={t("ap.shapesHint")}>
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

      <Group title={t("ap.density")} hint={t("ap.densityHint")}>
        <Segmented
          columns="grid-cols-3"
          options={DENSITIES}
          value={a.density}
          onChange={(density) => update({ density })}
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

      <Group title={t("ap.shadows")}>
        <Segmented
          columns="grid-cols-3"
          options={SHADOWS}
          value={a.shadows}
          onChange={(shadows) => update({ shadows })}
        />
      </Group>
    </Section>
  );
}

const SOUND_STYLES: { id: SoundStyle; label: DictKey }[] = [
  { id: "suave", label: "pz.sounds.style.suave" },
  { id: "cristal", label: "pz.sounds.style.cristal" },
  { id: "madeira", label: "pz.sounds.style.madeira" },
];

const SOUND_EVENTS: {
  kind: SoundKind;
  field: "soundNotification" | "soundMessage" | "soundAchievement" | "soundClicks";
  label: DictKey;
}[] = [
  { kind: "notification", field: "soundNotification", label: "pz.sounds.notification" },
  { kind: "message", field: "soundMessage", label: "pz.sounds.message" },
  { kind: "achievement", field: "soundAchievement", label: "pz.sounds.achievement" },
  { kind: "click", field: "soundClicks", label: "pz.sounds.clicks" },
];

/** Cartão "Sons": liga/desliga, volume, estilo e quais eventos tocam. */
export function SoundsSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  const preview = (kind: SoundKind) =>
    playSound(kind, { style: a.soundStyle, volume: a.soundVolume });

  return (
    <Section title={t("pz.sounds.title")} hint={t("pz.sounds.hint")}>
      <Switch
        checked={a.soundsOn}
        onChange={(soundsOn) => {
          update({ soundsOn });
          if (soundsOn) preview("notification");
        }}
        label={t("pz.sounds.enable")}
        hint={t("pz.sounds.enableHint")}
      />

      <div className={a.soundsOn ? "space-y-6" : "pointer-events-none space-y-6 opacity-50"}>
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
            options={SOUND_STYLES}
            value={a.soundStyle}
            onChange={(soundStyle) => {
              update({ soundStyle });
              playSound("notification", { style: soundStyle, volume: a.soundVolume });
            }}
          />
        </Group>

        <Group title={t("pz.sounds.when")}>
          <div className="space-y-4">
            {SOUND_EVENTS.map((ev) => (
              <div key={ev.kind} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <Switch
                    checked={a[ev.field]}
                    onChange={(value) => update({ [ev.field]: value })}
                    label={t(ev.label)}
                    hint=""
                  />
                </div>
                <button
                  type="button"
                  onClick={() => preview(ev.kind)}
                  aria-label={`${t("pz.sounds.listen")}: ${t(ev.label)}`}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <Volume2 className="h-3.5 w-3.5" /> {t("pz.sounds.listen")}
                </button>
              </div>
            ))}
          </div>
        </Group>
      </div>
    </Section>
  );
}

const WIDTHS: { id: ContentWidth; label: DictKey }[] = [
  { id: "narrow", label: "pz.layout.narrow" },
  { id: "normal", label: "pz.layout.normal" },
  { id: "wide", label: "pz.layout.wide" },
];

const HOME_PAGES: { id: HomePageId; label: DictKey }[] = [
  { id: "espaco", label: "pz.home.espaco" },
  { id: "comunidades", label: "pz.home.comunidades" },
  { id: "desafios", label: "pz.home.desafios" },
  { id: "explorar", label: "pz.home.explorar" },
  { id: "nina", label: "pz.home.nina" },
  { id: "acompanhamento", label: "pz.home.acompanhamento" },
];

/** Cartão "Layout e início". */
export function LayoutSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  return (
    <Section title={t("pz.layout.title")} hint={t("pz.layout.hint")}>
      <Group title={t("pz.layout.width")} hint={t("pz.layout.widthHint")}>
        <Segmented
          columns="grid-cols-3"
          options={WIDTHS}
          value={a.contentWidth}
          onChange={(contentWidth) => update({ contentWidth })}
        />
      </Group>

      <Group title={t("pz.layout.home")} hint={t("pz.layout.homeHint")}>
        <Segmented
          columns="grid-cols-2 sm:grid-cols-3"
          options={HOME_PAGES}
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
    </Section>
  );
}

/** Cartão "Acessibilidade". */
export function AccessSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  return (
    <Section title={t("ap.accessibility")} hint={t("pz.a11y.hint")}>
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
    </Section>
  );
}

const CARD_STYLES: { id: CardStyle; label: DictKey }[] = [
  { id: "classic", label: "pz.profile.classic" },
  { id: "compact", label: "pz.profile.compact" },
];
const IMAGE_SIZES: { id: ImageSize; label: DictKey }[] = [
  { id: "normal", label: "pz.profile.imgNormal" },
  { id: "large", label: "pz.profile.imgLarge" },
];
const AVATAR_SHAPES: { id: AvatarShape; label: DictKey }[] = [
  { id: "round", label: "pz.profile.round" },
  { id: "square", label: "pz.profile.square" },
];

/** Cartão "Perfil e posts". */
export function ProfileSection() {
  const { appearance: a, update } = useAppearance();
  const { t } = useI18n();
  return (
    <Section title={t("pz.profile.title")} hint={t("pz.profile.hint")}>
      <Group title={t("pz.profile.cards")} hint={t("pz.profile.cardsHint")}>
        <Segmented
          columns="grid-cols-2"
          options={CARD_STYLES}
          value={a.cardStyle}
          onChange={(cardStyle) => update({ cardStyle })}
        />
      </Group>

      <Group title={t("pz.profile.images")} hint={t("pz.profile.imagesHint")}>
        <Segmented
          columns="grid-cols-2"
          options={IMAGE_SIZES}
          value={a.imageSize}
          onChange={(imageSize) => update({ imageSize })}
        />
      </Group>

      <Group title={t("pz.profile.avatar")}>
        <Segmented
          columns="grid-cols-2"
          options={AVATAR_SHAPES}
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
    </Section>
  );
}
