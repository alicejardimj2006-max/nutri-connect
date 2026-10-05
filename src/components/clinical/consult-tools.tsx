// Ferramentas da consulta na chamada. Tudo o que o profissional registra aqui vai para o
// acompanhamento do paciente (anamnese, avaliações, medidas, evolução, planos, metas, documentos).
//
// Algumas ferramentas acontecem nas duas telas: o paciente responde questionários na tela dele,
// vê o cronômetro dos testes e autoriza (ou não) o registro de uma imagem da câmera.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  CalendarPlus,
  Camera,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  NotebookPen,
  Pause,
  Play,
  Ruler,
  RotateCcw,
  Target,
  Timer,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTr } from "@/components/settings-ui";
import type { Names } from "@/lib/appearance-data";
import type { Appointment, PersonSummary } from "@/lib/clinical/api";
import * as api from "@/lib/clinical/api";
import * as records from "@/lib/clinical/records";
import { uploadDocument } from "@/lib/clinical/care";
import {
  assessmentsKey,
  instrument,
  saveAssessment,
  useAssessments,
  toneOf,
} from "@/lib/clinical/assessments";
import { itemsOf, useCarePlans } from "@/lib/clinical/care-plans";
import {
  EVOLUTION_TEMPLATE,
  SUGGESTED_CARE_KINDS,
  SUGGESTED_INSTRUMENTS,
  TOOL_ORDER,
  type ProfessionKey,
  type ToolId,
} from "@/lib/clinical/professions";
import {
  qk,
  useAnamnesis,
  useAppointments,
  useClinicalMutation,
  useNotes,
  usePatientPrivate,
} from "@/lib/clinical/queries";
import { formatDate, formatTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import type { ToolEvent, useConsultationCall } from "@/lib/clinical/video-call";
import { AnamnesisForm } from "./anamnesis-form";
import { AnthropometryPanel } from "./anthropometry-panel";
import {
  AssessmentForm,
  AssessmentsPanel,
  OutcomeBadge,
  type PendingRemote,
} from "./assessments-panel";
import { CarePlansPanel } from "./care-plans-panel";
import { DocumentsPanel } from "./documents-panel";
import { GoalsPanel } from "./goals-panel";
import { NewAppointmentDialog } from "./new-appointment-dialog";
import { RecordSummary } from "./record-summary";
import { Card, buttonPrimary, buttonSecondary, inputClass, plainText } from "./ui";
import { firstName } from "./video-room";

type Call = ReturnType<typeof useConsultationCall>;
type Payload = number[] | Record<string, number | string | null>;

const rid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export interface TimerState {
  mode: "countdown" | "stopwatch";
  startedAt: number;
  seconds: number;
  label?: string;
}

// ─────────────────────────────── Estado compartilhado da sessão ───────────────────────────────

/** Fica montado durante toda a chamada (mesmo com o painel fechado), para não perder respostas. */
export function useConsultSession({
  call,
  appt,
  role,
}: {
  call: Call;
  appt: Appointment;
  role: "patient" | "professional";
}) {
  const tr = useTr();
  const qc = useQueryClient();
  const [timer, setTimerState] = useState<TimerState | null>(null);
  const [pending, setPending] = useState<PendingRemote[]>([]);
  const [incoming, setIncoming] = useState<{ id: string; instrumentId: string } | null>(null);
  const [snapshotAsk, setSnapshotAsk] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<"idle" | "waiting" | "saving">("idle");
  const snapshotId = useRef<string | null>(null);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const { sendTool, onTool, captureRemote } = call;

  const saveSnapshot = useCallback(async () => {
    setSnapshot("saving");
    try {
      const blob = await captureRemote();
      if (!blob) throw new Error("no-frame");
      const when = new Date();
      const file = new File(
        [blob],
        `consulta-${when.toISOString().slice(0, 16).replace(/[:T]/g, "-")}.jpg`,
        { type: "image/jpeg" },
      );
      await uploadDocument({
        patientId: appt.patient_id,
        title: `${tr(["Imagem da consulta", "Visit image", "Imagen de la consulta", "Image de la consultation"])} — ${when.toLocaleString()}`,
        kind: "documento",
        file,
        documentDate: when.toISOString().slice(0, 10),
      });
      await qc.invalidateQueries({ queryKey: qk.documents(appt.patient_id) });
      sendTool({ type: "snapshot-saved", id: snapshotId.current ?? "" });
      toast.success(
        tr([
          "Imagem salva nos documentos do paciente",
          "Image saved to the patient's documents",
          "Imagen guardada en los documentos",
          "Image enregistrée dans les documents",
        ]),
      );
    } catch {
      toast.error(
        tr([
          "Não deu para capturar a imagem. A câmera do paciente está ligada?",
          "Couldn't capture. Is the patient's camera on?",
          "No se pudo capturar. ¿La cámara del paciente está encendida?",
          "Capture impossible. La caméra du patient est-elle allumée ?",
        ]),
      );
    }
    setSnapshot("idle");
  }, [appt.patient_id, captureRemote, qc, sendTool, tr]);

  useEffect(
    () =>
      onTool(async (e: ToolEvent) => {
        if (e.type === "timer") {
          setTimerState(
            e.mode === "off"
              ? null
              : { mode: e.mode, startedAt: e.startedAt, seconds: e.seconds, label: e.label },
          );
          return;
        }
        if (role === "professional") {
          if (e.type === "form-answer") {
            if (!pendingRef.current.some((p) => p.id === e.id)) return;
            setPending((list) => list.filter((p) => p.id !== e.id));
            try {
              const saved = await saveAssessment({
                patientId: appt.patient_id,
                professionalId: appt.professional_id,
                appointmentId: appt.id,
                instrumentId: e.instrumentId,
                payload: e.payload,
                answeredByPatient: true,
              });
              await qc.invalidateQueries({ queryKey: assessmentsKey(appt.patient_id) });
              const label = (saved.data as { label?: Names } | null)?.label;
              toast.success(
                `${instrument(e.instrumentId)?.short ?? ""}: ${tr(["respondido", "answered", "respondido", "répondu"])}${saved.score !== null ? ` · ${saved.score}` : ""}${label ? ` · ${tr(label)}` : ""}`,
              );
            } catch (err) {
              toast.error(err instanceof Error ? err.message : String(err));
            }
          } else if (e.type === "form-declined") {
            setPending((list) => list.filter((p) => p.id !== e.id));
            toast.message(
              tr([
                "O paciente preferiu não responder agora",
                "The patient chose not to answer now",
                "El paciente prefirió no responder",
                "Le patient a préféré ne pas répondre",
              ]),
            );
          } else if (e.type === "snapshot-reply" && e.id === snapshotId.current) {
            if (e.ok) void saveSnapshot();
            else {
              setSnapshot("idle");
              toast.message(
                tr([
                  "O paciente não autorizou a imagem",
                  "The patient declined the image",
                  "El paciente no autorizó la imagen",
                  "Le patient a refusé l'image",
                ]),
              );
            }
          } else if (e.type === "doc-uploaded") {
            await qc.invalidateQueries({ queryKey: qk.documents(appt.patient_id) });
            toast.message(
              `${tr(["Novo documento do paciente", "New document from the patient", "Nuevo documento del paciente", "Nouveau document du patient"])}: ${e.title}`,
            );
          }
        } else {
          if (e.type === "form") setIncoming({ id: e.id, instrumentId: e.instrumentId });
          else if (e.type === "form-cancel") setIncoming((cur) => (cur?.id === e.id ? null : cur));
          else if (e.type === "snapshot-request") setSnapshotAsk(e.id);
          else if (e.type === "snapshot-saved") {
            await qc.invalidateQueries({ queryKey: qk.documents(appt.patient_id) });
            toast.success(
              tr([
                "A imagem foi salva nos seus documentos",
                "The image was saved to your documents",
                "La imagen se guardó en tus documentos",
                "L'image a été enregistrée dans vos documents",
              ]),
            );
          }
        }
      }),
    [onTool, role, appt, qc, tr, saveSnapshot],
  );

  return {
    timer,
    setTimer: (t: TimerState | null, share: boolean) => {
      setTimerState(t);
      if (share)
        sendTool(
          t ? { type: "timer", ...t } : { type: "timer", mode: "off", startedAt: 0, seconds: 0 },
        );
    },
    pending,
    sendForm: (instrumentId: string) => {
      const id = rid();
      setPending((list) => [...list, { id, instrumentId }]);
      sendTool({ type: "form", id, instrumentId });
    },
    cancelForm: (id: string) => {
      setPending((list) => list.filter((p) => p.id !== id));
      sendTool({ type: "form-cancel", id });
    },
    incoming,
    answerForm: (payload: Payload) => {
      if (!incoming) return;
      sendTool({
        type: "form-answer",
        id: incoming.id,
        instrumentId: incoming.instrumentId,
        payload,
      });
      setIncoming(null);
      toast.success(
        tr([
          "Respostas enviadas ao profissional",
          "Answers sent to your professional",
          "Respuestas enviadas",
          "Réponses envoyées",
        ]),
      );
    },
    declineForm: () => {
      if (!incoming) return;
      sendTool({ type: "form-declined", id: incoming.id });
      setIncoming(null);
    },
    snapshot,
    requestSnapshot: () => {
      const id = rid();
      snapshotId.current = id;
      setSnapshot("waiting");
      sendTool({ type: "snapshot-request", id });
      window.setTimeout(
        () => setSnapshot((s) => (s === "waiting" && snapshotId.current === id ? "idle" : s)),
        45_000,
      );
    },
    snapshotAsk,
    replySnapshot: (ok: boolean) => {
      if (!snapshotAsk) return;
      sendTool({ type: "snapshot-reply", id: snapshotAsk, ok });
      setSnapshotAsk(null);
    },
    notifyDocUploaded: (title: string) => sendTool({ type: "doc-uploaded", title }),
  };
}

export type ConsultSession = ReturnType<typeof useConsultSession>;

// ─────────────────────────────── Sobreposições (as duas telas) ───────────────────────────────

function useNowTick(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

const mmss = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
};

function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.18);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
    window.setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* sem áudio */
  }
}

