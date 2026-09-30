import { useEffect, useState, type ReactNode } from "react";
import { ClipboardList } from "lucide-react";
import * as records from "@/lib/clinical/records";
import type { AnamnesisData } from "@/lib/clinical/records";
import { qk, useAnamnesis, useClinicalMutation } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { Card, EmptyState, Field, Loading, buttonPrimary, inputClass } from "./ui";

type Section = keyof Pick<AnamnesisData, "clinicalHistory" | "lifestyle" | "eating">;

export function AnamnesisForm({
  patientId,
  professionalId,
  readOnly,
}: {
  patientId: string;
  professionalId: string;
  readOnly: boolean;
}) {
  const { t, locale } = useClinicalI18n();
  const query = useAnamnesis(patientId, professionalId);
  const [data, setData] = useState<AnamnesisData>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (query.data) setData(query.data.data ?? {});
  }, [query.data]);

  const save = useClinicalMutation(() => records.saveAnamnesis(patientId, data), {
    success: t("anamnesis.saved"),
    invalidate: [qk.anamnesis(patientId, professionalId)],
    onSuccess: () => setDirty(false),
  });

  const setTop = (key: keyof AnamnesisData, value: unknown) => {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
  };
  const setNested = (section: Section, key: string, value: unknown) => {
    setData((d) => ({ ...d, [section]: { ...(d[section] ?? {}), [key]: value } }));
    setDirty(true);
  };
  const nested = (section: Section, key: string) =>
    ((data[section] as Record<string, unknown> | undefined)?.[key] ?? "") as string | number;

  if (query.isLoading) return <Loading />;
  if (readOnly && !query.data) {
    return <EmptyState icon={ClipboardList} title={t("anamnesis.empty")} />;
  }

  const text = (label: ClinicalKey, value: string, onChange: (v: string) => void, rows = 2) => (
    <Field label={t(label)}>
      <textarea
        rows={rows}
        disabled={readOnly}
        className={cn(inputClass, "resize-y")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
  const line = (label: ClinicalKey, section: Section, key: string, type = "text") => (
    <Field label={t(label)}>
      <input
        type={type}
        step="any"
        disabled={readOnly}
        className={inputClass}
        value={nested(section, key)}
        onChange={(e) =>
          setNested(
            section,
            key,
            type === "number"
              ? e.target.value === ""
                ? null
                : Number(e.target.value)
              : e.target.value,
          )
        }
      />
    </Field>
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(undefined);
      }}
    >
      {query.data && (
        <p className="text-xs text-muted-foreground">
          {t("anamnesis.updatedAt", {
            date: formatDate(query.data.updated_at, locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })}
        </p>
      )}

      <Group title={t("anamnesis.section.main")}>
        {text("anamnesis.chiefComplaint", data.chiefComplaint ?? "", (v) =>
          setTop("chiefComplaint", v),
        )}
        {text("anamnesis.goals", data.goals ?? "", (v) => setTop("goals", v))}
      </Group>

      <Group title={t("anamnesis.section.clinical")}>
        <Field label={t("anamnesis.conditions")} hint={t("anamnesis.commaHint")}>
          <input
            disabled={readOnly}
            className={inputClass}
            value={(data.clinicalHistory?.conditions ?? []).join(", ")}
            onChange={(e) =>
              setNested(
                "clinicalHistory",
                "conditions",
                e.target.value
                  .split(",")
                  .map((s) => s.trimStart())
                  .filter((s, i, arr) => s || i === arr.length - 1),
              )
            }
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          {line("anamnesis.medications", "clinicalHistory", "medications")}
          {line("anamnesis.supplements", "clinicalHistory", "supplements")}
          {line("anamnesis.allergies", "clinicalHistory", "allergies")}
          {line("anamnesis.intolerances", "clinicalHistory", "intolerances")}
          {line("anamnesis.surgeries", "clinicalHistory", "surgeries")}
        </div>
        {text("anamnesis.familyHistory", data.familyHistory ?? "", (v) =>
          setTop("familyHistory", v),
        )}
      </Group>

      <Group title={t("anamnesis.section.lifestyle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {line("anamnesis.occupation", "lifestyle", "occupation")}
          {line("anamnesis.physicalActivity", "lifestyle", "physicalActivity")}
          {line("anamnesis.sleepHours", "lifestyle", "sleepHours", "number")}
          {line("anamnesis.sleepQuality", "lifestyle", "sleepQuality")}
          {line("anamnesis.waterLiters", "lifestyle", "waterLiters", "number")}
          {line("anamnesis.alcohol", "lifestyle", "alcohol")}
          {line("anamnesis.bowel", "lifestyle", "bowel")}
          {line("anamnesis.stress", "lifestyle", "stress")}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={readOnly}
            className="h-4 w-4 accent-[var(--color-primary)]"
            checked={!!data.lifestyle?.smoking}
            onChange={(e) => setNested("lifestyle", "smoking", e.target.checked)}
          />
          {t("anamnesis.smoking")}
        </label>
      </Group>

      <Group title={t("anamnesis.section.eating")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {line("anamnesis.mealsPerDay", "eating", "mealsPerDay", "number")}
          {line("anamnesis.whoCooks", "eating", "whoCooks")}
          {line("anamnesis.eatsOut", "eating", "eatsOut")}
          {line("anamnesis.cravings", "eating", "cravings")}
          {line("anamnesis.preferences", "eating", "preferences")}
          {line("anamnesis.aversions", "eating", "aversions")}
        </div>
        {text(
          "anamnesis.recall24h",
          String(nested("eating", "recall24h")),
          (v) => setNested("eating", "recall24h", v),
          4,
        )}
      </Group>

      <Group title={t("anamnesis.section.other")}>
        {text("anamnesis.labNotes", data.labNotes ?? "", (v) => setTop("labNotes", v))}
        {text("anamnesis.notes", data.notes ?? "", (v) => setTop("notes", v), 3)}
      </Group>

      {!readOnly && (
        <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
          <button
            type="submit"
            className={cn(buttonPrimary, "shadow-lg")}
            disabled={!dirty || save.isPending}
          >
            {t("anamnesis.save")}
          </button>
        </div>
      )}
    </form>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title}>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}
