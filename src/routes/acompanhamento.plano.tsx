import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileDown, History, Utensils } from "lucide-react";
import { MacroBars, MealPlanView } from "@/components/clinical/meal-plan-view";
import { NextMeal } from "@/components/clinical/next-meal";
import { PatientCarePlans } from "@/components/clinical/care-plans-panel";
import { ShoppingList } from "@/components/clinical/shopping-list";
import {
  Card,
  EmptyState,
  Loading,
  PageHeader,
  buttonPrimary,
  buttonSecondary,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import { planTotals } from "@/lib/clinical/plan";
import { exportMealPlanPdf } from "@/lib/clinical/plan-pdf";
import type { FullMealPlan } from "@/lib/clinical/records";
import { useDirectoryEntry, useMealPlan, useMealPlans, usePeople } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { scrollToTop } from "@/lib/app-scroll";

export const Route = createFileRoute("/acompanhamento/plano")({
  component: PatientPlanPage,
});

function PatientPlanPage() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const plans = useMealPlans(user?.id ?? "");
  const published = (plans.data ?? []).filter((p) => p.status !== "rascunho");
  const active = published.filter((p) => p.status === "ativo");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentId = selectedId ?? active[0]?.id ?? published[0]?.id ?? "";
  const plan = useMealPlan(currentId);

  if (plans.isLoading) return <Loading />;
  if (!published.length) {
    return (
      <>
        <PageHeader title={t("patientPlan.title")} />
        {user && (
          <div className="mb-6">
            <PatientCarePlans patientId={user.id} />
          </div>
        )}
        <EmptyState
          icon={Utensils}
          title={t("patientPlan.empty")}
          text={t("patientPlan.emptyText")}
          action={
            <Link to="/profissionais" className={buttonPrimary}>
              {t("patientNav.findProfessional")}
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("patientPlan.title")}
        subtitle={plan.data ? <PlanSubtitle plan={plan.data} /> : undefined}
        action={plan.data && <PdfButton plan={plan.data} patientName={user?.name ?? ""} />}
      />

      {active.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {active.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium",
                p.id === currentId
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {plan.isLoading || !plan.data ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {plan.data.status === "arquivado" && (
            <p className="rounded-xl bg-warning/10 px-4 py-2 text-sm text-warning">
              {t("patientPlan.archivedNotice")}
            </p>
          )}
          {plan.data.status === "ativo" && <NextMeal plan={plan.data} />}
          <Card>
            <MacroBars totals={planTotals(plan.data)} plan={plan.data} />
          </Card>
          <MealPlanView plan={plan.data} />
          <ShoppingList plan={plan.data} />
        </div>
      )}

      {published.length > 1 && (
        <Card title={t("patientPlan.history")} className="mt-6">
          <ul className="divide-y divide-border/60">
            {published.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id);
                    scrollToTop();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 py-2.5 text-left text-sm",
                    p.id === currentId && "font-semibold",
                  )}
                >
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.status === "ativo"
                      ? t("plan.status.ativo")
                      : formatDate(p.published_at ?? p.created_at, locale)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {user && (
        <div className="mt-6">
          <PatientCarePlans patientId={user.id} />
        </div>
      )}
    </>
  );
}

function PlanSubtitle({ plan }: { plan: FullMealPlan }) {
  const { t, locale } = useClinicalI18n();
  const people = usePeople([plan.professional_id]);
  return (
    <>
      {t("patientPlan.by", { name: people.data?.get(plan.professional_id)?.name ?? "…" })}
      {plan.published_at &&
        ` · ${t("plan.publishedAt", { date: formatDate(plan.published_at, locale) })}`}
    </>
  );
}

function PdfButton({ plan, patientName }: { plan: FullMealPlan; patientName: string }) {
  const { locale } = useClinicalI18n();
  const pro = useDirectoryEntry(plan.professional_id);
  return (
    <button
      type="button"
      className={buttonSecondary}
      onClick={() =>
        void exportMealPlanPdf({
          plan,
          patientName,
          professional: {
            name: pro.data?.name ?? "",
            council: pro.data?.council ?? undefined,
            registration: pro.data?.registration ?? undefined,
            uf: pro.data?.uf ?? undefined,
          },
          locale,
        })
      }
    >
      <FileDown className="h-4 w-4" /> PDF
    </button>
  );
}
