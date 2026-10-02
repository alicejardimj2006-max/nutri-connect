import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  ChefHat,
  Award,
  Plus,
  CheckCircle2,
  Sparkles,
  Compass,
  MoreVertical,
  Settings,
  LogOut,
  BadgeCheck,
  Inbox,
  ShieldCheck,
  Pencil,
  UserX,
  UserCheck,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useI18n } from "@/hooks/use-i18n";
import { initials } from "@/lib/community";
import {
  getAdministeredCommunity,
  getProfessionalInfo,
  getProfessionalInvites,
  isPlatformAdmin,
} from "@/lib/community-admin";
import { VerifiedBadge } from "@/components/person-chip";
import { fetchContactInfo, signOut } from "@/lib/auth";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";
import { RelationshipActions } from "@/components/relationship-actions";
import { useFeed, useFeedRealtime } from "@/lib/social/feed-queries";
import { useBlocked, useBlockUser, usePublicProfile, useUnblockUser } from "@/lib/social/queries";
import type { PublicProfile as RemoteProfile } from "@/lib/social/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CARD_GRID, PAGE_CONTAINER, STICKY_COLUMN } from "@/components/page-layout";
import { BadgesPanel, FriendsPanel, MyCommunitiesPanel } from "@/components/side-panels";

export const Route = createFileRoute("/perfil/$userId")({
  head: () => ({
    meta: [
      { title: "Perfil — NutriConnect" },
      {
        name: "description",
        content: "Perfil com biografia, jornada e publicações na comunidade.",
      },
      { property: "og:title", content: "Perfil — NutriConnect" },
      {
        property: "og:description",
        content: "Conheça membros das comunidades NutriConnect.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { userId } = useParams({ from: "/perfil/$userId" });
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t } = useI18n();
  const state = useCommunity();
  const { profiles, communities, challenges, hydrated } = state;
  const navigate = useNavigate();
  // Perfil, privacidade e bloqueio vêm do banco (valem em qualquer aparelho e para todas as pessoas).
  const remoteProfile = usePublicProfile(user ? userId : undefined);
  const blockedQuery = useBlocked();
  // Publicações da pessoa e receitas que ela preparou: do banco, e só se este perfil pode ser visto
  // (perfil privado de quem não é amigo não carrega nada).
  const canSeeContent = !!user && remoteProfile.data?.can_view_content !== false;
  const postsQuery = useFeed({ scope: "autor", author: userId, limit: 50 }, canSeeContent);
  const preparedQuery = useFeed({ scope: "preparados", author: userId, limit: 50 }, canSeeContent);
  useFeedRealtime(user?.id);
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  if (!authHydrated || !user) return <AuthGateLoading />;

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("settings.signout.success"));
    navigate({ to: "/login" });
  };

  const isSelf = user?.id === userId;

  const iBlockedThem = !isSelf && (blockedQuery.data ?? []).some((b) => b.id === userId);
  // get_public_profile devolve nada quando há bloqueio entre as duas pessoas (em qualquer sentido).
  const theyBlockedMe = !isSelf && remoteProfile.isFetched && remoteProfile.data === null;
  const unavailable = !isSelf && (iBlockedThem || theyBlockedMe);
  // Perfil privado de quem não é amigo: nome e foto aparecem, mas jornada e publicações não.
  const contentLocked =
    !isSelf && !!remoteProfile.data && remoteProfile.data.can_view_content === false;

  const handleBlock = () => {
    if (!user || !profile) return;
    blockMutation.mutate(userId, {
      onSuccess: () => toast.success(t("profile.blockedToast").replace("{name}", profile.name)),
    });
  };
  const handleUnblock = () => {
    if (!user || !profile) return;
    unblockMutation.mutate(userId, {
      onSuccess: () => toast.success(t("profile.unblockedToast").replace("{name}", profile.name)),
    });
  };

  // Registro local só para dados de profissional (vêm da tabela professionals, via profile-sync).
  const stored = profiles.find((p) => p.userId === userId);
  const remote = remoteProfile.data ?? null;

  const profile =
    isSelf && user
      ? { userId, name: user.name, bio: user.bio || t("profile.noBio") }
      : remote
        ? { userId, name: remote.name, bio: remote.bio ?? "" }
        : null;
  const username = remote?.username;
  const avatarUrl = isSelf ? user?.avatarUrl : (remote?.avatar_url ?? undefined);

  const myPosts = postsQuery.data ?? [];
  const preparedRecipes = (preparedQuery.data ?? []).filter((p) => p.type === "receita");
  const myChallenges = challenges.filter((c) => c.participants.includes(userId));
  // Comunidade que a pessoa administra (uma por vez); pendentes só aparecem para ela mesma.
  const administered = getAdministeredCommunity(userId, communities);
  const administeredCommunities =
    administered && (administered.status !== "pendente" || isSelf) ? [administered] : [];
  const isProfessional = stored?.role === "profissional" || remote?.role === "profissional";
  const professionalInfo = getProfessionalInfo(profiles, userId);
  const inviteCount =
    isSelf && isProfessional && user ? getProfessionalInvites(user.id, state).length : 0;

  const userGoals =
    isSelf && user
      ? [
          td(user.journeyGoal || user.goal) || t("profile.goal1"),
          t("profile.goal2"),
          t("profile.goal3"),
        ]
      : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className={`${PAGE_CONTAINER} flex-1 py-8`}>
        {!hydrated || (!isSelf && remoteProfile.isLoading) ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : unavailable ? (
          <>
            <Lock className="h-8 w-8 text-muted-foreground mb-3" />
            <h1 className="text-2xl font-bold text-primary">{t("profile.unavailable")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("profile.unavailableText")}</p>
            <Link
              to="/comunidades"
              className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
            >
              {t("profile.backToCommunities")}
            </Link>
          </>
        ) : !profile ? (
          <>
            <h1 className="text-2xl font-bold text-primary">{t("profile.notFound")}</h1>
            <Link
              to="/comunidades"
              className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
            >
              {t("profile.backToCommunities")}
            </Link>
          </>
        ) : (
          <>
            {/* Banner do Perfil */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card mb-8 flex flex-col">
              <div className="h-32 sm:h-48 w-full relative">
                <img
                  src="/images/hero/hero-table.jpg"
                  alt="Capa do perfil"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <div className="p-6 sm:p-10 pt-12 sm:pt-14 relative bg-gradient-to-br from-card via-card to-accent-soft/20">
                <div className="absolute -top-10 sm:-top-12 left-6 sm:left-10 grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-3xl bg-primary text-3xl font-extrabold text-primary-foreground shadow-card border-4 border-card">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.name}
                      className="h-full w-full rounded-[1.1rem] object-cover"
                    />
                  ) : (
                    initials(profile.name)
                  )}
                </div>

                {/* Menu de opções: canto fixo, separado dos botões de ação para não quebrar
                    linha sozinho em telas estreitas. */}
                <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-xs transition hover:bg-secondary cursor-pointer"
                        aria-label={t("profile.openMenu")}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    {isSelf ? (
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/perfil/configuracoes"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Settings className="h-4 w-4" />
                            <span>{t("settings.title")}</span>
                          </Link>
                        </DropdownMenuItem>
                        {!isProfessional && (
                          <DropdownMenuItem asChild>
                            <Link
                              to="/verificacao"
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <BadgeCheck className="h-4 w-4" />
                              <span>{t("profile.proVerification")}</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {isProfessional && (
                          <DropdownMenuItem asChild>
                            <Link to="/convites" className="flex items-center gap-2 cursor-pointer">
                              <Inbox className="h-4 w-4" />
                              <span>
                                {t("profile.invites")}
                                {inviteCount > 0 ? ` (${inviteCount})` : ""}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {isPlatformAdmin(user) && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                              <ShieldCheck className="h-4 w-4" />
                              <span>{t("profile.adminPanel")}</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t("settings.signout")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    ) : (
                      <DropdownMenuContent align="end" className="w-56">
                        {iBlockedThem ? (
                          <DropdownMenuItem
                            onClick={handleUnblock}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>{t("profile.unblock")}</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={handleBlock}
                            className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
                            <span>{t("profile.block")}</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </div>

                <div className="flex flex-col gap-6 pr-10 sm:pr-12">
                  <div>
                    <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                      {profile.name}
                      {isProfessional && <VerifiedBadge className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </h1>
                    {isProfessional && professionalInfo && (
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-accent">
                        {t("profile.verifiedPro")} · {td(professionalInfo.profession)} ·{" "}
                        {professionalInfo.council} {professionalInfo.registration}/
                        {professionalInfo.uf}
                      </p>
                    )}
                    {username && (
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        @{username}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{profile.bio}</p>
                    {remote && <ProfileCounts remote={remote} isProfessional={isProfessional} />}
                    {!isSelf && remote && (
                      <RelationshipActions
                        userId={userId}
                        name={profile.name}
                        relationship={remote.relationship}
                        targetIsProfessional={isProfessional}
                        viewerIsProfessional={!!user.professional}
                      />
                    )}
                    {isProfessional && !isSelf && (
                      <Link
                        to="/profissionais/$professionalId"
                        params={{ professionalId: userId }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
                      >
                        <CalendarCheck className="h-4 w-4" /> {t("profile.bookConsultation")}
                      </Link>
                    )}
                    {isProfessional && professionalInfo && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {professionalInfo.specialties.map((sp) => (
                          <li
                            key={sp}
                            className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground"
                          >
                            {td(sp)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {isSelf && user && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📧 {user.email} {user.phone ? ` · 📞 ${user.phone}` : ""}
                      </p>
                    )}
                    {!isSelf && !unavailable && <RemoteContact userId={userId} />}
                  </div>

                  {isSelf && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/perfil/editar"
                        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>{t("profile.editProfile")}</span>
                      </Link>
                      <ShareModal
                        triggerButton={
                          <button
                            type="button"
                            className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 shadow-xs flex items-center gap-1.5"
                          >
                            <Plus className="h-4 w-4" />
                            <span>{t("profile.share")}</span>
                          </button>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {contentLocked && (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center mb-8">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">{t("profile.privateTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("profile.privateText").replace("{name}", profile.name)}
                </p>
              </div>
            )}
            {!contentLocked && (
              <>
                {/* Métricas da Jornada */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("profile.stat.recipes")}
                      </span>
                      <ChefHat className="h-5 w-5 text-accent" />
                    </div>
                    <p className="mt-2 text-2xl font-bold font-display text-foreground">
                      {preparedRecipes.length}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t("profile.stat.recipesSub")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("profile.stat.challenges")}
                      </span>
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                    <p className="mt-2 text-2xl font-bold font-display text-foreground">
                      {myChallenges.length}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t("profile.stat.challengesSub")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("profile.stat.shares")}
                      </span>
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <p className="mt-2 text-2xl font-bold font-display text-foreground">
                      {myPosts.length}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t("profile.stat.sharesSub")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("profile.stat.pace")}
                      </span>
                      <Compass className="h-5 w-5 text-accent" />
                    </div>
                    <p className="mt-2 text-base font-bold text-foreground">
                      {t("profile.stat.paceValue")}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t("profile.stat.paceSub")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] min-[1440px]:grid-cols-[300px_minmax(0,1fr)_320px]">
                  {/* Coluna da esquerda: só a partir de 1440px */}
                  <div className="hidden min-[1440px]:block">
                    <div className={STICKY_COLUMN}>
                      <MyCommunitiesPanel
                        userId={userId}
                        title={
                          isSelf
                            ? undefined
                            : t("panel.communitiesOf").replace("{name}", profile.name)
                        }
                      />
                      {isSelf && (
                        <>
                          <BadgesPanel />
                          <FriendsPanel />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 space-y-8">
                    {/* Receitas que preparou */}
                    <section>
                      <div className="flex items-center justify-between mb-4 border-b border-border/70 pb-2">
                        <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                          <ChefHat className="h-5 w-5 text-accent" />
                          <span>
                            {t("profile.recipesDone")} ({preparedRecipes.length})
                          </span>
                        </h2>
                        <Link
                          to="/receitas"
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          {t("profile.discoverMore")}
                        </Link>
                      </div>

                      {preparedRecipes.length > 0 ? (
                        <div className={CARD_GRID}>
                          {preparedRecipes.map((r) => (
                            <PostCard key={r.id} post={r} />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/60">
                          <ChefHat className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-semibold text-foreground">
                            {isSelf ? t("profile.noRecipesSelf") : t("profile.noRecipesOther")}
                          </p>
                          {isSelf && (
                            <>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t("profile.howTo1")} <b>"{t("profile.howTo2")}"</b>{" "}
                                {t("profile.howTo3")}
                              </p>
                              <div className="mt-4">
                                <Link
                                  to="/receitas"
                                  className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground inline-block"
                                >
                                  {t("profile.exploreRecipes")}
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </section>

                    {/* Publicações */}
                    <section>
                      <div className="flex items-center justify-between mb-4 border-b border-border/70 pb-2">
                        <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-accent" />
                          <span>
                            {t("profile.postsTitle")} ({myPosts.length})
                          </span>
                        </h2>
                      </div>

                      {myPosts.length > 0 ? (
                        <div className="space-y-4">
                          {myPosts.map((p) => (
                            <PostCard key={p.id} post={p} />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/60">
                          <p className="text-sm text-muted-foreground">
                            {isSelf ? t("profile.noPostsSelf") : t("profile.noPostsOther")}
                          </p>
                          {isSelf && (
                            <div className="mt-3">
                              <ShareModal />
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Barra Lateral */}
                  <aside className="space-y-6">
                    {isSelf && userGoals.length > 0 && (
                      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                          <span>{t("profile.myGoals")}</span>
                        </h3>
                        <ul className="space-y-2.5 text-xs text-foreground">
                          {userGoals.map((goal, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 rounded-xl bg-secondary/40 p-2.5"
                            >
                              <span className="text-accent font-bold mt-0.5">✓</span>
                              <span className="leading-snug">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground flex items-center gap-2">
                          <Award className="h-4 w-4 text-accent" />
                          <span>{t("profile.activeChallenges")}</span>
                        </h3>
                        <Link
                          to="/desafios"
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          {t("profile.seeAll")}
                        </Link>
                      </div>

                      {myChallenges.length > 0 ? (
                        <div className="space-y-3">
                          {myChallenges.map((c) => {
                            const completed = (c.progress?.[userId] || []).length;
                            const total = c.steps.length;
                            const isDone = c.completedBy.includes(userId);
                            return (
                              <Link
                                key={c.id}
                                to="/desafios/$challengeId"
                                params={{ challengeId: c.id }}
                                className="block rounded-xl bg-secondary/50 p-3 text-xs hover:bg-secondary transition"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <span>{c.badgeIcon}</span> {c.title}
                                  </div>
                                  {isDone && (
                                    <Award className="h-3.5 w-3.5 text-primary shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {c.description}
                                </p>
                                {total > 0 && (
                                  <div className="h-1.5 w-full rounded-full bg-card overflow-hidden mt-2">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all"
                                      style={{ width: `${Math.round((completed / total) * 100)}%` }}
                                    />
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-xs text-muted-foreground">
                          <p>
                            {isSelf
                              ? t("profile.noChallengesSelf")
                              : t("profile.noChallengesOther")}
                          </p>
                          {isSelf && (
                            <Link
                              to="/desafios"
                              className="mt-2.5 inline-block text-xs font-semibold text-accent hover:underline"
                            >
                              {t("profile.pickChallenge")}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    {administeredCommunities.length > 0 && (
                      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground mb-3">
                          {t("profile.administers")}
                        </h3>
                        <ul className="flex flex-wrap gap-2">
                          {administeredCommunities.map((c) => (
                            <li key={c.id}>
                              <Link
                                to="/comunidades/$slug"
                                params={{ slug: c.slug }}
                                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted"
                              >
                                {c.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </aside>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/** Contato de outra pessoa: o Supabase só devolve para profissionais vinculados e admins. */
function RemoteContact({ userId }: { userId: string }) {
  const [contact, setContact] = useState<{ email?: string; phone?: string } | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchContactInfo(userId).then((c) => alive && setContact(c));
    return () => {
      alive = false;
    };
  }, [userId]);
  if (!contact || (!contact.email && !contact.phone)) return null;
  return (
    <p className="text-xs text-muted-foreground mt-1">
      {contact.email && `📧 ${contact.email}`}
      {contact.email && contact.phone ? " · " : ""}
      {contact.phone ? `📞 ${contact.phone}` : ""}
    </p>
  );
}

function ProfileCounts({
  remote,
  isProfessional,
}: {
  remote: RemoteProfile;
  isProfessional: boolean;
}) {
  const { t } = useI18n();
  const parts = isProfessional
    ? [t("profile.followersCount").replace("{n}", String(remote.followers_count))]
    : [
        t("profile.friendsCount").replace("{n}", String(remote.friends_count)),
        t("profile.followingCount").replace("{n}", String(remote.following_count)),
      ];
  return <p className="mt-1.5 text-xs font-semibold text-foreground">{parts.join(" · ")}</p>;
}
