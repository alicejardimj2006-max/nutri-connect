// Planos de cuidado: o profissional monta (treino, exercícios em casa, tarefas entre sessões,
// cuidados, orientações, medicações em uso) e o paciente segue e marca "feito hoje".
import { useMemo, useState, type ReactNode } from "react";
import { Check, ClipboardList, Pencil, Plus, Power, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTr } from "@/components/settings-ui";
import {
  carePlansKey,
  deleteCarePlan,
  itemsOf,
  saveCarePlan,
  setCarePlanActive,
  todayKey,
  useCareCheckins,
  useCarePlans,
  useToggleCareCheckin,
  type CareItem,
  type CarePlan,
} from "@/lib/clinical/care-plans";
import { CARE_PLAN_KINDS, type CarePlanKind } from "@/lib/clinical/professions";
import { useClinicalMutation, usePeople } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Card, EmptyState, Loading, buttonPrimary, buttonSecondary, inputClass } from "./ui";

const ALL_KINDS = Object.keys(CARE_PLAN_KINDS) as CarePlanKind[];

function PlanEditor({
  plan,
  patientId,
  professionalId,
  appointmentId,
  kinds,
  onClose,
}: {
  plan?: CarePlan;
  patientId: string;
  professionalId: string;
  appointmentId?: string | null;
  kinds: CarePlanKind[];
  onClose: () => void;
}) {
  const tr = useTr();
  const [kind, setKind] = useState<CarePlanKind>(
    (plan?.kind as CarePlanKind) ?? kinds[0] ?? "orientacoes",
  );
  const [title, setTitle] = useState(plan?.title ?? "");
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [items, setItems] = useState<CareItem[]>(() => (plan ? itemsOf(plan) : [{ name: "" }]));
  const meta = CARE_PLAN_KINDS[kind];

  const save = useClinicalMutation(
    () =>
      saveCarePlan({
        id: plan?.id,
        patientId,
        professionalId,
        appointmentId,
        kind,
        title: title.trim() || tr(meta.label),
        notes,
        items,
      }),
    {
      invalidate: [carePlansKey(patientId)],
      success: tr([
        "Plano salvo no acompanhamento",
        "Plan saved to the record",
        "Plan guardado",
        "Plan enregistré",
      ]),
      onSuccess: onClose,
    },
  );
  const setItem = (i: number, patch: Partial<CareItem>) =>
    setItems((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(undefined);
      }}
    >
      <div className="flex flex-wrap gap-1.5">
        {[...kinds, ...ALL_KINDS.filter((k) => !kinds.includes(k))].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              kind === k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary",
            )}
          >
            {tr(CARE_PLAN_KINDS[k].label)}
          </button>
        ))}
      </div>
      <input
        className={inputClass}
        placeholder={tr([
          "Título (ex.: Treino A — membros inferiores)",
          "Title (e.g. Workout A — lower body)",
          "Título (ej.: Entrenamiento A)",
          "Titre (ex. : Séance A)",
        ])}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />
      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="rounded-xl border border-border/70 bg-background p-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold">
                {i + 1}
              </span>
              <input
                className={cn(inputClass, "py-2")}
                placeholder={tr(meta.item)}
                value={it.name}
                onChange={(e) => setItem(i, { name: e.target.value })}
              />
              <button
                type="button"
                onClick={() =>
                  setItems((list) =>
                    list.length > 1 ? list.filter((_, j) => j !== i) : [{ name: "" }],
                  )
                }
                aria-label={tr(["Remover", "Remove", "Quitar", "Retirer"])}
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 grid gap-2 pl-8 sm:grid-cols-2">
              <input
                className={cn(inputClass, "py-2 text-xs")}
                placeholder={tr(meta.details)}
                value={it.details ?? ""}
                onChange={(e) => setItem(i, { details: e.target.value })}
              />
              <input
                className={cn(inputClass, "py-2 text-xs")}
                placeholder={tr(meta.frequency)}
                value={it.frequency ?? ""}
                onChange={(e) => setItem(i, { frequency: e.target.value })}
              />
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={cn(buttonSecondary, "px-3 py-1.5 text-xs")}
        onClick={() => setItems((l) => [...l, { name: "" }])}
      >
        <Plus className="h-3.5 w-3.5" />
        {tr(meta.item)}
      </button>
      <textarea
        rows={2}
        className={cn(inputClass, "resize-y")}
        placeholder={tr([
          "Observações gerais para o paciente",
          "General notes for the patient",
          "Observaciones para el paciente",
          "Remarques pour le patient",
        ])}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          {tr(["Cancelar", "Cancel", "Cancelar", "Annuler"])}
        </button>
        <button
          type="submit"
          className={buttonPrimary}
          disabled={save.isPending || !items.some((i) => i.name.trim())}
        >
          {tr([
            "Salvar e enviar ao paciente",
            "Save and share",
            "Guardar y compartir",
            "Enregistrer et partager",
          ])}
        </button>
      </div>
    </form>
  );
}

