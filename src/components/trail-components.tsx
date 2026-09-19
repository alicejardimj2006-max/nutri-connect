import { Link } from "@tanstack/react-router";
import { CheckCircle2, Lock, Star, Users, Award, BookOpen, Flame } from "lucide-react";
import type { Challenge, Community } from "@/lib/community";
import type { Unit, Lesson } from "@/lib/learning-trail";

// ── Cores Temáticas para as Unidades ───────────────────────────────────

const THEMES = [
  {
    bg: "bg-emerald-500",
    border: "border-emerald-600",
    text: "text-emerald-500",
    shadow: "shadow-emerald-500/30",
    ring: "ring-emerald-100 dark:ring-emerald-900/40",
  },
  {
    bg: "bg-sky-500",
    border: "border-sky-600",
    text: "text-sky-500",
    shadow: "shadow-sky-500/30",
    ring: "ring-sky-100 dark:ring-sky-900/40",
  },
  {
    bg: "bg-amber-500",
    border: "border-amber-600",
    text: "text-amber-500",
    shadow: "shadow-amber-500/30",
    ring: "ring-amber-100 dark:ring-amber-900/40",
  },
  {
    bg: "bg-violet-500",
    border: "border-violet-600",
    text: "text-violet-500",
    shadow: "shadow-violet-500/30",
    ring: "ring-violet-100 dark:ring-violet-900/40",
  },
];

// Padrão de zigue-zague da trilha
const STAGGER_CLASSES = [
  "translate-x-0",
  "-translate-x-12 sm:-translate-x-20",
  "-translate-x-20 sm:-translate-x-32",
  "-translate-x-12 sm:-translate-x-20",
  "translate-x-0",
  "translate-x-12 sm:translate-x-20",
  "translate-x-20 sm:translate-x-32",
  "translate-x-12 sm:translate-x-20",
];

// ── XP Bar ─────────────────────────────────────────────────────────────

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
      <div className="relative">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-400 border-b-4 border-amber-500 text-white font-black text-2xl shadow-sm shrink-0">
          {level}
        </div>
        <div className="absolute -bottom-1 -right-1 grid place-items-center h-6 w-6 bg-white dark:bg-card rounded-full shadow-sm">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm mb-1.5 font-bold">
          <span className="text-foreground">{label}</span>
          <span className="text-amber-500">{xp} XP</span>
        </div>
        <div className="h-4 w-full rounded-full bg-secondary overflow-hidden border-2 border-secondary relative">
          <div
            className="absolute top-0 bottom-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          >
            {/* Efeito de brilho 3D na barra */}
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wider">
          <span>Nível {level}</span>
          <span>Faltam {xpForNext - xpInLevel} XP</span>
        </div>
      </div>
    </div>
  );
}

// ── Streak Badge ───────────────────────────────────────────────────────

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak <= 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-orange-500/20 bg-orange-500/10 px-4 py-3 shrink-0">
      <div className="text-3xl animate-pulse drop-shadow-sm">🔥</div>
      <div>
        <div className="text-lg font-black text-orange-500 leading-none">{streak} dias</div>
        <div className="text-[11px] font-bold text-orange-500/70 uppercase tracking-widest mt-0.5">Ofensiva</div>
      </div>
    </div>
  );
}

// ── Trail Header ───────────────────────────────────────────────────────

interface TrailHeaderProps {
  xp: number;
  level: number;
  label: string;
  xpInLevel: number;
  xpForNext: number;
  streak: number;
  completedLessons: number;
  totalLessons: number;
}

