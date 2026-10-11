// Progresso das metas (M5): sequência gentil (sem culpa), últimas 4 semanas e os 28 dias em
// bolinhas. Nada de "você perdeu a sequência": um dia sem registro é só um dia.
import { useMemo } from "react";
import { Sprout, TrendingUp } from "lucide-react";
import { useTr } from "@/components/settings-ui";
import { EmojiIcon } from "@/components/emoji-icon";
import type { Goal, GoalCheckin } from "@/lib/clinical/records";
import { useCheckins, useGoals } from "@/lib/clinical/queries";
import { formatDate, parseDate } from "@/lib/clinical/format";
import { gentleStreak, lastDays, weeklyAdherence } from "@/lib/clinical/goals";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { useNoNumbers } from "@/lib/no-numbers";
import { cn } from "@/lib/utils";
import { Loading } from "./ui";

const WINDOW = 56; // dias lidos para a sequência (8 semanas)

/** Frase da sequência, sempre no tom de incentivo (mais neutra na visão do profissional). */
function useStreakText() {
  const tr = useTr();
  return (s: ReturnType<typeof gentleStreak>, forPro: boolean, hideNumbers = false) => {
    if (s.practiced === 0)
      return forPro
        ? tr([
            "Ainda sem registros recentes.",
            "No recent check-ins yet.",
            "Aún sin registros recientes.",
            "Pas encore d'enregistrements récents.",
          ])
        : tr([
            "Hoje é um bom dia para começar. Um passo pequeno já conta.",
            "Today is a good day to start. A small step already counts.",
            "Hoy es un buen día para empezar. Un paso pequeño ya cuenta.",
            "Aujourd'hui est un bon jour pour commencer. Un petit pas compte déjà.",
          ]);
    const n = s.practiced;
    const base = hideNumbers
      ? tr([
          "Você vem cuidando disso",
          "You've been caring for this",
          "Vienes cuidando esto",
          "Vous en prenez soin",
        ])
      : tr([
          `${n} ${n === 1 ? "dia" : "dias"} cuidando disso`,
          `${n} ${n === 1 ? "day" : "days"} caring for this`,
          `${n} ${n === 1 ? "día" : "días"} cuidando esto`,
          `${n} ${n === 1 ? "jour" : "jours"} à en prendre soin`,
        ]);
    if (forPro) return base;
    if (s.doneToday)
      return `${base}. ${tr(["Hoje já foi! 🌱", "Done today! 🌱", "¡Hoy ya está! 🌱", "C'est fait aujourd'hui ! 🌱"])}`;
    return `${base}. ${tr([
      "Quando der, registre o de hoje.",
      "When you can, log today's.",
      "Cuando puedas, registra el de hoy.",
      "Quand vous pourrez, notez celui d'aujourd'hui.",
    ])}`;
  };
}

