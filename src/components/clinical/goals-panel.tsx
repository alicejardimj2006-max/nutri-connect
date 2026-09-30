import { useMemo, useState } from "react";
import { Pause, Play, Plus, Target, Trash2 } from "lucide-react";
import * as records from "@/lib/clinical/records";
import type { Goal, GoalCheckin } from "@/lib/clinical/records";
import { qk, useCheckins, useClinicalMutation, useGoals } from "@/lib/clinical/queries";
import { formatNumber, formatWeekday, parseDate } from "@/lib/clinical/format";
import { GOAL_ICONS, adherence, lastDays } from "@/lib/clinical/goals";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import {
  Card,
  EmptyState,
  Field,
  Loading,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./ui";

export function GoalsPanel({ patientId, readOnly }: { patientId: string; readOnly: boolean }) {
  const { t, locale } = useClinicalI18n();
  const goals = useGoals(patientId);
  const days = useMemo(() => lastDays(7), []);
  const checkins = useCheckins(patientId, days[0]);
  const [adding, setAdding] = useState(false);

  const invalidate = [qk.goals(patientId)];
  const toggle = useClinicalMutation(
    (g: Goal) =>
      records.saveGoal(
        { id: g.id, patient_id: g.patient_id, title: g.title, active: !g.active },
        true,
      ),
    { invalidate },
  );
  const remove = useClinicalMutation((id: string) => records.deleteGoal(id), {
    success: t("goals.deleted"),
    invalidate,
  });

  if (goals.isLoading) return <Loading />;
  const list = goals.data ?? [];

  return (
    <div className="space-y-4">
      {!readOnly && !adding && (
        <div className="flex justify-end">
          <button type="button" className={buttonPrimary} onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> {t("goals.new")}
          </button>
        </div>
      )}
      {adding && <GoalForm patientId={patientId} onClose={() => setAdding(false)} />}

      {list.length === 0 ? (
        !adding && <EmptyState icon={Target} title={t("goals.empty")} text={t("goals.emptyText")} />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border/60">
            {list.map((g) => (
              <li
                key={g.id}
                className={cn(
                  "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
                  !g.active && "opacity-60",
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-xl"
                    aria-hidden
                  >
                    {g.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{g.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("goals.target", {
                        value: formatNumber(Number(g.target_value), locale),
                        unit: g.unit,
                      })}
                      {!g.professional_id && ` · ${t("goals.byPatient")}`}
                      {!g.active && ` · ${t("goals.paused")}`}
                    </p>
                  </div>
                </div>
                <WeekStrip goal={g} checkins={checkins.data ?? []} days={days} />
                {!readOnly && g.professional_id && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className={buttonGhost}
                      aria-label={g.active ? t("goals.pause") : t("goals.resume")}
                      title={g.active ? t("goals.pause") : t("goals.resume")}
                      onClick={() => toggle.mutate(g)}
                    >
                      {g.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      className={buttonGhost}
                      aria-label={t("common.remove")}
                      onClick={() =>
                        window.confirm(t("goals.deleteConfirm")) && remove.mutate(g.id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/** Sete quadradinhos (um por dia), mais escuros quanto mais perto da meta. */
export function WeekStrip({
  goal,
  checkins,
  days,
}: {
  goal: Goal;
  checkins: GoalCheckin[];
  days: string[];
}) {
  const { t, locale } = useClinicalI18n();
  const target = Number(goal.target_value) || 1;
  const pct = adherence(goal, checkins, days);
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" role="img" aria-label={t("goals.adherence", { pct })}>
        {days.map((d) => {
          const c = checkins.find((x) => x.goal_id === goal.id && x.day === d);
          const value = c ? Number(c.value) : 0;
          const ratio = Math.min(1, value / target);
          return (
            <span
              key={d}
              title={`${formatWeekday(parseDate(d), locale)}: ${formatNumber(value, locale)} / ${formatNumber(target, locale)} ${goal.unit}`}
              className="flex flex-col items-center gap-0.5"
            >
              <span
                className="h-6 w-6 rounded-md border border-primary/20"
                style={{
                  background: ratio
                    ? `color-mix(in oklch, var(--color-primary) ${Math.round(20 + ratio * 80)}%, transparent)`
                    : "var(--color-secondary)",
                }}
              />
              <span className="text-[9px] uppercase text-muted-foreground">
                {formatWeekday(parseDate(d), locale).slice(0, 1)}
              </span>
            </span>
          );
        })}
      </div>
      <span className="w-10 text-right text-sm font-bold tabular-nums text-foreground">{pct}%</span>
    </div>
  );
}

export function GoalForm({
  patientId,
  onClose,
  asProfessional = true,
}: {
  patientId: string;
  onClose: () => void;
  asProfessional?: boolean;
}) {
  const { t } = useClinicalI18n();
  const [icon, setIcon] = useState(GOAL_ICONS[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("1");
  const [unit, setUnit] = useState("");

  const save = useClinicalMutation(
    () =>
      records.saveGoal(
        {
          patient_id: patientId,
          icon,
          title: title.trim(),
          description: description.trim() || null,
          target_value: Number(target.replace(",", ".")) || 1,
          unit: unit.trim() || t("goals.defaultUnit"),
        },
        asProfessional,
      ),
    { success: t("goals.saved"), invalidate: [qk.goals(patientId)], onSuccess: onClose },
  );

  return (
    <Card title={t("goals.new")}>
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("goals.icon")}</p>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                aria-pressed={icon === i}
                onClick={() => setIcon(i)}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl border text-xl transition",
                  icon === i
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-background hover:bg-secondary",
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <Field label={t("goals.title")}>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("goals.titlePlaceholder")}
            />
          </Field>
          <Field label={t("goals.targetLabel")}>
            <input
              inputMode="decimal"
              className={inputClass}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </Field>
          <Field label={t("goals.unit")}>
            <input
              className={inputClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={t("goals.unitPlaceholder")}
            />
          </Field>
        </div>
        <Field label={t("goals.description")} hint={t("common.optional")}>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className={buttonPrimary}
            disabled={!title.trim() || save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </Card>
  );
}
