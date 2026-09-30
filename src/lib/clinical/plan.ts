import { sumMacros, type Macros } from "./calc";
import type { FullMealPlan, MealPlanItem } from "./records";

/** Itens principais (as substituições ficam penduradas neles). */
export const mainItems = (items: MealPlanItem[]) => items.filter((i) => !i.substitute_of);

export const substitutesOf = (items: MealPlanItem[], id: string) =>
  items.filter((i) => i.substitute_of === id);

/** Totais do dia considerando só os itens principais. */
export function planTotals(plan: FullMealPlan): Macros {
  return sumMacros(plan.meals.flatMap((m) => mainItems(m.items)));
}

/** Recalcula os nutrientes de um item para outra quantidade (valores são lineares na massa). */
export function rescaleItem(item: MealPlanItem, grams: number) {
  const f = grams / Number(item.quantity_g || 1);
  const r = (v: number) => Math.round(Number(v) * f * 10) / 10;
  return {
    quantity_g: grams,
    kcal: r(item.kcal),
    protein_g: r(item.protein_g),
    carbs_g: r(item.carbs_g),
    fat_g: r(item.fat_g),
  };
}
