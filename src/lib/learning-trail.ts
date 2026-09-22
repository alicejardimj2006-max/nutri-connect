// Trilha de Aprendizado: montagem do conteúdo, progresso, pontuação e conquistas.
import { BASE_UNITS } from "./trail-content-base";
import { STOP_EXTRAS } from "./trail-content-levels";
import { ADULT_EXTRAS } from "./trail-content-adult";
import { KID_TRAILS } from "./trail-content-kids";
import {
  LEVEL_META,
  type Activity,
  type Level,
  type LevelNumber,
  type SceneId,
  type ProfileKind,
  type Stop,
  type StopProgress,
  type Trail,
  type TrailProgress,
  type Unit,
} from "./trail-types";

export * from "./trail-types";

/* --------------------------------- Conteúdo --------------------------------- */

const SCENES: Record<string, SceneId> = {
  "unit-1": "meadow",
  "unit-2": "orchard",
  "unit-3": "kitchen",
  "unit-4": "lake",
};

/** Ícone (lucide) de cada parada adulta. */
const STOP_ICON_KEYS: Record<string, string> = {
  "lesson-1-1": "Beef",
  "lesson-1-2": "Apple",
  "lesson-1-3": "Droplets",
  "lesson-2-1": "Factory",
  "lesson-2-2": "Search",
  "lesson-2-3": "ClipboardList",
  "lesson-3-1": "UtensilsCrossed",
  "lesson-3-2": "Sprout",
  "lesson-3-3": "ShoppingBasket",
  "lesson-4-1": "HeartHandshake",
  "lesson-4-2": "Brain",
  "lesson-4-3": "Smile",
};

/** Monta o conteúdo adulto: cartão de explicação + atividades base + atividades extras, em cada nível. */
const ADULT_UNITS: Unit[] = BASE_UNITS.map((unit) => ({
  id: unit.id,
  title: unit.title,
  icon: unit.icon,
  description: unit.description,
  requiredUnitId: unit.requiredUnitId,
  scene: SCENES[unit.id] ?? "meadow",
  stops: unit.lessons.map((lesson): Stop => {
    const extras = STOP_EXTRAS[lesson.id];
    const adult = ADULT_EXTRAS[lesson.id];
    const build = (n: LevelNumber, activities: Activity[]): Level => ({
      id: `${lesson.id}-l${n}`,
      level: n,
      activities,
    });
    const withIds = (n: LevelNumber, drafts: object[], tag = ""): Activity[] =>
      drafts.map((d, i) => ({ ...d, id: `${lesson.id}-l${n}-${tag}${i + 1}` }) as Activity);
    return {
      id: lesson.id,
      title: lesson.title,
      icon: extras?.icon ?? "📘",
      iconKey: STOP_ICON_KEYS[lesson.id],
      summary: extras?.summary ?? "",
      levels: [
        build(1, [
          ...withIds(1, adult ? [adult.concepts[0]] : [], "c"),
          ...lesson.activities,
          ...withIds(1, extras?.level1Extra ?? [], "x"),
        ]),
        build(2, [
          ...withIds(2, adult ? [adult.concepts[1]] : [], "c"),
          ...withIds(2, extras?.level2 ?? []),
          ...withIds(2, adult?.extra2 ?? [], "x"),
        ]),
        build(3, [
          ...withIds(3, adult ? [adult.concepts[2]] : [], "c"),
          ...withIds(3, extras?.level3 ?? []),
          ...withIds(3, adult?.extra3 ?? [], "x"),
        ]),
      ],
    };
  }),
}));

const adultUnit = (id: string) => ADULT_UNITS.find((u) => u.id === id)!;

/** Cada trilha é um grande tema; as unidades de uma trilha se encadeiam entre si. */
const chain = (units: Unit[]): Unit[] =>
  units.map((u) => ({
    ...u,
    requiredUnitId: units.some((o) => o.id === u.requiredUnitId) ? u.requiredUnitId : undefined,
  }));

export const ADULT_TRAILS: Trail[] = [
  {
    id: "nutrientes",
    kind: "adult",
    title: "Fundamentos da Nutrição",
    tagline: "Nutrientes e hidratação",
    description:
      "Macronutrientes, vitaminas, minerais, água e fibras: a base para entender o que o corpo precisa.",
    icon: "🧬",
    guide: "nina",
    scene: "meadow",
    units: chain([adultUnit("unit-1")]),
  },
  {
    id: "escolhas",
    kind: "adult",
    title: "Alimentos e Escolhas",
    tagline: "Rótulos, prato e rotina",
    description:
      "Do grau de processamento ao prato equilibrado: como ler rótulos, temperar e planejar a semana.",
    icon: "🛒",
    guide: "nina",
    scene: "kitchen",
    units: chain([adultUnit("unit-2"), adultUnit("unit-3")]),
  },
  {
    id: "bem-estar",
    kind: "adult",
    title: "Mente e Bem-estar",
    tagline: "Comportamento alimentar",
    description: "Fome emocional, atenção plena e uma relação mais leve com a comida, sem culpa.",
    icon: "🧠",
    guide: "nina",
    scene: "lake",
    units: chain([adultUnit("unit-4")]),
  },
];

