import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarCheck,
  Camera,
  HeartPulse,
  Inbox,
  Lock,
  LogOut,
  Mail,
  Phone,
  MoreVertical,
  Paintbrush,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { AuthGateLoading } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useProfessionalMap } from "@/lib/social/professionals-queries";
import { userChallengeStreak, userChallengeXP } from "@/lib/social/challenge-stats";
import { useUserChallenges } from "@/lib/social/challenges-queries";
import { useCommunities, useCommunityInvites } from "@/lib/social/communities-queries";
import { useI18n } from "@/hooks/use-i18n";
import { initials } from "@/lib/community";
import { isPlatformAdmin } from "@/lib/community-admin";
import { VerifiedBadge } from "@/components/person-chip";
import { fetchContactInfo, refreshUser, signOut } from "@/lib/auth";
import { ShareModal } from "@/components/share-modal";
import { RelationshipActions } from "@/components/relationship-actions";
import { useAdultTrailProgress } from "@/components/rail-cards";
import { ProfileCanvas } from "@/components/profile-canvas";
import { ProfileDataProvider, type ProfileData } from "@/components/profile-blocks";
import { MediaUpload } from "@/components/profile-media";
import type { StudioPanel } from "@/components/profile-studio";
import { useTr } from "@/components/appearance-editor";
import { getActiveStreak } from "@/lib/learning-trail";
import { applyScopedAppearance } from "@/lib/appearance";
import {
  DEFAULT_HEADER,
  PROFILE_PAGE_KEY,
  ProfileRejectedError,
  defaultPage,
  compactLayout,
  freeSpot,
  newBlock,
  readPage,
  resolveCollisions,
  themeToAppearance,
  useProfilePage,
  useSaveProfilePage,
  type Block,
  type BlockType,
  type ProfilePage,
} from "@/lib/profile-page";
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
import { AppScreen } from "@/components/app-screen";

// As ferramentas de edição só são baixadas quando a pessoa pede para personalizar.
const ProfileStudioLayer = lazy(() => import("@/components/profile-studio-layer"));

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

const AVATAR_PX = { p: 72, m: 96, g: 128 } as const;

