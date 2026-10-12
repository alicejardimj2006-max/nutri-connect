// Lancheira da semana (N8): para cada perfil infantil, o responsável conta o que a Nina precisa
// saber (idade, alergias, o que não gosta, regras da escola, 1 ou 2 lanches), monta a semana com a
// Nina ou com ideias prontas e manda os ingredientes para a lista de compras. A criança vê o lanche
// do dia na trilha e diz se gostou.
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  Pencil,
  RefreshCw,
  Settings2,
  ShieldAlert,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Mascot } from "@/components/mascots";
import { ShoppingSection } from "@/components/menu-panel";
import { useTr } from "@/components/settings-ui";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import type { Names } from "@/lib/appearance-data";
import { addWeeks, dayDate, DAY_NAMES, mondayOf } from "@/lib/menu";
import { useSeasonNow } from "@/lib/season";
import { useTrailProfiles } from "@/lib/trail-profiles";
import type { TrailProfile } from "@/lib/trail-types";
import {
  AGE_NAMES,
  AGE_RANGES,
  safeIdeas,
  type AgeRange,
  type LunchIdea,
} from "@/lib/lunchbox-ideas";
import {
  LUNCHBOX_DAILY_LIMIT,
  SNACK_SLOTS,
  suggestLunchbox,
  type LunchboxError,
  type LunchSnack,
  type SnackSlot,
} from "@/lib/lunchbox.functions";
import {
  DEFAULT_LUNCH_PROFILE,
  SCHOOL_DAYS,
  lunchKeys,
  slotName,
  snackKey,
  useLunchbox,
  useLunchboxProfile,
  useLunchRatings,
  useSaveLunchbox,
  useSaveLunchboxProfile,
  type Lunchbox,
  type LunchSnacks,
} from "@/lib/lunchbox";

const card = "rounded-3xl border border-border/70 bg-card p-5 shadow-xs";
const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50";
const btnSoft =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50";
const iconBtn =
  "rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50";
const field =
  "w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

const ERRORS: Record<LunchboxError, Names> = {
  limit: [
    `A Nina já ajudou ${LUNCHBOX_DAILY_LIMIT} vezes com a lancheira hoje. Amanhã tem mais!`,
    `Nina has helped ${LUNCHBOX_DAILY_LIMIT} times with lunchboxes today. More tomorrow!`,
    `Nina ya ayudó ${LUNCHBOX_DAILY_LIMIT} veces con la lonchera hoy. ¡Mañana hay más!`,
    `Nina a déjà aidé ${LUNCHBOX_DAILY_LIMIT} fois pour la boîte à goûter aujourd'hui. À demain !`,
  ],
  unavailable: [
    "A Nina não está disponível agora.",
    "Nina isn't available right now.",
    "Nina no está disponible ahora.",
    "Nina n'est pas disponible pour le moment.",
  ],
  image: [
    "A Nina não conseguiu responder. Tente de novo.",
    "Nina couldn't answer. Try again.",
    "Nina no pudo responder. Inténtalo de nuevo.",
    "Nina n'a pas pu répondre. Réessayez.",
  ],
  failed: [
    "A Nina não conseguiu montar agora (ou o que sugeriu não era seguro para a criança). Tente de novo.",
    "Nina couldn't put it together (or what she suggested wasn't safe for the child). Try again.",
    "Nina no pudo armarlo (o lo que sugirió no era seguro para el niño). Inténtalo de nuevo.",
    "Nina n'a pas pu le préparer (ou sa proposition n'était pas sûre pour l'enfant). Réessayez.",
  ],
};

function fromIdea(idea: LunchIdea, tr: (n: Names) => string): LunchSnack {
  return {
    title: tr(idea.title),
    items: idea.items.map((i) => tr(i)),
    prep: "",
    tip: "",
    emojis: idea.emojis,
    source: "ideia",
  };
}

// ───────────────────────────── Sobre a criança ─────────────────────────────

