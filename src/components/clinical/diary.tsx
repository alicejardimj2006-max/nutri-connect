import { useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  MessageCircle,
  NotebookPen,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import * as care from "@/lib/clinical/care";
import { MEAL_TYPES, type DiaryEntry, type MealType } from "@/lib/clinical/care";
import {
  qk,
  useClinicalMutation,
  useDiary,
  useDiaryComments,
  usePeople,
  useSignedUrls,
} from "@/lib/clinical/queries";
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
  inputClass,
} from "./ui";

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

function Scale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              "h-8 w-8 rounded-lg border text-sm font-semibold transition",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-secondary",
            )}
          >
            {n}
          </button>
        ))}
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
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
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
      }),
    { success: t("diary.saved"), invalidate: [qk.diary(patientId)], onSuccess: reset },
  );

  return (
    <Card title={t("diary.newEntry")}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mealType === m}
              onClick={() => setMealType(m)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                mealType === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`diary.meal.${m}` as ClinicalKey)}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Field label={t("diary.whatDidYouEat")}>
            <textarea
              rows={2}
              className={cn(inputClass, "resize-y")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("diary.placeholder")}
            />
          </Field>
          <Field label={t("diary.date")}>
            <input
              type="date"
              className={inputClass}
              value={date}
              max={toDateKey(new Date())}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label={t("diary.time")}>
            <input
              type="time"
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">{t("diary.photo")}</p>
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
              <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label={t("common.remove")}
                  onClick={() => {
                    setPhoto(null);
                    setPreview(null);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:bg-secondary"
                aria-label={t("diary.addPhoto")}
              >
                <Camera className="h-6 w-6" />
              </button>
            )}
          </div>
          <Scale label={t("diary.hunger")} value={hunger} onChange={setHunger} />
          <Scale label={t("diary.satiety")} value={satiety} onChange={setSatiety} />
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">{t("diary.mood")}</p>
            <div className="flex gap-1">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mood === m}
                  onClick={() => setMood(mood === m ? null : m)}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg border text-lg transition",
                    mood === m
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {t("diary.followedPlan")}
            </p>
            <div className="flex gap-1">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={followed === v}
                  onClick={() => setFollowed(followed === v ? null : v)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                    followed === v
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  {v ? t("diary.yes") : t("diary.no")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className={buttonPrimary}
            disabled={(!description.trim() && !photo) || add.isPending}
            onClick={() => add.mutate(undefined)}
          >
            <NotebookPen className="h-4 w-4" /> {t("diary.save")}
          </button>
        </div>
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

  return (
    <div className="space-y-6">
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
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
      <div className="flex gap-3 p-4">
        {photoUrl && (
          <a href={photoUrl} target="_blank" rel="noreferrer" className="shrink-0">
            <img
              src={photoUrl}
              alt={t("diary.photoAlt")}
              className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
            />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {t(`diary.meal.${entry.meal_type}` as ClinicalKey)}{" "}
              <span className="font-normal text-muted-foreground">
                · {formatTime(entry.eaten_at, locale)}
              </span>
            </p>
            {canDelete && (
              <button
                type="button"
                className={cn(buttonGhost, "px-2 py-1")}
                aria-label={t("common.remove")}
                onClick={() => window.confirm(t("diary.deleteConfirm")) && remove.mutate(undefined)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {entry.description && (
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">{entry.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            {entry.hunger_before && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                {t("diary.hungerShort", { n: entry.hunger_before })}
              </span>
            )}
            {entry.satiety_after && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                {t("diary.satietyShort", { n: entry.satiety_after })}
              </span>
            )}
            {entry.mood && (
              <span className="rounded-full bg-secondary px-2 py-0.5">{entry.mood}</span>
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
