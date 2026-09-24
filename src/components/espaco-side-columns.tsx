import { td } from "@/lib/i18n/data";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ChefHat,
  Compass,
  Flame,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Mascot } from "@/components/mascots";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import { getUserLevel, getUserStreak, getUserXP, initials } from "@/lib/community";
import { getProfessionalInfo } from "@/lib/community-admin";
import {
  TRAIL_CHANGE_EVENT,
  getActiveStreak,
  getCurrentStopId,
  getTrailSummary,
  getTrails,
  loadTrailProgress,
  setTrailScope,
  type TrailProgress,
} from "@/lib/learning-trail";
import { LEVEL_LABEL_KEYS } from "@/lib/i18n/content";
import { ADULT_PROFILE_ID } from "@/lib/trail-profiles";

function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border/80 bg-card p-5 shadow-xs ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function useAdultTrailProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<TrailProgress | null>(null);
  useEffect(() => {
    if (!userId) return;
    const load = () => {
      setTrailScope(userId, ADULT_PROFILE_ID);
      setProgress(loadTrailProgress());
    };
    load();
    window.addEventListener(TRAIL_CHANGE_EVENT, load);
    return () => window.removeEventListener(TRAIL_CHANGE_EVENT, load);
  }, [userId]);
  return progress;
}

