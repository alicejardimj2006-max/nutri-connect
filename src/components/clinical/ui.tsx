import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import type { AppointmentStatus, LinkStatus, PaymentStatus } from "@/lib/clinical/api";

/**
 * O app justifica textos dentro de cards (styles.css). Nas telas clínicas, cheias de rótulos
 * curtos, isso abre buracos entre as palavras: aqui o texto herda o alinhamento do pai.
 */
export const plainText = "[&_:is(p,li,dd)]:[text-align:inherit] [&_:is(p,li,dd)]:[hyphens:manual]";

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60";

export const buttonPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:pointer-events-none disabled:opacity-60";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:pointer-events-none disabled:opacity-60";

export const buttonGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-60";

export const buttonDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card shadow-xs",
        padded && "p-4 sm:p-5",
        className,
      )}
    >
      {(title || action) && (
        <div className={cn("mb-4 flex items-center justify-between gap-3", !padded && "p-4 pb-0")}>
          {title && <h2 className="font-display text-base font-bold text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 font-display text-base font-bold text-foreground">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loading({ label }: { label?: string }) {
  const { t } = useClinicalI18n();
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label ?? t("common.loading")}
    </div>
  );
}

export function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg" };
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn("shrink-0 rounded-full avatar-shape object-cover", sizes[size].split(" text")[0])}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary",
        sizes[size],
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const badgeBase =
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";

const APPOINTMENT_STYLE: Record<AppointmentStatus, string> = {
  aguardando_pagamento: "bg-warning/15 text-warning",
  agendada: "bg-secondary text-foreground",
  confirmada: "bg-primary-soft text-primary",
  realizada: "bg-primary text-primary-foreground",
  cancelada: "bg-muted text-muted-foreground line-through",
  faltou: "bg-destructive/10 text-destructive",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { t } = useClinicalI18n();
  return (
    <span className={cn(badgeBase, APPOINTMENT_STYLE[status])}>
      {t(`appt.status.${status}` as ClinicalKey)}
    </span>
  );
}

const LINK_STYLE: Record<LinkStatus, string> = {
  pendente: "bg-warning/15 text-warning",
  ativo: "bg-primary-soft text-primary",
  recusado: "bg-muted text-muted-foreground",
  encerrado: "bg-muted text-muted-foreground",
};

export function LinkStatusBadge({ status }: { status: LinkStatus }) {
  const { t } = useClinicalI18n();
  return (
    <span className={cn(badgeBase, LINK_STYLE[status])}>
      {t(`link.status.${status}` as ClinicalKey)}
    </span>
  );
}

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
  pendente: "bg-warning/15 text-warning",
  em_processamento: "bg-warning/15 text-warning",
  aprovado: "bg-primary-soft text-primary",
  recusado: "bg-destructive/10 text-destructive",
  reembolsado: "bg-muted text-muted-foreground",
  cancelado: "bg-muted text-muted-foreground",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useClinicalI18n();
  return (
    <span className={cn(badgeBase, PAYMENT_STYLE[status])}>
      {t(`payment.status.${status}` as ClinicalKey)}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
        {hint && <span className="font-normal"> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Abas horizontais simples (sem mudar a URL). */
export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          aria-pressed={value === item.value}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
            value === item.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="ml-1.5 text-xs opacity-80">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
