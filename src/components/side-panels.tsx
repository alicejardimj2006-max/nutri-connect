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
  Heart,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Mascot } from "@/components/mascots";
import { Panel } from "@/components/page-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useFeed } from "@/lib/social/feed-queries";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import { getEarnedBadges, getUserLevel, getUserStreak, getUserXP, initials } from "@/lib/community";
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
import { useFriends } from "@/lib/social/queries";

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

/** Linha de lista dos painéis: ícone/avatar à esquerda, título e legenda. */
function Row({ icon, title, caption }: { icon: ReactNode; title: ReactNode; caption?: ReactNode }) {
  return (
    <>
      {icon}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
        {caption && (
          <span className="block truncate text-[11px] text-muted-foreground">{caption}</span>
        )}
      </span>
    </>
  );
}

const ROW_LINK = "flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary";

/** Cartão de perfil: foto, nível, barra de XP e ofensiva. */
export function ProfileSummaryCard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { challenges } = useCommunity();
  const trailProgress = useAdultTrailProgress(user?.id);

  if (!user) return null;

  const xp = getUserXP(user.id, challenges) + (trailProgress?.totalXP ?? 0);
  const lvl = getUserLevel(xp);
  const streak = Math.max(
    getUserStreak(user.id, challenges),
    trailProgress ? getActiveStreak(trailProgress) : 0,
  );
  const pct = Math.min(100, Math.round((lvl.xpInLevel / lvl.xpForNext) * 100));

  return (
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
  );
}

