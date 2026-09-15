import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import {
  Search,
  ArrowRight,
  Compass,
  Sparkles,
  ChefHat,
  Heart,
  Users,
  MessageSquare,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { type Post } from "@/lib/community";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriConnect — Sua alimentação. Sua jornada." },
      {
        name: "description",
        content:
          "Uma plataforma para descobrir receitas, compartilhar experiências e construir hábitos com outras pessoas.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const {
    posts = [],
    weeklyTheme = null,
    challenges = [],
    professionals = [],
    communities = [],
    hydrated = false,
  } = useCommunity();
  const navigate = useNavigate();

  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate({ to: "/buscar", search: { q: heroSearchQuery.trim() } });
    } else {
      navigate({ to: "/buscar" });
    }
  };

  // Filtrar posts para o Espaço de Hoje
  const todayRecipe = posts.find((p) => p.type === "receita");
  const todayExp = posts.find((p) => p.type === "experiencia");
  const todaySpec = posts.find((p) => p.type === "especialista" || p.type === "pergunta");
  const todayPosts = [todayRecipe, todayExp, todaySpec].filter((post): post is Post =>
    Boolean(post),
  );

  // Filtrar receitas para a seção editorial
  const recipePosts = posts.filter((p) => p.type === "receita").slice(0, 3);
  const mainRecipe = recipePosts[0];
  const secondaryRecipes = recipePosts.slice(1, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. HERO SECTION (Compact and Social) */}
        <section className="relative overflow-hidden bg-background pt-12 sm:pt-20 pb-16">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-accent-soft/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="grid gap-10 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-display leading-[1.1]">
                  Sua alimentação.
                  <br />
                  <span className="text-accent">Sua jornada.</span>
                </h1>

                {/* Elegante Barra de Busca */}
                <form
                  onSubmit={handleHeroSearch}
                  className="relative flex items-center max-w-lg border-b-2 border-border focus-within:border-accent transition-colors pb-2"
                >
                  <Search className="h-5 w-5 text-muted-foreground mr-3" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Receitas, pessoas, profissionais, temas..."
                    className="w-full bg-transparent py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-sm font-bold text-accent hover:text-accent/80 transition ml-2"
                  >
                    Buscar
                  </button>
                </form>

                <div className="pt-2">
                  <Link
                    to="/espaco"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <Sparkles className="h-4 w-4" /> Veja o que está acontecendo hoje{" "}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24 md:items-center">
            <div>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                Sua alimentação
                <br></br>do seu jeito
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/90">
                Conectamos pacientes e nutricionistas para
                <br></br>um acompanhamento completo e personalizado
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/cadastro"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
                >
                  Começar minha jornada <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/servicos"
                  className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary backdrop-blur-xs transition hover:bg-white/90 shadow-lg"
                >
                  Serviços
                </Link>
              </div>

              <div className="lg:col-span-6 relative hidden sm:block">
                <div className="aspect-[16/9] w-full rounded-[2rem] overflow-hidden shadow-lg border border-border/50">
                  <img
                    src="/images/hero/hero-table.jpg"
                    alt="Pessoas em uma mesa acolhedora"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ESPAÇO DE HOJE (Grid Assimétrico) */}
        {hydrated && todayPosts.length > 0 && (
          <section className="py-16 bg-secondary/20 border-y border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                    Espaço de Hoje
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O que está acontecendo agora no NutriConnect.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                {/* Principal Post */}
                {todayPosts[0] && (
                  <div className="lg:col-span-7">
                    <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={todayPosts[0].authorAvatar || "/images/professionals/prof-1.jpg"}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold">{todayPosts[0].authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {todayPosts[0].type === "receita" ? "Receita" : "Experiência"}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-display mb-2">
                          {todayPosts[0].title || "Publicação em destaque"}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {todayPosts[0].text}
                        </p>
                      </div>
                      <Link
                        to="/espaco"
                        className="inline-flex items-center self-start gap-1.5 text-xs font-bold text-accent hover:underline mt-2"
                      >
                        Ver publicação <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
                {/* Posts Secundários */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {todayPosts.slice(1, 3).map((post, i) => (
                    <div
                      key={post.id}
                      className="rounded-3xl border border-border bg-card p-5 shadow-sm flex items-start gap-4 flex-1"
                    >
                      <div className="flex-1">
                        <p className="text-xs font-bold text-accent mb-1">
                          {post.type === "pergunta" ? "Pergunta" : "Relato"}
                        </p>
                        <p className="text-sm text-foreground line-clamp-2 mb-2">"{post.text}"</p>
                        <p className="text-xs text-muted-foreground">— {post.authorName}</p>
                      </div>
                      <Link
                        to="/espaco"
                        className="shrink-0 text-xs font-bold border border-border rounded-full px-3 py-1 hover:bg-secondary transition"
                      >
                        Ver conversa
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. RECEITAS (Fundo Verde Seco) */}
        {mainRecipe && (
          <section className="py-16 bg-[#eef1e6]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-primary mb-8">
                Comida de verdade
              </h2>

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <div className="relative h-[300px] w-full overflow-hidden rounded-3xl shadow-sm">
                    <img
                      src="/images/recipes/default-recipe.jpg"
                      alt="Receita Principal"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold font-display text-white mb-2">
                        {mainRecipe.title || "Aveia com Frutas Frescas"}
                      </h3>
                      <p className="text-sm text-white/80 line-clamp-1 mb-4">{mainRecipe.text}</p>
                      <Link
                        to="/receitas/$id"
                        params={{ id: mainRecipe.id }}
                        className="inline-flex rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-bold text-white hover:bg-white/30 transition"
                      >
                        Ver receita
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  {secondaryRecipes.map((r, i) => (
                    <div
                      key={r.id}
                      className="flex-1 rounded-3xl bg-card border border-border p-4 flex gap-4 items-center shadow-sm"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                        <img
                          src={
                            i === 0
                              ? "/images/recipes/roasted-veg.jpg"
                              : "/images/recipes/default-recipe.jpg"
                          }
                          className="w-full h-full object-cover"
                          alt="Receita Secundária"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-display text-foreground line-clamp-2 mb-1">
                          {r.title}
                        </h4>
                        <Link
                          to="/receitas/$id"
                          params={{ id: r.id }}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Ver receita
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. TEMA DA SEMANA (Bloco Terracota) */}
        {weeklyTheme && (
          <section className="py-12 bg-background">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="rounded-[2.5rem] bg-[#f9f1ea] border border-[#f0dfd1] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden shrink-0">
                  <img
                    src="/images/challenges/salad-bowl.jpg"
                    alt="Tema"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="inline-block bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Tema da Semana
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-tight">
                    {weeklyTheme.title}
                  </h2>
                  {weeklyTheme.questionOfTheWeek && (
                    <p className="text-base text-foreground italic border-l-2 border-accent pl-4">
                      "{weeklyTheme.questionOfTheWeek}"
                    </p>
                  )}
                  <div className="pt-2">
                    <Link
                      to="/tema-da-semana"
                      className="inline-flex rounded-full bg-card border border-border px-6 py-2.5 text-sm font-bold text-foreground hover:bg-white transition"
                    >
                      Explorar tema
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. COMUNIDADES (Bloco Verde Profundo/Creme) */}
        {communities.length > 0 && (
          <section className="py-16 bg-[#faf9f5]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                    Encontre seu grupo
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Uma comunidade para sua jornada.
                  </p>
                </div>
                <Link to="/comunidades" className="text-sm font-bold text-accent hover:underline">
                  Explorar comunidades <ArrowRight className="inline h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {communities.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-3xl border border-border bg-card p-5 shadow-sm flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={c.coverImage || "/images/experiences/cooking.jpg"}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm font-display line-clamp-1">
                          {c.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          {c.members.length} membros
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground truncate">
                        {c.responsible ? `Resp: ${c.responsible.name}` : "Aguardando nutricionista"}
                      </span>
                      <Link
                        to="/comunidades"
                        className="text-xs font-bold text-primary hover:underline shrink-0 ml-2"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. MINHA JORNADA E DESAFIO E PROFISSIONAIS (Misto) */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Minha Jornada */}
              <div className="lg:col-span-5 rounded-[2.5rem] bg-primary-soft p-8 border border-primary/20 flex flex-col justify-center">
                <Compass className="h-8 w-8 text-primary mb-4" />
                <h2 className="text-2xl font-extrabold font-display text-primary mb-3">
                  Cada pessoa tem uma jornada diferente.
                </h2>
                <p className="text-sm text-primary/80 mb-6">
                  Acompanhe seu progresso, salve suas receitas favoritas e colecione pequenas
                  vitórias diárias.
                </p>
                <Link
                  to="/minha-jornada"
                  className="self-start rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:bg-primary/90 transition"
                >
                  Ver minha jornada
                </Link>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-8">
                {/* Desafio de Hoje */}
                {challenges[0] && (
                  <div className="flex-1 rounded-3xl border border-border bg-card p-6 shadow-sm flex items-center gap-6">
                    <div className="h-16 w-16 bg-accent-soft rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-2xl">{challenges[0].badgeIcon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-accent uppercase tracking-wide mb-1">
                        Desafio de hoje
                      </p>
                      <h3 className="text-base font-bold text-foreground mb-1">
                        {challenges[0].title}
                      </h3>
                      <Link
                        to="/desafios"
                        className="text-xs font-bold text-muted-foreground hover:text-accent transition"
                      >
                        Participar
                      </Link>
                    </div>
                  </div>
                )}

                {/* Profissionais */}
                {professionals.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">
                      Aprenda com especialistas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {professionals.slice(0, 2).map((prof) => (
                        <div
                          key={prof.id}
                          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={prof.avatar || "/images/professionals/prof-1.jpg"}
                              alt={prof.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-xs font-bold text-foreground">{prof.name}</p>
                              <p className="text-[10px] text-muted-foreground">{prof.specialty}</p>
                            </div>
                          </div>
                          <Link
                            to="/buscar"
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Ver perfil
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 7. CTA FINAL */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="relative rounded-[3rem] overflow-hidden shadow-xl aspect-[21/9] flex items-center justify-center">
              <img
                src="/images/communities/friends-dinner.jpg"
                alt="Final CTA"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 text-center px-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mb-6">
                  Sua jornada começa com um pequeno passo.
                </h2>
                <Link
                  to="/cadastro"
                  className="inline-flex rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-lg hover:bg-accent/90 transition"
                >
                  Criar conta gratuita
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
