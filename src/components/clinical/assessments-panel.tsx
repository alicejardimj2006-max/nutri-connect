// Avaliações: aplicar (o profissional preenche ou envia para o paciente responder na chamada),
// histórico com tendência e a visão do paciente.
import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ClipboardCheck, Loader2, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTr } from "@/components/settings-ui";
import type { Names } from "@/lib/appearance-data";
import {
  INSTRUMENTS,
  TONE_CLASS,
  assessmentsKey,
  evaluate,
  instrument,
  saveAssessment,
  toneOf,
  useAssessments,
  useDeleteAssessment,
  type Assessment,
  type Instrument,
  type Tone,
} from "@/lib/clinical/assessments";
import { useClinicalMutation } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Card, EmptyState, Loading, buttonPrimary, buttonSecondary, inputClass } from "./ui";

type Payload = number[] | Record<string, number | string | null>;

export function OutcomeBadge({
  label,
  tone,
  score,
  max,
}: {
  label: Names;
  tone: Tone;
  score?: number | null;
  max?: number;
}) {
  const tr = useTr();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASS[tone],
      )}
    >
      {score !== null && score !== undefined && (
        <span className="tabular-nums">
          {Number.isInteger(score) ? score : score.toFixed(1)}
          {max ? `/${max}` : ""}
        </span>
      )}
      {tr(label)}
    </span>
  );
}

