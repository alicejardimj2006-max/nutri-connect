import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, FileText, Flame, Scale, Target, Utensils } from "lucide-react";
import { bmi, bmiClass } from "@/lib/clinical/calc";
import { adherence, lastDays } from "@/lib/clinical/goals";
import { planTotals } from "@/lib/clinical/plan";
import {
  useActivePlan,
  useAnthropometrics,
  useCheckins,
  useGoals,
  useNotes,
} from "@/lib/clinical/queries";
import { ageFrom, formatDate, formatNumber } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { EvolutionCharts } from "./evolution-charts";
import { Card, Stat, buttonGhost } from "./ui";

export function RecordSummary({
  patientId,
  birthDate,
  onOpenTab,
}: {
  patientId: string;
  birthDate?: string | null;
  onOpenTab: (tab: "anamnese" | "evolucao" | "antropometria" | "plano" | "metas") => void;
}) {
  const { t, locale } = useClinicalI18n();
  const anthro = useAnthropometrics(patientId);
  const plan = useActivePlan(patientId);
  const notes = useNotes(patientId);
  const goals = useGoals(patientId);
  const days = useMemo(() => lastDays(7), []);
  const checkins = useCheckins(patientId, days[0]);

  const rows = anthro.data ?? [];
  const lastWeight = [...rows].reverse().find((r) => r.weight_kg);
  const firstWeight = rows.find((r) => r.weight_kg);
  const height = [...rows].reverse().find((r) => r.height_cm)?.height_cm;
  const lastFat = [...rows].reverse().find((r) => r.body_fat_pct);
  const lastTdee = [...rows].reverse().find((r) => r.tdee_kcal);
  const imc = lastWeight && height ? bmi(Number(lastWeight.weight_kg), Number(height)) : null;
  const delta =
    lastWeight && firstWeight && lastWeight.id !== firstWeight.id
      ? Number(lastWeight.weight_kg) - Number(firstWeight.weight_kg)
      : null;
  const activeGoals = (goals.data ?? []).filter((g) => g.active);
  const avgAdherence = activeGoals.length
    ? Math.round(
        activeGoals.reduce((a, g) => a + adherence(g, checkins.data ?? [], days), 0) /
          activeGoals.length,
      )
    : null;
  const lastNote = notes.data?.[0];
  const totals = plan.data ? planTotals(plan.data) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={Scale}
          label={t("summary.weight")}
          value={lastWeight ? `${formatNumber(Number(lastWeight.weight_kg), locale)} kg` : "—"}
          hint={
            delta !== null
              ? t("summary.sinceStart", {
                  delta: `${delta > 0 ? "+" : ""}${formatNumber(delta, locale)} kg`,
                })
              : undefined
          }
        />
        <Stat
          icon={Activity}
          label={t("anthro.bmi")}
          value={imc ? formatNumber(imc, locale) : "—"}
          hint={
            imc
              ? t(`anthro.bmiClass.${bmiClass(imc, ageFrom(birthDate))}` as ClinicalKey)
              : undefined
          }
        />
        <Stat
          icon={Flame}
          label={t("anthro.tdee")}
          value={lastTdee ? `${lastTdee.tdee_kcal} kcal` : "—"}
          hint={
            lastFat
              ? t("summary.bodyFat", { pct: formatNumber(Number(lastFat.body_fat_pct), locale) })
              : undefined
          }
        />
        <Stat
          icon={Target}
          label={t("summary.adherence")}
          value={avgAdherence !== null ? `${avgAdherence}%` : "—"}
          hint={activeGoals.length ? t("summary.goalsCount", { n: activeGoals.length }) : undefined}
        />
      </div>

      {rows.length > 0 && <EvolutionCharts rows={rows} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title={t("summary.activePlan")}
          action={
            <button type="button" className={buttonGhost} onClick={() => onOpenTab("plano")}>
              {t("common.seeAll")}
            </button>
          }
        >
          {plan.data ? (
            <Link
              to="/painel/planos/$planId"
              params={{ planId: plan.data.id }}
              className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3 hover:bg-secondary"
            >
              <Utensils className="h-5 w-5 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {plan.data.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(totals!.kcal, locale, 0)} kcal · {plan.data.meals.length}{" "}
                  {t("summary.meals")}
                  {plan.data.published_at && ` · ${formatDate(plan.data.published_at, locale)}`}
                </span>
              </span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">{t("summary.noPlan")}</p>
          )}
        </Card>

        <Card
          title={t("summary.lastNote")}
          action={
            <button type="button" className={buttonGhost} onClick={() => onOpenTab("evolucao")}>
              {t("common.seeAll")}
            </button>
          }
        >
          {lastNote ? (
            <div className="text-sm">
              <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> {formatDate(lastNote.created_at, locale)}
              </p>
              {lastNote.assessment && (
                <p className="text-foreground">
                  <span className="font-semibold">A:</span> {lastNote.assessment}
                </p>
              )}
              {lastNote.plan && (
                <p className="mt-1 text-foreground">
                  <span className="font-semibold">P:</span> {lastNote.plan}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("notes.empty")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
