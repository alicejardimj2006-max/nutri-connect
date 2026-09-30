import { useMemo } from "react";
import { Clock } from "lucide-react";
import type { FullMealPlan } from "@/lib/clinical/records";
import { mainItems } from "@/lib/clinical/plan";
import { shortTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";

/** Destaque da próxima refeição do dia, pelo horário. */
export function NextMeal({ plan }: { plan: FullMealPlan }) {
  const { t } = useClinicalI18n();
  const next = useMemo(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const withTime = plan.meals.filter((m) => m.time_of_day && mainItems(m.items).length);
    const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
    return withTime.find((m) => toMin(m.time_of_day!) >= minutes - 30) ?? null;
  }, [plan]);
  if (!next) return null;
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent-soft/50 p-4">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
        <Clock className="h-3.5 w-3.5" /> {t("patientPlan.next")} · {shortTime(next.time_of_day)}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-foreground">{next.name}</p>
      <p className="mt-1 text-sm text-foreground">
        {mainItems(next.items)
          .map((i) =>
            i.household_measure
              ? `${i.household_measure} ${t("pdf.of")} ${i.food_name.split(",")[0].toLowerCase()}`
              : i.food_name.split(",")[0],
          )
          .join(" · ")}
      </p>
    </div>
  );
}
