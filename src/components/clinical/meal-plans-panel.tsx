import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Plus, Utensils } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as records from "@/lib/clinical/records";
import { qk, useAnthropometrics, useClinicalMutation, useMealPlans } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { Card, EmptyState, Field, Loading, buttonPrimary, buttonSecondary, inputClass } from "./ui";

const STATUS_STYLE = {
  ativo: "bg-primary-soft text-primary",
  rascunho: "bg-warning/15 text-warning",
  arquivado: "bg-muted text-muted-foreground",
} as const;

export function MealPlansPanel({ patientId, readOnly }: { patientId: string; readOnly: boolean }) {
  const { t, locale } = useClinicalI18n();
  const plans = useMealPlans(patientId);
  const [creating, setCreating] = useState(false);

  if (plans.isLoading) return <Loading />;
  const list = plans.data ?? [];

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end">
          <button type="button" className={buttonPrimary} onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {t("plan.new")}
          </button>
        </div>
      )}
      {list.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title={t("plan.empty")}
          text={readOnly ? undefined : t("plan.emptyText")}
        />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border/60">
            {list.map((p) => (
              <li key={p.id}>
                <Link
                  to="/painel/planos/$planId"
                  params={{ planId: p.id }}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Utensils className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.target_kcal ? `${p.target_kcal} kcal · ` : ""}
                      {p.published_at
                        ? t("plan.publishedAt", { date: formatDate(p.published_at, locale) })
                        : t("plan.createdAt", { date: formatDate(p.created_at, locale) })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      STATUS_STYLE[p.status],
                    )}
                  >
                    {t(`plan.status.${p.status}` as ClinicalKey)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {creating && <NewPlanDialog patientId={patientId} onClose={() => setCreating(false)} />}
    </div>
  );
}

function NewPlanDialog({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { t } = useClinicalI18n();
  const navigate = useNavigate();
  const anthro = useAnthropometrics(patientId);
  const lastTdee = [...(anthro.data ?? [])].reverse().find((a) => a.tdee_kcal)?.tdee_kcal ?? null;
  const [title, setTitle] = useState(t("plan.defaultTitle"));
  const [kcal, setKcal] = useState<string | null>(null);
  const kcalValue = kcal ?? (lastTdee ? String(lastTdee) : "");

  const create = useClinicalMutation(
    () =>
      records.createMealPlan({
        patientId,
        title: title.trim() || t("plan.defaultTitle"),
        targetKcal: kcalValue ? Math.round(Number(kcalValue)) : null,
      }),
    {
      invalidate: [qk.plans(patientId)],
      onSuccess: (plan) => navigate({ to: "/painel/planos/$planId", params: { planId: plan.id } }),
    },
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("plan.new")}</DialogTitle>
          <DialogDescription>{t("plan.newText")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label={t("plan.planTitle")}>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field
            label={t("plan.targetKcal")}
            hint={lastTdee ? t("plan.tdeeHint", { kcal: lastTdee }) : t("common.optional")}
          >
            <input
              inputMode="numeric"
              className={inputClass}
              value={kcalValue}
              onChange={(e) => setKcal(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className={buttonPrimary}
            disabled={create.isPending}
            onClick={() => create.mutate(undefined)}
          >
            {t("plan.create")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
