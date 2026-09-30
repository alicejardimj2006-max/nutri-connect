import { useEffect, useMemo, useState } from "react";
import { CalendarX2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSlots } from "@/lib/clinical/queries";
import type { AppointmentModality, Slot } from "@/lib/clinical/api";
import { addDays, formatDate, formatTime, formatWeekday, toDateKey } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Loading } from "./ui";

const WINDOW_DAYS = 28;

/** Faixa de dias + horários livres de um profissional (no fuso do navegador). */
export function SlotPicker({
  professionalId,
  modality,
  value,
  onChange,
}: {
  professionalId: string;
  modality?: AppointmentModality;
  value?: string;
  onChange: (slot: Slot | null) => void;
}) {
  const { t, locale } = useClinicalI18n();
  const today = useMemo(() => new Date(), []);
  const from = toDateKey(today);
  const to = toDateKey(addDays(today, WINDOW_DAYS));
  const { data: slots, isLoading } = useSlots(professionalId, from, to);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      if (modality && s.modality !== "ambos" && s.modality !== modality) continue;
      const key = toDateKey(new Date(s.starts_at));
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [slots, modality]);

  const days = useMemo(
    () => Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(today, i)),
    [today],
  );
  const firstAvailable = days.find((d) => byDay.has(toDateKey(d)));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const activeDay =
    selectedDay && byDay.has(selectedDay)
      ? selectedDay
      : firstAvailable
        ? toDateKey(firstAvailable)
        : null;

  // Se o horário escolhido sumiu (modalidade trocada, alguém reservou), limpa a seleção.
  useEffect(() => {
    if (value && slots && !slots.some((s) => s.starts_at === value)) onChange(null);
  }, [slots, value, onChange]);

  if (isLoading) return <Loading />;

  if (!firstAvailable) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        <CalendarX2 className="h-6 w-6" />
        {t("booking.noSlots")}
      </div>
    );
  }

  const daySlots = activeDay ? (byDay.get(activeDay) ?? []) : [];

  return (
    <div className="min-w-0">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {days.map((d) => {
          const key = toDateKey(d);
          const available = byDay.has(key);
          const active = key === activeDay;
          return (
            <button
              key={key}
              type="button"
              disabled={!available}
              onClick={() => {
                setSelectedDay(key);
                onChange(null);
              }}
              className={cn(
                "flex w-14 shrink-0 flex-col items-center rounded-xl border px-1 py-2 text-center transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : available
                    ? "border-border bg-background hover:border-primary"
                    : "border-transparent bg-secondary/50 text-muted-foreground/50",
              )}
            >
              <span className="text-[10px] font-semibold uppercase">
                {formatWeekday(d, locale)}
              </span>
              <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
              <span className="text-[10px]">{formatDate(d, locale, { month: "short" })}</span>
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-3 text-xs font-medium text-muted-foreground">
        {activeDay &&
          formatDate(activeDay, locale, { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {daySlots.map((s) => {
          const active = s.starts_at === value;
          return (
            <button
              key={s.starts_at}
              type="button"
              onClick={() => onChange(active ? null : s)}
              className={cn(
                "rounded-lg border px-2 py-2 text-sm font-semibold transition",
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-background hover:border-accent",
              )}
            >
              {formatTime(s.starts_at, locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
