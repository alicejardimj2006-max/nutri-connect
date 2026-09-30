import { useMemo, useState } from "react";
import { Plus, Ruler, Trash2 } from "lucide-react";
import * as records from "@/lib/clinical/records";
import type { Anthropometric } from "@/lib/clinical/records";
import {
  ACTIVITY_FACTORS,
  CIRCUMFERENCE_SITES,
  assess,
  bmi,
  protocolSites,
  type BmrFormula,
  type BodyFatProtocol,
  type CircumferenceSite,
  type Sex,
  type SkinfoldSite,
} from "@/lib/clinical/calc";
import { qk, useAnthropometrics, useClinicalMutation } from "@/lib/clinical/queries";
import { ageFrom, formatDate, formatNumber, toDateKey } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { EvolutionCharts } from "./evolution-charts";
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

type NumMap<K extends string> = Partial<Record<K, string>>;

const num = (v: string | undefined) => {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const numbers = <K extends string>(m: NumMap<K>) =>
  Object.fromEntries(
    Object.entries(m)
      .map(([k, v]) => [k, num(v as string)])
      .filter(([, v]) => v !== undefined),
  ) as Partial<Record<K, number>>;

export function AnthropometryPanel({
  patientId,
  birthDate,
  sex: patientSex,
  readOnly,
  currentProfessionalId,
}: {
  patientId: string;
  birthDate?: string | null;
  sex?: string | null;
  readOnly: boolean;
  currentProfessionalId: string;
}) {
  const { t, locale } = useClinicalI18n();
  const rows = useAnthropometrics(patientId);
  const [adding, setAdding] = useState(false);
  const remove = useClinicalMutation((id: string) => records.deleteAnthropometric(id), {
    success: t("anthro.deleted"),
    invalidate: [qk.anthropometrics(patientId)],
  });

  if (rows.isLoading) return <Loading />;
  const list = rows.data ?? [];
  const lastHeight = [...list].reverse().find((r) => r.height_cm)?.height_cm ?? null;

  return (
    <div className="space-y-4">
      {!readOnly && !adding && (
        <div className="flex justify-end">
          <button type="button" className={buttonPrimary} onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> {t("anthro.new")}
          </button>
        </div>
      )}
      {adding && (
        <AssessmentForm
          patientId={patientId}
          age={ageFrom(birthDate)}
          defaultSex={(patientSex as Sex) ?? null}
          lastHeight={lastHeight ? Number(lastHeight) : null}
          onClose={() => setAdding(false)}
        />
      )}

      {list.length === 0 ? (
        !adding && <EmptyState icon={Ruler} title={t("anthro.empty")} />
      ) : (
        <>
          <EvolutionCharts rows={list} />
          <Card title={t("anthro.history")} padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">{t("anthro.date")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("anthro.weight")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("anthro.bmi")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("anthro.bodyFat")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("anthro.circ.waist")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("anthro.bmr")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("anthro.tdee")}</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {[...list].reverse().map((r) => (
                    <HistoryRow
                      key={r.id}
                      row={r}
                      heightFallback={lastHeight ? Number(lastHeight) : null}
                      canDelete={!readOnly && r.professional_id === currentProfessionalId}
                      onDelete={() =>
                        window.confirm(t("anthro.deleteConfirm")) && remove.mutate(r.id)
                      }
                      locale={locale}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function HistoryRow({
  row,
  heightFallback,
  canDelete,
  onDelete,
  locale,
}: {
  row: Anthropometric;
  heightFallback: number | null;
  canDelete: boolean;
  onDelete: () => void;
  locale: Parameters<typeof formatNumber>[1];
}) {
  const { t } = useClinicalI18n();
  const h = row.height_cm ? Number(row.height_cm) : heightFallback;
  const imc = row.weight_kg && h ? bmi(Number(row.weight_kg), h) : null;
  const waist = (row.circumferences as Record<string, number> | null)?.waist;
  const cell = (v: number | null | undefined, digits = 1) =>
    v ? formatNumber(Number(v), locale, digits) : "—";
  return (
    <tr className="border-b border-border/40 last:border-0">
      <td className="px-4 py-2">
        <span className="font-medium text-foreground">{formatDate(row.measured_at, locale)}</span>
        {!row.professional_id && (
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
            {t("evolution.selfReported")}
          </span>
        )}
      </td>
      <td className="px-2 py-2 text-right tabular-nums">{cell(row.weight_kg)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{cell(imc)}</td>
      <td className="px-2 py-2 text-right tabular-nums">
        {row.body_fat_pct ? `${cell(row.body_fat_pct)}%` : "—"}
      </td>
      <td className="px-2 py-2 text-right tabular-nums">{cell(waist)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{cell(row.bmr_kcal, 0)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{cell(row.tdee_kcal, 0)}</td>
      <td className="px-4 py-2 text-right">
        {canDelete && (
          <button
            type="button"
            className={buttonGhost}
            aria-label={t("common.remove")}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

function AssessmentForm({
  patientId,
  age,
  defaultSex,
  lastHeight,
  onClose,
}: {
  patientId: string;
  age: number | null;
  defaultSex: Sex | null;
  lastHeight: number | null;
  onClose: () => void;
}) {
  const { t, locale } = useClinicalI18n();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState(lastHeight ? String(lastHeight) : "");
  const [sex, setSex] = useState<Sex | null>(defaultSex);
  const [circ, setCirc] = useState<NumMap<CircumferenceSite>>({});
  const [protocol, setProtocol] = useState<BodyFatProtocol>("jp3");
  const [folds, setFolds] = useState<NumMap<SkinfoldSite>>({});
  const [manualFat, setManualFat] = useState("");
  const [activity, setActivity] = useState<number>(1.55);
  const [formula, setFormula] = useState<BmrFormula>("mifflin");
  const [notes, setNotes] = useState("");

  const sites = protocolSites(protocol, sex);
  const result = useMemo(
    () =>
      assess({
        weightKg: num(weight) ?? null,
        heightCm: num(height) ?? null,
        circumferences: numbers(circ),
        skinfolds: numbers(folds),
        protocol,
        manualBodyFat: num(manualFat) ?? null,
        activityFactor: activity,
        bmrFormula: formula,
        sex,
        age,
      }),
    [weight, height, circ, folds, protocol, manualFat, activity, formula, sex, age],
  );

  const save = useClinicalMutation(
    () => {
      const skinfolds = Object.fromEntries(
        Object.entries(numbers(folds)).filter(([k]) => sites.includes(k as SkinfoldSite)),
      );
      return records.addAnthropometric(
        {
          patient_id: patientId,
          measured_at: date,
          weight_kg: num(weight) ?? null,
          height_cm: num(height) ?? null,
          circumferences: numbers(circ),
          skinfolds,
          body_fat_protocol: result.bodyFat ? protocol : null,
          body_fat_pct: result.bodyFat,
          activity_factor: activity,
          bmr_formula: formula,
          bmr_kcal: result.bmrKcal,
          tdee_kcal: result.tdeeKcal,
          notes: notes.trim() || null,
        },
        true,
      );
    },
    { success: t("anthro.saved"), invalidate: [qk.anthropometrics(patientId)], onSuccess: onClose },
  );

  const numInput = (value: string, onChange: (v: string) => void, label: string, unit: string) => (
    <Field label={`${label} (${unit})`}>
      <input
        inputMode="decimal"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );

  return (
    <Card title={t("anthro.new")}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label={t("anthro.date")}>
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            {numInput(weight, setWeight, t("anthro.weight"), "kg")}
            {numInput(height, setHeight, t("anthro.height"), "cm")}
            <Field label={t("anthro.sex")}>
              <select
                className={inputClass}
                value={sex ?? ""}
                onChange={(e) => setSex((e.target.value || null) as Sex | null)}
              >
                <option value="">—</option>
                <option value="feminino">{t("record.sex.feminino")}</option>
                <option value="masculino">{t("record.sex.masculino")}</option>
              </select>
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">
              {t("anthro.circumferences")}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CIRCUMFERENCE_SITES.map((s) => (
                <Field key={s} label={`${t(`anthro.circ.${s}` as ClinicalKey)} (cm)`}>
                  <input
                    inputMode="decimal"
                    className={inputClass}
                    value={circ[s] ?? ""}
                    onChange={(e) => setCirc((c) => ({ ...c, [s]: e.target.value }))}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">
              {t("anthro.composition")}
            </p>
            <Field label={t("anthro.protocol")} className="mb-3 max-w-sm">
              <select
                className={inputClass}
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as BodyFatProtocol)}
              >
                {(["jp3", "jp7", "durnin", "bioimpedancia", "manual"] as const).map((p) => (
                  <option key={p} value={p}>
                    {t(`anthro.protocol.${p}` as ClinicalKey)}
                  </option>
                ))}
              </select>
            </Field>
            {protocol === "bioimpedancia" || protocol === "manual" ? (
              <div className="max-w-40">
                {numInput(manualFat, setManualFat, t("anthro.bodyFat"), "%")}
              </div>
            ) : !sex || age === null ? (
              <p className="text-xs text-warning">{t("anthro.needsSexAge")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {sites.map((s) => (
                  <Field key={s} label={`${t(`anthro.fold.${s}` as ClinicalKey)} (mm)`}>
                    <input
                      inputMode="decimal"
                      className={inputClass}
                      value={folds[s] ?? ""}
                      onChange={(e) => setFolds((f) => ({ ...f, [s]: e.target.value }))}
                    />
                  </Field>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("anthro.activity")}>
              <select
                className={inputClass}
                value={activity}
                onChange={(e) => setActivity(Number(e.target.value))}
              >
                {ACTIVITY_FACTORS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {t(`anthro.activity.${a.key}` as ClinicalKey)} ({a.value})
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("anthro.formula")}>
              <select
                className={inputClass}
                value={formula}
                onChange={(e) => setFormula(e.target.value as BmrFormula)}
              >
                {(["mifflin", "harris_benedict", "fao_who"] as const).map((f) => (
                  <option key={f} value={f}>
                    {t(`anthro.formula.${f}` as ClinicalKey)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={t("anthro.notes")} hint={t("common.optional")}>
            <input
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>

        <aside className="h-fit rounded-2xl bg-secondary/60 p-4 lg:sticky lg:top-24">
          <p className="mb-3 font-display text-base font-bold text-foreground">
            {t("anthro.results")}
          </p>
          <dl className="space-y-2.5 text-sm">
            <Result
              label={t("anthro.bmi")}
              value={result.bmi ? formatNumber(result.bmi, locale) : null}
              note={
                result.bmiClass ? t(`anthro.bmiClass.${result.bmiClass}` as ClinicalKey) : undefined
              }
            />
            <Result
              label={t("anthro.bodyFat")}
              value={result.bodyFat ? `${formatNumber(result.bodyFat, locale)}%` : null}
              note={
                result.density
                  ? t("anthro.density", { d: formatNumber(result.density, locale, 4) })
                  : undefined
              }
            />
            <Result
              label={t("anthro.fatMass")}
              value={result.fatMassKg ? `${formatNumber(result.fatMassKg, locale)} kg` : null}
            />
            <Result
              label={t("anthro.leanMass")}
              value={result.leanMassKg ? `${formatNumber(result.leanMassKg, locale)} kg` : null}
            />
            <Result
              label={t("anthro.bmr")}
              value={result.bmrKcal ? `${result.bmrKcal} kcal` : null}
            />
            <Result
              label={t("anthro.tdee")}
              value={result.tdeeKcal ? `${result.tdeeKcal} kcal` : null}
              highlight
            />
            <Result
              label={t("anthro.waistRisk")}
              value={result.waistRisk ? t(`anthro.risk.${result.waistRisk}` as ClinicalKey) : null}
            />
            <Result
              label={t("anthro.whr")}
              value={result.whr ? formatNumber(result.whr, locale, 2) : null}
              note={result.whrRisk ? t(`anthro.risk.${result.whrRisk}` as ClinicalKey) : undefined}
            />
          </dl>
          {age === null && (
            <p className="mt-3 text-xs text-muted-foreground">{t("anthro.noBirthDate")}</p>
          )}
        </aside>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button
          type="button"
          className={buttonPrimary}
          disabled={!num(weight) || save.isPending}
          onClick={() => save.mutate(undefined)}
        >
          {t("anthro.save")}
        </button>
      </div>
    </Card>
  );
}

function Result({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string | null;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right font-semibold tabular-nums text-foreground",
          highlight && "text-accent",
        )}
      >
        {value ?? "—"}
        {note && (
          <span className="block text-[11px] font-normal text-muted-foreground">{note}</span>
        )}
      </dd>
    </div>
  );
}
