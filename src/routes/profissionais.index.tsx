import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  Brain,
  Dumbbell,
  HeartPulse,
  MapPin,
  Search,
  Stethoscope,
  Video,
  type LucideIcon,
} from "lucide-react";
import { AuthGateLoading } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { VerifiedBadge } from "@/components/person-chip";
import { Avatar, EmptyState, Loading, inputClass, plainText } from "@/components/clinical/ui";
import { useDirectory } from "@/lib/clinical/queries";
import { formatMoney } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { professionKey, type ProfessionKey } from "@/lib/clinical/professions";
import { useTr } from "@/components/settings-ui";
import type { Names } from "@/lib/appearance-data";
import { td } from "@/lib/i18n/data";
import { cn } from "@/lib/utils";
import { AppScreen } from "@/components/app-screen";

export const Route = createFileRoute("/profissionais/")({
  head: () => ({ meta: [{ title: "Profissionais verificados — NutriConnect" }] }),
  component: DirectoryPage,
});

type ModalityFilter = "todos" | "online" | "presencial";

/** As profissões da plataforma, na ordem em que aparecem nos filtros. */
const PROFESSION_FILTERS: { key: ProfessionKey; label: Names; icon: LucideIcon }[] = [
  { key: "nutricao", label: ["Nutrição", "Nutrition", "Nutrición", "Nutrition"], icon: Apple },
  { key: "medicina", label: ["Medicina", "Medicine", "Medicina", "Médecine"], icon: Stethoscope },
  {
    key: "psicologia",
    label: ["Psicologia", "Psychology", "Psicología", "Psychologie"],
    icon: Brain,
  },
  {
    key: "educacao_fisica",
    label: ["Educação física", "Fitness", "Educación física", "Sport"],
    icon: Dumbbell,
  },
  {
    key: "fisioterapia",
    label: ["Fisioterapia", "Physiotherapy", "Fisioterapia", "Kinésithérapie"],
    icon: Activity,
  },
  {
    key: "enfermagem",
    label: ["Enfermagem", "Nursing", "Enfermería", "Soins infirmiers"],
    icon: HeartPulse,
  },
];

function DirectoryPage() {
  const { t, locale } = useClinicalI18n();
  const tr = useTr();
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { data, isLoading } = useDirectory();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [profession, setProfession] = useState<ProfessionKey | null>(null);
  const [modality, setModality] = useState<ModalityFilter>("todos");
  const [onlyAccepting, setOnlyAccepting] = useState(true);
  // O card "Qual profissional combina com você?" filtra a lista.
  useEffect(() => {
    const onQuery = (e: Event) => setQuery(String((e as CustomEvent<string>).detail ?? ""));
    const onProfession = (e: Event) => {
      const key = String((e as CustomEvent<string>).detail ?? "");
      setProfession(key ? (key as ProfessionKey) : null);
      setSpecialty(null);
    };
    window.addEventListener("pros:query", onQuery);
    window.addEventListener("pros:profession", onProfession);
    return () => {
      window.removeEventListener("pros:query", onQuery);
      window.removeEventListener("pros:profession", onProfession);
    };
  }, []);

  // Especialidades vêm dos próprios cadastros (as mais comuns entre os profissionais da profissão escolhida).
  const specialties = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of data ?? []) {
      if (profession && professionKey(p.profession) !== profession) continue;
      for (const sp of p.specialties ?? []) count.set(sp, (count.get(sp) ?? 0) + 1);
    }
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([k]) => k);
  }, [data, profession]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (onlyAccepting && !p.accepting_patients) return false;
      if (modality === "online" && !p.offers_online) return false;
      if (modality === "presencial" && !p.offers_presential) return false;
      if (profession && professionKey(p.profession) !== profession) return false;
      if (specialty && !p.specialties?.includes(specialty)) return false;
      if (!q) return true;
      return [p.name, p.profession, p.headline, p.uf, ...(p.specialties ?? [])]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [data, query, specialty, profession, modality, onlyAccepting]);

  // Só quem está logado vê a vitrine (os perfis não são públicos).
  if (!authHydrated || !user) return <AuthGateLoading />;

  return (
    <AppScreen className={plainText}>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <h1 className="sr-only">{t("directory.title")}</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              className={cn(inputClass, "pl-10")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("directory.search")}
              aria-label={t("directory.search")}
            />
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            {(["todos", "online", "presencial"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModality(m)}
                aria-pressed={modality === m}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  modality === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "todos" ? t("directory.all") : t(`modality.${m}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={profession === null}
            onClick={() => {
              setProfession(null);
              setSpecialty(null);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              profession === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary",
            )}
          >
            {tr([
              "Todas as profissões",
              "All professions",
              "Todas las profesiones",
              "Toutes les professions",
            ])}
          </button>
          {PROFESSION_FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={profession === key}
              onClick={() => {
                setProfession(profession === key ? null : key);
                setSpecialty(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                profession === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tr(label)}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {specialties.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={specialty === c}
              onClick={() => setSpecialty(specialty === c ? null : c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                specialty === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary",
              )}
            >
              {td(c, locale)}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={onlyAccepting}
              onChange={(e) => setOnlyAccepting(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            {t("directory.onlyAccepting")}
          </label>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title={t("directory.emptyTitle")}
              text={t("directory.emptyText")}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to="/profissionais/$professionalId"
                  params={{ professionalId: p.id! }}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={p.name ?? ""} url={p.avatar_url} size="lg" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-display text-base font-bold text-foreground">
                        <span className="truncate">{p.name}</span>
                        <VerifiedBadge className="h-4 w-4" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {td(p.profession, locale)} · {p.council} {p.registration}/{p.uf}
                      </p>
                      {p.headline && (
                        <p className="mt-1 line-clamp-2 text-sm text-foreground">{p.headline}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(p.specialties ?? []).slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {td(s, locale)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      {p.offers_online && (
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" /> {t("modality.online")}
                        </span>
                      )}
                      {p.offers_presential && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {t("modality.presencial")}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-foreground">
                      {p.consultation_price_cents
                        ? formatMoney(p.consultation_price_cents, locale)
                        : t("directory.free")}
                    </span>
                  </div>
                  {!p.accepting_patients && (
                    <p className="mt-2 text-xs font-medium text-warning">
                      {t("directory.notAccepting")}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppScreen>
  );
}
