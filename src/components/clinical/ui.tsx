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
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  // Sem cabeçalho visível com título e descrição: o título fica só para leitores de tela.
  return (
    <>
      <h1 className="sr-only">{title}</h1>
      {action && <div className="mb-5 flex flex-wrap items-center justify-end gap-2">{action}</div>}
    </>
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
        "group relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-card/60 backdrop-blur-2xl shadow-sm transition-all duration-300 hover:shadow-card hover:-translate-y-0.5",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {/* Efeito de brilho de fundo bem sutil no hover */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5" />
      
      {(title || action) && (
        <div className={cn("mb-5 flex items-center justify-between gap-4", !padded && "p-5 pb-0")}>
          {title && <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      <div className="relative z-10">{children}</div>
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
    <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/60 bg-card/30 backdrop-blur-sm px-6 py-12 text-center transition-all duration-300 hover:bg-card/50">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft/50 text-primary shadow-inner">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 font-display text-lg font-bold tracking-tight text-foreground">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
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
        className={cn(
          "shrink-0 rounded-full avatar-shape object-cover",
          sizes[size].split(" text")[0],
        )}
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
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5" />
      <div className="flex items-start justify-between gap-3 relative z-10">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent shadow-sm transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground relative z-10">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground opacity-80 relative z-10">{hint}</p>}
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
    <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-2 scroll-smooth">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          aria-pressed={value === item.value}
          className={cn(
            "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300",
            value === item.value
              ? "bg-accent text-accent-foreground shadow-md scale-105"
              : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-[1.02]",
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className={cn(
              "ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black",
              value === item.value ? "bg-accent-foreground/20 text-accent-foreground" : "bg-muted text-muted-foreground"
            )}>
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