/** Pontinhos dos últimos 7 dias: marcou "feito" ou não. */
function Adherence({ planId, days }: { planId: string; days: Set<string> }) {
  const tr = useTr();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const done = last7.filter((d) => days.has(`${planId}:${d}`)).length;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
      title={tr(["Últimos 7 dias", "Last 7 days", "Últimos 7 días", "7 derniers jours"])}
    >
      <span className="flex gap-0.5">
        {last7.map((d) => (
          <span
            key={d}
            className={cn(
              "h-2 w-2 rounded-full",
              days.has(`${planId}:${d}`) ? "bg-emerald-500" : "bg-border",
            )}
          />
        ))}
      </span>
      {done}/7
    </span>
  );
}

function PlanCard({
  plan,
  children,
  author,
}: {
  plan: CarePlan;
  children?: ReactNode;
  author?: string;
}) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const items = itemsOf(plan);
  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-4",
        plan.active ? "border-border/70" : "border-dashed border-border opacity-70",
      )}
    >
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {tr(CARE_PLAN_KINDS[plan.kind as CarePlanKind]?.label ?? ["", "", "", ""])}
          </p>
          <h3 className="font-display text-base font-bold text-foreground">{plan.title}</h3>
          <p className="text-[11px] text-muted-foreground">
            {author ? `${author} · ` : ""}
            {formatDate(plan.updated_at, locale, { day: "numeric", month: "short" })}
          </p>
        </div>
        {children}
      </div>
      <ol className="mt-3 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="font-semibold text-foreground">{it.name}</span>
              {(it.details || it.frequency) && (
                <span className="block text-xs text-muted-foreground">
                  {[it.details, it.frequency].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {plan.notes && (
        <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs leading-relaxed text-foreground">
          {plan.notes}
        </p>
      )}
    </article>
  );
}

/** Painel do profissional (prontuário e chamada). */
export function CarePlansPanel({
  patientId,
  professionalId,
  appointmentId,
  readOnly,
  kinds = ALL_KINDS,
}: {
  patientId: string;
  professionalId: string;
  appointmentId?: string | null;
  readOnly: boolean;
  kinds?: CarePlanKind[];
}) {
  const tr = useTr();
  const plans = useCarePlans(patientId);
  const checkins = useCareCheckins(patientId);
  const [editing, setEditing] = useState<CarePlan | "new" | null>(null);
  const authors = usePeople([...new Set((plans.data ?? []).map((p) => p.professional_id))]);
  const days = useMemo(
    () => new Set((checkins.data ?? []).map((c) => `${c.plan_id}:${c.day}`)),
    [checkins.data],
  );

  const toggle = useClinicalMutation(
    ({ id, active }: { id: string; active: boolean }) => setCarePlanActive(id, active),
    {
      invalidate: [carePlansKey(patientId)],
    },
  );
  const remove = useClinicalMutation((id: string) => deleteCarePlan(id), {
    invalidate: [carePlansKey(patientId)],
  });

  if (plans.isLoading) return <Loading />;
  const list = plans.data ?? [];

  return (
    <div className="space-y-3">
      {!readOnly &&
        (editing ? (
          <Card
            title={
              editing === "new"
                ? tr(["Novo plano", "New plan", "Nuevo plan", "Nouveau plan"])
                : tr(["Editar plano", "Edit plan", "Editar plan", "Modifier le plan"])
            }
          >
            <PlanEditor
              plan={editing === "new" ? undefined : editing}
              patientId={patientId}
              professionalId={professionalId}
              appointmentId={appointmentId}
              kinds={kinds}
              onClose={() => setEditing(null)}
            />
          </Card>
        ) : (
          <button type="button" className={buttonPrimary} onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" />
            {tr([
              "Novo plano de cuidado",
              "New care plan",
              "Nuevo plan de cuidado",
              "Nouveau plan de soins",
            ])}
          </button>
        ))}

      {!list.length && !editing && (
        <EmptyState
          icon={ClipboardList}
          title={tr(["Nenhum plano ainda", "No plans yet", "Ningún plan aún", "Aucun plan"])}
          text={tr([
            "Treino, exercícios em casa, tarefas entre sessões, cuidados ou medicações — o paciente acompanha e marca o que fez.",
            "Workouts, home exercises, between-session tasks, care or medications — the patient follows and checks them off.",
            "Entrenamiento, ejercicios, tareas, cuidados o medicaciones — el paciente sigue y marca lo hecho.",
            "Entraînement, exercices, tâches, soins ou médicaments — le patient suit et coche ce qu'il a fait.",
          ])}
        />
      )}

      {list.map((p) => {
        const mine = p.professional_id === professionalId;
        return (
          <PlanCard
            key={p.id}
            plan={p}
            author={mine ? undefined : authors.data?.get(p.professional_id)?.name}
          >
            <Adherence planId={p.id} days={days} />
            {mine && !readOnly && (
              <span className="flex w-full justify-end gap-1 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  aria-label={tr(["Editar", "Edit", "Editar", "Modifier"])}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggle.mutate({ id: p.id, active: !p.active })}
                  aria-label={
                    p.active
                      ? tr(["Encerrar", "Archive", "Archivar", "Archiver"])
                      : tr(["Reativar", "Reactivate", "Reactivar", "Réactiver"])
                  }
                  title={
                    p.active
                      ? tr(["Encerrar", "Archive", "Archivar", "Archiver"])
                      : tr(["Reativar", "Reactivate", "Reactivar", "Réactiver"])
                  }
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove.mutate(p.id)}
                  aria-label={tr(["Apagar", "Delete", "Borrar", "Supprimer"])}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            )}
          </PlanCard>
        );
      })}
    </div>
  );
}