export const TRAILS_BY_KIND: Record<ProfileKind, Trail[]> = {
  adult: ADULT_TRAILS,
  kid: KID_TRAILS,
};

export const getTrails = (kind: ProfileKind) => TRAILS_BY_KIND[kind];
export const getUnits = (kind: ProfileKind) => getTrails(kind).flatMap((t) => t.units);
export const getStops = (kind: ProfileKind) => getUnits(kind).flatMap((u) => u.stops);

const EVERY_TRAIL = [...ADULT_TRAILS, ...KID_TRAILS];
export const ALL_STOPS: Stop[] = EVERY_TRAIL.flatMap((t) => t.units.flatMap((u) => u.stops));

export const findTrailOfStop = (stopId: string) =>
  EVERY_TRAIL.find((t) => t.units.some((u) => u.stops.some((s) => s.id === stopId)));
export const findUnitOfStop = (stopId: string) =>
  EVERY_TRAIL.flatMap((t) => t.units).find((u) => u.stops.some((s) => s.id === stopId));

export const DAILY_GOAL_XP = 50;

/* -------------------------------- Progresso -------------------------------- */

export const TRAIL_CHANGE_EVENT = "trail-change";
const LEGACY_KEY = "nutriconnect_trail_v2";

/** O progresso é guardado por conta e por perfil (adulto ou infantil). */
let scope = "guest:adult";
export function setTrailScope(userId: string, profileId: string) {
  scope = `${userId}:${profileId}`;
}
const storageKey = () => `nutriconnect_trail_v3:${scope}`;

const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const daysBetween = (a: string, b: string) => {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
};

export const emptyProgress = (): TrailProgress => ({
  stops: {},
  totalXP: 0,
  streak: 0,
  lastActiveDay: null,
  daily: { day: dayKey(), xp: 0 },
  achievements: [],
  perfectLevels: 0,
  bestCombo: 0,
});

/** O perfil adulto herda o progresso salvo antes de existirem perfis (formato v2, sem escopo). */
function migrateLegacy(): TrailProgress | null {
  if (!scope.endsWith(":adult")) return null;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    return raw ? { ...emptyProgress(), ...(JSON.parse(raw) as TrailProgress) } : null;
  } catch {
    return null;
  }
}

export function loadTrailProgress(): TrailProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) return { ...emptyProgress(), ...(JSON.parse(raw) as TrailProgress) };
  } catch (e) {
    console.error("Erro ao ler progresso da trilha", e);
  }
  return migrateLegacy() ?? emptyProgress();
}

export function saveTrailProgress(progress: TrailProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(), JSON.stringify(progress));
  window.dispatchEvent(new Event(TRAIL_CHANGE_EVENT));
}

export const getStopProgress = (progress: TrailProgress, stopId: string): StopProgress =>
  progress.stops[stopId] ?? { done: 0, stars: [0, 0, 0] };

/** A parada está dourada quando os 3 níveis foram concluídos. */
export const isStopGold = (progress: TrailProgress, stopId: string) =>
  getStopProgress(progress, stopId).done === 3;

export const isUnitGold = (progress: TrailProgress, unit: Unit) =>
  unit.stops.every((s) => isStopGold(progress, s.id));

/** A unidade abre quando a anterior teve todas as paradas com ao menos o nível 1. */
export function isUnitUnlocked(unit: Unit, progress: TrailProgress, units: Unit[]) {
  if (!unit.requiredUnitId) return true;
  const required = units.find((u) => u.id === unit.requiredUnitId);
  if (!required) return true;
  return required.stops.every((s) => getStopProgress(progress, s.id).done >= 1);
}

/** Uma parada abre quando a anterior da mesma unidade teve ao menos o nível 1 concluído. */
export function isStopUnlocked(
  unit: Unit,
  stopIndex: number,
  progress: TrailProgress,
  units: Unit[],
) {
  if (!isUnitUnlocked(unit, progress, units)) return false;
  if (stopIndex === 0) return true;
  return getStopProgress(progress, unit.stops[stopIndex - 1].id).done >= 1;
}

