import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EyeOff, LineChart, Scale, Trash2 } from "lucide-react";
import { NoNumbersToggle } from "@/components/no-numbers";
import { useTr } from "@/components/settings-ui";
import { useNoNumbers } from "@/lib/no-numbers";
import { EvolutionCharts } from "@/components/clinical/evolution-charts";
import {
  Card,
  EmptyState,
  Field,
  Loading,
  PageHeader,
  buttonGhost,
  buttonPrimary,
  inputClass,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import * as records from "@/lib/clinical/records";
import { bmi, bmiClass } from "@/lib/clinical/calc";
import { qk, useAnthropometrics, useClinicalMutation } from "@/lib/clinical/queries";
import { ageFrom, formatDate, formatNumber, toDateKey } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { PatientAssessments } from "@/components/clinical/assessments-panel";

export const Route = createFileRoute("/acompanhamento/evolucao")({
  component: PatientEvolutionPage,
});

function PatientEvolutionPage() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const tr = useTr();
  const noNumbers = useNoNumbers();
  const [reveal, setReveal] = useState(false);
  const rows = useAnthropometrics(user?.id);
  const list = rows.data ?? [];
  const remove = useClinicalMutation((id: string) => records.deleteAnthropometric(id), {
    success: t("anthro.deleted"),
    invalidate: [qk.anthropometrics(user?.id ?? "")],
  });

  if (!user) return null;
  if (noNumbers && !reveal) {
    return (
      <>
        <PageHeader title={t("patientEvolution.title")} subtitle={t("patientEvolution.subtitle")} />
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <EyeOff className="h-8 w-8 text-accent" />
            <p className="max-w-md text-sm text-foreground">
              {tr([
                "O modo sem números está ligado. Suas medidas continuam guardadas e sua nutri acompanha por você; aqui o foco é como você se sente.",
                "No-numbers mode is on. Your measurements are still saved and your dietitian follows them for you; here the focus is how you feel.",
                "El modo sin números está activado. Tus medidas siguen guardadas y tu nutri las sigue por ti; aquí el foco es cómo te sientes.",
                "Le mode sans chiffres est activé. Vos mesures restent enregistrées et votre diététicien(ne) les suit pour vous ; ici, l'accent est sur vos ressentis.",
              ])}
            </p>
            <button type="button" className={buttonGhost} onClick={() => setReveal(true)}>
              {tr([
                "Mostrar os números só desta vez",
                "Show the numbers just this once",
                "Mostrar los números solo esta vez",
                "Afficher les chiffres juste cette fois",
              ])}
            </button>
          </div>
        </Card>
        <NoNumbersToggle className="mt-4" />
      </>
    );
  }
  const height = [...list].reverse().find((r) => r.height_cm)?.height_cm;
  const last = [...list].reverse().find((r) => r.weight_kg);
  const imc = last && height ? bmi(Number(last.weight_kg), Number(height)) : null;

  return (
    <>
      <PageHeader title={t("patientEvolution.title")} subtitle={t("patientEvolution.subtitle")} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {rows.isLoading ? (
            <Loading />
          ) : list.length === 0 ? (
            <EmptyState
              icon={LineChart}
              title={t("patientEvolution.empty")}
              text={t("patientEvolution.emptyText")}
            />
          ) : (
            <EvolutionCharts rows={list} />
          )}
          {imc && (
            <p className="text-sm text-muted-foreground">
              {t("patientEvolution.bmi", {
                value: formatNumber(imc, locale),
                label: t(
                  `anthro.bmiClass.${bmiClass(imc, ageFrom(user.birthDate))}` as ClinicalKey,
                ),
              })}
            </p>
          )}
          {list.length > 0 && (
            <Card title={t("anthro.history")} padded={false}>
              <ul className="divide-y divide-border/60">
                {[...list].reverse().map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="w-28 shrink-0 text-muted-foreground">
                      {formatDate(r.measured_at, locale)}
                    </span>
                    <span className="flex-1 tabular-nums text-foreground">
                      {r.weight_kg ? `${formatNumber(Number(r.weight_kg), locale)} kg` : "—"}
                      {(r.circumferences as Record<string, number> | null)?.waist
                        ? ` · ${t("anthro.circ.waist")} ${formatNumber((r.circumferences as Record<string, number>).waist, locale)} cm`
                        : ""}
                      {r.body_fat_pct
                        ? ` · ${formatNumber(Number(r.body_fat_pct), locale)}% ${t("patientEvolution.fat")}`
                        : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r.professional_id
                        ? t("evolution.byProfessional")
                        : t("evolution.selfReported")}
                    </span>
                    {!r.professional_id && (
                      <button
                        type="button"
                        className={buttonGhost}
                        aria-label={t("common.remove")}
                        onClick={() => remove.mutate(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <PatientAssessments patientId={user.id} />
        </div>
        <SelfWeighIn patientId={user.id} />
      </div>
    </>
  );
}

function SelfWeighIn({ patientId }: { patientId: string }) {
  const { t } = useClinicalI18n();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const n = (v: string) => Number(v.replace(",", "."));
  const save = useClinicalMutation(
    () =>
      records.addAnthropometric(
        {
          patient_id: patientId,
          measured_at: date,
          weight_kg: n(weight) || null,
          circumferences: n(waist) ? { waist: n(waist) } : {},
          notes: t("patientEvolution.selfNote"),
        },
        false,
      ),
    {
      success: t("patientEvolution.saved"),
      invalidate: [qk.anthropometrics(patientId)],
      onSuccess: () => {
        setWeight("");
        setWaist("");
      },
    },
  );
  return (
    <Card title={t("patientEvolution.logTitle")} className="h-fit">
      <p className="-mt-2 mb-3 text-xs text-muted-foreground">{t("patientEvolution.logHint")}</p>
      <div className="space-y-3">
        <Field label={t("anthro.date")}>
          <input
            type="date"
            className={inputClass}
            value={date}
            max={toDateKey(new Date())}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label={`${t("anthro.weight")} (kg)`}>
          <input
            inputMode="decimal"
            className={inputClass}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </Field>
        <Field label={`${t("anthro.circ.waist")} (cm)`} hint={t("common.optional")}>
          <input
            inputMode="decimal"
            className={inputClass}
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
          />
        </Field>
        <button
          type="button"
          className={`${buttonPrimary} w-full`}
          disabled={!(n(weight) > 0) || save.isPending}
          onClick={() => save.mutate(undefined)}
        >
          <Scale className="h-4 w-4" /> {t("patientEvolution.log")}
        </button>
      </div>
    </Card>
  );
}
