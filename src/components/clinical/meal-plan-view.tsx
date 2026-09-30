import { Clock } from "lucide-react";
import type { FullMealPlan, MealPlanItem } from "@/lib/clinical/records";
import { macroSplit, sumMacros, type Macros } from "@/lib/clinical/calc";
import { mainItems, substitutesOf } from "@/lib/clinical/plan";
import { formatNumber, shortTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";

/** Barras de energia e macronutrientes do plano contra as metas definidas. */
export function MacroBars({ totals, plan }: { totals: Macros; plan: FullMealPlan }) {
  const { t, locale } = useClinicalI18n();
  const split = macroSplit(totals);
  const rows = [
    {
      key: "kcal",
      label: t("plan.energy"),
      value: totals.kcal,
      target: plan.target_kcal,
      unit: "kcal",
      digits: 0,
    },
    {
      key: "p",
      label: t("plan.protein"),
      value: totals.protein_g,
      target: plan.target_protein_g,
      unit: "g",
      share: split.protein,
      digits: 0,
    },
    {
      key: "c",
      label: t("plan.carbs"),
      value: totals.carbs_g,
      target: plan.target_carbs_g,
      unit: "g",
      share: split.carbs,
      digits: 0,
    },
    {
      key: "f",
      label: t("plan.fat"),
      value: totals.fat_g,
      target: plan.target_fat_g,
      unit: "g",
      share: split.fat,
      digits: 0,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((r) => {
        const pct = r.target ? Math.round((r.value / r.target) * 100) : null;
        const off = pct !== null && (pct < 90 || pct > 110);
        return (
          <div key={r.key} className="rounded-xl bg-secondary/60 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{r.label}</span>
              {r.share !== undefined && (
                <span className="text-[11px] text-muted-foreground">
                  {t("plan.shareOfKcal", { pct: r.share })}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
              {formatNumber(r.value, locale, r.digits)}
              <span className="text-xs font-normal text-muted-foreground">
                {r.target ? ` / ${formatNumber(r.target, locale, 0)}` : ""} {r.unit}
              </span>
            </p>
            {pct !== null && (
              <>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={r.label}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <p
                  className={cn(
                    "mt-1 text-[11px]",
                    off ? "font-semibold text-warning" : "text-muted-foreground",
                  )}
                >
                  {t("plan.ofTarget", { pct })}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemLine({ item, showMacros }: { item: MealPlanItem; showMacros: boolean }) {
  const { locale } = useClinicalI18n();
  return (
    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
      <span className="text-foreground">
        {item.household_measure ? (
          <>
            <span className="font-semibold">{item.household_measure}</span> {item.food_name}{" "}
            <span className="text-muted-foreground">
              ({formatNumber(Number(item.quantity_g), locale, 0)} g)
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold">
              {formatNumber(Number(item.quantity_g), locale, 0)} g
            </span>{" "}
            {item.food_name}
          </>
        )}
      </span>
      {showMacros && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatNumber(Number(item.kcal), locale, 0)} kcal
        </span>
      )}
    </span>
  );
}

/** Plano alimentar para leitura (paciente, versões arquivadas). */
export function MealPlanView({
  plan,
  showMacros = true,
}: {
  plan: FullMealPlan;
  showMacros?: boolean;
}) {
  const { t, locale } = useClinicalI18n();
  return (
    <div className="space-y-3">
      {plan.meals.map((meal) => {
        const mains = mainItems(meal.items);
        const totals = sumMacros(mains);
        return (
          <section
            key={meal.id}
            className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
          >
            <header className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-bold text-foreground">{meal.name}</h3>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                {meal.time_of_day && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {shortTime(meal.time_of_day)}
                  </span>
                )}
                {showMacros && mains.length > 0 && (
                  <span className="tabular-nums">{formatNumber(totals.kcal, locale, 0)} kcal</span>
                )}
              </span>
            </header>
            {mains.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("plan.emptyMeal")}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {mains.map((item) => {
                  const subs = substitutesOf(meal.items, item.id);
                  return (
                    <li key={item.id}>
                      <ItemLine item={item} showMacros={showMacros} />
                      {subs.map((s) => (
                        <div key={s.id} className="mt-1 flex gap-2 pl-3 text-muted-foreground">
                          <span className="shrink-0 text-xs font-semibold uppercase text-accent">
                            {t("plan.or")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <ItemLine item={s} showMacros={showMacros} />
                          </div>
                        </div>
                      ))}
                      {item.notes && (
                        <p className="mt-0.5 pl-3 text-xs text-muted-foreground">{item.notes}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {meal.notes && (
              <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-xs text-foreground">
                {meal.notes}
              </p>
            )}
          </section>
        );
      })}
      {plan.guidelines && (
        <section className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-4">
          <h3 className="mb-1 font-display text-base font-bold text-foreground">
            {t("plan.guidelines")}
          </h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {plan.guidelines}
          </p>
        </section>
      )}
    </div>
  );
}