/** Coluna esquerda: quem sou eu na rede, minhas comunidades e atalhos. */
export function EspacoLeftColumn() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { communities, challenges } = useCommunity();
  const trailProgress = useAdultTrailProgress(user?.id);

  const myCommunities = useMemo(
    () => (user ? communities.filter((c) => c.members.some((m) => m.userId === user.id)) : []),
    [communities, user],
  );

  if (!user) return null;

  const xp = getUserXP(user.id, challenges) + (trailProgress?.totalXP ?? 0);
  const lvl = getUserLevel(xp);
  const streak = Math.max(
    getUserStreak(user.id, challenges),
    trailProgress ? getActiveStreak(trailProgress) : 0,
  );
  const pct = Math.min(100, Math.round((lvl.xpInLevel / lvl.xpForNext) * 100));

  const shortcuts: { to: string; icon: ReactNode; label: DictKey }[] = [
    { to: "/receitas", icon: <ChefHat className="h-4 w-4" />, label: "hub.shortcut.recipes" },
    { to: "/explorar", icon: <Compass className="h-4 w-4" />, label: "hub.shortcut.explore" },
    { to: "/tema-da-semana", icon: <Sparkles className="h-4 w-4" />, label: "hub.shortcut.weekly" },
    { to: "/desafios", icon: <Award className="h-4 w-4" />, label: "hub.shortcut.challenges" },
  ];

  return (
    <aside className="space-y-5 text-left">
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="h-16 bg-gradient-to-br from-primary to-accent/80" />
        <div className="-mt-8 px-5 pb-5">
          <Link
            to="/perfil/$userId"
            params={{ userId: user.id }}
            className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-card bg-primary text-xl font-extrabold text-primary-foreground shadow-card"
          >
            {initials(user.name)}
          </Link>
          <p className="mt-2 truncate text-base font-bold font-display text-foreground">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("hub.level").replace("{n}", String(lvl.level))} ·{" "}
            {t(LEVEL_LABEL_KEYS[lvl.label] ?? "hub.level.1")}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {lvl.xpInLevel}/{lvl.xpForNext} XP
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-accent">
              <Flame className="h-3.5 w-3.5" /> {streak} {t("hub.streakDays")}
            </span>
          </div>
        </div>
      </section>

      <Panel
        title={t("hub.myCommunities")}
        action={
          <Link
            to="/comunidades"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            {t("profile.seeAll")}
          </Link>
        }
      >
        {myCommunities.length > 0 ? (
          <ul className="space-y-1">
            {myCommunities.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to="/comunidades/$slug"
                  params={{ slug: c.slug }}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Users className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {c.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {c.members.length} {t("comunidades.members")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-2 text-center">
            <p className="text-xs text-muted-foreground">{t("hub.noCommunities")}</p>
            <Link
              to="/comunidades"
              className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
            >
              {t("hub.exploreCommunities")}
            </Link>
          </div>
        )}
      </Panel>

      <Panel title={t("hub.shortcuts")}>
        <ul className="grid grid-cols-2 gap-2">
          {shortcuts.map((s) => (
            <li key={s.to}>
              <Link
                to={s.to}
                className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
              >
                <span className="text-accent">{s.icon}</span>
                {t(s.label)}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </aside>
  );
}

/** Coluna direita: trilha com a Nina, tema da semana, desafios e sugestões. */
export function EspacoRightColumn() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const { communities, challenges, weeklyTheme, profiles, hydrated } = useCommunity();
  const trailProgress = useAdultTrailProgress(user?.id);

  const trail = useMemo(() => {
    const trails = getTrails("adult", locale);
    if (!trailProgress) return { trail: trails[0], stopTitle: null as string | null, pct: 0 };
    for (const tr of trails) {
      const id = getCurrentStopId(trailProgress, tr.units);
      if (id) {
        const stop = tr.units.flatMap((u) => u.stops).find((s) => s.id === id);
        const started = getTrailSummary(trailProgress, tr).levels > 0;
        return {
          trail: tr,
          stopTitle: stop?.title ?? null,
          pct: getTrailSummary(trailProgress, tr).pct,
          started,
        };
      }
    }
    return { trail: trails[0], stopTitle: null, pct: 100, started: true };
  }, [trailProgress, locale]);

  const myChallenges = useMemo(
    () =>
      user
        ? challenges.filter(
            (c) => c.participants.includes(user.id) && !c.completedBy.includes(user.id),
          )
        : [],
    [challenges, user],
  );

  const suggested = useMemo(
    () => (user ? communities.filter((c) => !c.members.some((m) => m.userId === user.id)) : []),
    [communities, user],
  );

  const professionals = useMemo(
    () => profiles.filter((p) => p.role === "profissional" && p.userId !== user?.id).slice(0, 3),
    [profiles, user],
  );

  if (!user) return null;

  const started = "started" in trail ? trail.started : false;

  return (
    <aside className="space-y-5 text-left">
      {/* Nina chamando para a trilha */}
      <section className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-soft via-card to-primary-soft p-5 shadow-card">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
        <div className="flex items-end gap-3">
          <Mascot id="nina" size={92} mood="talk" />
          <div className="relative min-w-0 flex-1 rounded-2xl rounded-bl-sm border border-border/70 bg-card/95 p-3 shadow-xs">
            <p className="text-sm font-bold leading-snug text-foreground">
              {started ? t("hub.trail.ninaContinue") : t("hub.trail.ninaStart")}
            </p>
          </div>
        </div>
        {trail.trail && (
          <div className="mt-7">
            <p className="truncate text-xs font-bold uppercase tracking-wider text-accent">
              {trail.trail.title}
            </p>
            {trail.stopTitle && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t("hub.trail.next")} {trail.stopTitle}
              </p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card/80">
              <div className="h-full rounded-full bg-accent" style={{ width: `${trail.pct}%` }} />
            </div>
          </div>
        )}
        <Link
          to="/desafios"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90"
        >
          {started ? t("hub.trail.cta.continue") : t("hub.trail.cta.start")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Tema da semana */}
      {hydrated && weeklyTheme && (
        <Panel title={weeklyTheme.badge || t("weekly.badge")}>
          <p className="text-base font-bold font-display leading-snug text-foreground">
            {weeklyTheme.title}
          </p>
          {weeklyTheme.questionOfTheWeek && (
            <p className="mt-2 rounded-xl bg-secondary/50 p-3 text-xs italic text-foreground/85">
              “{weeklyTheme.questionOfTheWeek}”
            </p>
          )}
          <Link
            to="/tema-da-semana"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
          >
            {t("hub.weekly.cta")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>
      )}

      {/* Desafios em andamento */}
      <Panel
        title={t("profile.activeChallenges")}
        action={
          <Link to="/desafios" className="text-[11px] font-semibold text-primary hover:underline">
            {t("profile.seeAll")}
          </Link>
        }
      >
        {myChallenges.length > 0 ? (
          <ul className="space-y-2">
            {myChallenges.slice(0, 3).map((c) => {
              const done = (c.progress?.[user.id] || []).length;
              const total = c.steps.length;
              return (
                <li key={c.id}>
                  <Link
                    to="/desafios/$challengeId"
                    params={{ challengeId: c.id }}
                    className="block rounded-xl bg-secondary/50 p-3 transition hover:bg-secondary"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <span>{c.badgeIcon}</span>
                      <span className="truncate">{c.title}</span>
                    </span>
                    {total > 0 && (
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-card">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${Math.round((done / total) * 100)}%` }}
                        />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Link
            to="/desafios"
            className="block py-2 text-center text-xs font-semibold text-accent hover:underline"
          >
            {t("profile.pickChallenge")}
          </Link>
        )}
      </Panel>

      {/* Comunidades para conhecer */}
      {suggested.length > 0 && (
        <Panel title={t("hub.suggested")}>
          <ul className="space-y-1">
            {suggested.slice(0, 3).map((c) => (
              <li key={c.id}>
                <Link
                  to="/comunidades/$slug"
                  params={{ slug: c.slug }}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {c.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {td(c.category)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* Profissionais verificados */}
      {professionals.length > 0 && (
        <Panel title={t("hub.professionals")}>
          <ul className="space-y-1">
            {professionals.map((p) => {
              const info = getProfessionalInfo(profiles, p.userId);
              return (
                <li key={p.userId}>
                  <Link
                    to="/perfil/$userId"
                    params={{ userId: p.userId }}
                    className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {initials(p.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <span className="truncate">{p.name}</span>
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
                      </span>
                      {info && (
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {td(info.profession)}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </aside>
  );
}
