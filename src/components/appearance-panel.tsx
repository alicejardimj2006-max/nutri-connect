import { useEffect, useState } from "react";
import { Monitor, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import {
  ACCENT_PRESETS,
  APPEARANCE_EVENT,
  BACKGROUNDS,
  BODY_FONTS,
  DEFAULT_APPEARANCE,
  HEADING_FONTS,
  PRIMARY_PRESETS,
  loadAppearance,
  resetAppearance,
  saveAppearance,
  type Appearance,
  type CornerStyle,
  type TextSize,
  type ThemeMode,
} from "@/lib/appearance";

const DEFAULT_HEADING_CSS = '"Libre Baskerville", ui-serif, Georgia, serif';
const DEFAULT_BODY_CSS = '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif';

function useAppearance() {
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

function ColorPicker({
  presets,
  value,
  onChange,
  label,
}: {
  presets: readonly { name: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const isPreset = presets.some((p) => p.value.toLowerCase() === value.toLowerCase());
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => {
        const active = p.value.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={p.value}
            type="button"
            title={p.name}
            aria-label={`${label}: ${p.name}`}
            aria-pressed={active}
            onClick={() => onChange(p.value)}
            style={{ backgroundColor: p.value }}
            className={`h-8 w-8 cursor-pointer rounded-full border-2 transition ${
              active ? "scale-110 border-foreground" : "border-card hover:scale-105"
            } shadow-xs`}
          />
        );
      })}
      <label
        title="Escolher outra cor"
        className={`relative grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full border-2 text-[10px] font-bold ${
          isPreset ? "border-dashed border-border text-muted-foreground" : "border-foreground"
        }`}
        style={isPreset ? undefined : { backgroundColor: value }}
      >
        {isPreset && "+"}
        <input
          type="color"
          aria-label={`${label}: outra cor`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

const MODES: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] =
  [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Escuro", icon: Moon },
    { id: "system", label: "Automático", icon: Monitor },
  ];

const SIZES: { id: TextSize; label: string; px: string }[] = [
  { id: "small", label: "Pequeno", px: "text-xs" },
  { id: "medium", label: "Médio", px: "text-base" },
  { id: "large", label: "Grande", px: "text-xl" },
];

const CORNERS: { id: CornerStyle; label: string; radius: string }[] = [
  { id: "sharp", label: "Retos", radius: "4px" },
  { id: "soft", label: "Suaves", radius: "12px" },
  { id: "round", label: "Arredondados", radius: "22px" },
];

/** Painel onde a pessoa monta o próprio estilo. Tudo vale na hora e fica salvo neste aparelho. */
export function AppearancePanel() {
  const { appearance: a, update, reset } = useAppearance();
  const isDefault = JSON.stringify(a) === JSON.stringify(DEFAULT_APPEARANCE);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-chart-4/15 text-chart-4">
            <Palette className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-foreground">Personalização</p>
            <p className="text-[11px] text-muted-foreground">
              Monte o seu estilo. As mudanças aparecem na hora.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={isDefault}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-default disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar padrão
        </button>
      </div>

      {/* Prévia */}
      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Prévia
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground">
          Uma refeição com calma
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Cada escolha abaixo muda a aparência do NutriConnect só para você.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
            Botão de destaque
          </span>
          <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
            Cor principal
          </span>
          <span className="rounded-full bg-accent-soft px-4 py-1.5 text-xs font-semibold text-accent">
            Detalhe suave
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <Group title="Modo">
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={a.mode === id}
                onClick={() => update({ mode: id })}
                className={`${optionClass(a.mode === id)} flex items-center justify-center gap-1.5`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </Group>

        <Group title="Cor de destaque" hint="Botões principais, links e selos.">
          <ColorPicker
            label="Cor de destaque"
            presets={ACCENT_PRESETS}
            value={a.accent}
            onChange={(accent) => update({ accent })}
          />
        </Group>

        <Group title="Cor principal" hint="Marca e elementos de apoio.">
          <ColorPicker
            label="Cor principal"
            presets={PRIMARY_PRESETS}
            value={a.primary}
            onChange={(primary) => update({ primary })}
          />
        </Group>

        <Group title="Fundo">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                type="button"
                aria-pressed={a.background === bg.id}
                onClick={() => update({ background: bg.id })}
                className={`${optionClass(a.background === bg.id)} flex flex-col items-center gap-1.5`}
              >
                <span
                  className="flex h-8 w-full items-end justify-end overflow-hidden rounded-lg border border-black/10 p-1"
                  style={{ backgroundColor: bg.swatch.light }}
                >
                  <span
                    className="h-4 w-1/2 rounded-md border border-black/10"
                    style={{ backgroundColor: bg.swatch.card }}
                  />
                </span>
                {bg.name}
              </button>
            ))}
          </div>
        </Group>

        <Group title="Fonte dos títulos">
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
                {f.name}
              </button>
            ))}
          </div>
        </Group>

        <Group title="Fonte do texto">
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
                {f.name}
              </button>
            ))}
          </div>
        </Group>

        <Group title="Tamanho do texto">
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={a.textSize === s.id}
                onClick={() => update({ textSize: s.id })}
                className={optionClass(a.textSize === s.id)}
              >
                <span className={`block font-semibold leading-tight text-foreground ${s.px}`}>
                  A
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </Group>

        <Group title="Cantos">
          <div className="grid grid-cols-3 gap-2">
            {CORNERS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={a.corners === c.id}
                onClick={() => update({ corners: c.id })}
                className={`${optionClass(a.corners === c.id)} flex flex-col items-center gap-1.5`}
              >
                <span
                  className="h-7 w-full border-2 border-foreground/40 bg-secondary"
                  style={{ borderRadius: c.radius }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </Group>
      </div>
    </section>
  );
}
