import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Minus, Plus, Target, Trash2 } from "lucide-react";
import * as records from "@/lib/clinical/records";
import type { Goal } from "@/lib/clinical/records";
import { lastDays } from "@/lib/clinical/goals";
import { qk, useCheckins, useClinicalMutation, useGoals } from "@/lib/clinical/queries";
import { formatNumber } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { GoalForm, WeekStrip } from "./goals-panel";
import { EmptyState, Loading, buttonGhost, buttonSecondary } from "./ui";
import { EmojiIcon } from "@/components/emoji-icon";

/** Check-in de hoje nas metas ativas (visão do paciente). */
export function TodayGoals({ patientId, compact }: { patientId: string; compact?: boolean }) {
  const { t } = useClinicalI18n();
  const goals = useGoals(patientId);
  const days = useMemo(() => lastDays(7), []);
  const today = days[days.length - 1];
  const checkins = useCheckins(patientId, days[0]);
  const [adding, setAdding] = useState(false);

  if (goals.isLoading || checkins.isLoading) return <Loading />;
  const active = (goals.data ?? []).filter((g) => g.active);

  return (
    <div className="space-y-3">
      {active.length === 0 && !adding && (
        <EmptyState
          icon={Target}
          title={t("goals.emptyPatient")}
          text={compact ? undefined : t("goals.emptyPatientText")}
        />
      )}
      <div className={cn("grid gap-3", !compact && "md:grid-cols-2")}>
        {active.map((g) => (
          <GoalCheckinCard
            key={g.id}
            goal={g}
            value={Number(
              checkins.data?.find((c) => c.goal_id === g.id && c.day === today)?.value ?? 0,
            )}
            today={today}
            days={days}
            checkins={checkins.data ?? []}
            compact={compact}
          />
        ))}
      </div>
      {!compact &&
        (adding ? (
          <GoalForm patientId={patientId} asProfessional={false} onClose={() => setAdding(false)} />
        ) : (
          <button type="button" className={buttonSecondary} onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> {t("goals.createOwn")}
          </button>
        ))}
    </div>
  );
}

function GoalCheckinCard({
  goal,
  value,
  today,
  days,
  checkins,
  compact,
}: {
  goal: Goal;
  value: number;
  today: string;
  days: string[];
  checkins: records.GoalCheckin[];
  compact?: boolean;
}) {
  const { t, locale } = useClinicalI18n();
  const target = Number(goal.target_value) || 1;
  const step = target >= 20 ? 5 : 1;
  const done = value >= target;
  const pct = Math.min(100, Math.round((value / target) * 100));
  const invalidate = [["clinical", "checkins"], qk.goals(goal.patient_id)];
  const set = useClinicalMutation(
    (v: number) => records.setCheckin(goal.id, goal.patient_id, today, Math.max(0, v)),
    { invalidate },
  );
  const remove = useClinicalMutation(() => records.deleteGoal(goal.id), {
    invalidate: [qk.goals(goal.patient_id)],
  });
  // Mostra o novo valor na hora (antes da resposta do servidor); a recarga depois confirma.
  const qc = useQueryClient();
  const change = (next: number) => {
    const v = Math.max(0, next);
    qc.setQueriesData<records.GoalCheckin[]>(
      { queryKey: ["clinical", "checkins", goal.patient_id] },
      (old) => {
        if (!old) return old;
        const rest = old.filter((c) => !(c.goal_id === goal.id && c.day === today));
        return [
          ...rest,
          {
            goal_id: goal.id,
            patient_id: goal.patient_id,
            day: today,
            value: v,
            updated_at: new Date().toISOString(),
          },
        ];
      },
    );
    set.mutate(v);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-xs transition",
        done ? "border-primary/40" : "border-border/70",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent"
          aria-hidden
        >
          <EmojiIcon emoji={goal.icon} className="h-5 w-5" fallback={null} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{goal.title}</p>
          {goal.description && !compact && (
            <p className="text-xs text-muted-foreground">{goal.description}</p>
          )}
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            <span className={cn("text-base font-bold", done ? "text-primary" : "text-foreground")}>
              {formatNumber(value, locale)}
            </span>{" "}
            / {formatNumber(target, locale)} {goal.unit}
          </p>
        </div>
        {!goal.professional_id && !compact && (
          <button
            type="button"
            className={cn(buttonGhost, "px-2")}
            aria-label={t("common.remove")}
            onClick={() => window.confirm(t("goals.deleteConfirm")) && remove.mutate(undefined)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={goal.title}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(buttonSecondary, "h-9 w-9 p-0")}
            aria-label={t("goals.decrease")}
            disabled={value <= 0}
            onClick={() => change(value - step)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(buttonSecondary, "h-9 w-9 p-0")}
            aria-label={t("goals.increase")}
            onClick={() => change(value + step)}
          >
            <Plus className="h-4 w-4" />
          </button>
          {!done && (
            <button
              type="button"
              className={cn(buttonGhost, "text-primary")}
              onClick={() => change(target)}
            >
              <Check className="h-4 w-4" /> {t("goals.complete")}
            </button>
          )}
          {done && (
            <span className="ml-1 text-xs font-semibold text-primary">{t("goals.done")}</span>
          )}
        </div>
        {!compact && <WeekStrip goal={goal} checkins={checkins} days={days} />}
      </div>
    </div>
  );
}
