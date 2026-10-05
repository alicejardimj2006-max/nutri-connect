import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { summarizePatient } from "@/lib/patient-summary.functions";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Card, buttonPrimary } from "./ui";

/** Resumo do paciente gerado pela IA. Só exibe: nada é salvo na ficha. */
export function AiSummaryCard({ patientId }: { patientId: string }) {
  const { t, locale } = useClinicalI18n();
  const [days, setDays] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await summarizePatient({ data: { patientId, days, locale } });
      if ("summary" in res) setSummary(res.summary);
      else setError(res.error);
    } catch {
      setError(t("ai.summary.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="mb-4"
      title={
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" /> {t("ai.summary.title")}
        </span>
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t("ai.summary.title")}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) === 30 ? 30 : 7)}
            disabled={loading}
            className="rounded-full border border-border bg-background px-3 py-2 text-sm"
          >
            <option value={7}>{t("ai.summary.days7")}</option>
            <option value={30}>{t("ai.summary.days30")}</option>
          </select>
          <button type="button" className={buttonPrimary} disabled={loading} onClick={generate}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading
              ? t("ai.summary.generating")
              : summary
                ? t("ai.summary.regenerate")
                : t("ai.summary.generate")}
          </button>
        </div>
      }
    >
      {!summary && !error && (
        <p className="text-sm text-muted-foreground">{t("ai.summary.hint")}</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {summary && (
        <>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{summary}</p>
          <p className="mt-3 text-xs text-muted-foreground">{t("ai.summary.disclaimer")}</p>
        </>
      )}
    </Card>
  );
}
