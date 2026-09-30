import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as api from "@/lib/clinical/api";
import type { AppointmentModality, AppointmentStatus } from "@/lib/clinical/api";
import { useClinicalMutation, useLinks, usePeople, useProfessional } from "@/lib/clinical/queries";
import { toDateKey } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Field, buttonPrimary, buttonSecondary, inputClass } from "./ui";

/** Profissional registra uma consulta (futura ou já realizada) para um paciente vinculado. */
export function NewAppointmentDialog({
  professionalId,
  defaultPatientId,
  onClose,
}: {
  professionalId: string;
  defaultPatientId?: string;
  onClose: () => void;
}) {
  const { t } = useClinicalI18n();
  const links = useLinks("professional");
  const pro = useProfessional(professionalId);
  const active = (links.data ?? []).filter((l) => l.status === "ativo");
  const people = usePeople(active.map((l) => l.patient_id));

  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [time, setTime] = useState("09:00");
  const [modality, setModality] = useState<AppointmentModality>("online");
  const [duration, setDuration] = useState<number | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState("");

  const dur = duration ?? pro.data?.consultation_duration_min ?? 60;
  const priceValue = price ?? String((pro.data?.consultation_price_cents ?? 0) / 100);
  const startsAt = new Date(`${date}T${time}`);
  const inPast = startsAt.getTime() < Date.now();

  const create = useClinicalMutation(
    () => {
      const endsAt = new Date(startsAt.getTime() + dur * 60_000);
      const status: AppointmentStatus = inPast ? "realizada" : "confirmada";
      return api.createAppointmentAsProfessional({
        patient_id: patientId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        modality,
        status,
        price_cents: Math.round(Number(priceValue.replace(",", ".")) * 100) || 0,
        meeting_url: modality === "online" ? meetingUrl.trim() || null : null,
        location: modality === "presencial" ? (pro.data?.address ?? null) : null,
      });
    },
    { success: t("newAppt.created"), onSuccess: onClose },
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newAppt.title")}</DialogTitle>
          <DialogDescription>{t("newAppt.text")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("newAppt.patient")} className="sm:col-span-2">
            <select
              className={inputClass}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">{t("newAppt.choosePatient")}</option>
              {active.map((l) => (
                <option key={l.patient_id} value={l.patient_id}>
                  {people.data?.get(l.patient_id)?.name ?? "…"}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("newAppt.date")}>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label={t("newAppt.time")}>
            <input
              type="time"
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
          <Field label={t("newAppt.modality")}>
            <select
              className={inputClass}
              value={modality}
              onChange={(e) => setModality(e.target.value as AppointmentModality)}
            >
              <option value="online">{t("modality.online")}</option>
              <option value="presencial">{t("modality.presencial")}</option>
            </select>
          </Field>
          <Field label={t("newAppt.duration")}>
            <input
              type="number"
              min={15}
              max={240}
              step={5}
              className={inputClass}
              value={dur}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </Field>
          <Field label={t("newAppt.price")}>
            <input
              inputMode="decimal"
              className={inputClass}
              value={priceValue}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          {modality === "online" && (
            <Field label={t("appt.meetingUrl")} hint={t("common.optional")}>
              <input
                type="url"
                className={inputClass}
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://"
              />
            </Field>
          )}
        </div>
        {inPast && <p className="text-xs text-muted-foreground">{t("newAppt.pastHint")}</p>}
        {active.length === 0 && !links.isLoading && (
          <p className="text-xs text-warning">{t("newAppt.noPatients")}</p>
        )}
        <DialogFooter>
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className={buttonPrimary}
            disabled={!patientId || !date || !time || create.isPending}
            onClick={() => create.mutate(undefined)}
          >
            {t("newAppt.save")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