/** Comunidades de que a pessoa participa (a logada, ou `userId` quando for outra). */
export function MyCommunitiesPanel({ userId, title }: { userId?: string; title?: string }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { communities } = useCommunity();
  const id = userId ?? user?.id;

  const mine = useMemo(
    () =>
      id
        ? communities.filter(
            (c) =>
              c.members.some((m) => m.userId === id) &&
              (c.status !== "pendente" || c.adminUserId === user?.id),
          )
        : [],
    [communities, id, user?.id],
  );
  const self = !userId || userId === user?.id;

  return (
    <Panel
      title={title ?? t("hub.myCommunities")}
      action={
        <Link to="/comunidades" className="text-[11px] font-semibold text-primary hover:underline">
          {t("profile.seeAll")}
        </Link>
      }
    >
      {mine.length > 0 ? (
        <ul className="space-y-1">
          {mine.slice(0, 5).map((c) => (
            <li key={c.id}>
              <Link to="/comunidades/$slug" params={{ slug: c.slug }} className={ROW_LINK}>
                <Row
                  icon={
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Users className="h-4 w-4" />
                    </span>
                  }
                  title={c.name}
                  caption={`${c.members.length} ${t("comunidades.members")}`}
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-2 text-center">
          <p className="text-xs text-muted-foreground">
            {self ? t("hub.noCommunities") : t("panel.noneYet")}
          </p>
          {self && (
            <Link
              to="/comunidades"
              className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
            >
              {t("hub.exploreCommunities")}
            </Link>
          )}
        </div>
      )}
    </Panel>
  );
}

export function ShortcutsPanel() {
  const { t } = useI18n();
  const shortcuts: { to: string; icon: ReactNode; label: DictKey }[] = [
    { to: "/receitas", icon: <ChefHat className="h-4 w-4" />, label: "hub.shortcut.recipes" },
    { to: "/explorar", icon: <Compass className="h-4 w-4" />, label: "hub.shortcut.explore" },
    { to: "/tema-da-semana", icon: <Sparkles className="h-4 w-4" />, label: "hub.shortcut.weekly" },
    { to: "/desafios", icon: <Award className="h-4 w-4" />, label: "hub.shortcut.challenges" },
  ];
  return (
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
  );
}

/** Nina chamando para a trilha de aprendizado. */
export function TrailCard() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const trailProgress = useAdultTrailProgress(user?.id);

  const trail = useMemo(() => {
    const trails = getTrails("adult", locale);
    if (!trailProgress) return { trail: trails[0], stopTitle: null as string | null, pct: 0 };
    for (const tr of trails) {
      const id = getCurrentStopId(trailProgress, tr.units);
      if (id) {
        const stop = tr.units.flatMap((u) => u.stops).find((s) => s.id === id);
        const summary = getTrailSummary(trailProgress, tr);
        return {
          trail: tr,
          stopTitle: stop?.title ?? null,
          pct: summary.pct,
          started: summary.levels > 0,
        };
      }
    }
    return { trail: trails[0], stopTitle: null, pct: 100, started: true };
  }, [trailProgress, locale]);

  if (!user) return null;
  const started = "started" in trail ? trail.started : false;

  return (
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
  );
}

export function WeeklyThemePanel() {
  const { t } = useI18n();
  const { weeklyTheme, hydrated } = useCommunity();
  if (!hydrated || !weeklyTheme) return null;
  return (
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
  );
}

/** Desafios em que a pessoa está participando e ainda não concluiu. */
export function ChallengesPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { challenges } = useCommunity();

  const mine = useMemo(
    () =>
      user
        ? challenges.filter(
            (c) => c.participants.includes(user.id) && !c.completedBy.includes(user.id),
          )
        : [],
    [challenges, user],
  );

  if (!user) return null;

  return (
    <Panel
      title={t("profile.activeChallenges")}
      action={
        <Link to="/desafios" className="text-[11px] font-semibold text-primary hover:underline">
          {t("profile.seeAll")}
        </Link>
      }
    >
      {mine.length > 0 ? (
        <ul className="space-y-2">
          {mine.slice(0, 3).map((c) => {
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
  );
}

/** Desafios criados por profissionais, dos mais aos menos disputados. */
export function PopularChallengesPanel() {
  const { t } = useI18n();
  const { challenges } = useCommunity();
  const popular = useMemo(
    () =>
      [...challenges]
        .filter((c) => c.createdByProfessionalId)
        .sort((a, b) => b.participants.length - a.participants.length)
        .slice(0, 3),
    [challenges],
  );
  if (popular.length === 0) return null;
  return (
    <Panel title={t("dz.popularTitle")}>
      <ul className="space-y-1">
        {popular.map((c) => (
          <li key={c.id}>
            <Link to="/desafios/$challengeId" params={{ challengeId: c.id }} className={ROW_LINK}>
              <Row
                icon={
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-lg">
                    {c.badgeIcon}
                  </span>
                }
                title={c.title}
                caption={`${c.participants.length} ${t("panel.participants")}`}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Conquistas (distintivos de desafios concluídos). */
export function BadgesPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { challenges } = useCommunity();
  if (!user) return null;
  const badges = getEarnedBadges(user.id, challenges);
  return (
    <Panel title={t("dz.achievements")}>
      <ul className="grid grid-cols-2 gap-2">
        {badges.map((badge) => (
          <li
            key={badge.label}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${
              badge.achieved
                ? "border-accent/40 bg-accent-soft/40"
                : "border-border bg-secondary/30 opacity-60"
            }`}
          >
            <span className="text-lg">{badge.achieved ? badge.icon : "🔒"}</span>
            <span className="text-[11px] font-bold leading-tight text-foreground">
              {td(badge.label)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Comunidades que a pessoa ainda não participa. */
export function SuggestedCommunitiesPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { communities } = useCommunity();
  const suggested = useMemo(
    () =>
      user
        ? communities.filter(
            (c) => c.status === "ativa" && !c.members.some((m) => m.userId === user.id),
          )
        : [],
    [communities, user],
  );
  if (suggested.length === 0) return null;
  return (
    <Panel title={t("hub.suggested")}>
      <ul className="space-y-1">
        {suggested.slice(0, 3).map((c) => (
          <li key={c.id}>
            <Link to="/comunidades/$slug" params={{ slug: c.slug }} className={ROW_LINK}>
              <Row
                icon={
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                }
                title={c.name}
                caption={td(c.category)}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Comunidades com mais gente e mais conversa. */
export function TopCommunitiesPanel() {
  const { t } = useI18n();
  const { communities, posts } = useCommunity();
  const top = useMemo(
    () =>
      communities
        .filter((c) => c.status === "ativa")
        .map((c) => ({
          c,
          score: c.members.length + posts.filter((p) => p.communityId === c.id).length,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(({ c }) => c),
    [communities, posts],
  );
  if (top.length === 0) return null;
  return (
    <Panel title={t("panel.topCommunities")}>
      <ul className="space-y-1">
        {top.map((c) => (
          <li key={c.id}>
            <Link to="/comunidades/$slug" params={{ slug: c.slug }} className={ROW_LINK}>
              <Row
                icon={
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Flame className="h-4 w-4" />
                  </span>
                }
                title={c.name}
                caption={`${c.members.length} ${t("comunidades.members")}`}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Receitas que mais gente preparou. */
export function TopRecipesPanel() {
  const { t } = useI18n();
  const { user } = useAuth();
  const feed = useFeed({ scope: "todos", type: "receita", limit: 30 }, !!user);
  const posts = feed.data;
  const top = useMemo(
    () =>
      [...(posts ?? [])]
        .sort((a, b) => (b.preparedBy?.length ?? 0) - (a.preparedBy?.length ?? 0))
        .slice(0, 4),
    [posts],
  );
  if (top.length === 0) return null;
  return (
    <Panel
      title={t("panel.topRecipes")}
      action={
        <Link to="/receitas" className="text-[11px] font-semibold text-primary hover:underline">
          {t("profile.seeAll")}
        </Link>
      }
    >
      <ul className="space-y-1">
        {top.map((r) => {
          const n = r.preparedBy?.length ?? 0;
          return (
            <li key={r.id}>
              <Link to="/receitas/$id" params={{ id: r.id }} className={ROW_LINK}>
                <Row
                  icon={
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                      <ChefHat className="h-4 w-4" />
                    </span>
                  }
                  title={r.title || t("recipes.fallbackTitle")}
                  caption={`${n} ${n === 1 ? t("recipes.prepOne") : t("recipes.prepMany")}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/** Receitas que a própria pessoa já marcou como preparadas. */
export function MyPreparedRecipesPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const feed = useFeed({ scope: "preparados", author: user?.id, limit: 5 }, !!user);
  if (!user) return null;
  const mine = feed.data ?? [];
  return (
    <Panel title={t("panel.myPrepared")}>
      {mine.length > 0 ? (
        <ul className="space-y-1">
          {mine.slice(0, 5).map((r) => (
            <li key={r.id}>
              <Link to="/receitas/$id" params={{ id: r.id }} className={ROW_LINK}>
                <Row
                  icon={
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <ChefHat className="h-4 w-4" />
                    </span>
                  }
                  title={r.title || t("recipes.fallbackTitle")}
                  caption={td(r.recipeData?.category)}
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 text-center text-xs text-muted-foreground">
          {t("panel.myPreparedEmpty")}
        </p>
      )}
    </Panel>
  );
}

/** Relatos que mais receberam apoio. */
export function TopExperiencesPanel() {
  const { t } = useI18n();
  const { user } = useAuth();
  const feed = useFeed({ scope: "todos", type: "experiencia", limit: 30 }, !!user);
  const posts = feed.data;
  const top = useMemo(
    () =>
      [...(posts ?? [])]
        .sort((a, b) => (b.supports?.length ?? 0) - (a.supports?.length ?? 0))
        .slice(0, 4),
    [posts],
  );
  if (top.length === 0) return null;
  return (
    <Panel title={t("panel.topExperiences")}>
      <ul className="space-y-1">
        {top.map((p) => (
          <li key={p.id}>
            <Link to="/perfil/$userId" params={{ userId: p.authorId }} className={ROW_LINK}>
              <Row
                icon={
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Heart className="h-4 w-4" />
                  </span>
                }
                title={p.title || p.text}
                caption={`${p.authorName} · ${p.supports?.length ?? 0} ${t("panel.supports")}`}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Amigos de verdade (amizade aceita no banco). */
export function FriendsPanel() {
  const { t } = useI18n();
  const friends = useFriends();
  const list = friends.data ?? [];
  return (
    <Panel
      title={t("panel.friends")}
      action={
        <Link to="/explorar" className="text-[11px] font-semibold text-primary hover:underline">
          {t("panel.findPeople")}
        </Link>
      }
    >
      {list.length > 0 ? (
        <ul className="space-y-1">
          {list.slice(0, 6).map((f) => (
            <li key={f.id}>
              <Link to="/perfil/$userId" params={{ userId: f.id }} className={ROW_LINK}>
                <Row
                  icon={
                    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {f.avatarUrl ? (
                        <img src={f.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials(f.name)
                      )}
                    </span>
                  }
                  title={f.name}
                  caption={`@${f.username}`}
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 text-center text-xs text-muted-foreground">
          {friends.isLoading ? t("common.loading") : t("panel.friendsEmpty")}
        </p>
      )}
    </Panel>
  );
}

/** Profissionais verificados da rede. */
export function ProfessionalsPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { profiles } = useCommunity();
  const professionals = useMemo(
    () => profiles.filter((p) => p.role === "profissional" && p.userId !== user?.id).slice(0, 3),
    [profiles, user],
  );
  if (professionals.length === 0) return null;
  return (
    <Panel
      title={t("hub.professionals")}
      action={
        <Link
          to="/profissionais"
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          {t("profile.seeAll")}
        </Link>
      }
    >
      <ul className="space-y-1">
        {professionals.map((p) => {
          const info = getProfessionalInfo(profiles, p.userId);
          return (
            <li key={p.userId}>
              <Link to="/perfil/$userId" params={{ userId: p.userId }} className={ROW_LINK}>
                <Row
                  icon={
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {initials(p.name)}
                    </span>
                  }
                  title={
                    <span className="flex items-center gap-1">
                      <span className="truncate">{p.name}</span>
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
                    </span>
                  }
                  caption={info ? td(info.profession) : undefined}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
