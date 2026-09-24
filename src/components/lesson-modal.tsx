import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Crown, Flame, Heart, Lightbulb, Star, X } from "lucide-react";
import { Mascot, type MascotMood } from "@/components/mascots";
import { t } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n";
import { LEVEL_LABEL_KEYS } from "@/lib/i18n/content";
import { Scenery, Sparkles } from "@/components/trail-scenery";
import { burstFrom, celebrate, fireConfetti, GOLD_COLORS } from "@/lib/confetti";
import {
  LEVEL_META,
  completeLevel,
  isGraded,
  starsFor,
  type Activity,
  type AchievementDef,
  type CharacterId,
  type LevelNumber,
  type LevelReward,
  type ProfileKind,
  type Stop,
  type Unit,
} from "@/lib/learning-trail";
import { getUserLevel } from "@/lib/community";

export interface LessonModalProps {
  stop: Stop;
  level: LevelNumber;
  unit: Unit;
  /** Perfil adulto (visual sóbrio) ou infantil (lúdico). */
  variant: ProfileKind;
  /** Personagem guia da trilha, que reage ao resultado. */
  guide: CharacterId;
  /** XP total do usuário antes da lição (trilha + desafios), para detectar subida de nível. */
  xpBefore: number;
  onClose: () => void;
  onNextLevel: (level: LevelNumber) => void;
}

/* ------------------------------ Utilidades ------------------------------ */

type Answer = number | boolean | number[] | Record<number, number> | string | null;

const initialAnswer = (a: Activity): Answer => {
  switch (a.type) {
    case "multi":
    case "order":
      return [];
    case "match":
    case "sort":
      return {};
    default:
      return null;
  }
};

const isReady = (a: Activity, ans: Answer) => {
  switch (a.type) {
    case "quiz":
    case "true_false":
      return ans !== null;
    case "multi":
      return (ans as number[]).length > 0;
    case "match":
      return Object.keys(ans as Record<number, number>).length === a.pairs.length;
    case "order":
      return (ans as number[]).length === a.items.length;
    case "sort":
      return Object.keys(ans as Record<number, number>).length === a.items.length;
    case "fill":
      return ans !== null;
    case "slider":
    case "scenario":
      return ans !== null;
    default:
      return true;
  }
};

const isCorrect = (a: Activity, ans: Answer) => {
  switch (a.type) {
    case "quiz":
      return ans === a.correctIndex;
    case "true_false":
      return ans === a.isTrue;
    case "multi": {
      const chosen = [...(ans as number[])].sort();
      const right = [...a.correctIndexes].sort();
      return chosen.length === right.length && chosen.every((v, i) => v === right[i]);
    }
    case "match":
      return a.pairs.every((_, i) => (ans as Record<number, number>)[i] === i);
    case "order":
      return (ans as number[]).every((v, i) => v === i);
    case "sort":
      return a.items.every((it, i) => (ans as Record<number, number>)[i] === it.group);
    case "fill":
      return ans === a.correctIndex;
    case "scenario":
      return ans === a.correctIndex;
    case "slider":
      return Math.abs((ans as number) - a.target) <= a.tolerance;
    default:
      return true;
  }
};

/** Texto da resposta certa, mostrado quando o jogador erra. */
const rightAnswerText = (a: Activity): string | null => {
  switch (a.type) {
    case "quiz":
      return a.options[a.correctIndex];
    case "true_false":
      return a.isTrue ? t("lm.true") : t("lm.false");
    case "multi":
      return a.correctIndexes.map((i) => a.options[i]).join(" • ");
    case "match":
      return a.pairs.map((p) => `${p.left} → ${p.right}`).join(" • ");
    case "order":
      return a.items.map((t, i) => `${i + 1}. ${t}`).join("  ");
    case "sort":
      return a.groups
        .map(
          (g, gi) =>
            `${g}: ${a.items
              .filter((it) => it.group === gi)
              .map((it) => it.text)
              .join(", ")}`,
        )
        .join(" • ");
    case "fill":
      return a.options[a.correctIndex];
    case "scenario":
      return a.options[a.correctIndex];
    case "slider":
      return t("lm.near").replace("{v}", `${a.target}${a.unit}`);
    default:
      return null;
  }
};

/** Embaralhamento estável (mesma atividade, mesma ordem) para não mudar a cada renderização. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CORRECT_MSGS: DictKey[] = ["lm.ok1", "lm.ok2", "lm.ok3", "lm.ok4", "lm.ok5", "lm.ok6"];
const WRONG_MSGS: DictKey[] = ["lm.bad1", "lm.bad2", "lm.bad3", "lm.bad4"];
const pick = (arr: DictKey[], i: number) => t(arr[i % arr.length]);

const MATCH_COLORS = [
  { bg: "bg-sky-100 dark:bg-sky-500/20", border: "border-sky-400", badge: "bg-sky-500" },
  { bg: "bg-amber-100 dark:bg-amber-500/20", border: "border-amber-400", badge: "bg-amber-500" },
  {
    bg: "bg-violet-100 dark:bg-violet-500/20",
    border: "border-violet-400",
    badge: "bg-violet-500",
  },
  { bg: "bg-rose-100 dark:bg-rose-500/20", border: "border-rose-400", badge: "bg-rose-500" },
];

/* ----------------------------- Texto com destaque ----------------------------- */

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-black text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Fala com efeito de digitação (palavra por palavra); tocar na fala mostra tudo. */
function Typewriter({ text }: { text: string }) {
  const words = useMemo(() => text.split(" "), [text]);
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = window.setInterval(() => {
      setN((v) => {
        if (v >= words.length) {
          window.clearInterval(t);
          return v;
        }
        return v + 1;
      });
    }, 55);
    return () => window.clearInterval(t);
  }, [words]);
  let shown = words.slice(0, n).join(" ");
  if ((shown.match(/\*\*/g)?.length ?? 0) % 2 === 1) shown += "**";
  return (
    <span onClick={() => setN(words.length)} className="cursor-pointer">
      <RichText text={shown} />
      {n < words.length && <span className="nc-twinkle ml-0.5 inline-block">▍</span>}
    </span>
  );
}

