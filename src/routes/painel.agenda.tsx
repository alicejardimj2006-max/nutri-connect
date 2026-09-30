import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AvailabilityEditor, BlocksEditor } from "@/components/clinical/availability-editor";
import { ManageAppointmentDialog } from "@/components/clinical/appointment-card";
import { NewAppointmentDialog } from "@/components/clinical/new-appointment-dialog";
import {
  Card,
  Loading,
  PageHeader,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import type { Appointment } from "@/lib/clinical/api";
import { useAppointments, usePayments, usePeople } from "@/lib/clinical/queries";
import {
  addDays,
  formatDate,
  formatTime,
  formatWeekday,
  isSameDay,
  startOfWeek,
} from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/agenda")({
  component: SchedulePage,
});

const CHIP_STYLE: Record<Appointment["status"], string> = {
  aguardando_pagamento: "border-warning/40 bg-warning/10",
  agendada: "border-border bg-background",
  confirmada: "border-primary/30 bg-primary-soft",
  realizada: "border-primary bg-primary text-primary-foreground",
  cancelada: "border-transparent bg-muted text-muted-foreground line-through",
  faltou: "border-destructive/30 bg-destructive/10 text-destructive",
};

function SchedulePage() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const appts = useAppointments({
    role: "professional",
    from: weekStart.toISOString(),
    to: addDays(weekStart, 7).toISOString(),
  });
  const list = (appts.data ?? []).filter((a) => showCancelled || a.status !== "cancelada");
  const people = usePeople(list.map((a) => a.patient_id));
  const payments = usePayments(list.filter((a) => a.price_cents > 0).map((a) => a.id));
  // Mantém o diálogo com a versão mais recente da consulta (após salvar/realtime).
  const current = selected
    ? ((appts.data ?? []).find((a) => a.id === selected.id) ?? selected)
    : null;

  const today = new Date();
  const weekLabel = `${formatDate(days[0], locale, { day: "numeric", month: "short" })} – ${formatDate(days[6], locale, { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <PageHeader
        title={t("schedule.title")}
        subtitle={t("schedule.subtitle")}
        action={
          <button type="button" className={buttonPrimary} onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {t("schedule.new")}
          </button>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 p-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={buttonGhost}
              aria-label={t("schedule.prevWeek")}
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => setWeekStart(startOfWeek(new Date()))}
            >
              {t("schedule.today")}
            </button>
            <button
              type="button"
              className={buttonGhost}
              aria-label={t("schedule.nextWeek")}
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="ml-2 text-sm font-semibold text-foreground">{weekLabel}</span>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            {t("schedule.showCancelled")}
          </label>
        </div>

        {appts.isLoading ? (
          <Loading />
        ) : (
          <div className="grid divide-y divide-border/60 md:grid-cols-7 md:divide-x md:divide-y-0">
            {days.map((d) => {
              const dayAppts = list.filter((a) => isSameDay(new Date(a.starts_at), d));
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={d.toISOString()}
                  className={cn("min-h-24 p-2 md:min-h-72", isToday && "bg-accent-soft/40")}
                >
                  <p
                    className={cn(
                      "mb-2 text-xs font-semibold uppercase text-muted-foreground",
                      isToday && "text-accent",
                    )}
                  >
                    {formatWeekday(d, locale)}{" "}
                    <span className="text-base text-foreground">{d.getDate()}</span>
                  </p>
                  <div className="space-y-1.5">
                    {dayAppts.length === 0 && (
                      <p className="text-[11px] text-muted-foreground/70 md:hidden">
                        {t("schedule.free")}
                      </p>
                    )}
                    {dayAppts.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelected(a)}
                        className={cn(
                          "w-full rounded-lg border px-2 py-1.5 text-left text-xs transition hover:shadow-soft",
                          CHIP_STYLE[a.status],
                        )}
                      >
                        <span className="font-bold">{formatTime(a.starts_at, locale)}</span>{" "}
                        <span className="truncate">
                          {people.data?.get(a.patient_id)?.name.split(" ")[0] ?? "…"}
                        </span>
                        <span className="block text-[10px] opacity-80">
                          {t(`modality.${a.modality}`)} · {t(`appt.status.${a.status}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {user && (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <AvailabilityEditor professionalId={user.id} />
          <BlocksEditor professionalId={user.id} />
        </div>
      )}

      {creating && user && (
        <NewAppointmentDialog professionalId={user.id} onClose={() => setCreating(false)} />
      )}
      {current && (
        <ManageAppointmentDialog
          appt={current}
          person={people.data?.get(current.patient_id)}
          payment={payments.data?.find((p) => p.appointment_id === current.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