function AboutKid({ kid, onSaved }: { kid: TrailProfile; onSaved: () => void }) {
  const tr = useTr();
  const profile = useLunchboxProfile(kid.id);
  const save = useSaveLunchboxProfile(kid.id);
  const [form, setForm] = useState(DEFAULT_LUNCH_PROFILE);

  useEffect(() => {
    const p = profile.data;
    setForm(
      p
        ? {
            age_range: p.age_range as AgeRange,
            snacks: p.snacks,
            allergies: p.allergies,
            dislikes: p.dislikes,
            school_rules: p.school_rules,
          }
        : DEFAULT_LUNCH_PROFILE,
    );
  }, [profile.data]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(form, {
      onSuccess: () => {
        toast.success(tr(["Salvo.", "Saved.", "Guardado.", "Enregistré."]));
        onSaved();
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <form onSubmit={submit} className={cn(card, "space-y-3")}>
      <p className="text-sm font-bold text-foreground">
        {tr([
          `Sobre ${kid.name}`,
          `About ${kid.name}`,
          `Sobre ${kid.name}`,
          `À propos de ${kid.name}`,
        ])}
      </p>
      <div className="flex flex-wrap gap-4">
        <label className="text-xs font-semibold text-foreground">
          {tr(["Idade", "Age", "Edad", "Âge"])}
          <select
            value={form.age_range}
            onChange={(e) => setForm({ ...form, age_range: e.target.value as AgeRange })}
            className="ml-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs"
          >
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>
                {tr(AGE_NAMES[a])}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <legend className="sr-only">
            {tr(["Lanches por dia", "Snacks per day", "Meriendas por día", "Goûters par jour"])}
          </legend>
          {[1, 2].map((n) => (
            <label key={n} className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="snacks"
                checked={form.snacks === n}
                onChange={() => setForm({ ...form, snacks: n })}
              />
              {n === 1
                ? tr([
                    "1 lanche (recreio)",
                    "1 snack (recess)",
                    "1 merienda (recreo)",
                    "1 goûter (récré)",
                  ])
                : tr([
                    "2 lanches (período integral)",
                    "2 snacks (full day)",
                    "2 meriendas (jornada completa)",
                    "2 goûters (journée complète)",
                  ])}
            </label>
          ))}
        </fieldset>
      </div>
      <label className="block text-xs font-semibold text-foreground">
        <span className="inline-flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
          {tr([
            "Alergias e intolerâncias",
            "Allergies and intolerances",
            "Alergias e intolerancias",
            "Allergies et intolérances",
          ])}
        </span>
        <input
          value={form.allergies}
          onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          maxLength={300}
          placeholder={tr([
            "Ex.: leite, amendoim",
            "E.g. milk, peanuts",
            "Ej.: leche, maní",
            "Ex. : lait, arachides",
          ])}
          className={cn(field, "mt-1")}
        />
      </label>
      <label className="block text-xs font-semibold text-foreground">
        {tr(["Não gosta de", "Doesn't like", "No le gusta", "N'aime pas"])}
        <input
          value={form.dislikes}
          onChange={(e) => setForm({ ...form, dislikes: e.target.value })}
          maxLength={300}
          placeholder={tr([
            "Ex.: mamão, cebola",
            "E.g. papaya, onion",
            "Ej.: papaya, cebolla",
            "Ex. : papaye, oignon",
          ])}
          className={cn(field, "mt-1")}
        />
      </label>
      <label className="block text-xs font-semibold text-foreground">
        {tr(["Regras da escola", "School rules", "Reglas de la escuela", "Règles de l'école"])}
        <input
          value={form.school_rules}
          onChange={(e) => setForm({ ...form, school_rules: e.target.value })}
          maxLength={300}
          placeholder={tr([
            "Ex.: sem castanhas, sem doces, sem micro-ondas",
            "E.g. no nuts, no sweets, no microwave",
            "Ej.: sin frutos secos, sin dulces, sin microondas",
            "Ex. : sans noix, sans bonbons, sans micro-ondes",
          ])}
          className={cn(field, "mt-1")}
        />
      </label>
      <p className="text-[11px] text-muted-foreground">
        {tr([
          "Só você vê. A Nina e as ideias prontas nunca sugerem o que estiver nas alergias ou proibido pela escola; mesmo assim, confira sempre.",
          "Only you see this. Nina and the ready ideas never suggest anything in the allergies or banned by the school; still, always double-check.",
          "Solo tú lo ves. Nina y las ideas listas nunca sugieren lo que esté en las alergias o prohibido por la escuela; aun así, revisa siempre.",
          "Vous seul le voyez. Nina et les idées ne proposent jamais ce qui figure dans les allergies ou est interdit par l'école ; vérifiez quand même.",
        ])}
      </p>
      <button type="submit" disabled={save.isPending} className={btnPrimary}>
        {tr(["Salvar", "Save", "Guardar", "Enregistrer"])}
      </button>
    </form>
  );
}

// ───────────────────────────── Um lanche ─────────────────────────────

function SnackCard({
  label,
  snack,
  busy,
  disabled,
  ideas,
  onAsk,
  onSet,
}: {
  label: string;
  snack: LunchSnack | undefined;
  busy: boolean;
  disabled: boolean;
  ideas: LunchIdea[];
  onAsk: () => void;
  onSet: (snack: LunchSnack | null) => void;
}) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ideias" | "escrever" | null>(null);
  const [draft, setDraft] = useState("");

  const write = (e: FormEvent) => {
    e.preventDefault();
    const title = draft.trim().slice(0, 120);
    if (!title) return;
    onSet({ title, items: [title], prep: "", tip: "", emojis: "", source: "manual" });
    setDraft("");
    setMode(null);
  };

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border/60 bg-background/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {busy ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {tr([
            "A Nina está pensando…",
            "Nina is thinking…",
            "Nina está pensando…",
            "Nina réfléchit…",
          ])}
        </p>
      ) : snack ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-1 text-left text-sm font-semibold text-foreground hover:underline"
          >
            {snack.emojis && <span className="mr-1">{snack.emojis}</span>}
            {snack.title}
          </button>
          {snack.rating && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              {snack.rating === "gostei" ? (
                <ThumbsUp className="h-3 w-3 text-primary" />
              ) : (
                <ThumbsDown className="h-3 w-3" />
              )}
              {snack.rating === "gostei"
                ? tr(["A criança gostou", "The child liked it", "Le gustó", "L'enfant a aimé"])
                : tr([
                    "A criança não gostou",
                    "The child didn't like it",
                    "No le gustó",
                    "L'enfant n'a pas aimé",
                  ])}
            </p>
          )}
          {open && (
            <div className="mt-2 space-y-2 text-xs text-foreground">
              <ul className="list-disc space-y-0.5 pl-4">
                {snack.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              {snack.prep && <p>{snack.prep}</p>}
              {snack.tip && <p className="rounded-xl bg-accent-soft/50 px-2 py-1.5">{snack.tip}</p>}
            </div>
          )}
        </>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">
          {tr(["Ainda vazio", "Still empty", "Aún vacío", "Encore vide"])}
        </p>
      )}

      {mode === "escrever" && (
        <form onSubmit={write} className="mt-2 flex gap-1.5">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={120}
            placeholder={tr([
              "Ex.: pão com queijo e uva",
              "E.g. cheese roll and grapes",
              "Ej.: pan con queso y uvas",
              "Ex. : pain-fromage et raisins",
            ])}
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1 text-xs"
          />
          <button type="submit" className={btnSoft} disabled={!draft.trim()}>
            OK
          </button>
        </form>
      )}
      {mode === "ideias" && (
        <select
          autoFocus
          defaultValue=""
          onChange={(e) => {
            const idea = ideas.find((i) => i.id === e.target.value);
            if (idea) onSet(fromIdea(idea, tr));
            setMode(null);
          }}
          className="mt-2 w-full rounded-full border border-border bg-background px-3 py-1 text-xs"
          aria-label={tr(["Ideias prontas", "Ready ideas", "Ideas listas", "Idées prêtes"])}
        >
          <option value="" disabled>
            {tr(["Escolha uma ideia", "Pick an idea", "Elige una idea", "Choisissez une idée"])}
          </option>
          {ideas.map((i) => (
            <option key={i.id} value={i.id}>
              {i.emojis} {tr(i.title)}
            </option>
          ))}
        </select>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-0.5 pt-2">
        <button
          type="button"
          onClick={onAsk}
          disabled={disabled}
          className={iconBtn}
          title={tr([
            "Outra ideia da Nina",
            "Another idea from Nina",
            "Otra idea de Nina",
            "Une autre idée de Nina",
          ])}
          aria-label={tr([
            "Outra ideia da Nina",
            "Another idea from Nina",
            "Otra idea de Nina",
            "Une autre idée de Nina",
          ])}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "ideias" ? null : "ideias")}
          className={iconBtn}
          title={tr(["Ideias prontas", "Ready ideas", "Ideas listas", "Idées prêtes"])}
          aria-label={tr(["Ideias prontas", "Ready ideas", "Ideas listas", "Idées prêtes"])}
        >
          <Lightbulb className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "escrever" ? null : "escrever")}
          className={iconBtn}
          title={tr(["Escrever", "Write", "Escribir", "Écrire"])}
          aria-label={tr(["Escrever", "Write", "Escribir", "Écrire"])}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {snack && (
          <button
            type="button"
            onClick={() => onSet(null)}
            className={iconBtn}
            title={tr(["Tirar", "Remove", "Quitar", "Retirer"])}
            aria-label={tr(["Tirar", "Remove", "Quitar", "Retirer"])}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── Semana de uma criança ─────────────────────────────

function KidWeek({ kid }: { kid: TrailProfile }) {
  const tr = useTr();
  const { locale } = useI18n();
  const qc = useQueryClient();
  const [week, setWeek] = useState(() => mondayOf());
  const profile = useLunchboxProfile(kid.id);
  const lunchbox = useLunchbox(kid.id, week);
  const save = useSaveLunchbox(kid.id, week);
  const ratings = useLunchRatings(kid.id);
  const season = useSeasonNow();
  const [editing, setEditing] = useState(false);
  const [wish, setWish] = useState("");
  const [busy, setBusy] = useState<string[]>([]);
  const [used, setUsed] = useState<number | null>(null);

  const about = profile.data ?? null;
  const perDay = about?.snacks ?? 1;
  const age = (about?.age_range ?? "4-6") as AgeRange;
  const restrictions = `${about?.allergies ?? ""} ${about?.school_rules ?? ""}`;
  const ideas = safeIdeas(age, restrictions);
  const snacks = (lunchbox.data?.snacks ?? {}) as LunchSnacks;
  const slots: SnackSlot[] = perDay === 2 ? [...SNACK_SLOTS] : ["manha"];
  const allSlots = SCHOOL_DAYS.flatMap((day) => slots.map((slot) => ({ day, slot })));
  const empty = allSlots.filter((s) => !snacks[snackKey(s.day, s.slot)]);
  const thisWeek = mondayOf();
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" });

  const persist = (next: LunchSnacks) =>
    save.mutate(next, { onError: (err) => toast.error((err as Error).message) });

  const ask = async (list: { day: number; slot: SnackSlot }[]) => {
    if (!list.length) return;
    const keys = list.map((s) => snackKey(s.day, s.slot));
    setBusy(keys);
    try {
      const keep = Object.entries(snacks)
        .filter(([k, s]) => s && !keys.includes(k))
        .map(([, s]) => s!.title)
        .slice(0, 10);
      const res = await suggestLunchbox({
        data: {
          slots: list,
          snacksPerDay: perDay === 2 ? 2 : 1,
          age,
          allergies: about?.allergies ?? "",
          dislikes: about?.dislikes ?? "",
          schoolRules: about?.school_rules ?? "",
          liked: ratings.data?.liked ?? [],
          disliked: ratings.data?.disliked ?? [],
          keep,
          season,
          wish,
          locale,
        },
      });
      if (res.used !== undefined) setUsed(res.used);
      if ("error" in res) {
        toast.error(tr(ERRORS[res.error]));
        return;
      }
      // Lê a lancheira mais recente (a pessoa pode ter mexido enquanto a Nina pensava).
      const latest = qc.getQueryData<Lunchbox | null>(lunchKeys.week(kid.id, week));
      const current = { ...((latest?.snacks ?? {}) as LunchSnacks) };
      for (const s of res.snacks) current[snackKey(s.day, s.slot)] = s.snack;
      persist(current);
      if (res.snacks.length < list.length)
        toast(
          tr([
            "Alguns lanches ficaram de fora por segurança. Peça de novo ou escolha uma ideia pronta.",
            "Some snacks were left out for safety. Ask again or pick a ready idea.",
            "Algunas meriendas quedaron fuera por seguridad. Pide de nuevo o elige una idea lista.",
            "Certains goûters ont été écartés par sécurité. Redemandez ou choisissez une idée.",
          ]),
        );
    } catch (err) {
      console.error("lancheira", err);
      toast.error(tr(ERRORS.failed));
    } finally {
      setBusy([]);
    }
  };

  const setSnack = (key: string, snack: LunchSnack | null) => {
    const next = { ...snacks };
    if (snack) next[key] = snack;
    else delete next[key];
    persist(next);
  };

  if (profile.isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  if (!about || editing) return <AboutKid kid={kid} onSaved={() => setEditing(false)} />;

  const weekLabel =
    week === thisWeek
      ? tr(["Esta semana", "This week", "Esta semana", "Cette semaine"])
      : week === addWeeks(thisWeek, 1)
        ? tr(["Próxima semana", "Next week", "Próxima semana", "La semaine prochaine"])
        : `${dateFmt.format(dayDate(week, 0))} – ${dateFmt.format(dayDate(week, 4))}`;

  return (
    <>
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {tr(AGE_NAMES[age])}
            {about.allergies && (
              <span className="ml-2 inline-flex items-center gap-1 font-semibold text-destructive">
                <ShieldAlert className="h-3.5 w-3.5" />
                {about.allergies}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setEditing(true)} className={btnSoft}>
              <Settings2 className="h-3.5 w-3.5" />
              {tr(["Sobre a criança", "About the child", "Sobre el niño", "À propos de l'enfant"])}
            </button>
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card p-1">
              <button
                type="button"
                onClick={() => setWeek(addWeeks(week, -1))}
                className={iconBtn}
                aria-label={tr([
                  "Semana anterior",
                  "Previous week",
                  "Semana anterior",
                  "Semaine précédente",
                ])}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-28 text-center text-xs font-semibold text-foreground">
                {weekLabel}
              </span>
              <button
                type="button"
                onClick={() => setWeek(addWeeks(week, 1))}
                className={iconBtn}
                aria-label={tr([
                  "Próxima semana",
                  "Next week",
                  "Próxima semana",
                  "Semaine suivante",
                ])}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <input
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          maxLength={200}
          placeholder={tr([
            "Pedido para a Nina (opcional): ex.: quinta tem passeio, algo fácil de levar",
            "Request for Nina (optional): e.g. field trip on Thursday, something easy to carry",
            "Pedido para Nina (opcional): ej.: el jueves hay excursión, algo fácil de llevar",
            "Demande à Nina (facultatif) : ex. sortie jeudi, quelque chose de facile à emporter",
          ])}
          className="mt-3 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {empty.length > 0 ? (
            <button
              type="button"
              onClick={() => void ask(empty)}
              disabled={busy.length > 0 || lunchbox.isLoading}
              className={btnPrimary}
            >
              {busy.length > 1 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {empty.length === allSlots.length
                ? tr([
                    "Montar a semana com a Nina",
                    "Plan the week with Nina",
                    "Armar la semana con Nina",
                    "Préparer la semaine avec Nina",
                  ])
                : tr([
                    `Completar com a Nina (${empty.length})`,
                    `Fill in with Nina (${empty.length})`,
                    `Completar con Nina (${empty.length})`,
                    `Compléter avec Nina (${empty.length})`,
                  ])}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    tr([
                      "Trocar todos os lanches da semana por novas ideias da Nina?",
                      "Replace every snack this week with new ideas from Nina?",
                      "¿Cambiar todas las meriendas de la semana por nuevas ideas de Nina?",
                      "Remplacer tous les goûters de la semaine par de nouvelles idées de Nina ?",
                    ]),
                  )
                )
                  void ask(allSlots);
              }}
              disabled={busy.length > 0}
              className={btnSoft}
            >
              <RefreshCw className="h-4 w-4" />
              {tr(["Refazer a semana", "Redo the week", "Rehacer la semana", "Refaire la semaine"])}
            </button>
          )}
          <span className="text-[11px] text-muted-foreground">
            {used !== null &&
              `${used}/${LUNCHBOX_DAILY_LIMIT} ${tr(["hoje", "today", "hoy", "aujourd'hui"])} · `}
            {tr([
              "Comida de verdade, sem ultraprocessados, respeitando alergias, regras da escola e o que a criança avaliou.",
              "Real food, no ultra-processed products, respecting allergies, school rules and the child's ratings.",
              "Comida de verdad, sin ultraprocesados, respetando alergias, reglas de la escuela y lo que el niño valoró.",
              "De vrais aliments, sans ultra-transformés, en respectant allergies, règles de l'école et avis de l'enfant.",
            ])}
          </span>
        </div>
      </section>

      {lunchbox.isLoading ? (
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <ol className="mt-6 space-y-3">
          {SCHOOL_DAYS.map((day) => (
            <li key={day} className={cn(card, "p-4")}>
              <p className="mb-2 text-sm font-bold text-foreground">
                {tr(DAY_NAMES[day])}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {dateFmt.format(dayDate(week, day))}
                </span>
              </p>
              <div className={cn("grid gap-2", slots.length === 2 && "sm:grid-cols-2")}>
                {slots.map((slot) => {
                  const key = snackKey(day, slot);
                  return (
                    <SnackCard
                      key={key}
                      label={tr(slotName(slot, perDay))}
                      snack={snacks[key]}
                      busy={busy.includes(key)}
                      disabled={busy.length > 0}
                      ideas={ideas}
                      onAsk={() => void ask([{ day, slot }])}
                      onSet={(s) => setSnack(key, s)}
                    />
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      )}

      <ShoppingSection ingredients={Object.values(snacks).flatMap((s) => s?.items ?? [])} />
    </>
  );
}

// ───────────────────────────── Página ─────────────────────────────

export function LunchboxPanel() {
  const tr = useTr();
  const { user } = useAuth();
  const { profiles } = useTrailProfiles(user?.id ?? "guest", "");
  const kids = profiles.filter((p) => p.kind === "kid");
  const [kidId, setKidId] = useState<string | null>(null);
  const kid = kids.find((k) => k.id === kidId) ?? kids[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold font-display text-foreground">
          {tr([
            "Lancheira da semana",
            "Weekly lunchbox",
            "Lonchera de la semana",
            "Boîte à goûter de la semaine",
          ])}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {tr([
            "Lanches escolares de segunda a sexta, com comida de verdade e seguros para cada criança. Ela vê o lanche do dia na trilha e conta se gostou.",
            "School snacks Monday to Friday, with real food and safe for each child. They see the day's snack on their trail and say if they liked it.",
            "Meriendas escolares de lunes a viernes, con comida de verdad y seguras para cada niño. Ve la merienda del día en su ruta y dice si le gustó.",
            "Goûters d'école du lundi au vendredi, de vrais aliments, sûrs pour chaque enfant. Il voit le goûter du jour sur son parcours et dit s'il a aimé.",
          ])}
        </p>
      </header>

      {!kid ? (
        <div className={cn(card, "text-center")}>
          <p className="text-sm text-muted-foreground">
            {tr([
              "A lancheira usa os perfis infantis da Trilha. Crie um perfil para cada criança e volte aqui.",
              "The lunchbox uses the kids' profiles from the Trail. Create a profile for each child and come back.",
              "La lonchera usa los perfiles infantiles de la Ruta. Crea un perfil para cada niño y vuelve aquí.",
              "La boîte à goûter utilise les profils enfants du Parcours. Créez un profil par enfant et revenez.",
            ])}
          </p>
          <Link to="/desafios" className={cn(btnPrimary, "mt-4")}>
            {tr(["Ir para a Trilha", "Go to the Trail", "Ir a la Ruta", "Aller au Parcours"])}
          </Link>
        </div>
      ) : (
        <>
          {kids.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2" role="group">
              {kids.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={k.id === kid.id}
                  onClick={() => setKidId(k.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition",
                    k.id === kid.id
                      ? "border-accent bg-accent-soft text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Mascot id={k.avatar} size={24} />
                  {k.name}
                </button>
              ))}
            </div>
          )}
          <KidWeek key={kid.id} kid={kid} />
        </>
      )}
    </div>
  );
}

/** Atalho na trilha do responsável (quando a conta tem perfis infantis). */
export function LunchboxLink() {
  const tr = useTr();
  return (
    <Link
      to="/lancheira"
      className="mb-6 flex items-center gap-3 rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-soft/60 to-card p-4 text-sm shadow-xs transition hover:shadow-card"
    >
      <span className="text-2xl" aria-hidden>
        🎒
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-foreground">
          {tr([
            "Lancheira da semana",
            "Weekly lunchbox",
            "Lonchera de la semana",
            "Boîte à goûter de la semaine",
          ])}
        </span>
        <span className="block text-xs text-muted-foreground">
          {tr([
            "Monte os lanches da escola das crianças com a Nina.",
            "Plan the kids' school snacks with Nina.",
            "Arma las meriendas escolares de los niños con Nina.",
            "Préparez les goûters d'école des enfants avec Nina.",
          ])}
        </span>
      </span>
    </Link>
  );
}

// ───────────────────────────── Na trilha da criança ─────────────────────────────

/** "Minha lancheira de hoje" no perfil infantil: o lanche do dia, com gostei / não gostei. */
export function KidLunchboxToday({ profileId }: { profileId: string }) {
  const tr = useTr();
  const today = new Date();
  const day = (today.getDay() + 6) % 7;
  const week = mondayOf(today);
  const lunchbox = useLunchbox(profileId, week);
  const profile = useLunchboxProfile(profileId);
  const save = useSaveLunchbox(profileId, week);

  if (day > 4 || !lunchbox.data) return null;
  const snacks = (lunchbox.data.snacks ?? {}) as LunchSnacks;
  const perDay = profile.data?.snacks ?? 1;
  const slots: SnackSlot[] = perDay === 2 ? [...SNACK_SLOTS] : ["manha"];
  const todays = slots
    .map((slot) => ({ slot, key: snackKey(day, slot), snack: snacks[snackKey(day, slot)] }))
    .filter((x) => x.snack);
  if (!todays.length) return null;

  const rate = (key: string, rating: "gostei" | "nao_gostei") => {
    const s = snacks[key];
    if (!s) return;
    save.mutate({ ...snacks, [key]: { ...s, rating } });
  };

  return (
    <section className="mb-6 rounded-3xl border-2 border-accent/40 bg-gradient-to-br from-accent-soft/60 to-card p-4">
      <h2 className="text-base font-extrabold font-display text-foreground">
        {tr([
          "Minha lancheira de hoje",
          "My lunchbox today",
          "Mi lonchera de hoy",
          "Ma boîte à goûter du jour",
        ])}
      </h2>
      <ul className="mt-3 space-y-3">
        {todays.map(({ slot, key, snack }) => (
          <li key={key} className="flex flex-wrap items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden>
              {snack!.emojis || "🍎"}
            </span>
            <div className="min-w-0 flex-1">
              {slots.length > 1 && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tr(slotName(slot, perDay))}
                </p>
              )}
              <p className="text-sm font-semibold text-foreground">{snack!.title}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => rate(key, "gostei")}
                aria-pressed={snack!.rating === "gostei"}
                className={cn(
                  "rounded-full border-2 px-3 py-2 text-xl transition",
                  snack!.rating === "gostei"
                    ? "border-primary bg-primary/15"
                    : "border-border bg-card hover:border-primary/60",
                )}
                aria-label={tr(["Gostei", "I liked it", "Me gustó", "J'ai aimé"])}
              >
                😋
              </button>
              <button
                type="button"
                onClick={() => rate(key, "nao_gostei")}
                aria-pressed={snack!.rating === "nao_gostei"}
                className={cn(
                  "rounded-full border-2 px-3 py-2 text-xl transition",
                  snack!.rating === "nao_gostei"
                    ? "border-muted-foreground bg-secondary"
                    : "border-border bg-card hover:border-muted-foreground/60",
                )}
                aria-label={tr([
                  "Não gostei",
                  "I didn't like it",
                  "No me gustó",
                  "Je n'ai pas aimé",
                ])}
              >
                😕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
