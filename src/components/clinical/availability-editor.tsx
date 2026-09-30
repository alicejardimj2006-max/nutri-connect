import { useState } from "react";
import { CalendarOff, Plus, Trash2, X } from "lucide-react";
import * as api from "@/lib/clinical/api";
import {
  useAvailabilityBlocks,
  useAvailabilityRules,
  useClinicalMutation,
  qk,
} from "@/lib/clinical/queries";
import { formatDate, formatTime, shortTime, weekdayName } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { Card, Field, Loading, buttonGhost, buttonSecondary, inputClass } from "./ui";

// Segunda a domingo.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
type RuleModality = "ambos" | "online" | "presencial";

export function AvailabilityEditor({ professionalId }: { professionalId: string }) {
  const { t, locale } = useClinicalI18n();
  const rules = useAvailabilityRules(professionalId);
  const [adding, setAdding] = useState<number | null>(null);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("12:00");
  const [modality, setModality] = useState<RuleModality>("ambos");

  const invalidate = [qk.rules(professionalId), ["clinical", "slots"]];
  const add = useClinicalMutation(
    (weekday: number) =>
      api.addAvailabilityRule({ weekday, start_time: start, end_time: end, modality }),
    { success: t("availability.added"), invalidate, onSuccess: () => setAdding(null) },
  );
  const remove = useClinicalMutation((id: string) => api.deleteAvailabilityRule(id), {
    invalidate,
  });

  return (
    <Card title={t("availability.title")}>
      <p className="-mt-2 mb-4 text-xs text-muted-foreground">{t("availability.hint")}</p>
      {rules.isLoading ? (
        <Loading />
      ) : (
        <ul className="divide-y divide-border/60">
          {WEEK_ORDER.map((wd) => {
            const dayRules = (rules.data ?? []).filter((r) => r.weekday === wd);
            return (
              <li key={wd} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start">
                <p className="w-28 shrink-0 pt-1 text-sm font-semibold text-foreground first-letter:uppercase">
                  {weekdayName(wd, locale)}
                </p>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {dayRules.length === 0 && adding !== wd && (
                    <span className="text-xs text-muted-foreground">
                      {t("availability.closed")}
                    </span>
                  )}
                  {dayRules.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
                    >
                      {shortTime(r.start_time)}–{shortTime(r.end_time)} ·{" "}
                      {t(`availability.modality.${r.modality as RuleModality}`)}
                      <button
                        type="button"
                        aria-label={t("common.remove")}
                        onClick={() => remove.mutate(r.id)}
                        className="rounded-full p-0.5 hover:bg-primary/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {adding === wd ? (
                    <div className="flex w-full flex-wrap items-end gap-2 rounded-xl bg-secondary/60 p-2">
                      <input
                        type="time"
                        className={cn(inputClass, "w-28")}
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        aria-label={t("availability.start")}
                      />
                      <input
                        type="time"
                        className={cn(inputClass, "w-28")}
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        aria-label={t("availability.end")}
                      />
                      <select
                        className={cn(inputClass, "w-36")}
                        value={modality}
                        onChange={(e) => setModality(e.target.value as RuleModality)}
                        aria-label={t("availability.modalityLabel")}
                      >
                        {(["ambos", "online", "presencial"] as const).map((m) => (
                          <option key={m} value={m}>
                            {t(`availability.modality.${m}`)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={buttonSecondary}
                        disabled={add.isPending || end <= start}
                        onClick={() => add.mutate(wd)}
                      >
                        {t("common.add")}
                      </button>
                      <button type="button" className={buttonGhost} onClick={() => setAdding(null)}>
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button type="button" className={buttonGhost} onClick={() => setAdding(wd)}>
                      <Plus className="h-3.5 w-3.5" /> {t("availability.addRange")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function BlocksEditor({ professionalId }: { professionalId: string }) {
  const { t, locale } = useClinicalI18n();
  const blocks = useAvailabilityBlocks(professionalId);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const [reason, setReason] = useState("");

  const invalidate = [qk.blocks(professionalId), ["clinical", "slots"]];
  const startsAt = startDate ? new Date(`${startDate}T${startTime}`) : null;
  const endsAt = endDate || startDate ? new Date(`${endDate || startDate}T${endTime}`) : null;
  const valid = !!startsAt && !!endsAt && endsAt > startsAt;

  const add = useClinicalMutation(
    () =>
      api.addAvailabilityBlock({
        starts_at: startsAt!.toISOString(),
        ends_at: endsAt!.toISOString(),
        reason: reason.trim() || null,
      }),
    {
      success: t("blocks.added"),
      invalidate,
      onSuccess: () => {
        setStartDate("");
        setEndDate("");
        setReason("");
      },
    },
  );
  const remove = useClinicalMutation((id: string) => api.deleteAvailabilityBlock(id), {
    invalidate,
  });

  return (
    <Card title={t("blocks.title")}>
      <p className="-mt-2 mb-4 text-xs text-muted-foreground">{t("blocks.hint")}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={t("blocks.from")}>
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>
        <Field label={t("blocks.fromTime")}>
          <input
            type="time"
            className={inputClass}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </Field>
        <Field label={t("blocks.to")}>
          <input
            type="date"
            className={inputClass}
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
        <Field label={t("blocks.toTime")}>
          <input
            type="time"
            className={inputClass}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <Field label={t("blocks.reason")} hint={t("common.optional")} className="min-w-48 flex-1">
          <input
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("blocks.reasonPlaceholder")}
          />
        </Field>
        <button
          type="button"
          className={buttonSecondary}
          disabled={!valid || add.isPending}
          onClick={() => add.mutate(undefined)}
        >
          <CalendarOff className="h-4 w-4" /> {t("blocks.add")}
        </button>
      </div>

      {(blocks.data ?? []).length > 0 && (
        <ul className="mt-4 space-y-2">
          {blocks.data!.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm"
            >
              <span>
                {formatDate(b.starts_at, locale, { day: "numeric", month: "short" })}{" "}
                {formatTime(b.starts_at, locale)} →{" "}
                {formatDate(b.ends_at, locale, { day: "numeric", month: "short" })}{" "}
                {formatTime(b.ends_at, locale)}
                {b.reason && <span className="text-muted-foreground"> · {b.reason}</span>}
              </span>
              <button
                type="button"
                className={buttonGhost}
                aria-label={t("common.remove")}
                onClick={() => remove.mutate(b.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
