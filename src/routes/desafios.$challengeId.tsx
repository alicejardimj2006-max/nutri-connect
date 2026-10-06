import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Circle,
  Lightbulb,
  Send,
  Users,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { formatDate, initials } from "@/lib/community";
import { sendBrowserNotification } from "@/lib/settings";
import { EmojiIcon } from "@/components/emoji-icon";
import { earnedBadges as computeBadges } from "@/lib/social/challenge-stats";
import {
  useAddTip,
  useChallenge,
  useChallengeParticipants,
  useChallengeTips,
  useChallenges,
  useJoinChallenge,
  useLeaveChallenge,
  useSetStep,
} from "@/lib/social/challenges-queries";

export const Route = createFileRoute("/desafios/$challengeId")({
  head: () => ({
    meta: [{ title: "Desafio — NutriConnect" }],
  }),
  component: ChallengeDetailPage,
});

function ChallengeDetailPage() {
  const { challengeId } = useParams({ from: "/desafios/$challengeId" });
  const { user } = useAuth();
  const { t } = useI18n();
  const [tipText, setTipText] = useState("");

  // Tudo vem do banco: o desafio (com o meu progresso), quem participa e as dicas da comunidade.
  const challengeQuery = useChallenge(challengeId);
  const participantsQuery = useChallengeParticipants(challengeId);
  const tipsQuery = useChallengeTips(challengeId);
  const allChallenges = useChallenges(!!user);
  const join = useJoinChallenge();
  const leave = useLeaveChallenge();
  const setStep = useSetStep();
  const addTip = useAddTip();

  const challenge = challengeQuery.data ?? undefined;
  const currentUserId = user?.id || "guest";

  if (challengeQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-muted-foreground">
        {t("cd.loading")}
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">{t("cd.notFound")}</h1>
        <Link to="/desafios" className="text-sm font-semibold text-accent hover:underline">
          {t("cd.backToChallenges")}
        </Link>
      </div>
    );
  }

  const isJoined = challenge.joined;
  const isCompleted = challenge.completed;
  const totalSteps = challenge.steps.length;
  const myCompletedSteps = challenge.mySteps;
  const progressPct = totalSteps > 0 ? Math.round((myCompletedSteps.length / totalSteps) * 100) : 0;
  const earnedBadges = computeBadges(allChallenges.data ?? []);
  const communityTips = tipsQuery.data ?? [];

  const handleJoin = () => {
    if (!user) {
      toast.info(t("challenge.loginToJoin"));
      return;
    }
    if (isJoined) {
      leave.mutate(challenge.id, { onSuccess: () => toast.info(t("cd.leftToast")) });
    } else {
      join.mutate(challenge.id, { onSuccess: () => toast.success(t("cd.joinedToast")) });
    }
  };

  const handleToggleStep = (index: number) => {
    if (!user) {
      toast.info(t("cd.loginProgress"));
      return;
    }
    const done = !myCompletedSteps.includes(index);
    const willComplete =
      done && !isCompleted && totalSteps > 0 && myCompletedSteps.length === totalSteps - 1;
    setStep.mutate(
      { challengeId: challenge.id, currentSteps: myCompletedSteps, stepIndex: index, done },
      {
        onSuccess: () => {
          if (!willComplete) return;
          toast.success(`${t("cd.doneToast")} ${challenge.badgeLabel}.`);
          sendBrowserNotification(
            user.id,
            "achievements",
            t("cd.doneNotifTitle"),
            `${t("cd.notifBody")} ${challenge.badgeLabel}.`,
          );
        },
      },
    );
  };

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info(t("cd.loginTip"));
      return;
    }
    try {
      await addTip.mutateAsync({ challengeId: challenge.id, text: tipText });
      setTipText("");
      toast.success(t("cd.tipShared"));
    } catch {
      // o aviso de erro já é mostrado pelo hook
    }
  };

  const participantsProgress = (participantsQuery.data ?? []).map((p) => ({
    userId: p.id,
    name: p.name,
    completed: p.stepsDone,
    pct: totalSteps > 0 ? Math.round((p.stepsDone / totalSteps) * 100) : 0,
    isDone: p.completed,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Link
        to="/desafios"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{t("cd.backAll")}</span>
      </Link>

      {/* Cabeçalho do Desafio */}
      <div className="rounded-3xl border border-border bg-card shadow-card p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary shadow-xs">
              <EmojiIcon emoji={challenge.badgeIcon} className="h-8 w-8" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {challenge.category}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {challenge.duration}
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                    <Award className="h-3 w-3" /> {t("challenge.completed")}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                {challenge.title}
              </h1>
              <p className="mt-2 text-sm text-foreground/80 leading-relaxed max-w-2xl">
                {challenge.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {challenge.participantCount} {t("cd.peopleParticipating")} ·{" "}
                {challenge.completedCount} {t("cd.alreadyDone")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition cursor-pointer ${
              isJoined
                ? "bg-primary-soft text-primary hover:bg-primary/20"
                : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft"
            }`}
          >
            {isJoined ? t("cd.joinedLeave") : t("cd.joinChallenge")}
          </button>
        </div>

        {isJoined && totalSteps > 0 && (
          <div className="mt-6 border-t border-border/60 pt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5">
              <span>{t("challenge.yourProgress")}</span>
              <span>
                {myCompletedSteps.length}/{totalSteps} {t("challenge.steps")} · {progressPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Passo a Passo */}
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold font-display text-foreground mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span>{t("cd.stepsTitle")}</span>
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              {isJoined ? t("cd.stepsJoined") : t("cd.stepsNotJoined")}
            </p>

            <ul className="space-y-2.5">
              {challenge.steps.map((step, i) => {
                const done = myCompletedSteps.includes(i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={!isJoined}
                      onClick={() => handleToggleStep(i)}
                      className={`w-full flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        done
                          ? "border-primary/30 bg-primary-soft/40"
                          : "border-border bg-secondary/20 hover:bg-secondary/40"
                      } ${isJoined ? "cursor-pointer" : "cursor-default opacity-80"}`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm leading-relaxed ${done ? "text-foreground/70 line-through" : "text-foreground"}`}
                      >
                        {step}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {!isJoined && (
              <button
                type="button"
                onClick={handleJoin}
                className="mt-5 w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition shadow-xs"
              >
                {t("cd.joinAndStart")}
              </button>
            )}
          </section>

          {/* Dicas */}
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold font-display text-foreground mb-5 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              <span>{t("cd.tips")}</span>
            </h2>

            {challenge.tips.length > 0 && (
              <ul className="space-y-2.5 mb-6">
                {challenge.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-2xl bg-accent-soft/30 p-3.5 text-sm text-foreground/90"
                  >
                    <span className="text-accent font-bold">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {t("cd.communityTips")}
            </h3>
            {communityTips.length > 0 ? (
              <div className="space-y-3 mb-5">
                {communityTips.map((tip) => (
                  <div key={tip.id} className="rounded-2xl bg-secondary/40 p-3.5 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-foreground text-xs">{tip.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(tip.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground/90 text-xs leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-5">{t("cd.noTips")}</p>
            )}

            <form onSubmit={handleAddTip} className="flex gap-2">
              <input
                type="text"
                value={tipText}
                onChange={(e) => setTipText(e.target.value)}
                placeholder={t("cd.tipPlaceholder")}
                className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors shadow-sm"
              />
              <button
                type="submit"
                disabled={!tipText.trim()}
                className="rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition shadow-sm shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>
        </div>

        {/* Barra Lateral */}
        <aside className="space-y-6">
          {/* Progresso da comunidade */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <span>{t("cd.communityProgress")}</span>
            </h3>

            {participantsProgress.length > 0 ? (
              <ul className="space-y-3.5">
                {participantsProgress.map((p) => (
                  <li key={p.userId} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full avatar-shape bg-primary-soft text-[11px] font-bold text-primary">
                      {initials(p.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {p.userId === currentUserId ? t("cd.you") : p.name}
                        </span>
                        {p.isDone ? (
                          <Award className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {p.pct}%
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${p.isDone ? "bg-primary" : "bg-accent"}`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">{t("cd.nobody")}</p>
            )}
          </div>

          {/* Recompensas */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span>{t("cd.reward")}</span>
            </h3>
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 mb-4 ${
                isCompleted ? "border-accent/40 bg-accent-soft/40" : "border-border bg-secondary/30"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <EmojiIcon emoji={isCompleted ? challenge.badgeIcon : "🔒"} className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{challenge.badgeLabel}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isCompleted ? t("cd.earned") : t("cd.completeAll")}
                </p>
              </div>
            </div>

            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              {t("cd.generalBadges")}
            </h4>
            <div className="space-y-2">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.label}
                  className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs ${
                    badge.achieved ? "bg-primary-soft/50" : "bg-secondary/30 opacity-60"
                  }`}
                >
                  <EmojiIcon
                    emoji={badge.achieved ? badge.icon : "🔒"}
                    className="h-4 w-4 text-accent"
                  />
                  <span className="font-semibold text-foreground">{td(badge.label)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
