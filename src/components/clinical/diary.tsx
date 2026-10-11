import { Fragment, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  MessageCircle,
  NotebookPen,
  Send,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTr } from "@/components/settings-ui";
import type { Names } from "@/lib/appearance-data";
import {
  DIARY_DAILY_LIMIT,
  commentDiaryPhoto,
  type DiaryNinaError,
} from "@/lib/diary-nina.functions";
import * as care from "@/lib/clinical/care";
import { MEAL_TYPES, type DiaryEntry, type MealType } from "@/lib/clinical/care";
import {
  qk,
  useClinicalMutation,
  useDiary,
  useDiaryComments,
  useLinks,
  usePeople,
  useSignedUrls,
} from "@/lib/clinical/queries";
import { SupportCard } from "@/components/no-numbers";
import {
  ALERT_FEELINGS,
  FEELINGS,
  HUNGER_WORDS,
  SATIETY_WORDS,
  feelingLabel,
  hasAlert,
  useNoNumbers,
  type Feeling,
} from "@/lib/no-numbers";
import { formatDate, formatTime, isSameDay, toDateKey } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import {
  Avatar,
  Card,
  EmptyState,
  Field,
  Loading,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./ui";
import { EmojiIcon } from "@/components/emoji-icon";

const MOODS = ["😊", "😌", "😐", "😣", "😴", "😤"];

/** Sugere a refeição pelo horário atual. */
function guessMeal(date: Date): MealType {
  const h = date.getHours();
  if (h < 9) return "cafe_da_manha";
  if (h < 11) return "lanche_da_manha";
  if (h < 14) return "almoco";
  if (h < 18) return "lanche_da_tarde";
  if (h < 21) return "jantar";
  return "ceia";
}

/** Escala de 1 a 5; no modo sem números, mostra as palavras no lugar dos números. */
function Scale({
  label,
  value,
  onChange,
  words,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  words: Names[];
}) {
  const tr = useTr();
  const noNumbers = useNoNumbers();
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground/80">{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={tr(words[n - 1])}
            title={tr(words[n - 1])}
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              "place-items-center rounded-full text-sm font-bold transition-all duration-300",
              noNumbers ? "px-3 py-2 text-xs" : "grid h-10 w-10",
              value === n
                ? "bg-primary text-primary-foreground scale-110 shadow-md ring-4 ring-primary/20"
                : "bg-secondary/80 text-muted-foreground hover:bg-primary/10 hover:text-primary",
            )}
          >
            {noNumbers ? tr(words[n - 1]) : n}
          </button>
        ))}
      </div>
      {!noNumbers && value && (
        <p className="mt-1 text-[11px] text-muted-foreground">{tr(words[value - 1])}</p>
      )}
    </div>
  );
}

