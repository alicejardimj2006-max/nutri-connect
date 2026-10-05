// Peças de interface compartilhadas pelo editor de fotos e pelos painéis das ferramentas.
import { useI18n } from "@/hooks/use-i18n";
import { PALETTE, pickName, type Names } from "@/lib/image-edit-data";

/** Texto no idioma atual, a partir de [pt-BR, en, es, fr]. */
export function useTr() {
  const { locale } = useI18n();
  return (names: Names) => pickName(names, locale);
}

export const toolBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card cursor-pointer disabled:cursor-not-allowed";

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  neutral = 0,
  onChange,
  resetTitle,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** Valor "sem efeito": duplo clique no rótulo volta para ele. */
  neutral?: number;
  onChange: (v: number) => void;
  resetTitle?: string;
}) {
  const shown = step < 1 ? value.toFixed(step < 0.1 ? 2 : 1) : Math.round(value);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <button
          type="button"
          onDoubleClick={() => onChange(neutral)}
          title={resetTitle}
          className="cursor-pointer select-none font-medium text-foreground"
        >
          {label}
        </button>
        <span
          className={`tabular-nums ${value !== neutral ? "font-semibold text-primary" : "text-muted-foreground"}`}
        >
          {value > neutral && neutral === 0 ? "+" : ""}
          {shown}
          {unit}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={() => onChange(neutral)}
        className="w-full cursor-pointer accent-[var(--color-primary)]"
      />
    </div>
  );
}

/** Linha de cores prontas + seletor livre. `allowNone` mostra um botão "sem cor". */
export function ColorRow({
  label,
  value,
  onChange,
  allowNone,
  noneLabel,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  allowNone?: boolean;
  noneLabel?: string;
}) {
  const custom = value && value.startsWith("#") && value.length === 7 ? value : "#ffffff";
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {allowNone && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-pressed={value === null}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
              value === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {noneLabel}
          </button>
        )}
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={value === c}
            onClick={() => onChange(c)}
            style={{ backgroundColor: c }}
            className={`h-6 w-6 cursor-pointer rounded-full border-2 transition ${
              value === c ? "scale-110 border-primary" : "border-border hover:scale-105"
            }`}
          />
        ))}
        <label
          className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/60"
          style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
          title="+"
        >
          <input
            type="color"
            aria-label={label}
            value={custom}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}

/** Botões alternativos (um só ativo). */
export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
            value === o.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-secondary"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Interruptor simples com rótulo. */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between gap-3 text-xs font-medium text-foreground"
    >
      {label}
      <span
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-primary" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
            checked ? "left-[1.1rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}