function PublicProfilePage() {
  const { userId } = useParams({ from: "/perfil/$userId" });
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t } = useI18n();
  const tr = useTr();
  const professionals = useProfessionalMap(!!user);
  const navigate = useNavigate();
  const qc = useQueryClient();
  // Perfil, privacidade e bloqueio vêm do banco (valem em qualquer aparelho e para todas as pessoas).
  const remoteProfile = usePublicProfile(user ? userId : undefined);
  const blockedQuery = useBlocked();
  // A página montada pela pessoa (capa, blocos e tema) também vem do banco: todo mundo vê igual.
  const pageQuery = useProfilePage(user ? userId : undefined);
  const savePage = useSaveProfilePage(userId);
  // Publicações da pessoa e receitas que ela preparou: do banco, e só se este perfil pode ser visto
  // (perfil privado de quem não é amigo não carrega nada).
  const canSeeContent = !!user && remoteProfile.data?.can_view_content !== false;
  const challengesQuery = useUserChallenges(userId, canSeeContent);
  const postsQuery = useFeed({ scope: "autor", author: userId, limit: 30 }, canSeeContent);
  const preparedQuery = useFeed({ scope: "preparados", author: userId, limit: 30 }, canSeeContent);
  useFeedRealtime(user?.id);
  // Comunidades (do banco): a que esta pessoa administra e, se for o próprio profissional, os convites.
  const communitiesQuery = useCommunities(false, !!user);
  const mineQuery = useCommunities(true, !!user && user.id === userId);
  const invitesQuery = useCommunityInvites(!!user && user.id === userId && !!user.professional);
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const isSelf = user?.id === userId;
  const trailProgress = useAdultTrailProgress(isSelf ? user?.id : undefined);

  // Modo de edição: o rascunho só vale para os outros depois de salvar.
  const [draft, setDraft] = useState<ProfilePage | null>(null);
  const [panel, setPanel] = useState<StudioPanel>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const remote = remoteProfile.data ?? null;
  const professionalInfo = professionals.map.get(userId)?.info;
  const isProfessional = !!professionalInfo || remote?.role === "profissional";

  const record = pageQuery.data ?? null;
  // A posição que quem visita vê (blocos colados uns nos outros) é a posição de verdade: a edição
  // começa dela, não das coordenadas antigas com vãos.
  const savedPage = useMemo(() => {
    const read = readPage(record?.page, isProfessional);
    return { ...read, layout: compactLayout(read.layout) };
  }, [record, isProfessional]);
  const page = draft ?? savedPage;
  const bannerUrl = record?.banner_url ?? null;
  const editing = draft !== null;
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(savedPage);

  // O tema de quem montou o perfil vale enquanto a página está aberta (e só nela): a personalização
  // de quem visita não se aplica ao perfil dos outros. Acessibilidade do visitante continua valendo.
  const themeKey = JSON.stringify(page.theme);
  // Vale assim que a página carregou (ou na hora, se a pessoa já está editando).
  const themeReady = !!user && (editing || !pageQuery.isLoading);
  useEffect(() => {
    if (!themeReady) return;
    applyScopedAppearance(themeToAppearance(JSON.parse(themeKey)));
    return () => applyScopedAppearance(null);
  }, [themeKey, themeReady]);

  if (!authHydrated || !user) return <AuthGateLoading />;

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("settings.signout.success"));
    navigate({ to: "/login" });
  };

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
  const myChallenges = challengesQuery.data ?? [];
  // Comunidade que a pessoa administra (uma por vez); pendentes só aparecem para ela mesma.
  const administered = (communitiesQuery.data ?? []).find(
    (c) => c.adminUserId === userId || c.professionalId === userId,
  );
  const administeredCommunities =
    administered && (administered.status !== "pendente" || isSelf) ? [administered] : [];
  // As comunidades de que participa só se sabem para a própria pessoa; para os outros, as que administra.
  const myCommunities = isSelf ? (mineQuery.data ?? []) : administeredCommunities;
  const inviteCount = isSelf && isProfessional ? (invitesQuery.data?.length ?? 0) : 0;

  const xp = userChallengeXP(myChallenges) + (isSelf ? (trailProgress?.totalXP ?? 0) : 0);
  const streak = Math.max(
    userChallengeStreak(myChallenges),
    isSelf && trailProgress ? getActiveStreak(trailProgress) : 0,
  );

  const data: ProfileData = {
    userId,
    name: profile?.name ?? "",
    bio: profile?.bio ?? "",
    isSelf,
    isProfessional,
    remote,
    posts: myPosts,
    recipes: preparedRecipes,
    challenges: myChallenges,
    communities: myCommunities,
    xp,
    streak,
    professionalInfo: isProfessional ? (professionalInfo ?? null) : null,
  };

  // ── Edição ────────────────────────────────────────────────────────────────

  const updateDraft = (fn: (p: ProfilePage) => ProfilePage) => setDraft((d) => (d ? fn(d) : d));
  const setLayout = (layout: Block[]) => updateDraft((p) => ({ ...p, layout }));
  const patchBlock = (id: string, patch: Partial<Block>) =>
    updateDraft((p) => ({
      ...p,
      layout: p.layout.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  const selected = draft?.layout.find((b) => b.id === selectedId) ?? null;

  const startEditing = () => {
    setDraft(savedPage);
    setPanel(null);
    setSelectedId(null);
  };
  const stopEditing = () => {
    setDraft(null);
    setPanel(null);
    setSelectedId(null);
  };
  const cancelEditing = () => {
    if (
      dirty &&
      !window.confirm(
        tr([
          "Descartar as mudanças que você ainda não salvou?",
          "Discard the changes you haven't saved?",
          "¿Descartar los cambios sin guardar?",
          "Abandonner les modifications non enregistrées ?",
        ]),
      )
    ) {
      return;
    }
    stopEditing();
  };
  const addBlock = (type: BlockType) => {
    if (!draft) return;
    const spot = freeSpot(draft.layout);
    const block = newBlock(type, spot);
    setLayout(resolveCollisions([...draft.layout, block], block.id));
    setAddOpen(false);
    setSelectedId(block.id);
    setPanel("block");
  };
  const removeBlock = (id: string) => {
    updateDraft((p) => ({ ...p, layout: p.layout.filter((b) => b.id !== id) }));
    if (selectedId === id) {
      setSelectedId(null);
      setPanel(null);
    }
  };
  const resetPage = () => {
    if (
      !window.confirm(
        tr([
          "Voltar ao perfil padrão? Os blocos e o tema atuais serão trocados (você ainda pode cancelar antes de salvar).",
          "Go back to the default profile? Current blocks and theme will be replaced (you can still cancel before saving).",
          "¿Volver al perfil estándar? Se reemplazarán los bloques y el tema actuales (aún puedes cancelar antes de guardar).",
          "Revenir au profil par défaut ? Les blocs et le thème actuels seront remplacés (vous pouvez encore annuler avant d'enregistrer).",
        ]),
      )
    )
      return;
    setDraft({ ...defaultPage(isProfessional), header: { ...DEFAULT_HEADER } });
    setSelectedId(null);
  };
  const handleSave = () => {
    if (!draft) return;
    // Ao salvar, os blocos sobem até encostar uns nos outros: não ficam vãos para quem visita.
    savePage.mutate(
      { ...draft, layout: compactLayout(draft.layout) },
      {
        onSuccess: () => {
          toast.success(
            tr([
              "Perfil salvo! Quem visitar já vê do seu jeito.",
              "Profile saved! Visitors now see it your way.",
              "¡Perfil guardado! Quien visite ya lo ve a tu manera.",
              "Profil enregistré ! Les visiteurs le voient à votre façon.",
            ]),
          );
          stopEditing();
        },
        onError: (err) => {
          if (err instanceof ProfileRejectedError) {
            toast.error(
              tr([
                "Não foi possível salvar o perfil",
                "Could not save the profile",
                "No se pudo guardar el perfil",
                "Impossible d'enregistrer le profil",
              ]),
              {
                description: err.message,
                duration: 12000,
              },
            );
          } else {
            toast.error(
              err instanceof Error
                ? err.message
                : tr([
                    "Não foi possível salvar agora.",
                    "Could not save right now.",
                    "No se pudo guardar ahora.",
                    "Impossible d'enregistrer pour le moment.",
                  ]),
            );
          }
        },
      },
    );
  };

  /** Depois de trocar foto de perfil ou capa: atualiza a conta e o que está na tela. */
  const afterMedia = async () => {
    await refreshUser();
    await Promise.all([
      qc.invalidateQueries({ queryKey: PROFILE_PAGE_KEY(userId) }),
      qc.invalidateQueries({ queryKey: ["social"] }),
    ]);
  };
  const removeBanner = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("profiles").update({ banner_url: null }).eq("id", userId);
    if (error) {
      toast.error(
        tr([
          "Não foi possível remover a capa.",
          "Could not remove the cover.",
          "No se pudo quitar la portada.",
          "Impossible de retirer la couverture.",
        ]),
      );
      return;
    }
    await afterMedia();
  };

  const header = page.header;
  const avatarPx = AVATAR_PX[header.avatarSize];
  const centered = header.avatarPos === "center";

  return (
    <AppScreen>
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-10">
        {!isSelf && remoteProfile.isLoading ? (
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
            {/* Cabeçalho: capa, foto, nome e ações */}
            <div className="relative mb-8 flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <div className="relative w-full" style={{ height: header.bannerHeight }}>
                <img
                  src={bannerUrl ?? "/images/hero/hero-table.jpg"}
                  alt={tr([
                    "Capa do perfil",
                    "Profile cover",
                    "Portada del perfil",
                    "Couverture du profil",
                  ])}
                  className="h-full w-full object-cover"
                />
                {header.dim && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                )}
                {isSelf && (
                  <MediaUpload target="banner" onDone={afterMedia}>
                    {(open, busy) => (
                      <button
                        type="button"
                        onClick={open}
                        disabled={busy}
                        className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/75 disabled:cursor-wait disabled:opacity-70"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        {busy
                          ? tr(["Analisando…", "Checking…", "Analizando…", "Analyse…"])
                          : tr([
                              "Alterar capa",
                              "Change cover",
                              "Cambiar portada",
                              "Changer la couverture",
                            ])}
                      </button>
                    )}
                  </MediaUpload>
                )}
              </div>

              <div
                className="relative bg-gradient-to-br from-card via-card to-accent-soft/20 px-6 pb-8 sm:px-10"
                style={{ paddingTop: avatarPx / 2 + 20 }}
              >
                <div
                  className={`avatar-shape absolute grid place-items-center bg-primary font-extrabold text-primary-foreground shadow-card border-4 border-card ${
                    centered ? "left-1/2 -translate-x-1/2" : "left-6 sm:left-10"
                  }`}
                  style={{
                    top: -avatarPx / 2,
                    width: avatarPx,
                    height: avatarPx,
                    fontSize: avatarPx / 3,
                    borderRadius: avatarPx * 0.28,
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                      style={{ borderRadius: avatarPx * 0.2 }}
                    />
                  ) : (
                    initials(profile.name)
                  )}
                  {isSelf && (
                    <MediaUpload target="avatar" onDone={afterMedia}>
                      {(open, busy) => (
                        <button
                          type="button"
                          onClick={open}
                          disabled={busy}
                          className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow-soft transition hover:scale-105 disabled:cursor-wait disabled:opacity-70"
                          aria-label={tr([
                            "Trocar foto de perfil",
                            "Change profile photo",
                            "Cambiar foto de perfil",
                            "Changer la photo de profil",
                          ])}
                          title={tr([
                            "Trocar foto de perfil",
                            "Change profile photo",
                            "Cambiar foto de perfil",
                            "Changer la photo de profil",
                          ])}
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      )}
                    </MediaUpload>
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
                        {user && (
                          <DropdownMenuItem asChild>
                            <Link
                              to={user.professional ? "/painel" : "/acompanhamento"}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <HeartPulse className="h-4 w-4" />
                              <span>{user.professional ? t("nav.clinic") : t("nav.care")}</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
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

                <div
                  className={`flex flex-col gap-6 ${
                    centered
                      ? "items-center text-center"
                      : "pr-10 sm:pr-12 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:pr-0"
                  }`}
                >
                  {/* Identidade: nome, registro, @, bio, números e contato */}
                  <div className={`min-w-0 ${centered ? "flex flex-col items-center" : ""}`}>
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
                    <p className="mt-0.5 max-w-prose text-xs sm:text-sm text-muted-foreground">
                      {profile.bio}
                    </p>
                    {remote && <ProfileCounts remote={remote} isProfessional={isProfessional} />}
                    {isSelf && user && (
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {user.email}
                        </span>
                        {user.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {user.phone}
                          </span>
                        )}
                      </p>
                    )}
                    {!isSelf && !unavailable && <RemoteContact userId={userId} />}
                  </div>

                  {/* Ações e especialidades: ocupam o lado direito em telas largas */}
                  <div
                    className={`flex min-w-0 flex-col gap-3 ${centered ? "items-center" : "lg:max-w-[46%] lg:items-end"}`}
                  >
                    {isSelf && (
                      <div
                        className={`flex flex-wrap items-center gap-2 ${centered ? "justify-center" : "lg:justify-end"}`}
                      >
                        {!editing && (
                          <button
                            type="button"
                            onClick={startEditing}
                            disabled={contentLocked}
                            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
                          >
                            <Paintbrush className="h-3.5 w-3.5" />
                            <span>
                              {tr([
                                "Personalizar perfil",
                                "Customize profile",
                                "Personalizar perfil",
                                "Personnaliser le profil",
                              ])}
                            </span>
                          </button>
                        )}
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
                              className="rounded-full bg-secondary px-5 py-2 text-xs font-semibold text-foreground hover:bg-muted shadow-xs flex items-center gap-1.5"
                            >
                              <Plus className="h-4 w-4" />
                              <span>{t("profile.share")}</span>
                            </button>
                          }
                        />
                      </div>
                    )}
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
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
                      >
                        <CalendarCheck className="h-4 w-4" /> {t("profile.bookConsultation")}
                      </Link>
                    )}
                    {isProfessional &&
                      professionalInfo &&
                      professionalInfo.specialties.length > 0 && (
                        <ul
                          className={`flex flex-wrap gap-1.5 ${centered ? "justify-center" : "lg:justify-end"}`}
                        >
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
                  </div>
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
            {!contentLocked && pageQuery.isLoading && (
              <div className="h-96 animate-pulse rounded-3xl bg-secondary/40" aria-hidden="true" />
            )}
            {!contentLocked && !pageQuery.isLoading && (
              <ProfileDataProvider value={data}>
                <ProfileCanvas
                  layout={page.layout}
                  editing={editing}
                  selectedId={selectedId}
                  onChange={setLayout}
                  onSelect={(id) => {
                    setSelectedId(id);
                    if (!id && panel === "block") setPanel(null);
                  }}
                  onEdit={(id) => {
                    setSelectedId(id);
                    setPanel("block");
                  }}
                  onDelete={removeBlock}
                />
                {administeredCommunities.length > 0 && !editing && (
                  <p className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold">{t("profile.administers")}:</span>
                    {administeredCommunities.map((c) => (
                      <Link
                        key={c.id}
                        to="/comunidades/$slug"
                        params={{ slug: c.slug }}
                        className="rounded-full bg-secondary px-3 py-1.5 font-medium text-secondary-foreground hover:bg-muted"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </p>
                )}
              </ProfileDataProvider>
            )}

            {editing && draft && (
              <Suspense fallback={null}>
                <ProfileStudioLayer
                  draft={draft}
                  dirty={dirty}
                  saving={savePage.isPending}
                  panel={panel}
                  onPanel={(p) => {
                    setPanel(p);
                    if (p !== "block") setSelectedId(null);
                  }}
                  addOpen={addOpen}
                  onAddOpen={setAddOpen}
                  selected={selected}
                  isProfessional={isProfessional}
                  hasBanner={!!bannerUrl}
                  onAddBlock={addBlock}
                  onPatchBlock={patchBlock}
                  onRemoveBlock={removeBlock}
                  onDraft={updateDraft}
                  onReset={resetPage}
                  onSave={handleSave}
                  onCancel={cancelEditing}
                  onMediaDone={afterMedia}
                  onRemoveBanner={removeBanner}
                />
              </Suspense>
            )}
          </>
        )}
      </div>
    </AppScreen>
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
    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {contact.email && (
        <span className="inline-flex items-center gap-1">
          <Mail className="h-3.5 w-3.5" /> {contact.email}
        </span>
      )}
      {contact.phone && (
        <span className="inline-flex items-center gap-1">
          <Phone className="h-3.5 w-3.5" /> {contact.phone}
        </span>
      )}
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
