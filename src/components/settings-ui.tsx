// Peças comuns das páginas de Configurações.
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { pickName, type Names } from "@/lib/appearance-data";

/** Texto no idioma atual, a partir de [pt-BR, en, es, fr]. */
export function useTr() {
  const { locale } = useI18n();
  return (names: Names) => pickName(names, locale);
}

/** Moldura de uma página de configurações: voltar, título e conteúdo. */
export function SettingsPage({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/perfil/configuracoes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("settings.account.back")}</span>
      </Link>
      <h1 className="sr-only">{title}</h1>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

/** Cartão de uma seção. */
export function SettingsCard({
  title,
  hint,
  children,
  tone = "default",
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-xs sm:p-6 ${
        tone === "danger" ? "border-destructive/40 bg-destructive/5" : "border-border/70 bg-card"
      }`}
    >
      <h2
        className={`font-display text-sm font-bold ${tone === "danger" ? "text-destructive" : "text-foreground"}`}
      >
        {title}
      </h2>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Linha com título, explicação e um controle à direita. */
export function Row({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export const selectClass =
  "rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export const buttonClass =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50";
