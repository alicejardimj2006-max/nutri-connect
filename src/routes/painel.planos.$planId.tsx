import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, FileDown, Send, Trash2, Utensils } from "lucide-react";
import { MealPlanEditor } from "@/components/clinical/meal-plan-editor";
import { MacroBars, MealPlanView } from "@/components/clinical/meal-plan-view";
import {
  Card,
  EmptyState,
  Loading,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import * as records from "@/lib/clinical/records";
import { planTotals } from "@/lib/clinical/plan";
import { exportMealPlanPdf } from "@/lib/clinical/plan-pdf";
import { qk, useClinicalMutation, useLinks, useMealPlan, usePeople } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/planos/$planId")({
  component: MealPlanPage,
});

function MealPlanPage() {
  const { planId } = Route.useParams();
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const navigate = useNavigate();
  const query = useMealPlan(planId);
  const links = useLinks("professional");
  const plan = query.data;
  const people = usePeople(plan ? [plan.patient_id] : []);

  const invalidate = plan
    ? [qk.plan(planId), qk.plans(plan.patient_id), qk.activePlan(plan.patient_id)]
    : [];
  const publish = useClinicalMutation(() => records.publishMealPlan(planId), {
    success: t("plan.published"),
    invalidate,
  });
  const rename = useClinicalMutation((title: string) => records.updateMealPlan(planId, { title }), {
    invalidate,
  });
  const duplicate = useClinicalMutation(() => records.duplicateMealPlan(planId), {
    success: t("plan.duplicated"),
    invalidate,
    onSuccess: (copy) => navigate({ to: "/painel/planos/$planId", params: { planId: copy.id } }),
  });
  const remove = useClinicalMutation(() => records.deleteMealPlan(planId), {
    success: t("plan.deleted"),
    invalidate,
    onSuccess: () =>
      plan &&
      navigate({ to: "/painel/pacientes/$patientId", params: { patientId: plan.patient_id } }),
  });

  if (query.isLoading) return <Loading />;
  if (!plan) return <EmptyState icon={Utensils} title={t("plan.notFound")} />;

  const patientName = people.data?.get(plan.patient_id)?.name ?? "";
  const linkActive = (links.data ?? []).some(
    (l) => l.patient_id === plan.patient_id && l.status === "ativo",
  );
  const editable = linkActive && plan.status !== "arquivado" && plan.professional_id === user?.id;

  const pdf = () =>
    exportMealPlanPdf({
      plan,
      patientName,
      professional: {
        name: user?.name ?? "",
        council: user?.professional?.council,
        registration: user?.professional?.registration,
        uf: user?.professional?.uf,
      },
      locale,
    });

  return (
    <>
      <Link
        to="/painel/pacientes/$patientId"
        params={{ patientId: plan.patient_id }}
        search={{ aba: "plano" }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {patientName}
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editable ? (
            <input
              key={plan.title}
              className={cn(
                inputClass,
                "max-w-xl border-transparent bg-transparent px-0 font-display text-2xl font-extrabold hover:border-border focus:px-3 sm:text-3xl",
              )}
              defaultValue={plan.title}
              aria-label={t("plan.planTitle")}
              onBlur={(e) =>
                e.target.value.trim() &&
                e.target.value !== plan.title &&
                rename.mutate(e.target.value.trim())
              }
            />
          ) : (
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{plan.title}</h1>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`plan.status.${plan.status}` as ClinicalKey)}
            {plan.published_at &&
              ` · ${t("plan.publishedAt", { date: formatDate(plan.published_at, locale) })}`}
            {plan.status === "rascunho" && ` · ${t("plan.draftHint")}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonSecondary} onClick={() => void pdf()}>
            <FileDown className="h-4 w-4" /> PDF
          </button>
          {linkActive && (
            <button
              type="button"
              className={buttonSecondary}
              disabled={duplicate.isPending}
              onClick={() => duplicate.mutate(undefined)}
            >
              <Copy className="h-4 w-4" /> {t("plan.duplicate")}
            </button>
          )}
          {plan.status === "rascunho" && (
            <button
              type="button"
              className={buttonDanger}
              onClick={() => window.confirm(t("plan.deleteConfirm")) && remove.mutate(undefined)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {editable && plan.status !== "ativo" && (
            <button
              type="button"
              className={buttonPrimary}
              disabled={publish.isPending || plan.meals.every((m) => m.items.length === 0)}
              onClick={() => window.confirm(t("plan.publishConfirm")) && publish.mutate(undefined)}
            >
              <Send className="h-4 w-4" /> {t("plan.publish")}
            </button>
          )}
        </div>
      </div>

      {editable ? (
        <MealPlanEditor plan={plan} />
      ) : (
        <div className="space-y-4">
          <Card>
            <MacroBars totals={planTotals(plan)} plan={plan} />
          </Card>
          <MealPlanView plan={plan} />
        </div>
      )}
    </>
  );
}
