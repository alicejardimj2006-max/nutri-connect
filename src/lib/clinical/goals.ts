import { addDays, toDateKey } from "./format";
import type { Goal, GoalCheckin } from "./records";

export const GOAL_ICONS = ["💧", "🍎", "🥗", "🚶‍♀️", "🏃", "🌙", "🍳", "🥦", "🧘", "🍽️", "📵", "🎯"];

export function lastDays(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => toDateKey(addDays(today, i - n + 1)));
}

/** % de cumprimento de uma meta num conjunto de dias (cada dia limitado a 100%). */
export function adherence(goal: Goal, checkins: GoalCheckin[], days: string[]): number {
  const target = Number(goal.target_value) || 1;
  const total = days.reduce((acc, d) => {
    const c = checkins.find((x) => x.goal_id === goal.id && x.day === d);
    return acc + Math.min(1, (c ? Number(c.value) : 0) / target);
  }, 0);
  return Math.round((total / days.length) * 100);
}