export function TrailHeader({
  xp, level, label, xpInLevel, xpForNext, streak, completedLessons, totalLessons,
}: TrailHeaderProps) {
  return (
    <div className="rounded-[2rem] border-2 border-border bg-card p-6 sm:p-8 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <div className="flex-1">
          <XPBar xp={xp} level={level} label={label} xpInLevel={xpInLevel} xpForNext={xpForNext} />
        </div>
        <div className="hidden sm:block w-0.5 h-16 bg-border" />
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <StreakBadge streak={streak} />
          <div className="flex items-center gap-3 rounded-2xl border-2 border-sky-500/20 bg-sky-500/10 px-4 py-3 shrink-0">
            <div className="text-3xl drop-shadow-sm">📘</div>
            <div>
              <div className="text-lg font-black text-sky-500 leading-none">{completedLessons}/{totalLessons}</div>
              <div className="text-[11px] font-bold text-sky-500/70 uppercase tracking-widest mt-0.5">Lições</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Learning Trail Map ─────────────────────────────────────────────────

interface LearningTrailMapProps {
  units: Unit[];
  completedLessons: string[];
  onStartLesson: (lesson: Lesson, unitTitle: string) => void;
}

export function LearningTrailMap({ units, completedLessons, onStartLesson }: LearningTrailMapProps) {
  let globalLessonIndex = 0;

  return (
    <div className="flex flex-col items-center py-6 relative overflow-hidden w-full">
      {/* Caminho central de terra/trilha */}
      <div className="absolute top-0 bottom-0 left-1/2 w-20 sm:w-28 bg-secondary/50 dark:bg-secondary/20 -translate-x-1/2 rounded-full z-0 blur-[2px]" />

      <div className="space-y-16 w-full max-w-2xl relative z-10 px-4">
        {units.map((unit, unitIndex) => {
          const theme = THEMES[unitIndex % THEMES.length];
          const allLessonsCompleted = unit.lessons.every((l) => completedLessons.includes(l.id));
          const completedInUnit = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
          
          let isUnitLocked = false;
          if (unit.requiredUnitId) {
            const reqUnit = units.find(u => u.id === unit.requiredUnitId);
            if (reqUnit && !reqUnit.lessons.every(l => completedLessons.includes(l.id))) {
              isUnitLocked = true;
            }
          }

          return (
            <div key={unit.id} className="flex flex-col items-center w-full">
              {/* Cabeçalho da Unidade */}
              <UnitHeader
                unit={unit}
                theme={theme}
                completedCount={completedInUnit}
                totalCount={unit.lessons.length}
                isCompleted={allLessonsCompleted}
                isLocked={isUnitLocked}
                unitNumber={unitIndex + 1}
              />

              {/* Nós das Lições (Sinuosos) */}
              {!isUnitLocked && (
                <div className="mt-12 flex flex-col items-center gap-10 w-full relative z-10">
                  {unit.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const previousLessonsCompleted = unit.lessons
                      .slice(0, lessonIndex)
                      .every((l) => completedLessons.includes(l.id));
                    
                    const isActive = !isCompleted && previousLessonsCompleted;
                    const isLocked = !isCompleted && !isActive;
                    
                    const staggerClass = STAGGER_CLASSES[globalLessonIndex % STAGGER_CLASSES.length];
                    globalLessonIndex++;

                    return (
                      <div key={lesson.id} className={`transition-all duration-500 ${staggerClass}`}>
                        <LessonNode
                          lesson={lesson}
                          status={isCompleted ? "completed" : isActive ? "active" : "locked"}
                          theme={theme}
                          onStart={() => onStartLesson(lesson, unit.title)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Troféu Final */}
        <div className="text-center py-16 relative flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full" />
          <div className="text-7xl mb-4 animate-bounce relative z-10 drop-shadow-xl">🏆</div>
          <h3 className="text-3xl font-black text-amber-500 font-display relative z-10 drop-shadow-sm">Mestre da Nutrição</h3>
          <p className="text-sm font-bold text-muted-foreground relative z-10 mt-2 uppercase tracking-widest">
            Sua jornada te transformou
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Unit Header ────────────────────────────────────────────────────────

interface UnitHeaderProps {
  unit: Unit;
  theme: typeof THEMES[0];
  completedCount: number;
  totalCount: number;
  isCompleted: boolean;
  isLocked: boolean;
  unitNumber: number;
}

function UnitHeader({
  unit,
  theme,
  completedCount,
  totalCount,
  isCompleted,
  isLocked,
  unitNumber,
}: UnitHeaderProps) {
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLocked) {
    return (
      <div className="w-full max-w-lg rounded-3xl border-2 border-border bg-secondary/50 p-6 flex items-center gap-5 opacity-80 grayscale">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary border-2 border-border text-3xl">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unidade {unitNumber}</span>
          <h2 className="text-xl font-black text-muted-foreground mt-1">{unit.title}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-lg rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border-b-8 active:border-b-4 transition-all duration-200 ${theme.bg} ${theme.border}`}>
      {/* Grafismos de Fundo */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
      <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {/* Ícone Gigante */}
        <div className="grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 text-5xl sm:text-6xl shadow-inner shrink-0 transform -rotate-6">
          {unit.icon}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between font-black uppercase tracking-widest text-white/80 text-[10px] sm:text-xs mb-1">
            <span>Unidade {unitNumber}</span>
            {isCompleted && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Concluída</span>}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display leading-none mb-2 drop-shadow-sm">
            {unit.title}
          </h2>
          <p className="font-bold text-white/90 text-xs sm:text-sm leading-snug line-clamp-2">
            {unit.description}
          </p>

          {/* Barra de Progresso Branca/Transparente */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 flex-1 bg-black/20 rounded-full overflow-hidden relative border border-white/10">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-white transition-all duration-500 rounded-full" 
                style={{ width: `${progressPct}%` }} 
              >
                 <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/50 rounded-full" />
              </div>
            </div>
            <span className="text-xs font-black tabular-nums">{completedCount}/{totalCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lesson Node (Stepping Stone) ───────────────────────────────────────

interface LessonNodeProps {
  lesson: Lesson;
  status: "completed" | "active" | "locked";
  theme: typeof THEMES[0];
  onStart: () => void;
}

function LessonNode({ lesson, status, theme, onStart }: LessonNodeProps) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isLocked = status === "locked";

  return (
    <div 
      className={`relative flex flex-col items-center group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={!isLocked ? onStart : undefined}
    >
      {/* Tooltip "Começar!" pulando acima do botão ativo */}
      {isActive && (
        <div className="absolute -top-14 animate-bounce bg-card border-2 border-border px-4 py-2 rounded-2xl font-black text-sm shadow-md z-20 text-foreground whitespace-nowrap">
          Começar!
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-b-2 border-r-2 border-border rotate-45" />
        </div>
      )}

      {/* Círculo do Botão 3D */}
      <div 
        className={`
          relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl transition-all duration-200
          border-b-8 active:border-b-0 active:translate-y-2
          ${isCompleted ? `${theme.bg} ${theme.border} text-white` : ''}
          ${isActive ? `${theme.bg} ${theme.border} text-white shadow-2xl ${theme.shadow} ${theme.ring} ring-8 animate-pulse` : ''}
          ${isLocked ? 'bg-secondary border-secondary-hover border-b-8 text-muted-foreground/50' : ''}
        `}
      >
        {isCompleted ? <Star className="fill-current w-10 h-10 sm:w-12 sm:h-12 drop-shadow-sm" /> :
         isLocked ? <Lock className="w-8 h-8 sm:w-10 sm:h-10" /> :
         <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-sm" />}
         
         {/* Reflexo de luz na parte superior do botão ativo/completado */}
         {(isCompleted || isActive) && (
           <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-2 sm:h-3 bg-white/30 rounded-full" />
         )}
      </div>

      {/* Coroa/Selo Flutuante se estiver concluído */}
      {isCompleted && (
        <div className="absolute -right-2 -top-2 bg-amber-400 border-2 border-white dark:border-background rounded-full p-1.5 shadow-sm rotate-12 z-20">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Título da Lição e Recompensas abaixo do botão */}
      <div className={`mt-4 text-center w-36 sm:w-40 transition-opacity ${isLocked ? 'opacity-50' : 'opacity-100'}`}>
        <span className="text-xs sm:text-sm font-black block leading-tight text-foreground drop-shadow-xs">{lesson.title}</span>
        {status !== "locked" && (
          <span className={`text-[10px] sm:text-[11px] font-bold mt-1 inline-flex items-center gap-1 ${theme.text}`}>
            {lesson.xpReward} XP
          </span>
        )}
      </div>
    </div>
  );
}

// ── Popular Badge ──────────────────────────────────────────────────────

export function PopularBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
      <Flame className="h-3 w-3" /> POPULAR
    </span>
  );
}

// ── Community Challenge Group ──────────────────────────────────────────

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
    <div className="rounded-[2rem] border-2 border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-2xl shadow-inner transform -rotate-3">
          👥
        </div>
        <div>
          <Link
            to="/comunidades/$slug"
            params={{ slug: community.slug }}
            className="text-lg font-black text-foreground hover:text-accent transition font-display"
          >
            {community.name}
          </Link>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
            {community.members.length} membros · {challenges.length} desafio{challenges.length !== 1 ? "s" : ""}
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
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl ${isCompleted ? 'bg-primary border-2 border-primary-hover shadow-inner' : 'bg-secondary border-2 border-border'}`}>
                {isCompleted ? <CheckCircle2 className="h-6 w-6 text-white" /> : c.badgeIcon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground truncate">{c.title}</p>
                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                  <Users className="h-3 w-3" />
                  {c.participants.length} · {c.duration}
                </p>
                {isJoined && !isCompleted && totalSteps > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 left-0 rounded-full bg-accent transition-all"
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
