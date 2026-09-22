import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  ShoppingBasket,
  Star,
  Target,
  Users,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import type { Challenge, Community } from "@/lib/community";
import { Mascot, type MascotMood } from "@/components/mascots";
import {
  ACHIEVEMENTS,
  CHARACTERS,
  getTrailSummary,
  type CharacterId,
  type ProfileKind,
  type Trail,
  type TrailProgress,
} from "@/lib/learning-trail";
import { burstFrom } from "@/lib/confetti";

/* ---------------------------------- XP ---------------------------------- */

interface XPBarProps {
  xp: number;
  level: number;
  label: string;
  xpInLevel: number;
  xpForNext: number;
}

export function XPBar({ xp, level, label, xpInLevel, xpForNext }: XPBarProps) {
  const pct = xpForNext > 0 ? Math.min(Math.round((xpInLevel / xpForNext) * 100), 100) : 100;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <div className="grid h-16 w-16 place-items-center rounded-full border-b-4 border-amber-600 bg-gradient-to-b from-amber-300 to-amber-500 text-2xl font-black text-white shadow-md">
          {level}
        </div>
        <div className="nc-wobble absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm dark:bg-card">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
          <span className="truncate text-foreground">{label}</span>
          <span className="tabular-nums text-amber-600 dark:text-amber-400">{xp} XP</span>
        </div>
        <div className="relative h-4 w-full overflow-hidden rounded-full border-2 border-secondary bg-secondary">
          <div
            className="nc-stripes absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-700"
            style={{ width: `${Math.max(pct, 4)}%` }}
          >
            <div className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/40" />
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Nível {level}</span>
          <span>Faltam {Math.max(xpForNext - xpInLevel, 0)} XP</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Ofensiva ------------------------------- */

export function StreakBadge({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <div
      className={`flex shrink-0 items-center gap-3 rounded-2xl border-2 px-4 py-3 ${
        active ? "border-orange-500/25 bg-orange-500/10" : "border-border bg-secondary/40"
      }`}
    >
      <div className={`text-3xl drop-shadow-sm ${active ? "nc-flame" : "grayscale opacity-50"}`}>
        🔥
      </div>
      <div>
        <div
          className={`text-lg font-black leading-none ${active ? "text-orange-500" : "text-muted-foreground"}`}
        >
          {streak} {streak === 1 ? "dia" : "dias"}
        </div>
        <div
          className={`mt-0.5 text-[11px] font-bold uppercase tracking-widest ${
            active ? "text-orange-500/70" : "text-muted-foreground"
          }`}
        >
          Ofensiva
        </div>
      </div>
    </div>
  );
}

/** Anel com o progresso da meta diária de XP. */
function DailyGoalRing({ xp, goal }: { xp: number; goal: number }) {
  const pct = Math.min(1, xp / goal);
  const done = pct >= 1;
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={`flex shrink-0 items-center gap-3 rounded-2xl border-2 px-4 py-3 ${
        done ? "border-emerald-500/30 bg-emerald-500/10" : "border-sky-500/20 bg-sky-500/10"
      }`}
    >
      <div className="relative h-12 w-12">
        <svg viewBox="0 0 52 52" className="-rotate-90">
          <circle
            cx={26}
            cy={26}
            r={r}
            fill="none"
            strokeWidth={6}
            className="stroke-black/10 dark:stroke-white/15"
          />
          <circle
            cx={26}
            cy={26}
            r={r}
            fill="none"
            strokeWidth={6}
            strokeLinecap="round"
            stroke={done ? "#10b981" : "#0ea5e9"}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: "stroke-dashoffset 0.9s ease" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-lg">
          {done ? <span className="nc-pop">✅</span> : <Target className="h-5 w-5 text-sky-500" />}
        </span>
      </div>
      <div>
        <div
          className={`text-lg font-black leading-none ${done ? "text-emerald-600" : "text-sky-600"}`}
        >
          {Math.min(xp, goal)}/{goal}
        </div>
        <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Meta do dia
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Cabeçalho ------------------------------ */

interface TrailHeaderProps {
  xp: number;
  level: number;
  label: string;
  xpInLevel: number;
  xpForNext: number;
  streak: number;
  dailyXP: number;
  dailyGoal: number;
  stars: number;
  maxStars: number;
  goldStops: number;
  totalStops: number;
  levelsDone: number;
  totalLevels: number;
  variant: ProfileKind;
  /** Nome de quem está estudando (perfil ativo). */
  name: string;
  /** Seletor de perfis, exibido no topo do painel. */
  profileSlot?: React.ReactNode;
}

function guideMessage(p: TrailHeaderProps) {
  if (p.variant === "adult") {
    if (p.levelsDone === 0)
      return `Olá, ${p.name}. Sou a Nina, sua nutricionista guia. Escolha uma trilha e comece pela primeira parada.`;
    if (p.dailyXP >= p.dailyGoal) return "Meta diária concluída. Ótimo ritmo!";
    if (p.dailyXP === 0) return "Que tal um nível hoje? A constância é o que mais conta.";
    return `Faltam ${p.dailyGoal - p.dailyXP} XP para a meta de hoje.`;
  }
  if (p.levelsDone === 0)
    return `Oi, ${p.name}! Eu sou a Nina. Toque na primeira parada e vamos começar juntos!`;
  if (p.dailyXP >= p.dailyGoal) return "Meta do dia batida! Você é demais! 🎉";
  if (p.dailyXP === 0) return "Que tal um nível rapidinho hoje? Sua ofensiva agradece!";
  return `Faltam só ${p.dailyGoal - p.dailyXP} XP para a meta de hoje. Bora!`;
}

export function TrailHeader(props: TrailHeaderProps) {
  const goalDone = props.dailyXP >= props.dailyGoal;
  const mood: MascotMood = goalDone ? "cheer" : "talk";
  return (
    <div
      className={`relative mb-8 overflow-hidden border-2 border-border bg-card p-5 shadow-sm sm:p-7 ${
        props.variant === "adult" ? "rounded-2xl" : "rounded-[2rem]"
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-end gap-3">
            <Mascot id="nina" mood={mood} size={72} className="shrink-0" />
            <div
              className={`relative mb-2 max-w-md border-2 border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground ${
                props.variant === "adult"
                  ? "rounded-xl rounded-bl-none font-medium"
                  : "rounded-2xl rounded-bl-none font-semibold"
              }`}
            >
              {guideMessage(props)}
            </div>
          </div>
          {props.profileSlot}
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex-1">
            <XPBar
              xp={props.xp}
              level={props.level}
              label={props.label}
              xpInLevel={props.xpInLevel}
              xpForNext={props.xpForNext}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StreakBadge streak={props.streak} />
            <DailyGoalRing xp={props.dailyXP} goal={props.dailyGoal} />
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border-2 border-amber-500/25 bg-amber-500/10 px-4 py-3">
              <div className="text-3xl drop-shadow-sm">⭐</div>
              <div>
                <div className="text-lg font-black leading-none text-amber-600 dark:text-amber-400">
                  {props.stars}/{props.maxStars}
                </div>
                <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70">
                  Estrelas
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border-2 border-yellow-500/30 bg-yellow-400/15 px-4 py-3">
              <Crown className="h-7 w-7 fill-yellow-400 text-yellow-500" />
              <div>
                <div className="text-lg font-black leading-none text-yellow-600 dark:text-yellow-400">
                  {props.goldStops}/{props.totalStops}
                </div>
                <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-yellow-600/70 dark:text-yellow-400/70">
                  Douradas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Herói --------------------------------- */

const HERO_CAST: CharacterId[] = ["lipe", "nina", "mila", "tito", "cadu"];
const HERO_FLOATERS = [
  { e: "🍎", l: 6, d: 0, t: 9 },
  { e: "🥕", l: 22, d: -3, t: 11 },
  { e: "🍊", l: 40, d: -6, t: 10 },
  { e: "🥦", l: 58, d: -2, t: 12 },
  { e: "🍋", l: 76, d: -8, t: 9 },
  { e: "🍇", l: 92, d: -4, t: 11 },
];

/** Faixa de boas-vindas. No perfil adulto é sóbria, com a Nina em destaque; no infantil, os Nutri-Amigos. */
export function TrailHero({ variant, name }: { variant: ProfileKind; name: string }) {
  const [cheering, setCheering] = useState<CharacterId | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const cheer = (id: CharacterId, el: Element, palette?: string[]) => {
    setCheering(id);
    burstFrom(el, palette ?? ["#facc15", "#fb923c", "#4ade80", "#38bdf8", "#f472b6"]);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCheering(null), 1300);
  };

  if (variant === "adult") {
    return (
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-64 rounded-full bg-amber-300/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(rgb(255 255 255 / 0.18) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="relative flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="max-w-xl space-y-3 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
              <FlaskConical className="h-3.5 w-3.5" /> Trilhas de aprendizado
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Nutrição com evidências, no seu ritmo
            </h2>
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">
              Escolha um tema e avance em etapas curtas: explicações claras, atividades práticas e
              três níveis por parada. Conquiste estrelas, mantenha a constância e deixe as paradas
              douradas.
            </p>
            <p className="text-xs text-white/60">Toque na Nina para cumprimentá-la.</p>
          </div>
          <button
            type="button"
            onClick={(e) =>
              cheer("nina", e.currentTarget, ["#fde047", "#34d399", "#ffffff", "#93c5fd"])
            }
            aria-label="Cumprimentar a Nutri Nina"
            className="-mb-6 shrink-0 cursor-pointer self-end transition-transform hover:-translate-y-1 active:scale-95 lg:-mr-2"
          >
            <Mascot
              key={cheering === "nina" ? "cheer" : "idle"}
              id="nina"
              mood={cheering === "nina" ? "cheer" : "talk"}
              size={190}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-12 left-10 h-44 w-44 rounded-full bg-pink-400/25 blur-3xl" />
        {HERO_FLOATERS.map((f, i) => (
          <span
            key={i}
            className="nc-fall absolute top-0 text-2xl opacity-0"
            style={{ left: `${f.l}%`, animationDelay: `${f.d}s`, animationDuration: `${f.t}s` }}
          >
            {f.e}
          </span>
        ))}
      </div>

      <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row">
        <div className="max-w-xl space-y-2 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur-sm">
            ✨ Olá, {name}!
          </span>
          <h2 className="font-display text-3xl font-black text-white drop-shadow-sm sm:text-4xl">
            Vamos aprender brincando!
          </h2>
          <p className="text-sm font-medium leading-relaxed text-white/90 sm:text-base">
            Escolha uma aventura, ganhe estrelas e deixe as paradas douradas. Toque nos amigos para
            cumprimentá-los!
          </p>
        </div>

        <div className="flex items-end justify-center -space-x-2 sm:space-x-1">
          {HERO_CAST.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={(e) => cheer(id, e.currentTarget)}
              title={`${CHARACTERS[id].name}: ${CHARACTERS[id].role}`}
              aria-label={`Cumprimentar ${CHARACTERS[id].name}`}
              className="cursor-pointer transition-transform hover:-translate-y-1.5 active:scale-95"
              style={{ zIndex: i === 1 ? 2 : 1 }}
            >
              <Mascot
                key={cheering === id ? "cheer" : "idle"}
                id={id}
                mood={cheering === id ? "cheer" : "idle"}
                size={i === 1 ? 92 : 76}
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ADULT_TRAIL_ICONS: Record<string, LucideIcon> = {
  nutrientes: FlaskConical,
  escolhas: ShoppingBasket,
  "bem-estar": Brain,
};

/** Escolha do grande tema (trilha) a estudar. */
export function TrailPicker({
  trails,
  progress,
  selectedId,
  onSelect,
  variant,
}: {
  trails: Trail[];
  progress: TrailProgress;
  selectedId: string;
  onSelect: (id: string) => void;
  variant: ProfileKind;
}) {
  const adult = variant === "adult";
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-foreground">
          {adult ? "Escolha um tema" : "Escolha sua aventura"}
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {trails.length} {adult ? "trilhas" : "aventuras"}
        </span>
      </div>
      <div className={`grid gap-4 ${trails.length > 2 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
        {trails.map((trail) => {
          const sum = getTrailSummary(progress, trail);
          const selected = trail.id === selectedId;
          const Icon = ADULT_TRAIL_ICONS[trail.id] ?? FlaskConical;
          return (
            <button
              key={trail.id}
              type="button"
              onClick={() => onSelect(trail.id)}
              aria-pressed={selected}
              className={`group relative cursor-pointer overflow-hidden border-2 p-5 text-left transition-all ${
                adult ? "rounded-2xl" : "rounded-[1.75rem]"
              } ${
                selected
                  ? "border-primary bg-primary-soft/40 shadow-md"
                  : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {adult ? (
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/70 text-3xl shadow-inner dark:bg-white/10">
                    <span className={selected ? "nc-bob" : ""}>{trail.icon}</span>
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold leading-tight text-foreground">
                    {trail.title}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {trail.tagline}
                  </p>
                </div>
                {sum.gold === sum.stops && sum.stops > 0 && (
                  <Crown className="h-5 w-5 shrink-0 fill-yellow-400 text-yellow-500" />
                )}
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {trail.description}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                      adult ? "bg-primary" : "nc-stripes bg-emerald-500"
                    }`}
                    style={{ width: `${Math.max(sum.pct, sum.pct > 0 ? 6 : 0)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                  {sum.pct}%
                </span>
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                {sum.stops} paradas · {sum.gold} douradas
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- Conquistas ------------------------------- */

export function TrailAchievements({ unlocked }: { unlocked: string[] }) {
  const count = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).length;
  return (
    <div className="mb-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-black text-foreground">
          🏅 Conquistas da trilha
        </h2>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
          {count}/{ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const has = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              title={a.description}
              className={`group flex items-center gap-3 rounded-2xl border-2 p-3 transition ${
                has
                  ? "border-amber-400/50 bg-gradient-to-br from-amber-100/70 to-yellow-100/40 hover:-translate-y-0.5 hover:shadow-md dark:from-amber-500/15 dark:to-yellow-500/10"
                  : "border-border bg-secondary/30"
              }`}
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl ${
                  has ? "bg-white/70 shadow-inner dark:bg-white/10" : "bg-secondary"
                }`}
              >
                {has ? a.icon : <Lock className="h-5 w-5 text-muted-foreground/60" />}
              </span>
              <div className="min-w-0">
                <p
                  className={`truncate text-xs font-black ${has ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {a.title}
                </p>
                <p className="line-clamp-2 text-[10px] font-medium leading-snug text-muted-foreground">
                  {a.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Desafios ------------------------------ */

export function PopularBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
      <Flame className="nc-flame h-3 w-3" /> POPULAR
    </span>
  );
}

interface CommunityChallengeGroupProps {
  community: Community;
  challenges: Challenge[];
  userId: string;
}

export function CommunityChallengeGroup({
  community,
  challenges,
  userId,
}: CommunityChallengeGroupProps) {
  return (
    <div className="rounded-[2rem] border-2 border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="nc-wobble grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-2xl shadow-inner">
          👥
        </div>
        <div>
          <Link
            to="/comunidades/$slug"
            params={{ slug: community.slug }}
            className="font-display text-lg font-black text-foreground transition hover:text-accent"
          >
            {community.name}
          </Link>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {community.members.length} membros · {challenges.length} desafio
            {challenges.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {challenges.map((c) => {
          const isCompleted = c.completedBy.includes(userId);
          const isJoined = c.participants.includes(userId);
          const totalSteps = c.steps.length;
          const completedSteps = (c.progress[userId] || []).length;
          const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

          return (
            <Link
              key={c.id}
              to="/desafios/$challengeId"
              params={{ challengeId: c.id }}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 transition-all hover:-translate-y-1 hover:shadow-md ${
                isCompleted
                  ? "border-primary/40 bg-primary-soft/20"
                  : "border-border hover:border-accent/40"
              }`}
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl ${
                  isCompleted
                    ? "border-2 border-primary-hover bg-primary shadow-inner"
                    : "border-2 border-border bg-secondary"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-6 w-6 text-white" /> : c.badgeIcon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-foreground">{c.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {c.participants.length} · {c.duration}
                </p>
                {isJoined && !isCompleted && totalSteps > 0 && (
                  <div className="mt-2">
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