/** Formulário de um instrumento. O paciente usa o mesmo formulário quando recebe na chamada. */
export function AssessmentForm({
  inst,
  onSubmit,
  submitting,
  submitLabel,
  showResult = true,
  onCancel,
}: {
  inst: Instrument;
  onSubmit: (payload: Payload, notes: string) => void;
  submitting?: boolean;
  submitLabel?: string;
  showResult?: boolean;
  onCancel?: () => void;
}) {
  const tr = useTr();
  const [answers, setAnswers] = useState<(number | undefined)[]>(() =>
    inst.type === "questionnaire" ? Array(inst.questions.length).fill(undefined) : [],
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const payload: Payload | null = useMemo(() => {
    if (inst.type === "questionnaire") {
      return answers.every((a) => a !== undefined) ? (answers as number[]) : null;
    }
    const out: Record<string, number | string | null> = {};
    let any = false;
    for (const f of inst.fields) {
      const raw = values[f.key]?.trim() ?? "";
      if (!raw) {
        out[f.key] = null;
        continue;
      }
      any = true;
      out[f.key] = f.text || f.options ? raw : Number(raw.replace(",", "."));
    }
    return any ? out : null;
  }, [inst, answers, values]);

  const outcome = payload ? evaluate(inst, payload) : null;
  const answered = answers.filter((a) => a !== undefined).length;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (payload) onSubmit(payload, notes);
      }}
    >
      {inst.type === "questionnaire" ? (
        <>
          <p className="text-sm font-medium text-foreground">{tr(inst.intro)}</p>
          <ol className="space-y-2.5">
            {inst.questions.map((q, i) => (
              <li key={i} className="rounded-xl border border-border/70 bg-background p-3">
                <p className="text-sm text-foreground">
                  <span className="mr-1.5 font-semibold text-muted-foreground">{i + 1}.</span>
                  {tr(q)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup">
                  {inst.options.map((o) => {
                    const on = answers[i] === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setAnswers((a) => a.map((x, j) => (j === i ? o.value : x)))}
                        className={cn(
                          "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-secondary",
                        )}
                      >
                        {tr(o.label)}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {inst.fields.map((f) => (
            <label key={f.key} className={cn("block", (f.text || f.slider) && "sm:col-span-2")}>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                {tr(f.label)}
                {f.unit && <span className="font-normal"> ({f.unit})</span>}
              </span>
              {f.slider ? (
                <div className="flex flex-wrap gap-1">
                  {Array.from(
                    { length: (f.max ?? 10) - (f.min ?? 0) + 1 },
                    (_, k) => k + (f.min ?? 0),
                  ).map((n) => {
                    const on = values[f.key] === String(n);
                    const hue = 140 - n * 14;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setValues((v) => ({ ...v, [f.key]: String(n) }))}
                        aria-pressed={on}
                        className={cn(
                          "grid h-9 w-9 cursor-pointer place-items-center rounded-lg border text-sm font-bold tabular-nums transition",
                          on
                            ? "scale-110 border-transparent text-white shadow-md"
                            : "border-border bg-card text-foreground hover:bg-secondary",
                        )}
                        style={on ? { background: `hsl(${hue} 70% 45%)` } : undefined}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              ) : f.options ? (
                <select
                  className={inputClass}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                >
                  <option value="">—</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {tr(o.label)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={inputClass}
                  type={f.text ? "text" : "number"}
                  inputMode={f.text ? undefined : "decimal"}
                  min={f.min}
                  max={f.max}
                  step={f.step ?? 1}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              )}
            </label>
          ))}
        </div>
      )}

      {showResult && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            {tr([
              "Observações do profissional (opcional)",
              "Professional notes (optional)",
              "Observaciones del profesional (opcional)",
              "Notes du professionnel (facultatif)",
            ])}
          </span>
          <textarea
            rows={2}
            className={cn(inputClass, "resize-y")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      )}

      {showResult && outcome && (
        <div className="space-y-2 rounded-xl bg-secondary/60 p-3">
          <OutcomeBadge
            label={outcome.label}
            tone={outcome.tone}
            score={outcome.score}
            max={inst.type === "questionnaire" ? inst.max : undefined}
          />
          {outcome.alert && (
            <p className="flex items-start gap-1.5 text-xs font-medium text-red-700 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {tr(outcome.alert)}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {inst.type === "questionnaire" && (
          <span className="mr-auto text-xs tabular-nums text-muted-foreground">
            {answered}/{inst.questions.length}
          </span>
        )}
        {onCancel && (
          <button type="button" className={buttonSecondary} onClick={onCancel}>
            {tr(["Cancelar", "Cancel", "Cancelar", "Annuler"])}
          </button>
        )}
        <button type="submit" className={buttonPrimary} disabled={!payload || submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel ??
            tr(["Salvar avaliação", "Save assessment", "Guardar evaluación", "Enregistrer"])}
        </button>
      </div>
    </form>
  );
}

/** Respostas de uma avaliação salva, para conferir depois. */
function AnswersView({ a }: { a: Assessment }) {
  const tr = useTr();
  const inst = instrument(a.kind);
  const d = (a.data ?? {}) as {
    answers?: number[];
    values?: Record<string, number | string | null>;
    notes?: string | null;
  };
  if (!inst) return null;
  return (
    <div className="mt-2 space-y-1.5 rounded-xl bg-secondary/50 p-3 text-xs">
      {inst.type === "questionnaire"
        ? inst.questions.map((q, i) => (
            <p key={i} className="flex gap-2">
              <span className="min-w-0 flex-1 text-muted-foreground">
                {i + 1}. {tr(q)}
              </span>
              <span className="shrink-0 font-semibold text-foreground">
                {tr(
                  inst.options.find((o) => o.value === d.answers?.[i])?.label ?? [
                    "—",
                    "—",
                    "—",
                    "—",
                  ],
                )}
              </span>
            </p>
          ))
        : inst.fields
            .filter(
              (f) =>
                d.values?.[f.key] !== null &&
                d.values?.[f.key] !== undefined &&
                d.values?.[f.key] !== "",
            )
            .map((f) => {
              const v = d.values?.[f.key];
              const shown = f.options
                ? tr(
                    f.options.find((o) => o.value === v)?.label ?? [
                      String(v),
                      String(v),
                      String(v),
                      String(v),
                    ],
                  )
                : String(v);
              return (
                <p key={f.key} className="flex gap-2">
                  <span className="flex-1 text-muted-foreground">{tr(f.label)}</span>
                  <span className="font-semibold text-foreground">
                    {shown}
                    {f.unit ? ` ${f.unit}` : ""}
                  </span>
                </p>
              );
            })}
      {d.notes && <p className="border-t border-border/60 pt-1.5 text-foreground">{d.notes}</p>}
    </div>
  );
}

/** Mini gráfico com as últimas pontuações do instrumento. */
function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 64;
  const h = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="shrink-0 text-primary" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function History({
  list,
  canDelete,
  patientId,
}: {
  list: Assessment[];
  canDelete: boolean;
  patientId: string;
}) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const [open, setOpen] = useState<string | null>(null);
  const del = useDeleteAssessment(patientId);
  const groups = useMemo(() => {
    const map = new Map<string, Assessment[]>();
    for (const a of list) map.set(a.kind, [...(map.get(a.kind) ?? []), a]);
    return [...map.entries()];
  }, [list]);

  return (
    <div className="space-y-3">
      {groups.map(([kind, items]) => {
        const inst = instrument(kind);
        const scores = items
          .map((a) => a.score)
          .filter((s): s is number => s !== null)
          .slice(0, 8)
          .reverse();
        return (
          <div key={kind} className="rounded-2xl border border-border/70 bg-card p-3">
            <div className="mb-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                {inst ? tr(inst.name) : kind}
              </p>
              <Spark values={scores.map(Number)} />
            </div>
            <ul className="divide-y divide-border/60">
              {items.slice(0, 6).map((a) => {
                const d = (a.data ?? {}) as { label?: Names; alert?: Names | null };
                return (
                  <li key={a.id} className="py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-20 shrink-0 text-xs text-muted-foreground">
                        {formatDate(a.created_at, locale, { day: "2-digit", month: "short" })}
                      </span>
                      <OutcomeBadge
                        label={d.label ?? ["Registrado", "Recorded", "Registrado", "Enregistré"]}
                        tone={toneOf(a)}
                        score={a.score === null ? null : Number(a.score)}
                        max={inst?.type === "questionnaire" ? inst.max : undefined}
                      />
                      {a.answered_by_patient && (
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {tr([
                            "respondido pelo paciente",
                            "answered by patient",
                            "respondido por el paciente",
                            "répondu par le patient",
                          ])}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setOpen(open === a.id ? null : a.id)}
                          aria-label={tr([
                            "Ver respostas",
                            "View answers",
                            "Ver respuestas",
                            "Voir les réponses",
                          ])}
                          className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                        >
                          <ChevronDown
                            className={cn("h-4 w-4 transition", open === a.id && "rotate-180")}
                          />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => del.mutate(a.id)}
                            aria-label={tr(["Apagar", "Delete", "Borrar", "Supprimer"])}
                            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    </div>
                    {d.alert && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {tr(d.alert)}
                      </p>
                    )}
                    {open === a.id && <AnswersView a={a} />}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export interface PendingRemote {
  id: string;
  instrumentId: string;
}

/** Painel do profissional (prontuário e chamada). */
export function AssessmentsPanel({
  patientId,
  professionalId,
  appointmentId,
  readOnly,
  suggested = [],
  onSendToPatient,
  pending = [],
  onCancelPending,
}: {
  patientId: string;
  professionalId: string;
  appointmentId?: string | null;
  readOnly: boolean;
  suggested?: string[];
  /** Na chamada: envia o questionário para o paciente responder na tela dele. */
  onSendToPatient?: (instrumentId: string) => void;
  pending?: PendingRemote[];
  onCancelPending?: (id: string) => void;
}) {
  const tr = useTr();
  const list = useAssessments(patientId);
  const [active, setActive] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const ordered = useMemo(
    () =>
      [...INSTRUMENTS].sort(
        (a, b) => (suggested.indexOf(a.id) + 1 || 99) - (suggested.indexOf(b.id) + 1 || 99),
      ),
    [suggested],
  );
  const visible =
    showAll || !suggested.length ? ordered : ordered.filter((i) => suggested.includes(i.id));

  const save = useClinicalMutation(
    ({ id, payload, notes }: { id: string; payload: Payload; notes: string }) =>
      saveAssessment({
        patientId,
        professionalId,
        appointmentId,
        instrumentId: id,
        payload,
        notes,
      }),
    {
      invalidate: [assessmentsKey(patientId)],
      success: tr([
        "Avaliação salva no acompanhamento",
        "Assessment saved to the record",
        "Evaluación guardada",
        "Évaluation enregistrée",
      ]),
      onSuccess: () => setActive(null),
    },
  );

  const current = active ? instrument(active) : null;

  return (
    <div className="space-y-4">
      {!readOnly && (
        <Card
          title={tr([
            "Aplicar avaliação",
            "Run an assessment",
            "Aplicar evaluación",
            "Faire une évaluation",
          ])}
        >
          {pending.length > 0 && (
            <ul className="mb-3 space-y-1.5">
              {pending.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl bg-primary-soft/60 px-3 py-2 text-xs text-foreground"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="flex-1">
                    {tr([
                      "Aguardando o paciente responder",
                      "Waiting for the patient",
                      "Esperando la respuesta del paciente",
                      "En attente du patient",
                    ])}
                    : <b>{instrument(p.instrumentId)?.short}</b>
                  </span>
                  {onCancelPending && (
                    <button
                      type="button"
                      onClick={() => onCancelPending(p.id)}
                      className="cursor-pointer rounded-full p-1 hover:bg-background"
                      aria-label="×"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {current ? (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <p className="flex-1 text-sm font-bold text-foreground">{tr(current.name)}</p>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
                  aria-label="×"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <AssessmentForm
                inst={current}
                submitting={save.isPending}
                onSubmit={(payload, notes) => save.mutate({ id: current.id, payload, notes })}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {visible.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex flex-col rounded-xl border border-border/70 bg-background p-3"
                  >
                    <p className="text-sm font-bold text-foreground">{tr(inst.name)}</p>
                    <p className="mt-0.5 flex-1 text-xs leading-snug text-muted-foreground">
                      {tr(inst.about)}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
                        onClick={() => setActive(inst.id)}
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        {tr(["Preencher", "Fill in", "Completar", "Remplir"])}
                      </button>
                      {onSendToPatient && inst.patientCanAnswer && (
                        <button
                          type="button"
                          className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
                          onClick={() => {
                            onSendToPatient(inst.id);
                            toast.message(
                              tr([
                                "Enviado para o paciente responder",
                                "Sent to the patient",
                                "Enviado al paciente",
                                "Envoyé au patient",
                              ]),
                            );
                          }}
                        >
                          <Send className="h-3.5 w-3.5" />
                          {tr([
                            "Paciente responde",
                            "Patient answers",
                            "Responde el paciente",
                            "Le patient répond",
                          ])}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {suggested.length > 0 && visible.length < ordered.length && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="mt-3 cursor-pointer text-xs font-semibold text-primary hover:underline"
                >
                  {tr([
                    "Ver todas as avaliações",
                    "Show all assessments",
                    "Ver todas",
                    "Tout afficher",
                  ])}
                </button>
              )}
            </>
          )}
        </Card>
      )}

      {list.isLoading ? (
        <Loading />
      ) : !list.data?.length ? (
        <EmptyState
          icon={ClipboardCheck}
          title={tr([
            "Nenhuma avaliação ainda",
            "No assessments yet",
            "Ninguna evaluación aún",
            "Aucune évaluation",
          ])}
        />
      ) : (
        <History
          list={list.data.filter((a) => a.professional_id === professionalId)}
          canDelete={!readOnly}
          patientId={patientId}
        />
      )}
    </div>
  );
}

/** Visão do paciente: avaliações compartilhadas com ele. */
export function PatientAssessments({ patientId }: { patientId: string }) {
  const tr = useTr();
  const list = useAssessments(patientId);
  if (list.isLoading) return <Loading />;
  if (!list.data?.length) return null;
  return (
    <Card
      title={tr([
        "Avaliações das consultas",
        "Visit assessments",
        "Evaluaciones de las consultas",
        "Évaluations des consultations",
      ])}
    >
      <History list={list.data} canDelete={false} patientId={patientId} />
    </Card>
  );
}
