import { addDays, toDateKey } from "./format";
import type { Goal, GoalCheckin } from "./records";

export const GOAL_ICONS = ["💧", "🍎", "🥗", "🚶‍♀️", "🏃", "🌙", "🍳", "🥦", "🧘", "🍽️", "📵", "🎯"];

export function lastDays(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => toDateKey(addDays(today, i - n + 1)));
}

const valueOn = (goal: Goal, checkins: GoalCheckin[], day: string) =>
  Number(checkins.find((x) => x.goal_id === goal.id && x.day === day)?.value ?? 0);

/**
 * Sequência gentil: conta os dias em que a pessoa cuidou da meta (qualquer registro vale, não
 * precisa bater 100%). Um dia sem registro no meio não quebra a sequência; só dois seguidos.
 * Hoje ainda sem registro também não quebra (o dia não acabou).
 * `days` vem em ordem, do mais antigo para hoje.
 */
export function gentleStreak(goal: Goal, checkins: GoalCheckin[], days: string[]) {
  let practiced = 0;
  let gap = 0;
  let start: string | null = null;
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i];
    if (valueOn(goal, checkins, d) > 0) {
      practiced++;
      gap = 0;
      start = d;
    } else if (i !== days.length - 1) {
      gap++;
      if (gap >= 2) break;
    }
  }
  const last7 = days.slice(-7).filter((d) => valueOn(goal, checkins, d) > 0).length;
  const doneToday = valueOn(goal, checkins, days[days.length - 1]) > 0;
  return { practiced, since: start, last7, doneToday };
}

/** % de cumprimento por semana (de 7 em 7 dias, terminando hoje), da mais antiga para a atual. */
export function weeklyAdherence(goal: Goal, checkins: GoalCheckin[], days: string[]) {
  const weeks: { from: string; to: string; pct: number }[] = [];
  for (let end = days.length; end >= 7; end -= 7) {
    const slice = days.slice(end - 7, end);
    weeks.unshift({ from: slice[0], to: slice[6], pct: adherence(goal, checkins, slice) });
  }
  return weeks;
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