/** Um nível abre depois que o anterior da mesma parada foi concluído. */
export const isLevelUnlocked = (progress: TrailProgress, stopId: string, level: LevelNumber) =>
  getStopProgress(progress, stopId).done >= level - 1;

/** Parada atual: a primeira aberta ainda sem nenhum nível; senão, a primeira ainda não dourada. */
export function getCurrentStopId(progress: TrailProgress, units: Unit[]): string | null {
  for (const unit of units) {
    for (let i = 0; i < unit.stops.length; i++) {
      const stop = unit.stops[i];
      if (
        isStopUnlocked(unit, i, progress, units) &&
        getStopProgress(progress, stop.id).done === 0
      ) {
        return stop.id;
      }
    }
  }
  for (const unit of units) {
    for (let i = 0; i < unit.stops.length; i++) {
      const stop = unit.stops[i];
      if (isStopUnlocked(unit, i, progress, units) && !isStopGold(progress, stop.id))
        return stop.id;
    }
  }
  return null;
}

export function getTrailTotals(progress: TrailProgress, kind: ProfileKind) {
  const stopsOfKind = getStops(kind);
  let levels = 0;
  let stars = 0;
  let gold = 0;
  for (const stop of stopsOfKind) {
    const p = getStopProgress(progress, stop.id);
    levels += p.done;
    stars += p.stars.reduce((a, b) => a + b, 0);
    if (p.done === 3) gold++;
  }
  const totalLevels = stopsOfKind.length * 3;
  return {
    levels,
    stars,
    gold,
    totalLevels,
    totalStops: stopsOfKind.length,
    maxStars: totalLevels * 3,
  };
}

/** Resumo de uma trilha (um grande tema) para os cartões de escolha. */
export function getTrailSummary(progress: TrailProgress, trail: Trail) {
  const stops = trail.units.flatMap((u) => u.stops);
  const levels = stops.reduce((sum, s) => sum + getStopProgress(progress, s.id).done, 0);
  const gold = stops.filter((s) => isStopGold(progress, s.id)).length;
  return {
    stops: stops.length,
    levels,
    totalLevels: stops.length * 3,
    gold,
    pct: stops.length > 0 ? Math.round((levels / (stops.length * 3)) * 100) : 0,
  };
}

export function getDailyXP(progress: TrailProgress) {
  return progress.daily.day === dayKey() ? progress.daily.xp : 0;
}

/** A ofensiva só vale se a última atividade foi hoje ou ontem. */
export function getActiveStreak(progress: TrailProgress) {
  if (!progress.lastActiveDay) return 0;
  return daysBetween(progress.lastActiveDay, dayKey()) <= 1 ? progress.streak : 0;
}

/* ------------------------------- Conquistas ------------------------------- */

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (p: TrailProgress, kind: ProfileKind) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-step",
    title: "Primeiro Passo",
    description: "Conclua seu primeiro nível.",
    icon: "👣",
    check: (p, k) => getTrailTotals(p, k).levels >= 1,
  },
  {
    id: "streak-3",
    title: "Pegando o Ritmo",
    description: "Estude 3 dias seguidos.",
    icon: "🔥",
    check: (p) => p.streak >= 3,
  },
  {
    id: "streak-7",
    title: "Semana de Ouro",
    description: "Estude 7 dias seguidos.",
    icon: "📅",
    check: (p) => p.streak >= 7,
  },
  {
    id: "perfect",
    title: "Sem Errar!",
    description: "Conclua um nível sem nenhum erro.",
    icon: "🎯",
    check: (p) => p.perfectLevels >= 1,
  },
  {
    id: "impeccable",
    title: "Impecável",
    description: "Conclua 5 níveis sem nenhum erro.",
    icon: "💎",
    check: (p) => p.perfectLevels >= 5,
  },
  {
    id: "combo-5",
    title: "Combo em Chamas",
    description: "Acerte 5 respostas seguidas em um nível.",
    icon: "⚡",
    check: (p) => p.bestCombo >= 5,
  },
  {
    id: "first-gold",
    title: "Parada Dourada",
    description: "Deixe uma parada dourada concluindo os 3 níveis.",
    icon: "🏅",
    check: (p, k) => getTrailTotals(p, k).gold >= 1,
  },
  {
    id: "unit-gold",
    title: "Unidade Reluzente",
    description: "Deixe todas as paradas de uma unidade douradas.",
    icon: "👑",
    check: (p, k) => getUnits(k).some((u) => isUnitGold(p, u)),
  },
  {
    id: "xp-500",
    title: "Colecionador de XP",
    description: "Some 500 XP na trilha.",
    icon: "✨",
    check: (p) => p.totalXP >= 500,
  },
  {
    id: "explorer",
    title: "Explorador",
    description: "Conclua o nível 1 de todas as paradas.",
    icon: "🧭",
    check: (p, k) => getStops(k).every((s) => getStopProgress(p, s.id).done >= 1),
  },
  {
    id: "master",
    title: "Mestre da Nutrição",
    description: "Deixe todas as paradas da trilha douradas.",
    icon: "🏆",
    check: (p, k) => getStops(k).every((s) => isStopGold(p, s.id)),
  },
];