/* ------------------------------- Atividades ------------------------------- */

interface ActivityProps<A extends Activity> {
  activity: A;
  answer: Answer;
  onChange: (a: Answer) => void;
  checked: boolean;
  correct: boolean;
  mood: MascotMood;
  moodKey: string;
}

function Ask({
  character,
  mood,
  moodKey,
  children,
}: {
  character?: { id: CharacterId };
  mood: MascotMood;
  moodKey: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end gap-3 sm:gap-4">
      {character && <Mascot key={moodKey} id={character.id} mood={mood} size={76} />}
      <div className="relative min-w-0 flex-1 rounded-3xl rounded-bl-none border-2 border-border bg-card px-4 py-3.5 shadow-sm sm:px-5 sm:py-4">
        <h2 className="font-display text-lg font-extrabold leading-snug text-foreground sm:text-2xl">
          {children}
        </h2>
      </div>
    </div>
  );
}

const optionBase =
  "w-full rounded-2xl border-2 border-b-4 p-3.5 text-left text-base font-semibold transition-all duration-150 sm:p-4 sm:text-lg";

function optionState(selected: boolean, checked: boolean, isRight: boolean) {
  if (checked) {
    if (isRight)
      return "border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100";
    if (selected)
      return "border-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100 nc-shake";
    return "border-border bg-card opacity-50";
  }
  return selected
    ? "border-primary bg-primary-soft/60 shadow-sm translate-y-0.5 border-b-2"
    : "border-border bg-card hover:border-primary/50 hover:bg-secondary/40 active:translate-y-0.5 active:border-b-2 cursor-pointer";
}

