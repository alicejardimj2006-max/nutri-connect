import { useState } from "react";
import { FileText, Loader2, Lock, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { draftSoapNote } from "@/lib/pro-ai.functions";
import * as records from "@/lib/clinical/records";
import type { ClinicalNote } from "@/lib/clinical/records";
import { qk, useAppointments, useClinicalMutation, useNotes } from "@/lib/clinical/queries";
import { formatDate, formatTime } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
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

const SOAP = ["subjective", "objective", "assessment", "plan"] as const;
type SoapKey = (typeof SOAP)[number];

export function NotesPanel({ patientId, readOnly }: { patientId: string; readOnly: boolean }) {
  const { t, locale } = useClinicalI18n();
  const notes = useNotes(patientId);
  const [editing, setEditing] = useState<Partial<ClinicalNote> | null>(null);

  const remove = useClinicalMutation((id: string) => records.deleteNote(id), {
    success: t("notes.deleted"),
    invalidate: [qk.notes(patientId)],
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> {t("notes.privateHint")}
        </p>
        {!readOnly && !editing && (
          <button type="button" className={buttonPrimary} onClick={() => setEditing({})}>
            <Plus className="h-4 w-4" /> {t("notes.new")}
          </button>
        )}
      </div>

      {editing && (
        <NoteForm patientId={patientId} note={editing} onClose={() => setEditing(null)} />
      )}

      {notes.isLoading ? (
        <Loading />
      ) : !notes.data?.length ? (
        !editing && (
          <EmptyState icon={FileText} title={t("notes.empty")} text={t("notes.emptyText")} />
        )
      ) : (
        <ol className="relative space-y-4 border-l-2 border-border/70 pl-5">
          {notes.data.map((n) => (
            <li key={n.id} className="relative">
              <span className="absolute -left-[27px] top-5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <Card>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(n.created_at, locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className={buttonGhost}
                        aria-label={t("notes.edit")}
                        onClick={() => setEditing(n)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className={buttonGhost}
                        aria-label={t("common.remove")}
                        onClick={() =>
                          window.confirm(t("notes.deleteConfirm")) && remove.mutate(n.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {SOAP.map((k) =>
                    n[k] ? (
                      <div key={k}>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-accent">
                          {t(`notes.${k}` as ClinicalKey)}
                        </dt>
                        <dd className="mt-0.5 whitespace-pre-line text-sm text-foreground">
                          {n[k]}
                        </dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function NoteForm({
  patientId,
  note,
  onClose,
}: {
  patientId: string;
  note: Partial<ClinicalNote>;
  onClose: () => void;
}) {
  const { t, locale } = useClinicalI18n();
  const appts = useAppointments({ role: "professional", patientId, ascending: false, limit: 20 });
  const [values, setValues] = useState<Record<SoapKey, string>>({
    subjective: note.subjective ?? "",
    objective: note.objective ?? "",
    assessment: note.assessment ?? "",
    plan: note.plan ?? "",
  });
  const [appointmentId, setAppointmentId] = useState(note.appointment_id ?? "");
  const [rough, setRough] = useState("");
  const [drafting, setDrafting] = useState(false);

  /** Organiza anotações soltas em SOAP com a IA. Só preenche os campos: quem salva é o profissional. */
  const draft = async () => {
    if (SOAP.some((k) => values[k].trim()) && !window.confirm(t("ai.soap.overwrite"))) return;
    setDrafting(true);
    try {
      const res = await draftSoapNote({ data: { patientId, text: rough, locale } });
      if ("note" in res) {
        setValues(res.note);
        toast.success(t("ai.soap.done"));
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error(t("ai.soap.error"));
    } finally {
      setDrafting(false);
    }
  };

  const save = useClinicalMutation(
    () =>
      records.saveNote({
        id: note.id,
        patient_id: patientId,
        appointment_id: appointmentId || null,
        ...Object.fromEntries(SOAP.map((k) => [k, values[k].trim() || null])),
      }),
    { success: t("notes.saved"), invalidate: [qk.notes(patientId)], onSuccess: onClose },
  );
  const empty = SOAP.every((k) => !values[k].trim());
  const done = (appts.data ?? []).filter((a) => a.status !== "cancelada");

  return (
    <Card title={note.id ? t("notes.edit") : t("notes.new")}>
      <div className="space-y-3">
        <div className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-accent" /> {t("ai.soap.title")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("ai.soap.hint")}</p>
          <textarea
            rows={3}
            maxLength={4000}
            className={cn(inputClass, "mt-2 resize-y")}
            value={rough}
            onChange={(e) => setRough(e.target.value)}
            placeholder={t("ai.soap.placeholder")}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className={buttonSecondary}
              disabled={rough.trim().length < 10 || drafting}
              onClick={draft}
            >
              {drafting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {drafting ? t("ai.soap.generating") : t("ai.soap.generate")}
            </button>
          </div>
        </div>
        <Field label={t("notes.appointment")} hint={t("common.optional")}>
          <select
            className={inputClass}
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
          >
            <option value="">{t("notes.noAppointment")}</option>
            {done.map((a) => (
              <option key={a.id} value={a.id}>
                {formatDate(a.starts_at, locale)} · {formatTime(a.starts_at, locale)}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          {SOAP.map((k) => (
            <Field
              key={k}
              label={t(`notes.${k}` as ClinicalKey)}
              hint={t(`notes.${k}Hint` as ClinicalKey)}
            >
              <textarea
                rows={4}
                className={cn(inputClass, "resize-y")}
                value={values[k]}
                onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
              />
            </Field>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className={buttonPrimary}
            disabled={empty || save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </Card>
  );
}