/* -------------------------------- Pontuação -------------------------------- */

export interface LevelResult {
  /** Acertos na primeira tentativa. */
  correct: number;
  total: number;
  mistakes: number;
  maxCombo: number;
}

/** Estrelas: 3 = sem erros, 2 = pelo menos 80%, 1 = passou. */
export function starsFor(correct: number, total: number): number {
  if (total === 0) return 3;
  const ratio = correct / total;
  return ratio >= 1 ? 3 : ratio >= 0.8 ? 2 : 1;
}

export interface LevelReward {
  stars: number;
  previousStars: number;
  firstTime: boolean;
  xp: { base: number; combo: number; perfect: number; practice: number };
  totalGained: number;
  becameGold: boolean;
  becameUnitGold: boolean;
  streak: number;
  streakIncreased: boolean;
  dailyXP: number;
  dailyGoalReached: boolean;
  newAchievements: AchievementDef[];
}

/**
 * Registra a conclusão de um nível.
 * Primeira vez: XP base + bônus de combo (2 por acerto seguido, até 10) + bônus de perfeição (10).
 * Repetição: 10 XP de prática + 15 por estrela ganha a mais.
 */
export function completeLevel(
  stopId: string,
  level: LevelNumber,
  result: LevelResult,
): LevelReward {
  const progress = loadTrailProgress();
  const unit = findUnitOfStop(stopId);
  const kind: ProfileKind = findTrailOfStop(stopId)?.kind ?? "adult";
  const stop = getStopProgress(progress, stopId);
  const stars = starsFor(result.correct, result.total);
  const previousStars = stop.stars[level - 1];
  const firstTime = stop.done < level;
  const wasGold = stop.done === 3;
  const wasUnitGold = unit ? isUnitGold(progress, unit) : false;

  const xp = { base: 0, combo: 0, perfect: 0, practice: 0 };
  if (firstTime) {
    xp.base = LEVEL_META[level].xp;
    xp.combo = Math.min(result.maxCombo, 10) * 2;
    xp.perfect = stars === 3 ? 10 : 0;
  } else {
    xp.practice = 10 + Math.max(0, stars - previousStars) * 15;
  }
  const totalGained = xp.base + xp.combo + xp.perfect + xp.practice;

  const nextStars = [...stop.stars] as [number, number, number];
  nextStars[level - 1] = Math.max(previousStars, stars);
  progress.stops[stopId] = {
    done: Math.max(stop.done, level) as 0 | 1 | 2 | 3,
    stars: nextStars,
  };

  progress.totalXP += totalGained;
  progress.bestCombo = Math.max(progress.bestCombo, result.maxCombo);
  if (stars === 3 && firstTime) progress.perfectLevels += 1;

  // Ofensiva diária e meta do dia
  const today = dayKey();
  let streakIncreased = false;
  if (progress.lastActiveDay !== today) {
    const gap = progress.lastActiveDay ? daysBetween(progress.lastActiveDay, today) : null;
    progress.streak = gap === 1 ? progress.streak + 1 : 1;
    progress.lastActiveDay = today;
    streakIncreased = true;
  }
  const dailyBefore = progress.daily.day === today ? progress.daily.xp : 0;
  progress.daily = { day: today, xp: dailyBefore + totalGained };

  const newAchievements = ACHIEVEMENTS.filter(
    (a) => !progress.achievements.includes(a.id) && a.check(progress, kind),
  );
  progress.achievements.push(...newAchievements.map((a) => a.id));

  saveTrailProgress(progress);

  return {
    stars,
    previousStars,
    firstTime,
    xp,
    totalGained,
    becameGold: !wasGold && level === 3,
    becameUnitGold: !!unit && !wasUnitGold && isUnitGold(progress, unit),
    streak: progress.streak,
    streakIncreased,
    dailyXP: progress.daily.xp,
    dailyGoalReached: dailyBefore < DAILY_GOAL_XP && progress.daily.xp >= DAILY_GOAL_XP,
    newAchievements,
  };
}
