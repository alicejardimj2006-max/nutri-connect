import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
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
} from "lucide-react";
import { toast } from "sonner";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { initials } from "@/lib/community";
import {
  getAdministeredCommunity,
  getProfessionalInfo,
  getProfessionalInvites,
  isPlatformAdmin,
} from "@/lib/community-admin";
import { VerifiedBadge } from "@/components/person-chip";
import { signOut } from "@/lib/auth";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const state = useCommunity();
  const { posts, communities, challenges, hydrated } = state;
  const navigate = useNavigate();

  const [dbProfile, setDbProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (data) {
          setDbProfile(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [userId]);

  if (!authHydrated || !user || !hydrated || loadingProfile) return <AuthGateLoading />;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate({ to: "/login" });
  };

  const isSelf = user?.id === userId;

  const fromPost = posts.find((p) => p.authorId === userId);

  const profile = dbProfile
    ? {
        userId: dbProfile.id,
        name: dbProfile.display_name || dbProfile.username || "Usuário",
        bio:
          dbProfile.bio ||
          (isSelf ? "Este perfil ainda não tem biografia." : "Membro da comunidade NutriConnect."),
        role: dbProfile.role,
      }
    : isSelf && user
      ? {
          userId,
          name: user.name,
          bio: user.bio || "Este perfil ainda não tem biografia.",
          role: null,
        }
      : fromPost
        ? {
            userId,
            name: fromPost.authorName,
            bio: "Membro da comunidade NutriConnect.",
            role: null,
          }
        : null;

  const isProfessional = profile?.role === "professional" || profile?.role === "profissional";

  const myPosts = posts
    .filter((p) => p.authorId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const preparedRecipes = posts.filter(
    (p) => p.type === "receita" && (p.preparedBy || []).includes(userId),
  );
  const myChallenges = challenges.filter((c) => c.participants.includes(userId));
  // Comunidade que a pessoa administra (uma por vez); pendentes só aparecem para ela mesma.
  const administered = getAdministeredCommunity(userId, communities);
  const administeredCommunities =
    administered && (administered.status !== "pendente" || isSelf) ? [administered] : [];
  const professionalInfo = getProfessionalInfo(profiles, userId);
  const inviteCount =
    isSelf && isProfessional && user ? getProfessionalInvites(user.id, state).length : 0;

  const userGoals =
    isSelf && user
      ? [
          user.journeyGoal || user.goal || "Construir uma relação mais leve com a comida",
          "Cozinhar com alimentos frescos em casa",
          "Respeitar meus sinais de fome e saciedade",
        ]
      : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !profile ? (
          <>
            <h1 className="text-2xl font-bold text-primary">Perfil não encontrado</h1>
            <Link
              to="/comunidades"
              className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
            >
              Voltar para comunidades
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
                  {initials(profile.name)}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                      {profile.name}
                      {isProfessional && <VerifiedBadge className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </h1>
                    {isProfessional && professionalInfo && (
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-accent">
                        Profissional verificado · {professionalInfo.profession} ·{" "}
                        {professionalInfo.council} {professionalInfo.registration}/
                        {professionalInfo.uf}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{profile.bio}</p>
                    {isProfessional && professionalInfo && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {professionalInfo.specialties.map((sp) => (
                          <li
                            key={sp}
                            className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground"
                          >
                            {sp}
                          </li>
                        ))}
                      </ul>
                    )}
                    {isSelf && user && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📧 {user.email} {user.phone ? ` · 📞 ${user.phone}` : ""}
                      </p>
                    )}
                  </div>

                  {isSelf && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/perfil/editar"
                        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Editar perfil</span>
                      </Link>
                      <ShareModal
                        triggerButton={
                          <button
                            type="button"
                            className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 shadow-xs flex items-center gap-1.5"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Compartilhar</span>
                          </button>
                        }
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-xs transition hover:bg-secondary cursor-pointer"
                            aria-label="Abrir menu do perfil"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          <DropdownMenuItem asChild>
                            <Link
                              to="/perfil/configuracoes"
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Settings className="h-4 w-4" />
                              <span>Configurações</span>
                            </Link>
                          </DropdownMenuItem>
                          {!isProfessional && (
                            <DropdownMenuItem asChild>
                              <Link
                                to="/verificacao"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <BadgeCheck className="h-4 w-4" />
                                <span>Verificação profissional</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {isProfessional && (
                            <DropdownMenuItem asChild>
                              <Link
                                to="/convites"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Inbox className="h-4 w-4" />
                                <span>
                                  Convites de comunidades
                                  {inviteCount > 0 ? ` (${inviteCount})` : ""}
                                </span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {isPlatformAdmin(user) && (
                            <DropdownMenuItem asChild>
                              <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Painel da plataforma</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sair da conta</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Métricas da Jornada */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Receitas Preparadas
                  </span>
                  <ChefHat className="h-5 w-5 text-accent" />
                </div>
                <p className="mt-2 text-2xl font-bold font-display text-foreground">
                  {preparedRecipes.length}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">registros na comunidade</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Desafios Ativos</span>
                  <Award className="h-5 w-5 text-accent" />
                </div>
                <p className="mt-2 text-2xl font-bold font-display text-foreground">
                  {myChallenges.length}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">hábitos em construção</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Compartilhamentos
                  </span>
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <p className="mt-2 text-2xl font-bold font-display text-foreground">
                  {myPosts.length}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">relatos e ideias na rede</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Ritmo da Caminhada
                  </span>
                  <Compass className="h-5 w-5 text-accent" />
                </div>
                <p className="mt-2 text-base font-bold text-foreground">Constante</p>
                <p className="mt-1 text-[11px] text-muted-foreground">um dia de cada vez</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-8">
                {/* Receitas que preparou */}
                <section>
                  <div className="flex items-center justify-between mb-4 border-b border-border/70 pb-2">
                    <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-accent" />
                      <span>Receitas que Preparou ({preparedRecipes.length})</span>
                    </h2>
                    <Link
                      to="/receitas"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Descobrir mais receitas
                    </Link>
                  </div>

                  {preparedRecipes.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {preparedRecipes.map((r) => (
                        <PostCard key={r.id} post={r} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/60">
                      <ChefHat className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">
                        {isSelf
                          ? "Você ainda não marcou nenhuma receita como preparada"
                          : "Ainda não preparou nenhuma receita."}
                      </p>
                      {isSelf && (
                        <>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ao navegar pelas receitas da comunidade, clique em <b>"Eu preparei"</b>{" "}
                            para registrar suas conquistas na cozinha!
                          </p>
                          <div className="mt-4">
                            <Link
                              to="/receitas"
                              className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground inline-block"
                            >
                              Explorar receitas
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
                      <span>Publicações na comunidade ({myPosts.length})</span>
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
                        {isSelf
                          ? "Você ainda não compartilhou nenhuma publicação."
                          : "Ainda sem publicações."}
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
                      <span>Meus Objetivos</span>
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
                      <span>Desafios em Andamento</span>
                    </h3>
                    <Link
                      to="/desafios"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Ver todos
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
                              {isDone && <Award className="h-3.5 w-3.5 text-primary shrink-0" />}
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
                          ? "Você ainda não está participando de nenhum desafio."
                          : "Ainda não participa de nenhum desafio."}
                      </p>
                      {isSelf && (
                        <Link
                          to="/desafios"
                          className="mt-2.5 inline-block text-xs font-semibold text-accent hover:underline"
                        >
                          Escolher um desafio de hábito
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {administeredCommunities.length > 0 && (
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground mb-3">
                      Comunidade que administra
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
      </main>
    </div>
  );
}
