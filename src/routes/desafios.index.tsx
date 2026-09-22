import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Flame, Sparkles, Users, Baby, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { ChallengeCard } from "@/components/community-cards";
import {
  TrailHeader,
  TrailHero,
  TrailAchievements,
  CommunityChallengeGroup,
  PopularBadge,
} from "@/components/trail-components";
import { LearningTrailMap, StopSheet } from "@/components/trail-map";
import { LessonModal } from "@/components/lesson-modal";
import { getEarnedBadges, getUserXP, getUserLevel, getUserStreak } from "@/lib/community";
import {
  DAILY_GOAL_XP,
  NUTRITION_UNITS,
  TRAIL_CHANGE_EVENT,
  getActiveStreak,
  getCurrentStopId,
  getDailyXP,
  getTrailTotals,
  loadTrailProgress,
  setTrailScope,
  getUnits,
  type ProfileKind,
  type LevelNumber,
  type Stop,
  type TrailProgress,
  type Unit,
} from "@/lib/learning-trail";

export const Route = createFileRoute("/desafios/")({
  head: () => ({
    meta: [
      { title: "Desafios & Aprendizado — NutriConnect" },
      {
        name: "description",
        content:
          "Trilha de aprendizado sobre nutrição, desafios populares e desafios das suas comunidades.",
      },
    ],
  }),
  component: DesafiosIndexPage,
});

type Tab = "trilha" | "populares" | "comunidades";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "trilha", label: "Minha Trilha", icon: <BookOpen className="h-4 w-4" /> },
  { key: "populares", label: "Desafios Populares", icon: <Flame className="h-4 w-4" /> },
  { key: "comunidades", label: "Das Minhas Comunidades", icon: <Users className="h-4 w-4" /> },
];