function QuizView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "quiz" }>>) {
  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.question}
      </Ask>
      <div className="grid gap-3">
        {activity.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={checked}
            onClick={() => onChange(i)}
            className={`${optionBase} ${optionState(answer === i, checked, i === activity.correctIndex)}`}
          >
            <span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-lg border-2 border-current/30 text-xs font-black opacity-70">
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrueFalseView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "true_false" }>>) {
  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.statement}
      </Ask>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            disabled={checked}
            onClick={() => onChange(v)}
            className={`${optionBase} flex flex-col items-center gap-1 py-6 text-center text-xl font-black sm:py-8 ${optionState(
              answer === v,
              checked,
              activity.isTrue === v,
            )}`}
          >
            <span className="text-3xl sm:text-4xl">{v ? "👍" : "👎"}</span>
            {v ? t("lm.true") : t("lm.false")}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "multi" }>>) {
  const chosen = answer as number[];
  const toggle = (i: number) =>
    onChange(chosen.includes(i) ? chosen.filter((v) => v !== i) : [...chosen, i]);
  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.question}
      </Ask>
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
        {t("lm.multiHint")}
      </p>
      <div className="grid gap-3">
        {activity.options.map((opt, i) => {
          const selected = chosen.includes(i);
          const right = activity.correctIndexes.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => toggle(i)}
              className={`${optionBase} flex items-center gap-3 ${optionState(selected, checked, right)}`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 ${
                  selected || (checked && right)
                    ? "border-current bg-current/15"
                    : "border-current/30"
                }`}
              >
                {(selected || (checked && right)) && (
                  <Check className="h-4 w-4" strokeWidth={3.5} />
                )}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "match" }>>) {
  const pairs = answer as Record<number, number>;
  const rightOrder = useMemo(
    () =>
      seededShuffle(
        activity.pairs.map((_, i) => i),
        activity.id,
      ),
    [activity],
  );
  const [selectedLeft, setSelectedLeft] = useState<number | null>(0);
  const owner = (rightIdx: number) =>
    Object.keys(pairs)
      .map(Number)
      .find((l) => pairs[l] === rightIdx);
  const nextFree = (from: Record<number, number>) =>
    activity.pairs.findIndex((_, i) => from[i] === undefined);

  const pickLeft = (i: number) => {
    if (checked) return;
    if (pairs[i] !== undefined) {
      const next = { ...pairs };
      delete next[i];
      onChange(next);
    }
    setSelectedLeft(i);
  };
  const pickRight = (j: number) => {
    if (checked || selectedLeft === null) return;
    const next = { ...pairs };
    const prevOwner = owner(j);
    if (prevOwner !== undefined) delete next[prevOwner];
    next[selectedLeft] = j;
    onChange(next);
    const free = nextFree(next);
    setSelectedLeft(free === -1 ? null : free);
  };

  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.prompt}
      </Ask>
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
        {t("lm.matchHint")}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <div className="grid content-start gap-3">
          {activity.pairs.map((p, i) => {
            const color = MATCH_COLORS[i % MATCH_COLORS.length];
            const paired = pairs[i] !== undefined;
            const right = checked ? pairs[i] === i : true;
            return (
              <button
                key={i}
                type="button"
                disabled={checked}
                onClick={() => pickLeft(i)}
                className={`rounded-2xl border-2 border-b-4 p-3 text-left text-sm font-bold transition sm:text-base ${
                  checked
                    ? right
                      ? "border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100"
                      : "nc-shake border-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100"
                    : paired
                      ? `${color.bg} ${color.border}`
                      : selectedLeft === i
                        ? "border-primary bg-primary-soft/60 ring-2 ring-primary/40"
                        : "cursor-pointer border-border bg-card hover:bg-secondary/40"
                }`}
              >
                <span
                  className={`mr-2 inline-grid h-5 w-5 place-items-center rounded-md text-[10px] font-black text-white ${paired || checked ? color.badge : "bg-muted-foreground/40"}`}
                >
                  {i + 1}
                </span>
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="grid content-start gap-3">
          {rightOrder.map((j) => {
            const l = owner(j);
            const color = l !== undefined ? MATCH_COLORS[l % MATCH_COLORS.length] : null;
            return (
              <button
                key={j}
                type="button"
                disabled={checked}
                onClick={() => pickRight(j)}
                className={`rounded-2xl border-2 border-b-4 p-3 text-left text-sm font-bold transition sm:text-base ${
                  checked
                    ? l === j
                      ? "border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100"
                      : "border-border bg-card opacity-60"
                    : color
                      ? `${color.bg} ${color.border}`
                      : "cursor-pointer border-border bg-card hover:bg-secondary/40"
                }`}
              >
                {l !== undefined && (
                  <span
                    className={`mr-2 inline-grid h-5 w-5 place-items-center rounded-md text-[10px] font-black text-white ${color?.badge}`}
                  >
                    {l + 1}
                  </span>
                )}
                {activity.pairs[j].right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "order" }>>) {
  const chosen = answer as number[];
  const bank = useMemo(() => {
    const idx = activity.items.map((_, i) => i);
    let shuffled = seededShuffle(idx, activity.id);
    // Evita começar já na ordem certa.
    if (shuffled.every((v, i) => v === i)) shuffled = [...shuffled.slice(1), shuffled[0]];
    return shuffled;
  }, [activity]);

  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.prompt}
      </Ask>
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
        {t("lm.orderHint")}
      </p>
      <div className="mb-4 grid min-h-[3.5rem] gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-2.5">
        {activity.items.map((_, slot) => {
          const item = chosen[slot];
          const right = checked ? item === slot : true;
          return item === undefined ? (
            <div
              key={slot}
              className="flex h-11 items-center rounded-xl border-2 border-dashed border-border/70 px-3 text-xs font-black text-muted-foreground/60"
            >
              {slot + 1}
            </div>
          ) : (
            <button
              key={slot}
              type="button"
              disabled={checked}
              onClick={() => onChange(chosen.filter((_, i) => i !== slot))}
              className={`nc-rise flex min-h-11 items-center gap-3 rounded-xl border-2 border-b-4 px-3 py-2 text-left text-sm font-bold sm:text-base ${
                checked
                  ? right
                    ? "border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100"
                    : "nc-shake border-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100"
                  : "cursor-pointer border-primary bg-primary-soft/60"
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
                {slot + 1}
              </span>
              {activity.items[item]}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {bank.map((i) => {
          const used = chosen.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used || checked}
              onClick={() => onChange([...chosen, i])}
              className={`rounded-xl border-2 border-b-4 px-3.5 py-2.5 text-left text-sm font-bold transition sm:text-base ${
                used
                  ? "border-border bg-secondary/50 text-transparent"
                  : "cursor-pointer border-border bg-card hover:border-primary/50 hover:bg-secondary/40 active:translate-y-0.5 active:border-b-2"
              }`}
            >
              {activity.items[i]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Cartão de explicação: ensina o conceito antes das perguntas. */
function ConceptView({ activity }: { activity: Extract<Activity, { type: "concept" }> }) {
  return (
    <div className="nc-rise">
      <div className="mb-4 flex items-end gap-3 sm:gap-4">
        {activity.character && (
          <Mascot key={activity.id} id={activity.character.id} mood="talk" size={92} />
        )}
        <div className="mb-2 min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-primary">
            {activity.emoji && <span className="mr-1">{activity.emoji}</span>}
            {t("lm.beforeStart")}
          </p>
          <h2 className="font-display text-xl font-extrabold leading-snug text-foreground sm:text-3xl">
            {activity.title}
          </h2>
        </div>
      </div>
      <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
          <RichText text={activity.body} />
        </p>
        {activity.points && activity.points.length > 0 && (
          <ul className="mt-4 space-y-2">
            {activity.points.map((pt, i) => (
              <li
                key={i}
                className="nc-rise flex items-start gap-3 rounded-2xl bg-secondary/50 px-3.5 py-2.5 text-sm font-medium text-foreground sm:text-base"
                style={{ animationDelay: `${150 + i * 90}ms` }}
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                  {i + 1}
                </span>
                <span>
                  <RichText text={pt} />
                </span>
              </li>
            ))}
          </ul>
        )}
        {activity.tip && (
          <div className="mt-4 flex gap-3 rounded-2xl border-2 border-amber-400/40 bg-amber-400/10 p-3.5">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm font-semibold leading-snug text-amber-900 dark:text-amber-200">
              {activity.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SortView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "sort" }>>) {
  const picks = answer as Record<number, number>;
  const order = useMemo(
    () =>
      seededShuffle(
        activity.items.map((_, i) => i),
        activity.id,
      ),
    [activity],
  );
  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.prompt}
      </Ask>
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
        {t("lm.sortHint")}
      </p>
      <ul className="grid gap-2.5">
        {order.map((i) => {
          const item = activity.items[i];
          const chosen = picks[i];
          const right = chosen === item.group;
          return (
            <li
              key={i}
              className={`flex flex-col gap-2 rounded-2xl border-2 p-3 sm:flex-row sm:items-center sm:justify-between ${
                checked
                  ? right
                    ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-500/20"
                    : "nc-shake border-rose-500 bg-rose-100 dark:bg-rose-500/20"
                  : chosen !== undefined
                    ? "border-primary/50 bg-primary-soft/40"
                    : "border-border bg-card"
              }`}
            >
              <span className="text-sm font-bold text-foreground sm:text-base">{item.text}</span>
              <div className="flex flex-wrap gap-1.5">
                {activity.groups.map((g, gi) => (
                  <button
                    key={gi}
                    type="button"
                    disabled={checked}
                    onClick={() => onChange({ ...picks, [i]: gi })}
                    className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
                      chosen === gi
                        ? checked
                          ? right
                            ? "border-emerald-600 bg-emerald-500 text-white"
                            : "border-rose-600 bg-rose-500 text-white"
                          : "border-primary bg-primary text-primary-foreground"
                        : checked && gi === item.group
                          ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                          : "cursor-pointer border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FillView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "fill" }>>) {
  const [before, ...rest] = activity.sentence.split("___");
  const after = rest.join("___");
  const chosen = answer as number | null;
  const right = chosen === activity.correctIndex;
  return (
    <div className="nc-rise">
      <div className="mb-6 flex items-end gap-3 sm:gap-4">
        {activity.character && (
          <Mascot key={moodKey} id={activity.character.id} mood={mood} size={76} />
        )}
        <div className="min-w-0 flex-1 rounded-3xl rounded-bl-none border-2 border-border bg-card px-4 py-3.5 shadow-sm sm:px-5 sm:py-4">
          <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            {t("lm.fillHint")}
          </p>
          <p className="font-display text-lg font-extrabold leading-relaxed text-foreground sm:text-2xl">
            {before}
            <span
              className={`mx-1 inline-block min-w-[6rem] border-b-4 px-2 text-center ${
                chosen === null
                  ? "border-dashed border-primary/60 text-transparent"
                  : checked
                    ? right
                      ? "border-emerald-500 text-emerald-600"
                      : "border-rose-500 text-rose-600"
                    : "border-primary text-primary"
              }`}
            >
              {chosen === null ? "____" : activity.options[chosen]}
            </span>
            {after}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {activity.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={checked}
            onClick={() => onChange(i)}
            className={`rounded-2xl border-2 border-b-4 px-4 py-2.5 text-base font-bold transition ${optionState(
              chosen === i,
              checked,
              i === activity.correctIndex,
            )}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScenarioView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "scenario" }>>) {
  return (
    <div className="nc-rise">
      <div className="mb-5 flex items-start gap-3 rounded-3xl border-2 border-dashed border-accent/40 bg-accent/5 p-4 sm:p-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-lg">
          📖
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-accent">
            {t("lm.situation")}
          </p>
          <p className="text-sm font-medium leading-relaxed text-foreground/90 sm:text-base">
            {activity.setup}
          </p>
        </div>
      </div>
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.question}
      </Ask>
      <div className="grid gap-3">
        {activity.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={checked}
            onClick={() => onChange(i)}
            className={`${optionBase} ${optionState(answer === i, checked, i === activity.correctIndex)}`}
          >
            <span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-lg border-2 border-current/30 text-xs font-black opacity-70">
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderView({
  activity,
  answer,
  onChange,
  checked,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "slider" }>>) {
  const chosen = answer as number | null;
  const mid = Math.round((activity.min + activity.max) / 2);
  const shown = chosen ?? mid;
  const right = chosen !== null && Math.abs(chosen - activity.target) <= activity.tolerance;
  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.question}
      </Ask>
      <div
        className={`rounded-3xl border-2 p-5 transition-colors sm:p-6 ${
          checked
            ? right
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
            : "border-border bg-card"
        }`}
      >
        <div className="mb-4 text-center">
          <span
            className={`font-display text-4xl font-black sm:text-5xl ${
              !checked ? "text-primary" : right ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {chosen === null ? "?" : shown}
          </span>
          <span className="ml-1.5 text-lg font-bold text-muted-foreground">{activity.unit}</span>
        </div>
        <input
          type="range"
          aria-label={activity.question}
          min={activity.min}
          max={activity.max}
          step={activity.step ?? 1}
          disabled={checked}
          value={shown}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full cursor-pointer accent-[var(--color-primary)] disabled:cursor-not-allowed"
        />
        <div className="mt-1.5 flex justify-between text-xs font-bold text-muted-foreground">
          <span>
            {activity.min}
            {activity.unit}
          </span>
          <span>
            {activity.max}
            {activity.unit}
          </span>
        </div>
        {checked && (
          <p className="mt-4 text-center text-sm font-bold text-muted-foreground">
            {t("lm.reference")}{" "}
            <span className="text-foreground">
              ~{activity.target}
              {activity.unit}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function ReflectView({
  activity,
  answer,
  onChange,
  mood,
  moodKey,
}: ActivityProps<Extract<Activity, { type: "reflect" }>>) {
  const text = (answer as string | null) ?? "";
  return (
    <div className="nc-rise">
      <Ask character={activity.character} mood={mood} moodKey={moodKey}>
        {activity.prompt}
      </Ask>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={activity.placeholder ?? t("lm.reflectPh")}
        className="w-full resize-none rounded-2xl border-2 border-border bg-card p-4 text-base leading-relaxed text-foreground outline-none transition focus:border-primary"
      />
      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {t("lm.reflectNote")}
      </p>
    </div>
  );
}

/** Depois de um erro: explicação em destaque, com o personagem, para aprender com a resposta. */
function ExplainCard({ activity, guide }: { activity: Activity; guide: CharacterId }) {
  if (!("explanation" in activity)) return null;
  const who = ("character" in activity && activity.character?.id) || guide;
  return (
    <div className="nc-rise mt-5 flex items-start gap-3 rounded-3xl border-2 border-amber-400/50 bg-amber-400/10 p-4">
      <Mascot id={who} mood="talk" size={64} />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">
          <Lightbulb className="h-3.5 w-3.5" /> {t("lm.understand")}
        </p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground sm:text-base">
          {activity.explanation}
        </p>
        {rightAnswerText(activity) && (
          <p className="mt-2 text-xs font-bold text-muted-foreground">
            {t("lm.rightAnswer")} {rightAnswerText(activity)}
          </p>
        )}
      </div>
    </div>
  );
}

function DialogueView({ activity }: { activity: Extract<Activity, { type: "dialogue" }> }) {
  return (
    <div className="nc-rise flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8">
      <div className="text-center">
        <Mascot key={activity.id} id={activity.character.id} mood="talk" size={150} />
        <p className="mt-1 text-xs font-black uppercase tracking-widest text-muted-foreground">
          {activity.character.name}
        </p>
      </div>
      <div className="relative w-full flex-1 rounded-3xl border-2 border-border bg-card p-5 text-lg leading-relaxed text-foreground/90 shadow-sm sm:rounded-bl-none sm:p-6 sm:text-xl">
        <Typewriter text={activity.text} />
      </div>
    </div>
  );
}

/* ---------------------------------- Modal ---------------------------------- */

interface QueueItem {
  activity: Activity;
  retry: boolean;
}

export function LessonModal({
  stop,
  level,
  unit,
  variant,
  guide,
  xpBefore,
  onClose,
  onNextLevel,
}: LessonModalProps) {
  const meta = LEVEL_META[level];
  const levelData = stop.levels[level - 1];
  const adult = variant === "adult";

  const [queue, setQueue] = useState<QueueItem[]>(() =>
    levelData.activities.map((activity) => ({ activity, retry: false })),
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(() => initialAnswer(levelData.activities[0]));
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [hearts, setHearts] = useState(meta.hearts);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [firstCorrect, setFirstCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [phase, setPhase] = useState<"play" | "passed" | "failed">("play");
  const [reward, setReward] = useState<LevelReward | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [heartHit, setHeartHit] = useState(0);
  const [msgSeed, setMsgSeed] = useState(0);
  const savedRef = useRef(false);
  const checkRef = useRef<HTMLButtonElement>(null);

  const totalGraded = levelData.activities.filter(isGraded).length;
  const current = queue[index]?.activity;
  const isRetry = queue[index]?.retry ?? false;
  const gradedCurrent = current ? isGraded(current) : false;
  const ready = current ? isReady(current, answer) : false;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const mood: MascotMood = !checked ? "idle" : correct ? "happy" : "sad";
  const moodKey = `${index}-${checked ? (correct ? "ok" : "no") : "ask"}`;

  const goTo = (i: number, q = queue) => {
    setIndex(i);
    setChecked(false);
    setCorrect(false);
    setAnswer(initialAnswer(q[i].activity));
  };

  const finish = (passedByScore: boolean) => {
    setPhase(passedByScore ? "passed" : "failed");
  };

  const handleCheck = () => {
    if (!current || !ready) return;
    const ok = isCorrect(current, answer);
    setCorrect(ok);
    setChecked(true);
    setMsgSeed((s) => s + 1);
    if (ok) {
      if (!isRetry) setFirstCorrect((v) => v + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));
      burstFrom(checkRef.current, nextCombo >= 3 ? ["#fb923c", "#facc15", "#f97316"] : undefined);
    } else {
      setCombo(0);
      navigator.vibrate?.(60);
      if (!isRetry) {
        setMistakes((v) => v + 1);
        setHearts((h) => h - 1);
        setHeartHit((v) => v + 1);
        // Erro na primeira tentativa: a pergunta volta no fim para uma segunda chance.
        setQueue((q) => [...q, { activity: current, retry: true }]);
      }
    }
  };

  const handleContinue = () => {
    if (current && !gradedCurrent) {
      // Fala do personagem
    } else if (!correct && hearts <= 0 && !isRetry) {
      finish(false);
      return;
    }
    if (index < queue.length - 1) {
      goTo(index + 1);
      return;
    }
    const passed = totalGraded === 0 || firstCorrect / totalGraded >= meta.minPass;
    finish(passed);
  };

  // Sem vidas: falha assim que o jogador continua depois de errar.
  const outOfHearts = hearts <= 0;

  // Salva o resultado uma única vez ao passar.
  useEffect(() => {
    if (phase !== "passed" || savedRef.current) return;
    savedRef.current = true;
    const r = completeLevel(stop.id, level, {
      correct: firstCorrect,
      total: totalGraded,
      mistakes,
      maxCombo,
    });
    setReward(r);
    const levelUp = getUserLevel(xpBefore + r.totalGained).level > getUserLevel(xpBefore).level;
    if (r.becameGold || r.becameUnitGold) celebrate("gold");
    else if (levelUp) celebrate("levelup", !adult);
    else celebrate("level", !adult);
  }, [phase, stop.id, level, firstCorrect, totalGraded, mistakes, maxCombo, xpBefore, adult]);

  // Enter avança
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || phase !== "play" || confirmExit) return;
      // Em um botão focado, o Enter já o aciona sozinho.
      if ((e.target as HTMLElement | null)?.tagName === "BUTTON") return;
      e.preventDefault();
      if (!gradedCurrent || checked) handleContinue();
      else handleCheck();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const retry = () => {
    const fresh = levelData.activities.map((activity) => ({ activity, retry: false }));
    savedRef.current = false;
    setQueue(fresh);
    setHearts(meta.hearts);
    setCombo(0);
    setMaxCombo(0);
    setFirstCorrect(0);
    setMistakes(0);
    setReward(null);
    setPhase("play");
    goTo(0, fresh);
  };

  const progressPct =
    phase === "play" ? ((index + (checked ? 1 : 0)) / Math.max(queue.length, 1)) * 100 : 100;

  const shared = {
    answer,
    onChange: setAnswer,
    checked,
    correct,
    mood,
    moodKey,
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-background sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("lm.ariaDialog").replace("{title}", stop.title).replace("{n}", String(level))}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <Scenery scene={unit.scene} variant={variant} />
      </div>
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden bg-card/95 backdrop-blur-sm sm:rounded-[2rem] sm:border-2 sm:border-border sm:shadow-2xl">
        {/* Topo: sair, progresso, vidas e combo */}
        <div className="z-10 flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
          <button
            type="button"
            onClick={() => (phase === "play" ? setConfirmExit(true) : onClose())}
            aria-label={t("lm.exitLesson")}
            className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-secondary sm:h-[18px]">
            <div
              className="nc-stripes absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(progressPct, 3)}%` }}
            >
              <div className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/40" />
            </div>
          </div>
          {combo >= 2 && phase === "play" && (
            <span
              key={combo}
              className="nc-pop inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-sm font-black text-orange-500"
            >
              <Flame className="nc-flame h-4 w-4 fill-orange-500" /> {combo}
            </span>
          )}
          <span
            key={heartHit}
            className={`inline-flex items-center gap-1 text-base font-black text-rose-500 ${heartHit > 0 ? "nc-shake" : ""}`}
            aria-label={t("lm.livesAria").replace("{n}", String(Math.max(hearts, 0)))}
          >
            <Heart className="h-6 w-6 fill-rose-500" /> {Math.max(hearts, 0)}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 pb-40 pt-2 sm:px-10">
          {phase === "play" && current && (
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  {meta.emoji}{" "}
                  {t("tm.levelN")
                    .replace("{n}", String(level))
                    .replace("{label}", t(`lv.${level}.label` as DictKey))}
                </span>
                {isRetry && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600">
                    {t("lm.secondChance")}
                  </span>
                )}
              </div>

              {current.type === "dialogue" && <DialogueView key={current.id} activity={current} />}
              {current.type === "concept" && <ConceptView key={current.id} activity={current} />}
              {current.type === "sort" && (
                <SortView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "fill" && (
                <FillView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "quiz" && (
                <QuizView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "true_false" && (
                <TrueFalseView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "multi" && (
                <MultiView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "match" && (
                <MatchView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "order" && (
                <OrderView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "scenario" && (
                <ScenarioView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "slider" && (
                <SliderView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {current.type === "reflect" && (
                <ReflectView key={`${current.id}-${index}`} activity={current} {...shared} />
              )}
              {checked && !correct && gradedCurrent && (
                <ExplainCard activity={current} guide={guide} />
              )}
            </div>
          )}

          {phase === "passed" && (
            <PassedView
              stop={stop}
              level={level}
              guide={guide}
              reward={reward}
              xpBefore={xpBefore}
              correct={firstCorrect}
              total={totalGraded}
              maxCombo={maxCombo}
            />
          )}

          {phase === "failed" && (
            <FailedView
              guide={guide}
              outOfHearts={outOfHearts}
              minPass={meta.minPass}
              correct={firstCorrect}
              total={totalGraded}
            />
          )}
        </div>

        {/* Barra inferior */}
        {phase === "play" && current && (
          <div
            className={`absolute inset-x-0 bottom-0 border-t-2 p-4 transition-colors duration-300 sm:p-5 ${
              checked
                ? correct
                  ? "border-emerald-300 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950"
                  : "border-rose-300 bg-rose-100 dark:border-rose-800 dark:bg-rose-950"
                : "border-border bg-card"
            }`}
          >
            <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
              {checked && gradedCurrent && (
                <div className="nc-rise min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-white ${correct ? "bg-emerald-500" : "bg-rose-500"}`}
                    >
                      {correct ? (
                        <Check className="h-5 w-5" strokeWidth={3.5} />
                      ) : (
                        <X className="h-5 w-5" strokeWidth={3.5} />
                      )}
                    </span>
                    <span
                      className={`text-lg font-black sm:text-xl ${correct ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
                    >
                      {correct ? pick(CORRECT_MSGS, msgSeed) : pick(WRONG_MSGS, msgSeed)}
                    </span>
                    {correct && combo >= 3 && (
                      <span className="nc-pop inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-black text-white">
                        <Flame className="h-3 w-3 fill-white" />{" "}
                        {t("lm.combo").replace("{n}", String(combo))}
                      </span>
                    )}
                  </div>
                  {/* Quando errado, a explicação e a resposta certa aparecem no ExplainCard, com o
                      mascote, logo acima desta barra — não duplicamos aqui. */}
                  {correct && "explanation" in current && (
                    <p className="mt-1 text-xs font-medium leading-relaxed text-emerald-800 dark:text-emerald-200 sm:text-sm">
                      {current.explanation}
                    </p>
                  )}
                </div>
              )}

              <div className={checked && gradedCurrent ? "shrink-0 sm:w-48" : "w-full"}>
                {!gradedCurrent || checked ? (
                  <button
                    ref={checkRef}
                    type="button"
                    onClick={handleContinue}
                    className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-black text-white shadow-[0_5px_0_0_var(--sh)] transition-transform active:translate-y-1 active:shadow-none sm:text-lg ${
                      checked
                        ? correct
                          ? "bg-emerald-500 [--sh:#047857] hover:bg-emerald-600"
                          : "bg-rose-500 [--sh:#be123c] hover:bg-rose-600"
                        : "bg-primary [--sh:var(--primary-hover)] hover:brightness-110"
                    }`}
                  >
                    {checked && !correct && outOfHearts && !isRetry
                      ? t("lm.seeResult")
                      : t("lm.continue")}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    ref={checkRef}
                    type="button"
                    onClick={handleCheck}
                    disabled={!ready}
                    className={`w-full rounded-2xl py-3.5 text-base font-black transition-all active:translate-y-1 sm:text-lg ${
                      ready
                        ? "cursor-pointer bg-primary text-primary-foreground shadow-[0_5px_0_0_var(--primary-hover)] hover:brightness-110 active:shadow-none"
                        : "cursor-not-allowed bg-secondary text-muted-foreground opacity-60"
                    }`}
                  >
                    {t("lm.check")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "passed" && (
          <div className="absolute inset-x-0 bottom-0 border-t-2 border-border bg-card p-4 sm:p-5">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer rounded-2xl bg-secondary py-3.5 text-base font-bold text-foreground transition hover:bg-secondary/70"
              >
                {t("lm.backToTrail")}
              </button>
              {level < 3 && (
                <button
                  type="button"
                  onClick={() => onNextLevel((level + 1) as LevelNumber)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-base font-black text-white shadow-[0_5px_0_0_#047857] transition active:translate-y-1 active:shadow-none hover:bg-emerald-600"
                >
                  {t("lm.nextLevel")} <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {phase === "failed" && (
          <div className="absolute inset-x-0 bottom-0 border-t-2 border-border bg-card p-4 sm:p-5">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer rounded-2xl bg-secondary py-3.5 text-base font-bold text-foreground transition hover:bg-secondary/70"
              >
                {t("lm.backToTrail")}
              </button>
              <button
                type="button"
                onClick={retry}
                className="w-full cursor-pointer rounded-2xl bg-primary py-3.5 text-base font-black text-primary-foreground shadow-[0_5px_0_0_var(--primary-hover)] transition active:translate-y-1 active:shadow-none hover:brightness-110"
              >
                {t("lm.tryAgain")}
              </button>
            </div>
          </div>
        )}

        {/* Confirmação de saída */}
        {confirmExit && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-black/50 p-6 backdrop-blur-[2px]">
            <div className="nc-pop w-full max-w-sm rounded-3xl border-2 border-border bg-card p-6 text-center shadow-2xl">
              <Mascot id={guide} mood="sad" size={88} />
              <h3 className="mt-2 font-display text-xl font-black text-foreground">
                {t("lm.leaveQ")}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{t("lm.leaveText")}</p>
              <div className="mt-5 grid gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmExit(false)}
                  className="cursor-pointer rounded-2xl bg-primary py-3 text-base font-black text-primary-foreground shadow-[0_4px_0_0_var(--primary-hover)] transition active:translate-y-1 active:shadow-none"
                >
                  {t("lm.keepLearning")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-2xl py-3 text-sm font-bold text-rose-500 transition hover:bg-rose-500/10"
                >
                  {t("lm.leaveAnyway")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Resultados --------------------------------- */

function CountUp({
  to,
  duration = 900,
  delay = 0,
}: {
  to: number;
  duration?: number;
  delay?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const t = window.setTimeout(() => {
      const tick = (now: number) => {
        if (!start) start = now;
        const p = Math.min(1, (now - start) / duration);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [to, duration, delay]);
  return <>{v}</>;
}

function BigStars({ count }: { count: number }) {
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-3">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={n === 2 ? "-translate-y-2" : ""}
          style={{
            animation:
              n <= count
                ? `nc-pop 0.6s ${0.35 + n * 0.4}s cubic-bezier(0.34,1.56,0.64,1) both`
                : undefined,
          }}
        >
          <Star
            className={`${n === 2 ? "h-20 w-20 sm:h-24 sm:w-24" : "h-14 w-14 sm:h-16 sm:w-16"} ${
              n <= count
                ? "fill-amber-400 text-amber-500 drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]"
                : "fill-secondary text-muted-foreground/30"
            }`}
          />
        </span>
      ))}
    </div>
  );
}

function PassedView({
  stop,
  level,
  guide,
  reward,
  xpBefore,
  correct,
  total,
  maxCombo,
}: {
  stop: Stop;
  level: LevelNumber;
  guide: CharacterId;
  reward: LevelReward | null;
  xpBefore: number;
  correct: number;
  total: number;
  maxCombo: number;
}) {
  const stars = reward?.stars ?? starsFor(correct, total);
  const golden = reward?.becameGold || reward?.becameUnitGold;
  const before = getUserLevel(xpBefore);
  const after = reward ? getUserLevel(xpBefore + reward.totalGained) : before;
  const leveledUp = after.level > before.level;

  // Chuva de confete dourado extra na parada/unidade dourada.
  useEffect(() => {
    if (!golden) return;
    const t = window.setTimeout(
      () =>
        fireConfetti({
          x: 0.5,
          y: 0.3,
          count: 120,
          spread: 360,
          power: 15,
          colors: GOLD_COLORS,
          emojis: ["👑", "⭐"],
        }),
      900,
    );
    return () => window.clearTimeout(t);
  }, [golden]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-2 text-center">
      <div className="relative">
        {golden && <Sparkles radius={110} />}
        <Mascot id={guide} mood="cheer" size={golden ? 140 : 116} />
      </div>

      {golden ? (
        <div className="nc-pop mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-4 py-1.5 text-sm font-black uppercase tracking-widest text-amber-950 shadow-lg">
          <Crown className="h-4 w-4 fill-amber-950" />
          {reward?.becameUnitGold ? t("lm.unitGold") : t("lm.stopGold")}
        </div>
      ) : null}

      <h2 className="mt-3 font-display text-3xl font-black text-emerald-600 sm:text-4xl dark:text-emerald-400">
        {golden ? t("lm.masterHere") : t("lm.levelDone")}
      </h2>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">
        {t("lm.stopLevel").replace("{title}", stop.title).replace("{n}", String(level))}
      </p>

      <div className="my-5">
        <BigStars count={stars} />
      </div>

      <div className="grid w-full grid-cols-3 gap-2.5">
        <div
          className="nc-rise rounded-2xl border-2 border-border bg-secondary/40 p-3"
          style={{ animationDelay: "0.9s" }}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            XP
          </div>
          <div className="text-2xl font-black text-amber-500">
            +<CountUp to={reward?.totalGained ?? 0} delay={1000} />
          </div>
        </div>
        <div
          className="nc-rise rounded-2xl border-2 border-border bg-secondary/40 p-3"
          style={{ animationDelay: "1.05s" }}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("lm.hits")}
          </div>
          <div className="text-2xl font-black text-emerald-500">
            {correct}/{total}
          </div>
        </div>
        <div
          className="nc-rise rounded-2xl border-2 border-border bg-secondary/40 p-3"
          style={{ animationDelay: "1.2s" }}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("lm.comboLabel")}
          </div>
          <div className="text-2xl font-black text-orange-500">x{maxCombo}</div>
        </div>
      </div>

      {reward && (
        <ul className="mt-3 w-full space-y-1 text-left text-xs font-bold text-muted-foreground">
          {reward.xp.base > 0 && <XpLine label={t("lm.xpBase")} value={reward.xp.base} />}
          {reward.xp.combo > 0 && <XpLine label={t("lm.xpCombo")} value={reward.xp.combo} />}
          {reward.xp.perfect > 0 && <XpLine label={t("lm.xpPerfect")} value={reward.xp.perfect} />}
          {reward.xp.practice > 0 && (
            <XpLine label={t("lm.xpPractice")} value={reward.xp.practice} />
          )}
        </ul>
      )}

      <div className="mt-4 flex w-full flex-col gap-2.5">
        {reward?.streakIncreased && (
          <Chip
            icon="🔥"
            text={t("lm.streakChip")
              .replace("{n}", String(reward.streak))
              .replace("{word}", reward.streak === 1 ? t("tc.day") : t("tc.days"))}
            tone="orange"
          />
        )}
        {reward?.dailyGoalReached && <Chip icon="🎯" text={t("lm.dailyDone")} tone="sky" />}
        {leveledUp && (
          <Chip
            icon="🌟"
            text={t("lm.levelUp")
              .replace("{n}", String(after.level))
              .replace(
                "{label}",
                LEVEL_LABEL_KEYS[after.label] ? t(LEVEL_LABEL_KEYS[after.label]) : after.label,
              )}
            tone="amber"
          />
        )}
        {reward?.newAchievements.map((a) => (
          <AchievementChip key={a.id} a={a} />
        ))}
        {level < 3 && !golden && (
          <p className="text-xs font-semibold text-muted-foreground">
            {t("lm.keepGoing").replace("{n}", String(level + 1))}
          </p>
        )}
      </div>
    </div>
  );
}

function XpLine({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-1.5">
      <span>{label}</span>
      <span className="tabular-nums text-amber-600 dark:text-amber-400">+{value} XP</span>
    </li>
  );
}

function Chip({
  icon,
  text,
  tone,
}: {
  icon: string;
  text: string;
  tone: "orange" | "sky" | "amber";
}) {
  const tones = {
    orange: "border-orange-500/30 bg-orange-500/10 text-orange-600",
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-600",
    amber: "border-amber-500/40 bg-amber-400/15 text-amber-600",
  };
  return (
    <div
      className={`nc-pop flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-black ${tones[tone]}`}
    >
      <span className="text-xl">{icon}</span>
      {text}
    </div>
  );
}

function AchievementChip({ a }: { a: AchievementDef }) {
  return (
    <div className="nc-pop flex items-center gap-3 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-100/80 to-yellow-100/50 px-3 py-2 text-left dark:from-amber-500/15 dark:to-yellow-500/10">
      <span className="text-3xl">{a.icon}</span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
          {t("lm.newAchievement")}
        </p>
        <p className="text-sm font-black text-foreground">{t(`ach.${a.id}.title` as DictKey)}</p>
      </div>
    </div>
  );
}

function FailedView({
  guide,
  outOfHearts,
  minPass,
  correct,
  total,
}: {
  guide: CharacterId;
  outOfHearts: boolean;
  minPass: number;
  correct: number;
  total: number;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-4 text-center">
      <Mascot id={guide} mood="sad" size={130} />
      <h2 className="mt-3 font-display text-3xl font-black text-rose-500">
        {outOfHearts ? t("lm.outOfLives") : t("lm.bad1")}
      </h2>
      <p className="mt-2 text-base font-medium leading-relaxed text-foreground/80">
        {outOfHearts ? (
          t("lm.outOfLivesText")
        ) : (
          <>
            {t("lm.needPass1")} <strong>{Math.round(minPass * 100)}%</strong> {t("lm.needPass2")}{" "}
            <strong>
              {correct} {t("lm.of")} {total}
            </strong>
            .
          </>
        )}
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-muted-foreground">
        <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> {t("lm.livesBack")}
      </div>
    </div>
  );
}
