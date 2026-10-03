// Peças reutilizáveis do painel de personalização (seções, grupos, cores, seletores e galerias).
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun, Sunset } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import { pickName, type ColorPreset, type Names, type Preset } from "@/lib/appearance-data";
import {
  isHex,
  type Appearance,
  type BorderStyle,
  type Density,
  type ShadowStyle,
  type ThemeMode,
} from "@/lib/appearance";

export const DEFAULT_HEADING_CSS = '"Libre Baskerville", ui-serif, Georgia, serif';
export const DEFAULT_BODY_CSS = '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif';

/** Texto escolhido pelo idioma atual, a partir de [pt-BR, en, es, fr]. */
export function useTr() {
  const { locale } = useI18n();
  return (names: Names) => pickName(names, locale);
}

export const optionClass = (active: boolean) =>
  `min-w-0 rounded-xl border px-2 py-2 text-xs font-medium transition cursor-pointer sm:px-3 ${
    active
      ? "border-accent bg-accent-soft text-foreground ring-2 ring-accent/40"
      : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
  }`;

export function Section({
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
      <div className="mt-5 space-y-7">{children}</div>
    </section>
  );
}

export function Group({
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

/** Bolinhas de cor prontas. `value` marca a escolhida; `onPick(null)` volta ao automático. */
export function ColorSwatches({
  label,
  presets,
  value,
  onPick,
  autoLabel,
}: {
  label: string;
  presets: readonly ColorPreset[];
  value: string | null;
  onPick: (value: string | null) => void;
  /** Quando informado, mostra um botão "automático" que devolve null. */
  autoLabel?: string;
}) {
  const tr = useTr();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {autoLabel && (
        <button
          type="button"
          onClick={() => onPick(null)}
          aria-pressed={value === null}
          className={`rounded-full border px-3 py-1 text-[11px] font-medium transition cursor-pointer ${
            value === null
              ? "border-foreground bg-secondary text-foreground"
              : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          {autoLabel}
        </button>
      )}
      {presets.map((p) => {
        const active = !!value && p.value.toLowerCase() === value.toLowerCase();
        const name = tr(p.names);
        return (
          <button
            key={p.value}
            type="button"
            title={name}
            aria-label={`${label}: ${name}`}
            aria-pressed={active}
            onClick={() => onPick(p.value)}
            style={{ backgroundColor: p.value }}
            className={`h-8 w-8 cursor-pointer rounded-full border-2 shadow-xs transition ${
              active ? "scale-110 border-foreground" : "border-card hover:scale-105"
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * Cor totalmente livre: seletor + código hexadecimal, com cores prontas opcionais.
 * `value` nulo significa "usar a cor do tema principal" (mostrada por `fallback`).
 */
export function FreeColor({
  label,
  value,
  fallback,
  onChange,
  resetLabel,
  presets,
}: {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string | null) => void;
  resetLabel: string;
  presets?: readonly ColorPreset[];
}) {
  const { t } = useI18n();
  const shown = value ?? fallback;
  return (
    <div className="space-y-3">
      {presets && (
        <ColorSwatches label={label} presets={presets} value={value} onPick={onChange} />
      )}
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
    </div>
  );
}

/** Cores de marca: sugestões rápidas e qualquer outra cor à escolha. */
export function BrandColor({
  label,
  presets,
  value,
  fallback,
  onChange,
}: {
  label: string;
  presets: readonly ColorPreset[];
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      <ColorSwatches
        label={label}
        presets={presets}
        value={value}
        onPick={(v) => onChange(v ?? fallback)}
      />
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

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  columns,
}: {
  options: {
    id: T;
    /** Chave do dicionário ou texto já traduzido. */
    label: DictKey | string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value: T;
  onChange: (id: T) => void;
  columns: string;
}) {
  const { t } = useI18n();
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={String(id)}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`${optionClass(value === id)} flex items-center justify-center gap-1.5`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label.includes(".") && !label.includes(" ") ? t(label as DictKey) : label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
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
      <span className="w-16 shrink-0 text-right font-mono text-xs text-foreground">{display}</span>
    </div>
  );
}

export function Switch({
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
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
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

/** Lista suspensa simples (nativa, acessível). */
export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <select
      aria-label={label}
      value={String(value)}
      onChange={(e) => {
        const picked = options.find((o) => String(o.id) === e.target.value);
        if (picked) onChange(picked.id);
      }}
      className={`rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent ${className}`}
    >
      {options.map((o) => (
        <option key={String(o.id)} value={String(o.id)}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Opções de hora cheia (0h a 23h). */
export const HOURS = Array.from({ length: 24 }, (_, h) => ({
  id: h,
  label: `${String(h).padStart(2, "0")}:00`,
}));

/**
 * Galeria de modelos prontos. Clicar aplica o modelo; `isActive` marca o que já está valendo.
 * `preview` desenha a miniatura de cada modelo.
 */
export function PresetGallery({
  presets,
  onPick,
  isActive,
  preview,
  columns = "grid-cols-2 sm:grid-cols-3",
}: {
  presets: readonly Preset[];
  onPick: (preset: Preset) => void;
  isActive?: (preset: Preset) => boolean;
  preview?: (preset: Preset) => React.ReactNode;
  columns?: string;
}) {
  const tr = useTr();
  return (
    <div className={`grid gap-2.5 ${columns}`}>
      {presets.map((p) => {
        const active = isActive?.(p) ?? false;
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={active}
            onClick={() => onPick(p)}
            className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-2.5 text-left transition ${
              active
                ? "border-accent bg-accent-soft ring-2 ring-accent/40"
                : "border-border bg-background hover:bg-secondary"
            }`}
          >
            {preview?.(p) ??
              (p.swatch && (
                <span className="flex h-9 overflow-hidden rounded-lg border border-border/60">
                  {p.swatch.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
              ))}
            <span className="text-xs font-semibold text-foreground">{tr(p.names)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Aviso curto dentro de um cartão. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-secondary/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export const MODES: {
  id: ThemeMode;
  label: DictKey | string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "light", label: "ap.mode.light", icon: Sun },
  { id: "dark", label: "ap.mode.dark", icon: Moon },
  { id: "system", label: "ap.mode.system", icon: Monitor },
  { id: "schedule", label: "Agendado", icon: Sunset },
];

export const DENSITIES: { id: Density; label: DictKey }[] = [
  { id: "compact", label: "ap.density.compact" },
  { id: "normal", label: "ap.density.normal" },
  { id: "spacious", label: "ap.density.spacious" },
];

export const BORDERS: { id: BorderStyle; label: DictKey }[] = [
  { id: "none", label: "ap.border.none" },
  { id: "subtle", label: "ap.border.subtle" },
  { id: "strong", label: "ap.border.strong" },
];

export const SHADOWS: { id: ShadowStyle; label: DictKey }[] = [
  { id: "none", label: "ap.shadow.none" },
  { id: "soft", label: "ap.shadow.soft" },
  { id: "strong", label: "ap.shadow.strong" },
];

export function contrastLabel(ratio: number) {
  if (ratio >= 7) return { text: "ap.contrast.excellent" as DictKey, ok: true };
  if (ratio >= 4.5) return { text: "ap.contrast.good" as DictKey, ok: true };
  if (ratio >= 3) return { text: "ap.contrast.low" as DictKey, ok: false };
  return { text: "ap.contrast.veryLow" as DictKey, ok: false };
}

/** Compara só os campos do modelo com a aparência atual (para marcar o modelo ativo). */
export function matchesPatch(a: Appearance, patch: Partial<Appearance>): boolean {
  return (Object.keys(patch) as (keyof Appearance)[]).every((k) => a[k] === patch[k]);
}
