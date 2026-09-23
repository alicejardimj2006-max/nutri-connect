import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { LOCALES } from "@/lib/i18n";

export const Route = createFileRoute("/perfil/configuracoes/idioma")({
  head: () => ({ meta: [{ title: "Idioma — NutriConnect" }] }),
  component: IdiomaPage,
});

function IdiomaPage() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <Link
        to="/perfil/configuracoes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("settings.account.back")}</span>
      </Link>

      <h1 className="text-3xl font-extrabold font-display text-foreground mb-1">
        {t("settings.language.title")}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{t("settings.language.hint")}</p>

      <div className="space-y-2.5">
        {LOCALES.map((l) => {
          const active = l.id === locale;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setLocale(l.id);
                toast.success(l.name + " — " + t("settings.language.changed"));
              }}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-accent bg-accent-soft"
                  : "border-border/70 bg-card hover:bg-secondary/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{l.flag}</span>
                <span>
                  <span className="block text-sm font-bold text-foreground">{l.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{l.namePt}</span>
                </span>
              </span>
              {active && <Check className="h-5 w-5 shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
