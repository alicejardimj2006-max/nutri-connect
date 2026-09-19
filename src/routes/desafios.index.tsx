import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Flame, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { ChallengeCard } from "@/components/community-cards";
import {
  TrailHeader,
  LearningTrailMap,
  CommunityChallengeGroup,
  PopularBadge,
} from "@/components/trail-components";
import { LessonModal } from "@/components/lesson-modal";
import {
  getEarnedBadges,
  getUserXP,
  getUserLevel,
  getUserStreak,
} from "@/lib/community";
import {
  NUTRITION_UNITS as UNITS,
  loadTrailProgress,
  completeLesson,
  TRAIL_CHANGE_EVENT,
  type Lesson,
  type TrailProgress,
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

  // ── Trail progress (separate localStorage) ──
  const [trailProgress, setTrailProgress] = useState<TrailProgress>({
    completedLessons: [],
    lessonScores: {},
    totalXP: 0,
  });

  useEffect(() => {
    const sync = () => setTrailProgress(loadTrailProgress());
    sync();
    window.addEventListener(TRAIL_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TRAIL_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // ── Lesson modal state ──
  const [activeLesson, setActiveLesson] = useState<{
    lesson: Lesson;
    unitTitle: string;
  } | null>(null);

  const currentUserId = user?.id || "guest";

  // ── Combined XP (trail lessons + challenges) ──
  const challengeXP = useMemo(
    () => getUserXP(currentUserId, challenges),
    [currentUserId, challenges],
  );
  const totalXP = trailProgress.totalXP + challengeXP;
  const levelInfo = useMemo(() => getUserLevel(totalXP), [totalXP]);
  const streak = useMemo(
    () => getUserStreak(currentUserId, challenges),
    [currentUserId, challenges],
  );
  const earnedBadges = useMemo(
    () => getEarnedBadges(currentUserId, challenges),
    [currentUserId, challenges],
  );

  const totalLessons = useMemo(
    () => UNITS.reduce((sum, u) => sum + u.lessons.length, 0),
    [],
  );

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

  // ── Lesson handlers ──
  const handleStartLesson = useCallback((lesson: Lesson, unitTitle: string) => {
    setActiveLesson({ lesson, unitTitle });
  }, []);

  const handleCompleteLesson = useCallback(
    (lessonId: string, correctCount: number, totalQuestions: number) => {
      const lesson = UNITS.flatMap((u) => u.lessons).find((l) => l.id === lessonId);
      if (lesson) {
        completeLesson(lessonId, correctCount, totalQuestions, lesson.xpReward);
      }
      setActiveLesson(null);
    },
    [],
  );

  const handleCloseLesson = useCallback(() => {
    setActiveLesson(null);
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        {/* Cabeçalho */}
        <div className="border-b border-border/70 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Aprendizado & Desafios</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
            Desafios & Aprendizado
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Aprenda sobre nutrição no seu ritmo com lições interativas, participe de
            desafios práticos e cresça junto com a comunidade.
          </p>
        </div>

        {/* Barra de XP, Nível e Streak */}
        <TrailHeader
          xp={totalXP}
          level={levelInfo.level}
          label={levelInfo.label}
          xpInLevel={levelInfo.xpInLevel}
          xpForNext={levelInfo.xpForNext}
          streak={streak}
          completedLessons={trailProgress.completedLessons.length}
          totalLessons={totalLessons}
        />

        {/* Conquistas compactas */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span>Suas Conquistas</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-medium">
              {trailProgress.completedLessons.length} lições ·{" "}
              {challenges.filter((c) => c.completedBy.includes(currentUserId)).length} desafios concluídos
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
          <div className="py-12 text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : (
          <>
            {/* ── ABA: Minha Trilha (Lições Educativas) ── */}
            {tab === "trilha" && (
              <div>
                {/* Banner educativo (Modo Jogo) */}
                <div className="rounded-[2rem] border-0 bg-gradient-to-br from-indigo-500 to-violet-600 p-6 sm:p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                  {/* Luzes de fundo */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
                  
                  <div className="space-y-2 relative z-10 text-white text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-black font-display drop-shadow-sm">
                      Aprenda Nutrição Brincando!
                    </h2>
                    <p className="text-sm sm:text-base font-medium text-white/90 leading-relaxed max-w-xl drop-shadow-sm">
                      Nossos Nutri-Amigos estão te esperando. Complete lições, ganhe XP, suba de nível e descubra como uma alimentação saudável pode ser divertida e sem neuras.
                    </p>
                  </div>
                  
                  <div className="text-6xl sm:text-7xl flex -space-x-4 relative z-10 drop-shadow-2xl justify-center">
                    <div className="bg-white/20 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center backdrop-blur-md border-2 border-white/30 transform rotate-[-10deg]">👩🏽‍⚕️</div>
                    <div className="bg-white/20 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center backdrop-blur-md border-2 border-white/30 transform rotate-[10deg] translate-y-4 shadow-xl">🥑</div>
                    <div className="bg-white/20 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center backdrop-blur-md border-2 border-white/30 transform rotate-[-5deg] shadow-xl">🍎</div>
                  </div>
                </div>

                {/* Trail map */}
                <LearningTrailMap
                  units={UNITS}
                  completedLessons={trailProgress.completedLessons}
                  onStartLesson={handleStartLesson}
                />
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

      {/* Lesson Modal (fullscreen overlay) */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson.lesson}
          unitTitle={activeLesson.unitTitle}
          onClose={handleCloseLesson}
          onComplete={handleCompleteLesson}
          isCompleted={trailProgress.completedLessons.includes(activeLesson.lesson.id)}
        />
      )}
    </>
  );
}