export function timerValue(t: TimerState, now: number) {
  const elapsed = (now - t.startedAt) / 1000;
  return t.mode === "countdown" ? Math.max(0, t.seconds - elapsed) : elapsed;
}

/** Cronômetro grande no topo do vídeo (aparece nas duas telas quando compartilhado). */
function TimerOverlay({ timer }: { timer: TimerState }) {
  const now = useNowTick(true);
  const v = timerValue(timer, now);
  const done = timer.mode === "countdown" && v <= 0;
  const beeped = useRef<number | null>(null);
  useEffect(() => {
    if (done && beeped.current !== timer.startedAt) {
      beeped.current = timer.startedAt;
      beep();
    }
  }, [done, timer.startedAt]);
  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2">
      <div
        className={cn(
          "flex flex-col items-center rounded-3xl px-6 py-3 shadow-2xl backdrop-blur-md",
          done ? "bg-emerald-500/90" : "bg-black/65",
        )}
      >
        {timer.label && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
            {timer.label}
          </span>
        )}
        <span className="font-display text-5xl font-bold tabular-nums text-white">{mmss(v)}</span>
      </div>
    </div>
  );
}

/** Tudo o que aparece por cima do vídeo: cronômetro, questionário do paciente, pedido de imagem. */
export function CallOverlays({
  session,
  role,
  other,
}: {
  session: ConsultSession;
  role: "patient" | "professional";
  other?: PersonSummary;
}) {
  const tr = useTr();
  const inst = session.incoming ? instrument(session.incoming.instrumentId) : null;
  const first = firstName(other?.name);
  return (
    <>
      {session.timer && <TimerOverlay timer={session.timer} />}

      {role === "patient" && inst && (
        <div className="absolute inset-0 z-30 grid place-items-end bg-black/40 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-6">
          <div className="max-h-[88%] w-full overflow-y-auto rounded-t-3xl bg-background p-5 text-foreground shadow-2xl sm:max-w-lg sm:rounded-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {tr([
                `${first} pediu para você responder`,
                `${first} asked you to answer`,
                `${first} te pidió responder`,
                `${first} vous demande de répondre`,
              ])}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold">{tr(inst.name)}</h2>
            <div className="mt-4">
              <AssessmentForm
                inst={inst}
                showResult={false}
                submitLabel={tr([
                  "Enviar respostas",
                  "Send answers",
                  "Enviar respuestas",
                  "Envoyer",
                ])}
                onSubmit={(payload) => session.answerForm(payload)}
                onCancel={session.declineForm}
              />
            </div>
          </div>
        </div>
      )}

      {role === "patient" && session.snapshotAsk && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/45 p-6">
          <div className="w-full max-w-sm rounded-3xl bg-background p-5 text-center text-foreground shadow-2xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
              <Camera className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-display text-lg font-bold">
              {tr([
                "Registrar uma imagem da sua câmera?",
                "Record an image from your camera?",
                "¿Registrar una imagen de tu cámara?",
                "Enregistrer une image de votre caméra ?",
              ])}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {tr([
                `${first} quer guardar uma foto do que a sua câmera mostra agora (por exemplo, postura ou uma ferida) nos seus documentos. Só você e seus profissionais vinculados veem.`,
                `${first} wants to save a photo of what your camera shows now (e.g. posture or a wound) to your documents. Only you and your linked professionals can see it.`,
                `${first} quiere guardar una foto de lo que muestra tu cámara (p. ej. postura o una herida) en tus documentos. Solo tú y tus profesionales la ven.`,
                `${first} souhaite enregistrer une photo de ce que montre votre caméra (posture, plaie…) dans vos documents. Seuls vous et vos professionnels la voient.`,
              ])}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className={cn(buttonSecondary, "flex-1")}
                onClick={() => session.replySnapshot(false)}
              >
                {tr(["Não permitir", "Decline", "No permitir", "Refuser"])}
              </button>
              <button
                type="button"
                className={cn(buttonPrimary, "flex-1")}
                onClick={() => session.replySnapshot(true)}
              >
                {tr(["Permitir", "Allow", "Permitir", "Autoriser"])}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────── Ferramentas do profissional ───────────────────────────────

const TOOL_META: Record<ToolId, { icon: LucideIcon; label: Names }> = {
  paciente: { icon: UserRound, label: ["Paciente", "Patient", "Paciente", "Patient"] },
  anamnese: { icon: ClipboardList, label: ["Anamnese", "History", "Anamnesis", "Anamnèse"] },
  avaliacoes: {
    icon: ClipboardCheck,
    label: ["Avaliações", "Assessments", "Evaluaciones", "Évaluations"],
  },
  medidas: { icon: Ruler, label: ["Medidas", "Measurements", "Medidas", "Mesures"] },
  evolucao: { icon: NotebookPen, label: ["Evolução", "Progress note", "Evolución", "Évolution"] },
  cuidados: { icon: Activity, label: ["Planos", "Plans", "Planes", "Plans"] },
  metas: { icon: Target, label: ["Metas", "Goals", "Metas", "Objectifs"] },
  documentos: { icon: FileText, label: ["Documentos", "Documents", "Documentos", "Documents"] },
  retorno: { icon: CalendarPlus, label: ["Retorno", "Follow-up", "Seguimiento", "Suivi"] },
  cronometro: { icon: Timer, label: ["Cronômetro", "Timer", "Cronómetro", "Chrono"] },
};

/** Ficha rápida a partir da anamnese: o essencial para qualquer profissão. */
function QuickSheet({
  patientId,
  professionalId,
  onOpen,
}: {
  patientId: string;
  professionalId: string;
  onOpen: (t: ToolId) => void;
}) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const anam = useAnamnesis(patientId, professionalId);
  const priv = usePatientPrivate(patientId);
  const d = anam.data?.data ?? {};
  const rows: [Names, string | undefined][] = [
    [["Queixa principal", "Chief complaint", "Motivo de consulta", "Motif"], d.chiefComplaint],
    [["Objetivos", "Goals", "Objetivos", "Objectifs"], d.goals],
    [
      ["Condições de saúde", "Health conditions", "Condiciones de salud", "Pathologies"],
      d.clinicalHistory?.conditions?.filter(Boolean).join(", "),
    ],
    [["Medicações", "Medications", "Medicaciones", "Médicaments"], d.clinicalHistory?.medications],
    [["Alergias", "Allergies", "Alergias", "Allergies"], d.clinicalHistory?.allergies],
  ];
  const filled = rows.filter(([, v]) => v && v.trim());
  const age = priv.data?.birth_date
    ? Math.floor((Date.now() - new Date(priv.data.birth_date).getTime()) / (365.25 * 86_400_000))
    : null;
  return (
    <Card
      title={tr(["Ficha rápida", "Quick sheet", "Ficha rápida", "Fiche rapide"])}
      action={
        <button
          type="button"
          className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
          onClick={() => onOpen("anamnese")}
        >
          {filled.length
            ? tr(["Editar", "Edit", "Editar", "Modifier"])
            : tr([
                "Preencher anamnese",
                "Fill in history",
                "Completar anamnesis",
                "Remplir l'anamnèse",
              ])}
        </button>
      }
    >
      {age !== null && (
        <p className="mb-2 text-sm text-foreground">
          {age} {tr(["anos", "years old", "años", "ans"])}
          {anam.data
            ? ` · ${tr(["anamnese de", "history from", "anamnesis del", "anamnèse du"])} ${formatDate(anam.data.updated_at, locale, { day: "numeric", month: "short" })}`
            : ""}
        </p>
      )}
      {filled.length ? (
        <dl className="space-y-1.5 text-sm">
          {filled.map(([label, v]) => (
            <div key={label[0]} className="grid grid-cols-[8.5rem_1fr] gap-2">
              <dt className="text-muted-foreground">{tr(label)}</dt>
              <dd className="text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">
          {tr([
            "Ainda sem anamnese sua para este paciente.",
            "No history recorded by you yet.",
            "Aún no registraste anamnesis.",
            "Pas encore d'anamnèse de votre part.",
          ])}
        </p>
      )}
    </Card>
  );
}

function PatientContextTool({
  patientId,
  professionalId,
  profession,
  onOpen,
}: {
  patientId: string;
  professionalId: string;
  profession: ProfessionKey;
  onOpen: (t: ToolId) => void;
}) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const priv = usePatientPrivate(patientId);
  // Peso, IMC e gasto energético não ajudam numa sessão de psicologia.
  const bodyNumbers = profession !== "psicologia";
  const assessments = useAssessments(patientId);
  const plans = useCarePlans(patientId);
  const latest = (() => {
    const seen = new Set<string>();
    return (assessments.data ?? [])
      .filter((a) => (seen.has(a.kind) ? false : (seen.add(a.kind), true)))
      .slice(0, 6);
  })();
  const active = (plans.data ?? []).filter((p) => p.active).slice(0, 4);
  return (
    <div className="space-y-4">
      <QuickSheet patientId={patientId} professionalId={professionalId} onOpen={onOpen} />
      {bodyNumbers && (
        <RecordSummary
          patientId={patientId}
          birthDate={priv.data?.birth_date}
          onOpenTab={(t) =>
            onOpen(t === "antropometria" ? "medidas" : t === "plano" ? "cuidados" : t)
          }
        />
      )}
      {latest.length > 0 && (
        <Card
          title={tr([
            "Últimas avaliações",
            "Latest assessments",
            "Últimas evaluaciones",
            "Dernières évaluations",
          ])}
        >
          <ul className="space-y-2">
            {latest.map((a) => {
              const inst = instrument(a.kind);
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {inst ? tr(inst.name) : a.kind}
                  </span>
                  <OutcomeBadge
                    label={(a.data as { label?: Names } | null)?.label ?? ["", "", "", ""]}
                    tone={toneOf(a)}
                    score={a.score === null ? null : Number(a.score)}
                    max={inst?.type === "questionnaire" ? inst.max : undefined}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(a.created_at, locale, { day: "2-digit", month: "short" })}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      {active.length > 0 && (
        <Card
          title={tr([
            "Planos de cuidado ativos",
            "Active care plans",
            "Planes activos",
            "Plans actifs",
          ])}
        >
          <ul className="space-y-1.5 text-sm">
            {active.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="flex-1 font-medium text-foreground">{p.title}</span>
                <span className="text-xs text-muted-foreground">
                  {itemsOf(p).length} {tr(["itens", "items", "ítems", "éléments"])}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/** Evolução da consulta (SOAP com modelo da profissão), orientações para o paciente e conclusão. */
function EvolutionTool({ appt, profession }: { appt: Appointment; profession: ProfessionKey }) {
  const tr = useTr();
  const { t } = useClinicalI18n();
  const notes = useNotes(appt.patient_id);
  const existing = notes.data?.find((n) => n.appointment_id === appt.id);
  const [soap, setSoap] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [summary, setSummary] = useState(appt.summary_for_patient ?? "");
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !notes.data) return;
    loaded.current = true;
    if (existing) {
      setSoap({
        subjective: existing.subjective ?? "",
        objective: existing.objective ?? "",
        assessment: existing.assessment ?? "",
        plan: existing.plan ?? "",
      });
    }
  }, [notes.data, existing]);

  const template = EVOLUTION_TEMPLATE[profession];
  const empty = !soap.subjective && !soap.objective && !soap.assessment && !soap.plan;

  const saveNote = useClinicalMutation(
    () =>
      records.saveNote({
        id: existing?.id,
        patient_id: appt.patient_id,
        appointment_id: appt.id,
        subjective: soap.subjective.trim() || null,
        objective: soap.objective.trim() || null,
        assessment: soap.assessment.trim() || null,
        plan: soap.plan.trim() || null,
      }),
    {
      success: tr([
        "Evolução salva no prontuário",
        "Note saved to the record",
        "Evolución guardada",
        "Évolution enregistrée",
      ]),
    },
  );
  const saveSummary = useClinicalMutation(
    () => api.updateAppointment(appt.id, { summary_for_patient: summary.trim() || null }),
    { success: t("appt.saved") },
  );
  const finish = useClinicalMutation(
    () =>
      api.updateAppointment(appt.id, {
        summary_for_patient: summary.trim() || null,
        status: "realizada",
      }),
    {
      success: tr([
        "Consulta concluída",
        "Appointment completed",
        "Consulta concluida",
        "Consultation terminée",
      ]),
    },
  );

  const fields: [keyof typeof soap, Names][] = [
    ["subjective", ["S — Subjetivo (relato)", "S — Subjective", "S — Subjetivo", "S — Subjectif"]],
    [
      "objective",
      [
        "O — Objetivo (observado, medidas, exames)",
        "O — Objective",
        "O — Objetivo",
        "O — Objectif",
      ],
    ],
    ["assessment", ["A — Avaliação", "A — Assessment", "A — Evaluación", "A — Évaluation"]],
    ["plan", ["P — Plano / condutas", "P — Plan", "P — Plan", "P — Plan"]],
  ];

  return (
    <div className="space-y-4">
      <Card
        title={tr([
          "Evolução (só você vê)",
          "Progress note (private)",
          "Evolución (privada)",
          "Évolution (privée)",
        ])}
        action={
          empty && (template.subjective || template.plan) ? (
            <button
              type="button"
              className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
              onClick={() => setSoap(template)}
            >
              {tr(["Usar modelo", "Use template", "Usar modelo", "Utiliser un modèle"])}
            </button>
          ) : undefined
        }
      >
        <div className="space-y-2.5">
          {fields.map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                {tr(label)}
              </span>
              <textarea
                rows={3}
                value={soap[key]}
                onChange={(e) => setSoap((s) => ({ ...s, [key]: e.target.value }))}
                className={cn(inputClass, "resize-y")}
              />
            </label>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              className={buttonPrimary}
              disabled={saveNote.isPending}
              onClick={() => saveNote.mutate(undefined)}
            >
              {saveNote.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {tr(["Salvar evolução", "Save note", "Guardar evolución", "Enregistrer"])}
            </button>
          </div>
        </div>
      </Card>

      <Card
        title={tr([
          "Orientações para o paciente",
          "Guidance for the patient",
          "Indicaciones para el paciente",
          "Conseils pour le patient",
        ])}
      >
        <textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder={tr([
            "O paciente vê este resumo na página de consultas.",
            "The patient sees this summary on their appointments page.",
            "El paciente ve este resumen en su página de consultas.",
            "Le patient voit ce résumé sur sa page de consultations.",
          ])}
          className={cn(inputClass, "resize-y")}
        />
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className={buttonSecondary}
            disabled={saveSummary.isPending}
            onClick={() => saveSummary.mutate(undefined)}
          >
            {tr(["Salvar", "Save", "Guardar", "Enregistrer"])}
          </button>
          {appt.status !== "realizada" && (
            <button
              type="button"
              className={buttonPrimary}
              disabled={finish.isPending}
              onClick={() => finish.mutate(undefined)}
            >
              {tr([
                "Concluir consulta",
                "Complete appointment",
                "Concluir consulta",
                "Terminer la consultation",
              ])}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

function TimerTool({ session }: { session: ConsultSession }) {
  const tr = useTr();
  const [share, setShare] = useState(true);
  const [label, setLabel] = useState("");
  const [custom, setCustom] = useState("45");
  const now = useNowTick(!!session.timer);
  const t = session.timer;
  const start = (mode: TimerState["mode"], seconds: number) =>
    session.setTimer(
      { mode, seconds, startedAt: Date.now(), label: label.trim() || undefined },
      share,
    );

  return (
    <Card
      title={tr([
        "Cronômetro para testes e exercícios",
        "Timer for tests and exercises",
        "Cronómetro para pruebas y ejercicios",
        "Chrono pour tests et exercices",
      ])}
    >
      <div className="mb-4 grid place-items-center rounded-2xl bg-secondary/60 py-5">
        <span className="font-display text-6xl font-bold tabular-nums text-foreground">
          {t ? mmss(timerValue(t, now)) : "00:00"}
        </span>
        {t && (
          <span className="mt-1 text-xs text-muted-foreground">
            {t.mode === "countdown"
              ? tr(["Contagem regressiva", "Countdown", "Cuenta regresiva", "Compte à rebours"])
              : tr(["Cronômetro", "Stopwatch", "Cronómetro", "Chronomètre"])}
          </span>
        )}
      </div>
      <input
        className={cn(inputClass, "mb-3")}
        placeholder={tr([
          "Nome (ex.: Sentar e levantar)",
          "Label (e.g. Chair stand)",
          "Nombre (ej.: Sentarse y levantarse)",
          "Nom (ex. : Lever de chaise)",
        ])}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {[30, 60, 120, 300].map((s) => (
          <button
            key={s}
            type="button"
            className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
            onClick={() => start("countdown", s)}
          >
            <Play className="h-3.5 w-3.5" />
            {s < 60 ? `${s}s` : `${s / 60} min`}
          </button>
        ))}
        <span className="inline-flex items-center gap-1">
          <input
            className={cn(inputClass, "w-16 px-2 py-1.5 text-xs")}
            inputMode="numeric"
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
            aria-label={tr(["Segundos", "Seconds", "Segundos", "Secondes"])}
          />
          <button
            type="button"
            className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
            onClick={() => start("countdown", Math.max(1, Number(custom) || 1))}
          >
            s
          </button>
        </span>
        <button
          type="button"
          className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
          onClick={() => start("stopwatch", 0)}
        >
          <Timer className="h-3.5 w-3.5" />
          {tr(["Cronômetro livre", "Stopwatch", "Cronómetro libre", "Chronomètre"])}
        </button>
        {t && (
          <button
            type="button"
            className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
            onClick={() => session.setTimer(null, share)}
          >
            {t.mode === "stopwatch" ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {tr(["Parar", "Stop", "Detener", "Arrêter"])}
          </button>
        )}
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--color-primary)]"
          checked={share}
          onChange={(e) => setShare(e.target.checked)}
        />
        {tr([
          "Mostrar na tela do paciente",
          "Show on the patient's screen",
          "Mostrar en la pantalla del paciente",
          "Afficher chez le patient",
        ])}
      </label>
    </Card>
  );
}

function ReturnTool({ appt }: { appt: Appointment }) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const [open, setOpen] = useState(false);
  const next = useAppointments({
    role: "professional",
    patientId: appt.patient_id,
    from: new Date().toISOString(),
    ascending: true,
    limit: 5,
  });
  const upcoming = (next.data ?? []).filter(
    (a) =>
      a.id !== appt.id && ["agendada", "confirmada", "aguardando_pagamento"].includes(a.status),
  );
  return (
    <Card title={tr(["Próximo encontro", "Next visit", "Próxima cita", "Prochain rendez-vous"])}>
      {upcoming.length ? (
        <ul className="mb-3 space-y-1.5 text-sm">
          {upcoming.map((a) => (
            <li key={a.id} className="rounded-xl bg-secondary/60 px-3 py-2 text-foreground">
              {formatDate(a.starts_at, locale, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}{" "}
              · {formatTime(a.starts_at, locale)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-sm text-muted-foreground">
          {tr([
            "Ainda não há retorno marcado.",
            "No follow-up booked yet.",
            "Aún no hay seguimiento agendado.",
            "Aucun suivi prévu.",
          ])}
        </p>
      )}
      <button type="button" className={buttonPrimary} onClick={() => setOpen(true)}>
        <CalendarPlus className="h-4 w-4" />
        {tr(["Agendar retorno", "Book follow-up", "Agendar seguimiento", "Planifier un suivi"])}
      </button>
      {open && (
        <NewAppointmentDialog
          professionalId={appt.professional_id}
          defaultPatientId={appt.patient_id}
          onClose={() => setOpen(false)}
        />
      )}
    </Card>
  );
}

/** Painel de ferramentas do profissional dentro da chamada (e depois dela). */
export function ConsultTools({
  appt,
  profession,
  session,
  inCall,
  expanded,
  onToggleExpand,
  onClose,
}: {
  appt: Appointment;
  profession: ProfessionKey;
  session: ConsultSession;
  inCall: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  const tr = useTr();
  const order = TOOL_ORDER[profession];
  const [tool, setTool] = useState<ToolId>(order[0]);
  const priv = usePatientPrivate(appt.patient_id);
  const pid = appt.patient_id;
  const proId = appt.professional_id;

  let body: ReactNode = null;
  if (tool === "paciente")
    body = (
      <PatientContextTool
        patientId={pid}
        professionalId={proId}
        profession={profession}
        onOpen={setTool}
      />
    );
  else if (tool === "anamnese")
    body = (
      <AnamnesisForm
        patientId={pid}
        professionalId={proId}
        readOnly={false}
        profession={profession}
        compact
      />
    );
  else if (tool === "avaliacoes")
    body = (
      <AssessmentsPanel
        patientId={pid}
        professionalId={proId}
        appointmentId={appt.id}
        readOnly={false}
        suggested={SUGGESTED_INSTRUMENTS[profession]}
        onSendToPatient={inCall ? session.sendForm : undefined}
        pending={session.pending}
        onCancelPending={session.cancelForm}
      />
    );
  else if (tool === "medidas")
    body = (
      <AnthropometryPanel
        patientId={pid}
        birthDate={priv.data?.birth_date}
        sex={priv.data?.sex}
        readOnly={false}
        currentProfessionalId={proId}
      />
    );
  else if (tool === "evolucao") body = <EvolutionTool appt={appt} profession={profession} />;
  else if (tool === "cuidados")
    body = (
      <CarePlansPanel
        patientId={pid}
        professionalId={proId}
        appointmentId={appt.id}
        readOnly={false}
        kinds={SUGGESTED_CARE_KINDS[profession]}
      />
    );
  else if (tool === "metas") body = <GoalsPanel patientId={pid} readOnly={false} />;
  else if (tool === "documentos")
    body = (
      <div className="space-y-3">
        {inCall && (
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <Camera className="h-5 w-5" />
              </span>
              <p className="min-w-0 flex-1 text-sm text-foreground">
                {tr([
                  "Registrar uma imagem da câmera do paciente (postura, ferida, exame em mãos). Ele precisa autorizar.",
                  "Save an image from the patient's camera (posture, wound, a printed test). They must allow it.",
                  "Registrar una imagen de la cámara del paciente (postura, herida, examen). Debe autorizar.",
                  "Enregistrer une image de la caméra du patient (posture, plaie, examen). Il doit l'autoriser.",
                ])}
              </p>
              <button
                type="button"
                className={buttonSecondary}
                disabled={session.snapshot !== "idle"}
                onClick={session.requestSnapshot}
              >
                {session.snapshot !== "idle" && <Loader2 className="h-4 w-4 animate-spin" />}
                {session.snapshot === "waiting"
                  ? tr(["Aguardando…", "Waiting…", "Esperando…", "En attente…"])
                  : tr(["Capturar imagem", "Capture image", "Capturar imagen", "Capturer"])}
              </button>
            </div>
          </Card>
        )}
        <DocumentsPanel patientId={pid} meId={proId} canUpload />
      </div>
    );
  else if (tool === "retorno") body = <ReturnTool appt={appt} />;
  else if (tool === "cronometro") body = <TimerTool session={session} />;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <h2 className="flex-1 truncate px-1 text-sm font-bold text-foreground">
          {tr([
            "Ferramentas da consulta",
            "Visit tools",
            "Herramientas de la consulta",
            "Outils de consultation",
          ])}
        </h2>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={
            expanded
              ? tr(["Reduzir painel", "Shrink panel", "Reducir panel", "Réduire"])
              : tr(["Ampliar painel", "Expand panel", "Ampliar panel", "Agrandir"])
          }
          className="hidden h-8 w-8 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-secondary sm:grid"
        >
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={tr(["Fechar", "Close", "Cerrar", "Fermer"])}
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-border px-2 py-2">
        {order.map((id) => {
          const { icon: Icon, label } = TOOL_META[id];
          const on = tool === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTool(id)}
              aria-pressed={on}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                on
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tr(label)}
              {id === "avaliacoes" && session.pending.length > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] text-white">
                  {session.pending.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className={cn("@container min-h-0 flex-1 overflow-y-auto p-3 sm:p-4", plainText)}>
        {body}
      </div>
    </div>
  );
}