function DesafiosIndexPage() {
  const { user } = useAuth();
  const { challenges, communities, hydrated } = useCommunity();
  const [tab, setTab] = useState<Tab>("trilha");
  const [activeProfile, setActiveProfile] = useState<ProfileKind>("adult");

  // ── Progresso da trilha (localStorage próprio) ──
  const [trailProgress, setTrailProgress] = useState<TrailProgress>(() => {
    setTrailScope("guest", "adult");
    return loadTrailProgress();
  });

  const currentUserId = user?.id || "guest";

  const handleProfileChange = (kind: ProfileKind) => {
    setActiveProfile(kind);
    setTrailScope(currentUserId, kind);
    setTrailProgress(loadTrailProgress());
  };

  useEffect(() => {
    const sync = () => setTrailProgress(loadTrailProgress());
    window.addEventListener(TRAIL_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TRAIL_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // ── Parada aberta (escolha de nível) e lição em andamento ──
  const [sheet, setSheet] = useState<{ stop: Stop; unit: Unit } | null>(null);
  const [activeLesson, setActiveLesson] = useState<{
    stop: Stop;
    unit: Unit;
    level: LevelNumber;
    xpBefore: number;
  } | null>(null);

  // ── XP combinado (trilha + desafios) ──
  const challengeXP = useMemo(
    () => getUserXP(currentUserId, challenges),
    [currentUserId, challenges],
  );
  const totalXP = trailProgress.totalXP + challengeXP;
  const levelInfo = useMemo(() => getUserLevel(totalXP), [totalXP]);
  const streak = useMemo(
    () => Math.max(getActiveStreak(trailProgress), getUserStreak(currentUserId, challenges)),
    [trailProgress, currentUserId, challenges],
  );
  const earnedBadges = useMemo(
    () => getEarnedBadges(currentUserId, challenges),
    [currentUserId, challenges],
  );
  const totals = useMemo(() => getTrailTotals(trailProgress, activeProfile), [trailProgress, activeProfile]);
  const currentUnits = useMemo(() => getUnits(activeProfile), [activeProfile]);
  const currentStopId = useMemo(() => getCurrentStopId(trailProgress, currentUnits), [trailProgress, currentUnits]);

  // Populares: desafios com createdByProfessionalId, ordenados por participantes
  const popularChallenges = useMemo(
    () =>
      [...challenges]
        .filter((c) => c.createdByProfessionalId)
        .sort((a, b) => b.participants.length - a.participants.length),
    [challenges],
  );

  // Comunidades do usuário com desafios
  const userCommunityChallenges = useMemo(() => {
    const userCommunities = communities.filter((c) =>
      c.members.some((m) => m.userId === currentUserId),
    );
    return userCommunities
      .map((community) => {
        const commChallenges = challenges.filter((c) => c.communityId === community.id);
        return { community, challenges: commChallenges };
      })
      .filter((g) => g.challenges.length > 0);
  }, [communities, challenges, currentUserId]);

  const startLevel = (stop: Stop, unit: Unit, level: LevelNumber) => {
    setSheet(null);
    setActiveLesson({
      stop,
      unit,
      level,
      // XP atual, lido do armazenamento para valer também ao encadear níveis
      xpBefore: loadTrailProgress().totalXP + challengeXP,
    });
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        {/* Cabeçalho com Seletor de Perfil */}
        <div className="border-b border-border/70 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
              <Award className="h-3.5 w-3.5" />
              <span>Aprendizado & Desafios</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
              Desafios & Aprendizado
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Aprenda sobre nutrição no seu ritmo com lições interativas, participe de desafios
              práticos e cresça junto com a comunidade.
            </p>
          </div>
          
          {/* Seletor de Perfil */}
          <div className="flex bg-secondary p-1 rounded-xl shadow-inner shrink-0">
            <button
              onClick={() => handleProfileChange("adult")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeProfile === "adult"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              Perfil Adulto
            </button>
            <button
              onClick={() => handleProfileChange("kid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeProfile === "kid"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Baby className="w-4 h-4" />
              Perfil Infantil
            </button>
          </div>
        </div>

        {/* Barra de XP, nível, ofensiva e meta do dia */}
        <TrailHeader
          variant={activeProfile}
          name={user?.name || (activeProfile === "adult" ? "Visitante" : "Pequeno Explorador")}
          xp={totalXP}
          level={levelInfo.level}
          label={levelInfo.label}
          xpInLevel={levelInfo.xpInLevel}
          xpForNext={levelInfo.xpForNext}
          streak={streak}
          dailyXP={getDailyXP(trailProgress)}
          dailyGoal={DAILY_GOAL_XP}
          stars={totals.stars}
          maxStars={totals.maxStars}
          goldStops={totals.gold}
          totalStops={totals.totalStops}
          levelsDone={totals.levels}
          totalLevels={totals.totalLevels}
        />

        {/* Conquistas compactas */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span>Suas Conquistas</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-medium">
              {totals.levels} níveis ·{" "}
              {challenges.filter((c) => c.completedBy.includes(currentUserId)).length} desafios
              concluídos
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.label}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                  badge.achieved
                    ? "border-accent/40 bg-accent-soft/40"
                    : "border-border bg-secondary/30 opacity-60"
                }`}
              >
                <span className="text-lg">{badge.achieved ? badge.icon : "🔒"}</span>
                <span className="text-[11px] font-bold text-foreground">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="flex items-center gap-1 rounded-2xl bg-secondary p-1 mb-8 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs font-semibold transition whitespace-nowrap ${
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.key === "populares" && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                  {popularChallenges.length}
                </span>
              )}
              {t.key === "comunidades" && userCommunityChallenges.length > 0 && (
                <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                  {userCommunityChallenges.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba ativa */}
        {!hydrated ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <>
            {/* ── ABA: Minha Trilha (Lições Educativas) ── */}
            {tab === "trilha" && (
              <div>
                <TrailHero variant={activeProfile} name={user?.name || (activeProfile === "adult" ? "Visitante" : "Pequeno Explorador")} />

                <LearningTrailMap
                  units={currentUnits}
                  progress={trailProgress}
                  currentStopId={currentStopId}
                  frozen={!!activeLesson}
                  onOpenStop={(stop, unit) => setSheet({ stop, unit })}
                />

                <div className="mt-10">
                  <TrailAchievements unlocked={trailProgress.achievements} />
                </div>
              </div>
            )}

            {/* ── ABA: Desafios Populares ── */}
            {tab === "populares" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                      <Flame className="h-5 w-5 text-amber-500" />
                      Desafios Populares
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Publicados por profissionais verificados · Ordenados por participação
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {popularChallenges.length} desafios
                  </span>
                </div>

                {popularChallenges.length === 0 ? (
                  <div className="py-16 text-center rounded-3xl border bg-card p-8">
                    <p className="text-sm text-muted-foreground">
                      Nenhum desafio popular publicado ainda por profissionais.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {popularChallenges.map((c) => (
                      <div key={c.id} className="relative">
                        {c.participants.length >= 10 && (
                          <div className="absolute top-3 right-3 z-10">
                            <PopularBadge />
                          </div>
                        )}
                        <ChallengeCard challenge={c} />
                        {c.createdByProfessionalName && (
                          <div className="mt-2 px-2 text-[10px] text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-accent" />
                            Criado por{" "}
                            <span className="font-semibold text-foreground">
                              {c.createdByProfessionalName}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ABA: Das Minhas Comunidades ── */}
            {tab === "comunidades" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      Desafios das Minhas Comunidades
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Desafios das comunidades que você participa
                    </p>
                  </div>
                </div>

                {userCommunityChallenges.length === 0 ? (
                  <div className="py-16 text-center rounded-3xl border bg-card p-8">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Você ainda não participa de nenhuma comunidade com desafios ativos.
                    </p>
                    <Link
                      to="/comunidades"
                      className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition"
                    >
                      Explorar Comunidades
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userCommunityChallenges.map(({ community, challenges: commChallenges }) => (
                      <CommunityChallengeGroup
                        key={community.id}
                        community={community}
                        challenges={commChallenges}
                        userId={currentUserId}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <StopSheet
        stop={sheet?.stop ?? null}
        unit={sheet?.unit ?? null}
        progress={trailProgress}
        onClose={() => setSheet(null)}
        onStart={(stop, level) => sheet && startLevel(stop, sheet.unit, level)}
      />

      {activeLesson && (
        <LessonModal
          key={`${activeLesson.stop.id}-${activeLesson.level}`}
          stop={activeLesson.stop}
          level={activeLesson.level}
          unit={activeLesson.unit}
          xpBefore={activeLesson.xpBefore}
          onClose={() => setActiveLesson(null)}
          onNextLevel={(level) => startLevel(activeLesson.stop, activeLesson.unit, level)}
        />
      )}
    </>
  );
}
