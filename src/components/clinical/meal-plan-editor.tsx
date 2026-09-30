import { useState } from "react";
import { ArrowDown, ArrowUp, CornerDownRight, Plus, Trash2 } from "lucide-react";
import * as records from "@/lib/clinical/records";
import type { FullMealPlan, MealPlanItem, MealWithItems } from "@/lib/clinical/records";
import { portion, sumMacros } from "@/lib/clinical/calc";
import { mainItems, planTotals, rescaleItem, substitutesOf } from "@/lib/clinical/plan";
import { qk, useAnthropometrics, useClinicalMutation } from "@/lib/clinical/queries";
import { formatNumber, shortTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { FoodSearch, type FoodChoice } from "./food-search";
import { MacroBars } from "./meal-plan-view";
import { Card, Field, buttonGhost, buttonSecondary, inputClass } from "./ui";

const cellInput =
  "w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm outline-none transition hover:border-border focus:border-primary focus:bg-background";

function newItemFromChoice(mealId: string, c: FoodChoice, position: number, substituteOf?: string) {
  const m = portion(c.food, c.grams);
  return {
    meal_id: mealId,
    substitute_of: substituteOf ?? null,
    food_id: c.food.id,
    food_name: c.food.name,
    quantity_g: c.grams,
    household_measure: c.measure || null,
    position,
    ...m,
  };
}

export function MealPlanEditor({ plan }: { plan: FullMealPlan }) {
  const { t, locale } = useClinicalI18n();
  const invalidate = [qk.plan(plan.id), qk.plans(plan.patient_id), qk.activePlan(plan.patient_id)];
  const anthro = useAnthropometrics(plan.patient_id);
  const lastTdee = [...(anthro.data ?? [])].reverse().find((a) => a.tdee_kcal)?.tdee_kcal;

  const updatePlan = useClinicalMutation(
    (patch: Parameters<typeof records.updateMealPlan>[1]) => records.updateMealPlan(plan.id, patch),
    { invalidate },
  );
  const addMeal = useClinicalMutation(
    () => records.addMeal(plan.id, t("plan.newMealName"), null, plan.meals.length),
    { invalidate },
  );

  const totals = planTotals(plan);
  const intField = (
    value: number | null,
    key: "target_kcal" | "target_protein_g" | "target_carbs_g" | "target_fat_g",
    label: string,
    unit: string,
  ) => (
    <Field label={`${label} (${unit})`}>
      <input
        key={`${key}-${value}`}
        inputMode="numeric"
        className={inputClass}
        defaultValue={value ?? ""}
        onBlur={(e) => {
          const v =
            e.target.value.trim() === ""
              ? null
              : Math.round(Number(e.target.value.replace(",", ".")));
          if (v !== value) updatePlan.mutate({ [key]: v });
        }}
      />
    </Field>
  );

  return (
    <div className="space-y-4">
      <Card title={t("plan.targets")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {intField(plan.target_kcal, "target_kcal", t("plan.energy"), "kcal")}
          {intField(plan.target_protein_g, "target_protein_g", t("plan.protein"), "g")}
          {intField(plan.target_carbs_g, "target_carbs_g", t("plan.carbs"), "g")}
          {intField(plan.target_fat_g, "target_fat_g", t("plan.fat"), "g")}
        </div>
        {lastTdee && lastTdee !== plan.target_kcal && (
          <button
            type="button"
            className={cn(buttonGhost, "mt-2 px-0")}
            onClick={() => updatePlan.mutate({ target_kcal: lastTdee })}
          >
            {t("plan.useTdee", { kcal: lastTdee })}
          </button>
        )}
        <div className="mt-4">
          <MacroBars totals={totals} plan={plan} />
        </div>
      </Card>

      {plan.meals.map((meal, idx) => (
        <MealEditor
          key={meal.id}
          meal={meal}
          planId={plan.id}
          patientId={plan.patient_id}
          isFirst={idx === 0}
          isLast={idx === plan.meals.length - 1}
          neighbors={[plan.meals[idx - 1], plan.meals[idx + 1]]}
        />
      ))}

      <button
        type="button"
        className={buttonSecondary}
        disabled={addMeal.isPending}
        onClick={() => addMeal.mutate(undefined)}
      >
        <Plus className="h-4 w-4" /> {t("plan.addMeal")}
      </button>

      <Card title={t("plan.guidelines")}>
        <textarea
          key={plan.guidelines ?? ""}
          rows={5}
          className={cn(inputClass, "resize-y")}
          defaultValue={plan.guidelines ?? ""}
          placeholder={t("plan.guidelinesPlaceholder")}
          onBlur={(e) =>
            e.target.value !== (plan.guidelines ?? "") &&
            updatePlan.mutate({ guidelines: e.target.value.trim() || null })
          }
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label={t("plan.startsOn")}>
            <input
              type="date"
              className={inputClass}
              defaultValue={plan.starts_on ?? ""}
              key={`s-${plan.starts_on}`}
              onBlur={(e) =>
                e.target.value !== (plan.starts_on ?? "") &&
                updatePlan.mutate({ starts_on: e.target.value || null })
              }
            />
          </Field>
          <Field label={t("plan.endsOn")} hint={t("common.optional")}>
            <input
              type="date"
              className={inputClass}
              defaultValue={plan.ends_on ?? ""}
              key={`e-${plan.ends_on}`}
              onBlur={(e) =>
                e.target.value !== (plan.ends_on ?? "") &&
                updatePlan.mutate({ ends_on: e.target.value || null })
              }
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("plan.totalDay", {
            kcal: formatNumber(totals.kcal, locale, 0),
          })}
        </p>
      </Card>
    </div>
  );
}

function MealEditor({
  meal,
  planId,
  patientId,
  isFirst,
  isLast,
  neighbors,
}: {
  meal: MealWithItems;
  planId: string;
  patientId: string;
  isFirst: boolean;
  isLast: boolean;
  neighbors: [MealWithItems | undefined, MealWithItems | undefined];
}) {
  const { t, locale } = useClinicalI18n();
  const invalidate = [qk.plan(planId), qk.activePlan(patientId)];
  const [adding, setAdding] = useState(false);
  const mains = mainItems(meal.items);
  const totals = sumMacros(mains);

  const updateMeal = useClinicalMutation(
    (patch: Parameters<typeof records.updateMeal>[1]) => records.updateMeal(meal.id, patch),
    { invalidate },
  );
  const removeMeal = useClinicalMutation(() => records.deleteMeal(meal.id), { invalidate });
  const move = useClinicalMutation(
    async (dir: -1 | 1) => {
      const other = neighbors[dir === -1 ? 0 : 1];
      if (!other) return;
      await records.updateMeal(meal.id, { position: other.position });
      await records.updateMeal(other.id, { position: meal.position });
    },
    { invalidate },
  );
  const addItem = useClinicalMutation(
    (v: { choice: FoodChoice; substituteOf?: string }) =>
      records.addItem(newItemFromChoice(meal.id, v.choice, meal.items.length, v.substituteOf)),
    { invalidate },
  );

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-3">
        <input
          key={meal.name}
          className={cn(cellInput, "max-w-xs font-display text-base font-bold")}
          defaultValue={meal.name}
          aria-label={t("plan.mealName")}
          onBlur={(e) =>
            e.target.value.trim() &&
            e.target.value !== meal.name &&
            updateMeal.mutate({ name: e.target.value.trim() })
          }
        />
        <input
          type="time"
          key={meal.time_of_day ?? ""}
          className={cn(cellInput, "w-28")}
          defaultValue={shortTime(meal.time_of_day)}
          aria-label={t("plan.mealTime")}
          onBlur={(e) =>
            e.target.value !== shortTime(meal.time_of_day) &&
            updateMeal.mutate({ time_of_day: e.target.value || null })
          }
        />
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {formatNumber(totals.kcal, locale, 0)} kcal · P{" "}
          {formatNumber(totals.protein_g, locale, 0)} · C {formatNumber(totals.carbs_g, locale, 0)}{" "}
          · G {formatNumber(totals.fat_g, locale, 0)}
        </span>
        <div className="flex">
          <button
            type="button"
            className={buttonGhost}
            disabled={isFirst}
            aria-label={t("plan.moveUp")}
            onClick={() => move.mutate(-1)}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={buttonGhost}
            disabled={isLast}
            aria-label={t("plan.moveDown")}
            onClick={() => move.mutate(1)}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={buttonGhost}
            aria-label={t("plan.deleteMeal")}
            onClick={() =>
              (meal.items.length === 0 || window.confirm(t("plan.deleteMealConfirm"))) &&
              removeMeal.mutate(undefined)
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-semibold">{t("plan.food")}</th>
              <th className="w-24 px-1 py-2 font-semibold">{t("plan.gramsShort")}</th>
              <th className="w-44 px-1 py-2 font-semibold">{t("plan.measure")}</th>
              <th className="w-14 px-1 py-2 text-right font-semibold">kcal</th>
              <th className="w-12 px-1 py-2 text-right font-semibold">P</th>
              <th className="w-12 px-1 py-2 text-right font-semibold">C</th>
              <th className="w-12 px-1 py-2 text-right font-semibold">G</th>
              <th className="w-20 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {mains.map((item) => (
              <ItemRows
                key={item.id}
                item={item}
                subs={substitutesOf(meal.items, item.id)}
                invalidate={invalidate}
                onAddSubstitute={(choice) => addItem.mutate({ choice, substituteOf: item.id })}
              />
            ))}
            {mains.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-3 text-sm text-muted-foreground">
                  {t("plan.emptyMeal")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3">
        {adding ? (
          <FoodSearch
            onPick={(choice) => addItem.mutate({ choice })}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button type="button" className={buttonGhost} onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> {t("plan.addFood")}
          </button>
        )}
        <input
          key={meal.notes ?? ""}
          className={inputClass}
          defaultValue={meal.notes ?? ""}
          placeholder={t("plan.mealNotesPlaceholder")}
          onBlur={(e) =>
            e.target.value !== (meal.notes ?? "") &&
            updateMeal.mutate({ notes: e.target.value.trim() || null })
          }
        />
      </div>
    </Card>
  );
}

