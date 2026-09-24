import { useEffect, useState } from "react";
import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import {
  ACCENT_PRESETS,
  APPEARANCE_EVENT,
  BODY_FONTS,
  CORNER_RANGE,
  DEFAULT_APPEARANCE,
  HEADING_FONTS,
  PRIMARY_PRESETS,
  TEXT_SCALE_RANGE,
  THEME_COLORS,
  contrastRatio,
  isHex,
  loadAppearance,
  resetAppearance,
  saveAppearance,
  type Appearance,
  type BorderStyle,
  type Density,
  type ShadowStyle,
  type ThemeMode,
} from "@/lib/appearance";

const DEFAULT_HEADING_CSS = '"Libre Baskerville", ui-serif, Georgia, serif';
const DEFAULT_BODY_CSS = '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif';

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const sync = () => setAppearance(loadAppearance());
    sync();
    window.addEventListener(APPEARANCE_EVENT, sync);
    return () => window.removeEventListener(APPEARANCE_EVENT, sync);
  }, []);

  return {
    appearance,
    update: (patch: Partial<Appearance>) => saveAppearance({ ...appearance, ...patch }),
    reset: resetAppearance,
  };
}

const optionClass = (active: boolean) =>
  `min-w-0 rounded-xl border px-2 py-2 text-xs font-medium transition cursor-pointer sm:px-3 ${
    active
      ? "border-accent bg-accent-soft text-foreground ring-2 ring-accent/40"
      : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
  }`;

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

/** Campo de código hexadecimal que só aceita cores completas (#rrggbb). */
function HexInput({
  value,
  onCommit,
  label,
}: {
  value: string;
  onCommit: (hex: string) => void;
  label: string;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <input
      type="text"
      value={draft}
      maxLength={7}
      spellCheck={false}
      aria-label={`${label}: ${t("ap.colorCode")}`}
      onChange={(e) => {
        const text = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
        setDraft(text);
        if (isHex(text)) onCommit(text.toLowerCase());
      }}
      onBlur={() => setDraft(value)}
      className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs uppercase text-foreground outline-none focus:border-accent"
    />
  );
}

/**
 * Cor totalmente livre: seletor + código hexadecimal, sem modelos prontos.
 * `value` nulo significa "usar a cor do tema principal" (mostrada por `fallback`).
 */
function FreeColor({
  label,
  value,
  fallback,
  onChange,
  resetLabel,
}: {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string | null) => void;
  resetLabel: string;
}) {
  const { t } = useI18n();
  const shown = value ?? fallback;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <label
        className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-foreground/30 shadow-xs"
        style={{ backgroundColor: shown }}
        title={t("ap.pickColor")}
      >
        <input
          type="color"
          aria-label={`${label}: ${t("ap.colorPicker")}`}
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <HexInput value={shown} label={label} onCommit={onChange} />
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="cursor-pointer text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}

/** Cores de marca: algumas sugestões rápidas e qualquer outra cor à escolha. */
function BrandColor({
  label,
  presets,
  value,
  fallback,
  onChange,
}: {
  label: string;
  presets: readonly { name: string; value: string }[];
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => {
          const active = p.value.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={p.value}
              type="button"
              title={t(`ap.color.${p.name}` as DictKey)}
              aria-label={`${label}: ${t(`ap.color.${p.name}` as DictKey)}`}
              aria-pressed={active}
              onClick={() => onChange(p.value)}
              style={{ backgroundColor: p.value }}
              className={`h-8 w-8 cursor-pointer rounded-full border-2 shadow-xs transition ${
                active ? "scale-110 border-foreground" : "border-card hover:scale-105"
              }`}
            />
          );
        })}
      </div>
      <FreeColor
        label={label}
        value={value}
        fallback={fallback}
        onChange={(v) => onChange(v ?? fallback)}
        resetLabel={t("ap.useDefault")}
      />
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  columns,
}: {
  options: { id: T; label: DictKey; icon?: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (id: T) => void;
  columns: string;
}) {
  const { t } = useI18n();
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`${optionClass(value === id)} flex items-center justify-center gap-1.5`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {t(label)}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 flex-1 cursor-pointer accent-[var(--color-accent)]"
      />
      <span className="w-14 shrink-0 text-right font-mono text-xs text-foreground">{display}</span>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
          checked ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-all ${
            checked ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

const MODES: {
  id: ThemeMode;
  label: DictKey;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "light", label: "ap.mode.light", icon: Sun },
  { id: "dark", label: "ap.mode.dark", icon: Moon },
  { id: "system", label: "ap.mode.system", icon: Monitor },
];

const DENSITIES: { id: Density; label: DictKey }[] = [
  { id: "compact", label: "ap.density.compact" },
  { id: "normal", label: "ap.density.normal" },
  { id: "spacious", label: "ap.density.spacious" },
];

const BORDERS: { id: BorderStyle; label: DictKey }[] = [
  { id: "none", label: "ap.border.none" },
  { id: "subtle", label: "ap.border.subtle" },
  { id: "strong", label: "ap.border.strong" },
];

const SHADOWS: { id: ShadowStyle; label: DictKey }[] = [
  { id: "none", label: "ap.shadow.none" },
  { id: "soft", label: "ap.shadow.soft" },
  { id: "strong", label: "ap.shadow.strong" },
];

function contrastLabel(ratio: number) {
  if (ratio >= 7) return { text: "ap.contrast.excellent" as DictKey, ok: true };
  if (ratio >= 4.5) return { text: "ap.contrast.good" as DictKey, ok: true };
  if (ratio >= 3) return { text: "ap.contrast.low" as DictKey, ok: false };
  return { text: "ap.contrast.veryLow" as DictKey, ok: false };
}

/** Todas as opções de personalização. Tudo vale na hora e fica salvo neste aparelho. */
export function AppearanceEditor() {
  const { appearance: a, update, reset } = useAppearance();
  const { t } = useI18n();
  const isDefault = JSON.stringify(a) === JSON.stringify(DEFAULT_APPEARANCE);

  // Contraste do texto personalizado contra o fundo que está valendo agora.
  const darkNow =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const effectiveBg =
    (darkNow ? a.backgroundDark : a.backgroundLight) ??
    (darkNow ? THEME_COLORS.dark.background : THEME_COLORS.light.background);
  const textContrast = isHex(a.textColor)
    ? contrastLabel(contrastRatio(a.textColor, effectiveBg))
    : null;

  return (
    <div className="space-y-5">
      {/* Prévia */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("ap.preview")}
          </p>
          <button
            type="button"
            onClick={reset}
            disabled={isDefault}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-default disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("ap.restore")}
          </button>
        </div>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground">
          {t("ap.previewTitle")}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("ap.previewText")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
            {t("ap.accentButton")}
          </span>
          <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
            {t("ap.primaryColorSample")}
          </span>
          <span className="rounded-full bg-accent-soft px-4 py-1.5 text-xs font-semibold text-accent">
            {t("ap.softDetail")}
          </span>
        </div>
      </div>

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

      <Section title={t("ap.accessibility")} hint={t("ap.accessibilityHint")}>
        <Switch
          checked={a.reduceMotion}
          onChange={(reduceMotion) => update({ reduceMotion })}
          label={t("ap.reduceMotion")}
          hint={t("ap.reduceMotionHint")}
        />
      </Section>
    </div>
  );
}
