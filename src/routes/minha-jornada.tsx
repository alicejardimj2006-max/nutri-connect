import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles,
  ChefHat,
  Award,
  Calendar,
  Heart,
  BookOpen,
  ArrowRight,
  Plus,
  UserCheck,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { PostCard, ChallengeCard, ProfessionalCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/minha-jornada")({
  head: () => ({
    meta: [
      { title: "Minha Jornada — NutriConnect" },
      {
        name: "description",
        content: "Acompanhe sua caminhada pessoal: seus objetivos, receitas que preparou, desafios ativos e aprendizados com a comunidade.",
      },
    ],
  }),
  component: MinhaJornadaPage,
});

function MinhaJornadaPage() {
  const { user, hydrated } = useAuth();
  const { posts, challenges, professionals } = useCommunity();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) {
      navigate({ to: "/login" });
    }
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground text-sm">
        Carregando sua jornada…
      </div>
    );
  }

  // Receitas que o usuário preparou ("Eu preparei")
  const preparedRecipes = posts.filter((p) =>
    p.type === "receita" && (p.preparedBy || []).includes(user.id)
  );

  // Publicações criadas pelo usuário
  const myPosts = posts.filter((p) => p.authorId === user.id);

  // Desafios que o usuário está participando
  const myChallenges = challenges.filter((c) => c.participants.includes(user.id));

  // Objetivos padrão ou configurados
  const userGoals = [
    user.goal || "Construir uma relação mais leve com a comida",
    "Cozinhar com alimentos frescos em casa",
    "Respeitar meus sinais de fome e saciedade",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Banner do Perfil de Jornada */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-accent-soft/20 p-6 sm:p-10 shadow-card mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary text-2xl font-extrabold text-primary-foreground shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                    {user.name}
                  </h1>
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent capitalize">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {user.bio || "Construindo uma caminhada alimentar tranquila e conectada com o corpo."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📧 {user.email} {user.phone ? ` · 📞 ${user.phone}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
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

              <Link
                to={user.role === "nutricionista" ? "/nutricionista/perfil" : "/paciente/perfil"}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition"
              >
                Editar meus dados
              </Link>
            </div>
          </div>

          {/* Atalho para Acompanhamento Clínico se aplicável */}
          <div className="mt-8 pt-6 border-t border-border/70 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-accent" />
              <span>Acompanhamento clínico individual e plano alimentar:</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/paciente/agendamentos"
                className="font-semibold text-primary hover:underline"
              >
                Minhas Consultas
              </Link>
              <span>·</span>
              <Link
                to="/paciente/plano-alimentar"
                className="font-semibold text-primary hover:underline"
              >
                Plano Alimentar
              </Link>
              <span>·</span>
              <Link
                to="/paciente/dashboard"
                className="font-semibold text-accent hover:underline"
              >
                Painel Clínico Completo →
              </Link>
            </div>
          </div>
        </div>

        {/* Métricas Humanas da Jornada (Sem Vaidade) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Receitas Preparadas</span>
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
              <span className="text-xs font-medium text-muted-foreground">Compartilhamentos</span>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-2 text-2xl font-bold font-display text-foreground">
              {myPosts.length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">relatos e ideias na rede</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Ritmo da Caminhada</span>
              <Compass className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-2 text-base font-bold text-foreground">Constante</p>
            <p className="mt-1 text-[11px] text-muted-foreground">um dia de cada vez</p>
          </div>
        </div>

        {/* Layout de Seções: Objetivos + Desafios + Receitas preparadas */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {/* Seção: Receitas que Eu Preparei */}
            <section>
              <div className="flex items-center justify-between mb-4 border-b border-border/70 pb-2">
                <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-accent" />
                  <span>Receitas que Preparei ({preparedRecipes.length})</span>
                </h2>
                <Link to="/receitas" className="text-xs text-primary font-semibold hover:underline">
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
                  <p className="text-sm font-semibold text-foreground">Você ainda não marcou nenhuma receita como preparada</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ao navegar pelas receitas da comunidade, clique em <b>"Eu preparei"</b> para registrar suas conquistas na cozinha!
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/receitas"
                      className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground inline-block"
                    >
                      Explorar receitas
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Seção: Meus Compartilhamentos */}
            <section>
              <div className="flex items-center justify-between mb-4 border-b border-border/70 pb-2">
                <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <span>O que compartilhei com a comunidade ({myPosts.length})</span>
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
                    Você ainda não compartilhou nenhuma publicação.
                  </p>
                  <div className="mt-3">
                    <ShareModal />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Barra Lateral: Objetivos & Desafios */}
          <aside className="space-y-6">
            {/* Meus Objetivos na Jornada */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Meus Objetivos</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-foreground">
                {userGoals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl bg-secondary/40 p-2.5">
                    <span className="text-accent font-bold mt-0.5">✓</span>
                    <span className="leading-snug">{goal}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-border/60">
                <Link
                  to="/paciente/perfil"
                  className="text-[11px] font-semibold text-primary hover:underline block text-center"
                >
                  Personalizar meus objetivos no perfil
                </Link>
              </div>
            </div>

            {/* Meus Desafios de Hábitos */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" />
                  <span>Desafios em Andamento</span>
                </h3>
                <Link to="/desafios" className="text-xs text-primary font-semibold hover:underline">
                  Ver todos
                </Link>
              </div>

              {myChallenges.length > 0 ? (
                <div className="space-y-3">
                  {myChallenges.map((c) => (
                    <div key={c.id} className="rounded-xl bg-secondary/50 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span>{c.badgeIcon}</span> {c.title}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{c.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  <p>Você ainda não está participando de nenhum desafio.</p>
                  <Link
                    to="/desafios"
                    className="mt-2.5 inline-block text-xs font-semibold text-accent hover:underline"
                  >
                    Escolher um desafio de hábito
                  </Link>
                </div>
              )}
            </div>

            {/* Acompanhamento Profissional */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <span>Especialistas Parceiros</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Encontre o nutricionista ideal para o seu momento e agende uma conversa com acompanhamento individual.
              </p>
              <Link
                to="/profissionais"
                className="w-full rounded-full bg-secondary py-2 text-center text-xs font-semibold text-foreground hover:bg-muted block transition"
              >
                Ver especialistas disponíveis
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
