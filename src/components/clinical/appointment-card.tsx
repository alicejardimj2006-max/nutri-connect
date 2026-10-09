import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  MapPin,
  UserX,
  Video,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as api from "@/lib/clinical/api";
import type { Appointment, Payment, PersonSummary, Slot } from "@/lib/clinical/api";
import { useClinicalMutation } from "@/lib/clinical/queries";
import { requestRefund } from "@/lib/clinical/payments";
import { formatDate, formatMoney, formatTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { roomState } from "@/lib/clinical/video-call";
import { methodLabel } from "@/lib/clinical/labels";
import { SlotPicker } from "./slot-picker";
import {
  AppointmentStatusBadge,
  Avatar,
  Field,
  PaymentStatusBadge,
  buttonDanger,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./ui";
import { EmojiIcon } from "@/components/emoji-icon";

const ACTIVE: Appointment["status"][] = ["aguardando_pagamento", "agendada", "confirmada"];

const paidOnline = (payment?: Payment) =>
  payment?.status === "aprovado" && payment.provider === "stripe";

/** Cancela e, se a consulta foi paga on-line, pede o estorno. Devolve o aviso para o usuário. */
async function cancelWithRefund(
  appt: Appointment,
  payment: Payment | undefined,
  reason: string,
  t: ReturnType<typeof useClinicalI18n>["t"],
): Promise<string> {
  await api.cancelAppointment(appt.id, reason);
  if (!paidOnline(payment)) return t("appt.cancelled");
  const result = await requestRefund(appt.id).catch(() => null);
  if (result?.refunded) return t("appt.cancelledRefunded");
  if (result?.reason === "fora do prazo")
    return t("appt.cancelledNoRefund", { h: result.minHours ?? 24 });
  return t("appt.cancelledRefundFailed");
}

/** A sala de vídeo do site abre 30 min antes e fecha 1 h depois do fim da consulta. */
function canJoin(appt: Appointment): boolean {
  return roomState(appt) === "aberta";
}

export function AppointmentCard({
  appt,
  person,
  role,
  payment,
  onPay,
  compact,
}: {
  appt: Appointment;
  person?: PersonSummary;
  role: "patient" | "professional";
  payment?: Payment;
  onPay?: (appt: Appointment) => void;
  compact?: boolean;
}) {
  const { t, locale } = useClinicalI18n();
  const [dialog, setDialog] = useState<null | "cancel" | "reschedule" | "manage">(null);
  const isFuture = new Date(appt.ends_at).getTime() > Date.now();
  const isActive = ACTIVE.includes(appt.status);
  const start = new Date(appt.starts_at);

  return (
    <article
      className={cn(
        "group relative overflow-hidden @container rounded-[1.75rem] border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card",
        appt.status === "cancelada" && "opacity-70",
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5" />
      
      {/* O layout segue a largura do card (que pode estar numa coluna estreita), não a da tela. */}
      <div className="relative z-10 flex flex-col gap-4 @xl:flex-row @xl:items-center">
        <div className="flex w-full items-center gap-4 @xl:w-auto">
          <div className="grid w-16 shrink-0 place-items-center rounded-2xl bg-secondary/80 py-3 text-center shadow-inner">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">
              {formatDate(start, locale, { month: "short" })}
            </span>
            <span className="font-display text-xl font-bold leading-none text-foreground">
              {start.getDate()}
            </span>
            <span className="text-[11px] font-semibold text-accent">
              {formatTime(start, locale)}
            </span>
          </div>
          <div className="min-w-0 flex-1 @xl:hidden">
            <PersonLine person={person} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="hidden @xl:block">
            <PersonLine person={person} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {appt.modality === "online" ? (
                <Video className="h-3.5 w-3.5" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
              {t(`modality.${appt.modality}`)}
            </span>
            <span>
              {formatDate(start, locale, { weekday: "long", day: "numeric", month: "long" })} ·{" "}
              {formatTime(start, locale)}–{formatTime(appt.ends_at, locale)}
            </span>
            {appt.price_cents > 0 && <span>{formatMoney(appt.price_cents, locale)}</span>}
          </div>
          {!compact && appt.modality === "presencial" && appt.location && isActive && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <EmojiIcon emoji="📍" className="h-3.5 w-3.5 shrink-0" />
              {appt.location}
            </p>
          )}
          {!compact && appt.status === "cancelada" && appt.cancel_reason && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("appt.cancelReasonLabel")}: {appt.cancel_reason}
            </p>
          )}
          {!compact && role === "patient" && appt.summary_for_patient && (
            <p className="mt-2 rounded-xl bg-primary-soft/60 px-3 py-2 text-xs leading-relaxed text-foreground">
              <FileText className="mr-1 inline h-3.5 w-3.5 text-primary" />
              {appt.summary_for_patient}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 @xl:justify-end">
          <AppointmentStatusBadge status={appt.status} />
          {payment && appt.price_cents > 0 && <PaymentStatusBadge status={payment.status} />}

          {canJoin(appt) && (
            <Link
              to="/consulta/$appointmentId"
              params={{ appointmentId: appt.id }}
              className={buttonPrimary}
            >
              <Video className="h-4 w-4" /> {t("appt.join")}
            </Link>
          )}

          {role === "patient" && appt.status === "aguardando_pagamento" && onPay && (
            <button type="button" className={buttonPrimary} onClick={() => onPay(appt)}>
              <CreditCard className="h-4 w-4" /> {t("appt.payNow")}
            </button>
          )}

          {role === "patient" && isActive && isFuture && (
            <>
              {appt.status !== "aguardando_pagamento" && (
                <button
                  type="button"
                  className={buttonGhost}
                  onClick={() => setDialog("reschedule")}
                >
                  <CalendarClock className="h-4 w-4" /> {t("appt.reschedule")}
                </button>
              )}
              <button type="button" className={buttonGhost} onClick={() => setDialog("cancel")}>
                <XCircle className="h-4 w-4" /> {t("common.cancel")}
              </button>
            </>
          )}

          {role === "professional" && (
            <button type="button" className={buttonSecondary} onClick={() => setDialog("manage")}>
              {t("appt.manage")}
            </button>
          )}
        </div>
      </div>

      {dialog === "cancel" && (
        <CancelDialog appt={appt} payment={payment} onClose={() => setDialog(null)} />
      )}
      {dialog === "reschedule" && <RescheduleDialog appt={appt} onClose={() => setDialog(null)} />}
      {dialog === "manage" && (
        <ManageAppointmentDialog
          appt={appt}
          person={person}
          payment={payment}
          onClose={() => setDialog(null)}
        />
      )}
    </article>
  );
}

function PersonLine({ person }: { person?: PersonSummary }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} size="sm" />
      <p className="truncate text-sm font-semibold text-foreground">{person?.name ?? "…"}</p>
    </div>
  );
}

function CancelDialog({
  appt,
  payment,
  onClose,
}: {
  appt: Appointment;
  payment?: Payment;
  onClose: () => void;
}) {
  const { t } = useClinicalI18n();
  const [reason, setReason] = useState("");
  const cancel = useClinicalMutation(() => cancelWithRefund(appt, payment, reason, t), {
    success: (msg) => msg,
    onSuccess: onClose,
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("appt.cancelTitle")}</DialogTitle>
          <DialogDescription>
            {t("appt.cancelText")} {paidOnline(payment) && t("appt.refundPolicyPatient")}
          </DialogDescription>
        </DialogHeader>
        <Field label={t("appt.cancelReason")} hint={t("common.optional")}>
          <textarea
            rows={3}
            className={cn(inputClass, "resize-none")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <DialogFooter>
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {t("common.back")}
          </button>
          <button
            type="button"
            className={buttonDanger}
            disabled={cancel.isPending}
            onClick={() => cancel.mutate(undefined)}
          >
            {t("appt.confirmCancel")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const { t } = useClinicalI18n();
  const [slot, setSlot] = useState<Slot | null>(null);
  const reschedule = useClinicalMutation(
    (startsAt: string) => api.rescheduleAppointment(appt.id, startsAt),
    { success: t("appt.rescheduled"), onSuccess: onClose },
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("appt.rescheduleTitle")}</DialogTitle>
          <DialogDescription>{t("appt.rescheduleText")}</DialogDescription>
        </DialogHeader>
        <SlotPicker
          professionalId={appt.professional_id}
          modality={appt.modality}
          value={slot?.starts_at}
          onChange={setSlot}
        />
        <DialogFooter>
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {t("common.back")}
          </button>
          <button
            type="button"
            className={buttonPrimary}
            disabled={!slot || reschedule.isPending}
            onClick={() => slot && reschedule.mutate(slot.starts_at)}
          >
            {t("appt.confirmReschedule")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const PAYMENT_METHODS = ["pix", "dinheiro", "cartao", "transferencia"] as const;

export function ManageAppointmentDialog({
  appt,
  person,
  payment,
  onClose,
}: {
  appt: Appointment;
  person?: PersonSummary;
  payment?: Payment;
  onClose: () => void;
}) {
  const { t, locale } = useClinicalI18n();
  const [location, setLocation] = useState(appt.location ?? "");
  const [summary, setSummary] = useState(appt.summary_for_patient ?? "");
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("pix");
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const started = new Date(appt.starts_at).getTime() <= Date.now();
  const isActive = ACTIVE.includes(appt.status);
  const paid = payment?.status === "aprovado";

  const setStatus = useClinicalMutation(
    (status: Appointment["status"]) => api.updateAppointment(appt.id, { status }),
    { success: t("appt.updated") },
  );
  const save = useClinicalMutation(
    () =>
      api.updateAppointment(appt.id, {
        location: location.trim() || null,
        summary_for_patient: summary.trim() || null,
      }),
    { success: t("appt.saved") },
  );
  const pay = useClinicalMutation(() => api.registerManualPayment(appt.id, method), {
    success: t("appt.paymentRegistered"),
  });
  const cancel = useClinicalMutation(() => cancelWithRefund(appt, payment, reason, t), {
    success: (msg) => msg,
    onSuccess: onClose,
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} size="sm" />
            {person?.name}
          </DialogTitle>
          <DialogDescription>
            {formatDate(appt.starts_at, locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            · {formatTime(appt.starts_at, locale)}–{formatTime(appt.ends_at, locale)} ·{" "}
            {t(`modality.${appt.modality}`)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <AppointmentStatusBadge status={appt.status} />
          {appt.patient_notes && (
            <p className="w-full rounded-xl bg-secondary px-3 py-2 text-xs text-foreground">
              <span className="font-semibold">{t("appt.patientNotes")}:</span> {appt.patient_notes}
            </p>
          )}
        </div>

        {isActive && (
          <div className="flex flex-wrap gap-2">
            {appt.status !== "confirmada" && (
              <button
                type="button"
                className={buttonSecondary}
                disabled={setStatus.isPending}
                onClick={() => setStatus.mutate("confirmada")}
              >
                <CheckCircle2 className="h-4 w-4 text-primary" /> {t("appt.confirm")}
              </button>
            )}
            {started && (
              <>
                <button
                  type="button"
                  className={buttonSecondary}
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate("realizada")}
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t("appt.markDone")}
                </button>
                <button
                  type="button"
                  className={buttonSecondary}
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate("faltou")}
                >
                  <UserX className="h-4 w-4 text-destructive" /> {t("appt.markNoShow")}
                </button>
              </>
            )}
          </div>
        )}

        <div className="space-y-3">
          {appt.modality === "online" ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-secondary/70 px-3 py-2.5 text-xs text-foreground">
              <Video className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">{t("appt.roomInfo")}</span>
              {canJoin(appt) && (
                <Link
                  to="/consulta/$appointmentId"
                  params={{ appointmentId: appt.id }}
                  className={buttonPrimary}
                >
                  {t("appt.join")}
                </Link>
              )}
            </div>
          ) : (
            <Field label={t("appt.location")}>
              <input
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Field>
          )}
          <Field label={t("appt.summary")} hint={t("appt.summaryHint")}>
            <textarea
              rows={3}
              className={cn(inputClass, "resize-none")}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap justify-between gap-2">
            <Link
              to="/painel/pacientes/$patientId"
              params={{ patientId: appt.patient_id }}
              className={buttonGhost}
            >
              <ExternalLink className="h-4 w-4" /> {t("appt.openRecord")}
            </Link>
            <button
              type="button"
              className={buttonPrimary}
              disabled={save.isPending}
              onClick={() => save.mutate(undefined)}
            >
              {t("common.save")}
            </button>
          </div>
        </div>

        {appt.price_cents > 0 && appt.status !== "cancelada" && (
          <div className="rounded-xl border border-border/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {t("appt.payment")} · {formatMoney(appt.price_cents, locale)}
              </p>
              {payment ? (
                <PaymentStatusBadge status={payment.status} />
              ) : (
                <span className="text-xs text-muted-foreground">{t("appt.noPayment")}</span>
              )}
            </div>
            {payment?.provider === "stripe" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Stripe{payment.method ? ` · ${methodLabel(payment.method, t)}` : ""}
              </p>
            )}
            {!paid && (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <Field label={t("appt.manualMethod")} className="min-w-40 flex-1">
                  <select
                    className={inputClass}
                    value={method}
                    onChange={(e) => setMethod(e.target.value as typeof method)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {t(`payment.method.${m}`)}
                      </option>
                    ))}
                  </select>
                </Field>
                <button
                  type="button"
                  className={buttonSecondary}
                  disabled={pay.isPending}
                  onClick={() => pay.mutate(undefined)}
                >
                  <CreditCard className="h-4 w-4" /> {t("appt.registerPayment")}
                </button>
              </div>
            )}
          </div>
        )}

        {isActive &&
          (cancelling ? (
            <div className="space-y-2 rounded-xl border border-destructive/30 p-3">
              {paidOnline(payment) && (
                <p className="text-xs text-muted-foreground">{t("appt.refundPolicyPro")}</p>
              )}
              <Field label={t("appt.cancelReason")}>
                <input
                  className={inputClass}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
              <div className="flex justify-end gap-2">
                <button type="button" className={buttonGhost} onClick={() => setCancelling(false)}>
                  {t("common.back")}
                </button>
                <button
                  type="button"
                  className={buttonDanger}
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(undefined)}
                >
                  {t("appt.confirmCancel")}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className={buttonDanger} onClick={() => setCancelling(true)}>
              <XCircle className="h-4 w-4" /> {t("appt.cancelAppointment")}
            </button>
          ))}
      </DialogContent>
    </Dialog>
  );
}