function GoalProgressCard({
  goal,
  checkins,
  days,
  forPro,
}: {
  goal: Goal;
  checkins: GoalCheckin[];
  days: string[];
  forPro: boolean;
}) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const streakText = useStreakText();
  // Modo sem números: só na visão da própria pessoa.
  const hide = useNoNumbers() && !forPro;
  const streak = gentleStreak(goal, checkins, days);
  const weeks = weeklyAdherence(goal, checkins, days.slice(-28));
  const last28 = days.slice(-28);
  const target = Number(goal.target_value) || 1;
  const trend = weeks.length >= 2 ? weeks[weeks.length - 1].pct - weeks[weeks.length - 2].pct : 0;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent"
          aria-hidden
        >
          <EmojiIcon emoji={goal.icon} className="h-5 w-5" fallback={null} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{goal.title}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Sprout className="h-3.5 w-3.5 shrink-0 text-primary" />
            {streakText(streak, forPro, hide)}
          </p>
        </div>
        {!hide && (
          <span className="shrink-0 rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-foreground">
            {streak.last7}/7
          </span>
        )}
      </div>

      {/* Últimas 4 semanas */}
      <div
        className="mt-4 grid grid-cols-4 items-end gap-2"
        role="img"
        aria-label={tr([
          "Últimas 4 semanas",
          "Last 4 weeks",
          "Últimas 4 semanas",
          "4 dernières semaines",
        ])}
      >
        {weeks.map((w, i) => (
          <div key={w.from} className="flex flex-col items-center gap-1">
            {!hide && (
              <span className="text-[10px] font-semibold tabular-nums text-foreground">
                {w.pct}%
              </span>
            )}
            <div className="flex h-16 w-full items-end overflow-hidden rounded-lg bg-secondary/60">
              <div
                className={cn(
                  "w-full rounded-lg transition-all",
                  i === weeks.length - 1 ? "bg-primary" : "bg-primary/45",
                )}
                style={{ height: `${Math.max(w.pct ? 6 : 0, w.pct)}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">
              {i === weeks.length - 1
                ? tr(["Esta semana", "This week", "Esta semana", "Cette semaine"])
                : formatDate(parseDate(w.from), locale, { day: "numeric", month: "short" })}
            </span>
          </div>
        ))}
      </div>
      {trend > 0 && !hide && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary">
          <TrendingUp className="h-3.5 w-3.5" />
          {tr([
            `+${trend} pontos em relação à semana passada`,
            `+${trend} points vs last week`,
            `+${trend} puntos respecto a la semana pasada`,
            `+${trend} points par rapport à la semaine dernière`,
          ])}
        </p>
      )}

      {/* 28 dias em bolinhas */}
      <div className="mt-3 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
        {last28.map((d) => {
          const v = Number(checkins.find((c) => c.goal_id === goal.id && c.day === d)?.value ?? 0);
          const ratio = Math.min(1, v / target);
          return (
            <span
              key={d}
              title={`${formatDate(parseDate(d), locale, { day: "numeric", month: "short" })}: ${v}/${target} ${goal.unit}`}
              className={cn("aspect-square rounded-full", !ratio && "border border-border/50")}
              style={{
                background: ratio
                  ? `color-mix(in oklch, var(--color-primary) ${Math.round(25 + ratio * 75)}%, transparent)`
                  : "transparent",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Progresso de todas as metas ativas. `forPro` muda o texto para a visão do profissional. */
export function GoalProgress({
  patientId,
  forPro = false,
}: {
  patientId: string;
  forPro?: boolean;
}) {
  const tr = useTr();
  const goals = useGoals(patientId);
  const days = useMemo(() => lastDays(WINDOW), []);
  const checkins = useCheckins(patientId, days[0]);

  if (goals.isLoading || checkins.isLoading) return <Loading />;
  const active = (goals.data ?? []).filter((g) => g.active);
  if (active.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold font-display text-foreground">
        {forPro
          ? tr(["Progresso", "Progress", "Progreso", "Progrès"])
          : tr(["Seu progresso", "Your progress", "Tu progreso", "Vos progrès"])}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {forPro
          ? tr([
              "Constância nas últimas semanas. Um dia sem registro não quebra a sequência; só dois seguidos.",
              "Consistency over recent weeks. One day without a check-in doesn't break the streak; only two in a row.",
              "Constancia en las últimas semanas. Un día sin registro no rompe la racha; solo dos seguidos.",
              "Régularité des dernières semaines. Un jour sans saisie ne casse pas la série ; seulement deux d'affilée.",
            ])
          : tr([
              "Constância, não perfeição. Um dia de folga não apaga o caminho que você já fez.",
              "Consistency, not perfection. A day off doesn't erase the path you've walked.",
              "Constancia, no perfección. Un día libre no borra el camino que ya hiciste.",
              "La régularité, pas la perfection. Un jour de pause n'efface pas le chemin parcouru.",
            ])}
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {active.map((g) => (
          <GoalProgressCard
            key={g.id}
            goal={g}
            checkins={checkins.data ?? []}
            days={days}
            forPro={forPro}
          />
        ))}
      </div>
    </section>
  );
}