/** Visão do paciente: planos ativos com "feito hoje". */
export function PatientCarePlans({ patientId }: { patientId: string }) {
  const tr = useTr();
  const plans = useCarePlans(patientId);
  const checkins = useCareCheckins(patientId);
  const toggle = useToggleCareCheckin(patientId);
  const authors = usePeople([...new Set((plans.data ?? []).map((p) => p.professional_id))]);
  const days = useMemo(
    () => new Set((checkins.data ?? []).map((c) => `${c.plan_id}:${c.day}`)),
    [checkins.data],
  );
  const active = (plans.data ?? []).filter((p) => p.active);
  if (!active.length) return null;
  const today = todayKey();

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-foreground">
        {tr([
          "Seus planos de cuidado",
          "Your care plans",
          "Tus planes de cuidado",
          "Vos plans de soins",
        ])}
      </h2>
      {active.map((p) => {
        const done = days.has(`${p.id}:${today}`);
        return (
          <PlanCard key={p.id} plan={p} author={authors.data?.get(p.professional_id)?.name}>
            <button
              type="button"
              onClick={() => toggle.mutate({ planId: p.id, done: !done })}
              disabled={toggle.isPending}
              aria-pressed={done}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                done
                  ? "bg-emerald-500 text-white"
                  : "border border-border bg-background text-foreground hover:bg-secondary",
              )}
            >
              <Check className="h-3.5 w-3.5" />
              {done
                ? tr(["Feito hoje", "Done today", "Hecho hoy", "Fait aujourd'hui"])
                : tr(["Marcar feito hoje", "Mark done today", "Marcar hecho hoy", "Marquer fait"])}
            </button>
            <span className="w-full">
              <Adherence planId={p.id} days={days} />
            </span>
          </PlanCard>
        );
      })}
    </section>
  );
}
