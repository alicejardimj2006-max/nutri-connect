// Peças visuais compartilhadas pelo console de administração.
import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Database,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminSetupError } from "@/lib/admin-api";

export const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";
export const btnCls =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50";
export const btnDanger =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-3.5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50";

export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function Panel({
  title,
  hint,
  action,
  children,
  className = "",
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-border/80 bg-card p-4 shadow-xs sm:p-5 ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="flex items-center gap-1.5 font-display text-base font-bold text-foreground">
                {title}
                {/* A explicação fica no ícone de ajuda, sem texto corrido no topo. */}
                {hint && (
                  <span
                    title={hint}
                    aria-label={hint}
                    className="cursor-help text-muted-foreground/70"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </span>
                )}
              </h2>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
  onClick,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: LucideIcon;
  tone?: "default" | "alert" | "good";
  onClick?: () => void;
}) {
  const color = tone === "alert" ? "#d6456b" : tone === "good" ? "#4f8a4b" : "var(--accent)";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-start gap-3 rounded-3xl border border-border/80 bg-card p-4 text-left shadow-xs transition ${
        onClick ? "cursor-pointer hover:shadow-soft" : ""
      }`}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
        style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-2xl font-bold leading-none text-foreground">
          {value}
        </span>
        <span className="mt-1 block text-xs font-medium text-muted-foreground">{label}</span>
        {sub && <span className="mt-0.5 block text-[11px] text-muted-foreground/80">{sub}</span>}
      </span>
    </Tag>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "good" | "warn" | "bad" | "info";
}) {
  const map = {
    default: "bg-secondary text-secondary-foreground",
    good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    bad: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    info: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[tone]}`}
    >
      {children}
    </span>
  );
}

/** Barras simples (um valor por dia). */
export function BarChart({
  data,
  color = "var(--accent)",
  height = 120,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div
      className="flex items-end gap-[3px]"
      style={{ height }}
      role="img"
      aria-label="Gráfico de barras"
    >
      {data.map((d, i) => (
        <div
          key={i}
          className="group relative flex h-full min-w-0 flex-1 items-end"
          title={`${d.label}: ${d.value}`}
        >
          <div
            className="w-full rounded-t-[3px] transition-opacity group-hover:opacity-80"
            style={{
              height: `${Math.max(d.value > 0 ? 4 : 1, (d.value / max) * 100)}%`,
              background: color,
              opacity: d.value === 0 ? 0.25 : 1,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** Barras empilhadas com legenda (várias séries por dia). */
export function StackedBars({
  labels,
  series,
  height = 140,
}: {
  labels: string[];
  series: { name: string; color: string; values: number[] }[];
  height?: number;
}) {
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  const max = Math.max(1, ...totals);
  return (
    <div>
      <div
        className="flex items-end gap-[3px]"
        style={{ height }}
        role="img"
        aria-label="Gráfico de barras empilhadas"
      >
        {labels.map((label, i) => (
          <div
            key={i}
            className="flex h-full min-w-0 flex-1 flex-col-reverse"
            title={`${label}: ${series.map((s) => `${s.name} ${s.values[i] ?? 0}`).join(" · ")}`}
          >
            {series.map((s) => (
              <div
                key={s.name}
                style={{ height: `${((s.values[i] ?? 0) / max) * 100}%`, background: s.color }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block min-w-[14rem] flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pl-10 [&::-webkit-search-cancel-button]:hidden`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Limpar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </label>
  );
}

export function Pagination({
  offset,
  limit,
  total,
  onChange,
}: {
  offset: number;
  limit: number;
  total: number;
  onChange: (offset: number) => void;
}) {
  if (total <= limit)
    return total > 0 ? (
      <p className="mt-3 text-xs text-muted-foreground">
        {total} resultado{total === 1 ? "" : "s"}
      </p>
    ) : null;
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.ceil(total / limit);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
      <span>
        {offset + 1}–{Math.min(offset + limit, total)} de {total}
      </span>
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
          className={btnCls}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="font-semibold text-foreground">
          {page}/{pages}
        </span>
        <button
          type="button"
          disabled={offset + limit >= total}
          onClick={() => onChange(offset + limit)}
          className={btnCls}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  );
}

export function Empty({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
      {Icon && <Icon className="mx-auto mb-2 h-7 w-7 opacity-50" />}
      {children}
    </div>
  );
}

/** Mostra o aviso certo quando uma consulta do painel falha (inclusive "falta aplicar a migration"). */
export function QueryError({ error }: { error: unknown }) {
  if (!error) return null;
  if (error instanceof AdminSetupError) {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">As funções do painel ainda não estão no banco.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rode <code className="rounded bg-secondary px-1.5 py-0.5">npx supabase db push</code>{" "}
            para aplicar a migration do console de administração e depois recarregue esta página.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <p>{error instanceof Error ? error.message : "Não foi possível carregar."}</p>
    </div>
  );
}

/** Confirmação antes de uma ação séria; pode pedir um motivo. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  askReason = false,
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  askReason?: boolean;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {askReason && (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-foreground">
              Motivo (a pessoa será avisada)
            </span>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 300))}
              className={`${inputCls} resize-none`}
            />
          </label>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnCls}>
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy || (askReason && reason.trim().length < 3)}
            onClick={() => onConfirm(reason.trim())}
            className={
              danger
                ? "inline-flex cursor-pointer items-center rounded-full bg-destructive px-4 py-2 text-xs font-bold text-white transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                : btnPrimary
            }
          >
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const shortDate = (iso: string | null | undefined) =>
  iso
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
        new Date(iso),
      )
    : "—";
export const dateTime = (iso: string | null | undefined) =>
  iso
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : "—";