/** "Como me senti": sentimentos livres; os de alerta abrem o cartão de apoio ao salvar. */
function FeelingsPicker({
  value,
  onChange,
}: {
  value: Feeling[];
  onChange: (v: Feeling[]) => void;
}) {
  const tr = useTr();
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground/80">
        {tr(["Como me senti", "How I felt", "Cómo me sentí", "Comment je me suis senti(e)"])}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {FEELINGS.map((f) => {
          const on = value.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((x) => x !== f.id) : [...value, f.id])}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                on
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border/70 bg-secondary/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {tr(f.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DiaryComposer({ patientId }: { patientId: string }) {
  const { t } = useClinicalI18n();
  const now = new Date();
  const [mealType, setMealType] = useState<MealType>(guessMeal(now));
  const [date, setDate] = useState(toDateKey(now));
  const [time, setTime] = useState(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  );
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hunger, setHunger] = useState<number | null>(null);
  const [satiety, setSatiety] = useState<number | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [followed, setFollowed] = useState<boolean | null>(null);
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [support, setSupport] = useState(false);
  const links = useLinks("patient");
  const hasCare = (links.data ?? []).some((l) => l.status === "ativo");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setSupport(hasAlert(feelings));
    setFeelings([]);
    setDescription("");
    setPhoto(null);
    setPreview(null);
    setHunger(null);
    setSatiety(null);
    setMood(null);
    setFollowed(null);
  };
  const add = useClinicalMutation(
    () =>
      care.addDiaryEntry({
        eatenAt: new Date(`${date}T${time}`).toISOString(),
        mealType,
        description,
        photo,
        hungerBefore: hunger,
        satietyAfter: satiety,
        mood,
        followedPlan: followed,
        feelings,
      }),
    { success: t("diary.saved"), invalidate: [qk.diary(patientId)], onSuccess: reset },
  );

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-accent" />
          <span>{t("diary.newEntry")}</span>
        </div>
      }
      className="relative border-t-8 border-t-accent/80"
    >
      {/* Detalhe visual de fita adesiva ou arame de caderno (simulado com um padrão pontilhado no topo) */}
      <div className="absolute top-0 left-4 right-4 h-2 flex justify-between px-2 opacity-20 pointer-events-none">
        <div className="w-2 h-4 rounded-full bg-foreground -mt-1" />
        <div className="w-2 h-4 rounded-full bg-foreground -mt-1" />
        <div className="w-2 h-4 rounded-full bg-foreground -mt-1" />
        <div className="w-2 h-4 rounded-full bg-foreground -mt-1" />
        <div className="w-2 h-4 rounded-full bg-foreground -mt-1" />
        <div className="w-2 h-4 rounded-full bg-foreground -mt-1" />
      </div>

      <div className="space-y-6 pt-2">
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mealType === m}
              onClick={() => setMealType(m)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-all duration-300",
                mealType === m
                  ? "bg-accent text-accent-foreground shadow-md scale-[1.02]"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
              )}
            >
              {t(`diary.meal.${m}` as ClinicalKey)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="sm:col-span-1 rounded-2xl bg-secondary/30 p-4 border border-border/40 relative overflow-hidden">
            {/* Lined paper effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(transparent 27px, var(--color-border) 28px)",
                backgroundSize: "100% 28px",
                opacity: 0.4,
              }}
            />
            <textarea
              rows={3}
              className="w-full resize-none bg-transparent text-base leading-[28px] text-foreground outline-none placeholder:text-muted-foreground/60 relative z-10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("diary.placeholder")}
            />
          </div>

          <div className="flex gap-3 sm:flex-col sm:gap-4">
            <Field label={t("diary.date")}>
              <input
                type="date"
                className={cn(inputClass, "rounded-xl py-3")}
                value={date}
                max={toDateKey(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label={t("diary.time")}>
              <input
                type="time"
                className={cn(inputClass, "rounded-xl py-3")}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-8 rounded-2xl bg-card/40 p-4 border border-border/30">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground/80">{t("diary.photo")}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                if (f.size > care.MAX_UPLOAD_BYTES) return toast.error(t("errors.fileTooLarge"));
                setPhoto(f);
                setPreview(URL.createObjectURL(f));
              }}
            />
            {preview ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-sm transition-transform hover:scale-105">
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label={t("common.remove")}
                  onClick={() => {
                    setPhoto(null);
                    setPreview(null);
                  }}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid h-24 w-24 place-items-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary-soft/20 text-primary transition-colors hover:bg-primary-soft/50 hover:border-primary/50"
                aria-label={t("diary.addPhoto")}
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera className="h-7 w-7" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    {t("diary.photo")}
                  </span>
                </div>
              </button>
            )}
          </div>

          <Scale
            label={t("diary.hunger")}
            value={hunger}
            onChange={setHunger}
            words={HUNGER_WORDS}
          />
          <Scale
            label={t("diary.satiety")}
            value={satiety}
            onChange={setSatiety}
            words={SATIETY_WORDS}
          />
          <FeelingsPicker value={feelings} onChange={setFeelings} />

          <div>
            <p className="mb-2 text-sm font-semibold text-foreground/80">{t("diary.mood")}</p>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mood === m}
                  onClick={() => setMood(mood === m ? null : m)}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border-2 text-xl transition-all duration-300",
                    mood === m
                      ? "border-accent bg-accent-soft scale-110 shadow-md ring-4 ring-accent/20"
                      : "border-transparent bg-secondary/80 hover:bg-secondary hover:scale-105 grayscale hover:grayscale-0",
                  )}
                >
                  <EmojiIcon emoji={m} className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-foreground/80">
              {t("diary.followedPlan")}
            </p>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={followed === v}
                  onClick={() => setFollowed(followed === v ? null : v)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all duration-300",
                    followed === v
                      ? v
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                        : "border-destructive bg-destructive text-destructive-foreground shadow-md scale-105"
                      : "border-transparent bg-secondary/80 text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {v ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {v ? t("diary.yes") : t("diary.no")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            className={cn(buttonPrimary, "px-8 py-3 text-base shadow-lg")}
            disabled={(!description.trim() && !photo) || add.isPending}
            onClick={() => add.mutate(undefined)}
          >
            <Send className="h-4 w-4 mr-1" /> {t("diary.save")}
          </button>
        </div>
        {support && <SupportCard hasCare={hasCare} />}
      </div>
    </Card>
  );
}

export function DiaryFeed({
  patientId,
  meId,
  canComment,
  isOwner,
}: {
  patientId: string;
  meId: string;
  canComment: boolean;
  isOwner: boolean;
}) {
  const { t, locale } = useClinicalI18n();
  const diary = useDiary(patientId);
  const entries = useMemo(() => diary.data ?? [], [diary.data]);
  const comments = useDiaryComments(entries.map((e) => e.id));
  const photos = useSignedUrls(
    "diary-photos",
    entries.map((e) => e.photo_path),
  );
  const people = usePeople([patientId, ...(comments.data ?? []).map((c) => c.author_id)]);

  const days = useMemo(() => {
    const groups: { day: Date; entries: DiaryEntry[] }[] = [];
    for (const e of entries) {
      const d = new Date(e.eaten_at);
      const g = groups.find((x) => isSameDay(x.day, d));
      if (g) g.entries.push(e);
      else groups.push({ day: d, entries: [e] });
    }
    for (const g of groups) g.entries.sort((a, b) => a.eaten_at.localeCompare(b.eaten_at));
    return groups;
  }, [entries]);

  if (diary.isLoading) return <Loading />;
  if (!entries.length) {
    return (
      <EmptyState
        icon={NotebookPen}
        title={t("diary.empty")}
        text={isOwner ? t("diary.emptyOwner") : t("diary.emptyPro")}
      />
    );
  }

  const since = Date.now() - 14 * 86_400_000;
  const alerts = isOwner
    ? 0
    : entries.filter((e) => new Date(e.eaten_at).getTime() >= since && hasAlert(e.feelings)).length;

  return (
    <div className="space-y-6">
      {alerts > 0 && <AlertSummary count={alerts} />}
      {days.map((g) => {
        const followed = g.entries.filter((e) => e.followed_plan !== null);
        const onPlan = followed.filter((e) => e.followed_plan).length;
        return (
          <section key={toDateKey(g.day)}>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h3 className="font-display text-base font-bold text-foreground first-letter:uppercase">
                {isSameDay(g.day, new Date())
                  ? t("diary.today")
                  : formatDate(g.day, locale, { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              {followed.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {t("diary.onPlanCount", { n: onPlan, total: followed.length })}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {g.entries.map((e) => (
                <EntryCard
                  key={e.id}
                  entry={e}
                  photoUrl={e.photo_path ? photos.data?.[e.photo_path] : undefined}
                  comments={(comments.data ?? []).filter((c) => c.entry_id === e.id)}
                  people={people.data}
                  meId={meId}
                  canComment={canComment}
                  canDelete={isOwner}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Para o profissional: refeições recentes com sinais de alerta marcados pelo paciente. */
function AlertSummary({ count }: { count: number }) {
  const tr = useTr();
  return (
    <p className="rounded-2xl border border-accent/30 bg-accent-soft/40 px-4 py-3 text-sm text-foreground">
      {tr([
        `Sinais de atenção (culpa, perda de controle, compensação, restrição ou purgação) marcados em ${count} refeição(ões) nos últimos 14 dias. Vale acolher na próxima conversa.`,
        `Warning signs (guilt, loss of control, compensation, restriction or purging) marked on ${count} meal(s) in the last 14 days. Worth addressing gently next time.`,
        `Señales de atención (culpa, pérdida de control, compensación, restricción o purga) marcadas en ${count} comida(s) en los últimos 14 días. Conviene acoger el tema en la próxima conversación.`,
        `Signaux d'alerte (culpabilité, perte de contrôle, compensation, restriction ou purge) notés sur ${count} repas ces 14 derniers jours. À aborder avec bienveillance.`,
      ])}
    </p>
  );
}

/** Comentário educativo da Nina sobre a foto (M7). Só a dona do diário pede; todos veem. */
function NinaPhotoComment({ entry, canAsk }: { entry: DiaryEntry; canAsk: boolean }) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const ERRORS: Record<DiaryNinaError, Names> = {
    limit: [
      `A Nina já comentou ${DIARY_DAILY_LIMIT} fotos hoje. Amanhã tem mais!`,
      `Nina has commented on ${DIARY_DAILY_LIMIT} photos today. More tomorrow!`,
      `Nina ya comentó ${DIARY_DAILY_LIMIT} fotos hoy. ¡Mañana hay más!`,
      `Nina a déjà commenté ${DIARY_DAILY_LIMIT} photos aujourd'hui. À demain !`,
    ],
    unavailable: [
      "A Nina não está disponível agora.",
      "Nina isn't available right now.",
      "Nina no está disponible ahora.",
      "Nina n'est pas disponible pour le moment.",
    ],
    photo: [
      "Não deu para abrir a foto desta refeição.",
      "Couldn't open this meal's photo.",
      "No se pudo abrir la foto de esta comida.",
      "Impossible d'ouvrir la photo de ce repas.",
    ],
    failed: [
      "A Nina não conseguiu comentar. Tente de novo.",
      "Nina couldn't comment. Please try again.",
      "Nina no pudo comentar. Inténtalo de nuevo.",
      "Nina n'a pas pu commenter. Réessayez.",
    ],
  };
  const ask = useMutation({
    mutationFn: () => commentDiaryPhoto({ data: { entryId: entry.id, locale } }),
    onSuccess: (res) => {
      if ("error" in res) setError(tr(ERRORS[res.error]));
      else {
        setError(null);
        qc.invalidateQueries({ queryKey: qk.diary(entry.patient_id) });
      }
    },
    onError: () => setError(tr(ERRORS.failed)),
  });

  if (!entry.nina_comment && !canAsk) return null;

  return (
    <div className="border-t border-border/60 bg-accent-soft/30 px-4 py-3">
      {entry.nina_comment ? (
        <div className="flex gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">
              Nina{" "}
              <span className="font-normal text-muted-foreground">
                ·{" "}
                {tr([
                  "olhar educativo, sem calorias",
                  "educational take, no calories",
                  "mirada educativa, sin calorías",
                  "regard éducatif, sans calories",
                ])}
              </span>
            </p>
            <div className="mt-1 space-y-1 text-sm leading-relaxed text-foreground">
              {entry.nina_comment
                .split("\n")
                .filter((l) => l.trim())
                .map((line, i) => (
                  <p key={i}>
                    {line
                      .split(/(\*\*[^*]+\*\*)/g)
                      .map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j}>{part.slice(2, -2)}</strong>
                        ) : (
                          <Fragment key={j}>{part}</Fragment>
                        ),
                      )}
                  </p>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => ask.mutate()}
            disabled={ask.isPending}
            className={cn(buttonSecondary, "text-xs")}
          >
            <Sparkles className={cn("h-4 w-4 text-accent", ask.isPending && "animate-pulse")} />
            {ask.isPending
              ? tr([
                  "A Nina está olhando a foto…",
                  "Nina is looking at the photo…",
                  "Nina está mirando la foto…",
                  "Nina regarde la photo…",
                ])
              : tr([
                  "Pedir um olhar da Nina",
                  "Ask Nina for a look",
                  "Pedir una mirada de Nina",
                  "Demander l'avis de Nina",
                ])}
          </button>
          <span className="text-[11px] text-muted-foreground">
            {tr([
              "Comentário educativo, sem calorias e sem julgamento.",
              "Educational comment, no calories and no judgement.",
              "Comentario educativo, sin calorías y sin juicios.",
              "Commentaire éducatif, sans calories ni jugement.",
            ])}
          </span>
          {error && <p className="w-full text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}

function EntryCard({
  entry,
  photoUrl,
  comments,
  people,
  meId,
  canComment,
  canDelete,
}: {
  entry: DiaryEntry;
  photoUrl?: string;
  comments: care.DiaryComment[];
  people?: Map<string, { name: string; avatarUrl: string | null }>;
  meId: string;
  canComment: boolean;
  canDelete: boolean;
}) {
  const { t, locale } = useClinicalI18n();
  const tr = useTr();
  // Modo sem números vale para a dona do diário; o profissional continua vendo a escala.
  const words = useNoNumbers() && canDelete;
  const [comment, setComment] = useState("");
  const invalidate = [qk.diary(entry.patient_id), ["clinical", "diary-comments"]];
  const send = useClinicalMutation(() => care.addDiaryComment(entry.id, comment), {
    invalidate,
    onSuccess: () => setComment(""),
  });
  const removeComment = useClinicalMutation((id: string) => care.deleteDiaryComment(id), {
    invalidate,
  });
  const remove = useClinicalMutation(() => care.deleteDiaryEntry(entry), {
    success: t("diary.deleted"),
    invalidate,
  });

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-card/60 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5" />

      <div className="flex gap-4 p-5 relative z-10">
        {photoUrl && (
          <a href={photoUrl} target="_blank" rel="noreferrer" className="shrink-0 group/photo">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 group-hover/photo:scale-105 sm:h-32 sm:w-32 border-4 border-card">
              <img
                src={photoUrl}
                alt={t("diary.photoAlt")}
                className="h-full w-full object-cover"
              />
            </div>
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <p className="text-base font-bold text-foreground">
                {t(`diary.meal.${entry.meal_type}` as ClinicalKey)}
              </p>
              <span className="text-xs font-medium text-muted-foreground/80">
                {formatTime(entry.eaten_at, locale)}
              </span>
            </div>
            {canDelete && (
              <button
                type="button"
                className={cn(buttonGhost, "px-2 py-2 rounded-xl")}
                aria-label={t("common.remove")}
                onClick={() => window.confirm(t("diary.deleteConfirm")) && remove.mutate(undefined)}
              >
                <Trash2 className="h-4 w-4 opacity-50 transition-opacity hover:opacity-100" />
              </button>
            )}
          </div>
          {entry.description && (
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">{entry.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            {entry.hunger_before && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                {words
                  ? tr(HUNGER_WORDS[entry.hunger_before - 1])
                  : t("diary.hungerShort", { n: entry.hunger_before })}
              </span>
            )}
            {entry.satiety_after && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                {words
                  ? tr(SATIETY_WORDS[entry.satiety_after - 1])
                  : t("diary.satietyShort", { n: entry.satiety_after })}
              </span>
            )}
            {entry.feelings.map((f) => {
              const label = feelingLabel(f);
              if (!label) return null;
              return (
                <span
                  key={f}
                  className={cn(
                    "rounded-full px-2 py-0.5",
                    ALERT_FEELINGS.has(f)
                      ? "bg-accent-soft font-semibold text-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {tr(label)}
                </span>
              );
            })}
            {entry.mood && (
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5">
                <EmojiIcon emoji={entry.mood} className="h-3.5 w-3.5" />
              </span>
            )}
            {entry.followed_plan !== null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                  entry.followed_plan
                    ? "bg-primary-soft text-primary"
                    : "bg-warning/15 text-warning",
                )}
              >
                {entry.followed_plan ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {entry.followed_plan ? t("diary.onPlan") : t("diary.offPlan")}
              </span>
            )}
          </div>
        </div>
      </div>

      {photoUrl && (entry.nina_comment || canDelete) && (
        <NinaPhotoComment entry={entry} canAsk={canDelete} />
      )}

      {(comments.length > 0 || canComment) && (
        <div className="space-y-2 border-t border-border/60 bg-secondary/30 px-4 py-3">
          {comments.map((c) => {
            const author = people?.get(c.author_id);
            return (
              <div key={c.id} className="flex gap-2">
                <Avatar name={author?.name ?? "…"} url={author?.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1 rounded-xl bg-card px-3 py-2 text-sm">
                  <p className="text-xs font-semibold text-foreground">
                    {author?.name ?? "…"}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {formatDate(c.created_at, locale, { day: "numeric", month: "short" })}
                    </span>
                  </p>
                  <p className="text-foreground">{c.body}</p>
                </div>
                {c.author_id === meId && (
                  <button
                    type="button"
                    className={cn(buttonGhost, "self-start px-1.5 py-1")}
                    aria-label={t("common.remove")}
                    onClick={() => removeComment.mutate(c.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
          {canComment && (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim()) send.mutate(undefined);
              }}
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className={cn(inputClass, "py-2")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("diary.commentPlaceholder")}
                aria-label={t("diary.commentPlaceholder")}
              />
              <button
                type="submit"
                className={cn(buttonGhost, "px-2")}
                disabled={!comment.trim() || send.isPending}
                aria-label={t("chat.send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