function ItemRows({
  item,
  subs,
  invalidate,
  onAddSubstitute,
}: {
  item: MealPlanItem;
  subs: MealPlanItem[];
  invalidate: readonly (readonly unknown[])[];
  onAddSubstitute: (choice: FoodChoice) => void;
}) {
  const { t } = useClinicalI18n();
  const [addingSub, setAddingSub] = useState(false);
  return (
    <>
      <ItemRow item={item} invalidate={invalidate} onSubstitute={() => setAddingSub(true)} />
      {subs.map((s) => (
        <ItemRow key={s.id} item={s} invalidate={invalidate} isSubstitute />
      ))}
      {addingSub && (
        <tr>
          <td colSpan={8} className="px-3 pb-3 pl-9">
            <FoodSearch
              placeholder={t("plan.searchSubstitute")}
              onPick={(c) => {
                onAddSubstitute(c);
                setAddingSub(false);
              }}
              onCancel={() => setAddingSub(false)}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function ItemRow({
  item,
  invalidate,
  isSubstitute,
  onSubstitute,
}: {
  item: MealPlanItem;
  invalidate: readonly (readonly unknown[])[];
  isSubstitute?: boolean;
  onSubstitute?: () => void;
}) {
  const { t, locale } = useClinicalI18n();
  const update = useClinicalMutation(
    (patch: Parameters<typeof records.updateItem>[1]) => records.updateItem(item.id, patch),
    {
      invalidate: [...invalidate],
    },
  );
  const remove = useClinicalMutation(() => records.deleteItem(item.id), {
    invalidate: [...invalidate],
  });
  const n = (v: number) => formatNumber(Number(v), locale, 0);

  return (
    <tr
      className={cn(
        "border-t border-border/40",
        isSubstitute && "bg-secondary/40 text-muted-foreground",
      )}
    >
      <td className="px-3 py-1.5">
        <span className="flex items-center gap-1.5">
          {isSubstitute && (
            <>
              <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="text-[10px] font-bold uppercase text-accent">{t("plan.or")}</span>
            </>
          )}
          <span className={cn("text-foreground", isSubstitute && "text-muted-foreground")}>
            {item.food_name}
          </span>
        </span>
      </td>
      <td className="px-1 py-1.5">
        <input
          key={String(item.quantity_g)}
          inputMode="decimal"
          aria-label={t("plan.grams")}
          className={cn(cellInput, "text-right tabular-nums")}
          defaultValue={String(item.quantity_g)}
          onBlur={(e) => {
            const g = Number(e.target.value.replace(",", "."));
            if (g > 0 && g !== Number(item.quantity_g)) update.mutate(rescaleItem(item, g));
          }}
        />
      </td>
      <td className="px-1 py-1.5">
        <input
          key={item.household_measure ?? ""}
          aria-label={t("plan.measure")}
          className={cellInput}
          defaultValue={item.household_measure ?? ""}
          placeholder="—"
          onBlur={(e) =>
            e.target.value !== (item.household_measure ?? "") &&
            update.mutate({ household_measure: e.target.value.trim() || null })
          }
        />
      </td>
      <td className="px-1 py-1.5 text-right tabular-nums">{n(item.kcal)}</td>
      <td className="px-1 py-1.5 text-right tabular-nums">{n(item.protein_g)}</td>
      <td className="px-1 py-1.5 text-right tabular-nums">{n(item.carbs_g)}</td>
      <td className="px-1 py-1.5 text-right tabular-nums">{n(item.fat_g)}</td>
      <td className="px-2 py-1.5 text-right">
        <span className="inline-flex">
          {!isSubstitute && onSubstitute && (
            <button
              type="button"
              className={cn(buttonGhost, "px-2")}
              title={t("plan.addSubstitute")}
              aria-label={t("plan.addSubstitute")}
              onClick={onSubstitute}
            >
              <CornerDownRight className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className={cn(buttonGhost, "px-2")}
            aria-label={t("common.remove")}
            onClick={() => remove.mutate(undefined)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      </td>
    </tr>
  );
}
