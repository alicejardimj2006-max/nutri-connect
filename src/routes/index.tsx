import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowRight, Compass, Bot } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { PostCard, ChallengeCard, ProfessionalCard } from "@/components/community-cards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriConnect — Sua alimentação. Sua jornada." },
      {
        name: "description",
        content:
          "Uma rede social viva para descobrir receitas, compartilhar experiências, aprender com nutricionistas, cumprir desafios e ter suporte inteligente em tempo real.",
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
    hydrated = false,
  } = useCommunity();
  const navigate = useNavigate();

  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate({ to: "/buscar", search: { q: heroSearchQuery.trim() } });
    } else {
      navigate({ to: "/buscar" });
    }
  };

  // Filtrar posts para o Espaço de Hoje (1 receita, 1 experiencia, 1 especialista/pergunta)
  const todayRecipe = posts.find((p) => p.type === "receita");
  const todayExp = posts.find((p) => p.type === "experiencia");
  const todaySpec = posts.find((p) => p.type === "especialista" || p.type === "pergunta");
  const todayPosts = [todayRecipe, todayExp, todaySpec].filter(Boolean);

  // Filtrar receitas para a seção editorial
  const recipePosts = posts.filter((p) => p.type === "receita").slice(0, 3);
  const mainRecipe = recipePosts[0];
  const secondaryRecipes = recipePosts.slice(1, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-background pt-16 sm:pt-28 pb-20 sm:pb-32">
          {/* Organic Background Shapes */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent-soft/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-primary-soft/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
              {/* Coluna Esquerda: Texto + Busca */}
              <div className="lg:col-span-6 space-y-8">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-display leading-[1.1]">
                  Sua alimentação.
                  <br className="hidden sm:inline" />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 text-accent">Sua jornada.</span>
                    <svg
                      className="absolute w-full h-4 -bottom-2 left-0 text-accent/20"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 5 Q 50 10 100 5"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Um espaço acolhedor para descobrir receitas, compartilhar experiências e aprender
                  com profissionais. Comida de verdade, no seu ritmo.
                </p>

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
                    Descobrir
                  </button>
                </form>
              </div>

              {/* Coluna Direita: Fotografia */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none lg:ml-auto">
                  <div className="w-full h-full overflow-hidden rounded-t-[12rem] rounded-b-[2rem] shadow-xl">
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
          </div>
        </section>

        {/* 2. BENEFÍCIOS / ESTATÍSTICAS (Sem números fake) */}
        <section className="border-y border-border/40 bg-card/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
              <div className="px-4">
                <span className="block text-sm font-bold font-display text-foreground mb-1">
                  Receitas testadas
                </span>
                <span className="text-xs text-muted-foreground">
                  Compartilhadas pela comunidade
                </span>
              </div>
              <div className="px-4">
                <span className="block text-sm font-bold font-display text-foreground mb-1">
                  Histórias reais
                </span>
                <span className="text-xs text-muted-foreground">Pessoas caminhando juntas</span>
              </div>
              <div className="px-4">
                <span className="block text-sm font-bold font-display text-foreground mb-1">
                  Desafios gentis
                </span>
                <span className="text-xs text-muted-foreground">Passos constantes e sem culpa</span>
              </div>
              <div className="px-4">
                <span className="block text-sm font-bold font-display text-foreground mb-1">
                  Nutricionistas
                </span>
                <span className="text-xs text-muted-foreground">
                  Profissionais presentes e humanos
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. RECEITAS (Editorial visual) */}
        {mainRecipe && (
          <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
                  Comida de verdade
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
                  Receitas caseiras, ingredientes naturais e o prazer de preparar a própria
                  refeição.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                {/* Destaque Principal */}
                <div className="lg:col-span-8">
                  <Link
                    to={`/receitas/${mainRecipe.id}`}
                    className="group block relative h-[400px] sm:h-[500px] w-full overflow-hidden rounded-3xl"
                  >
                    <img
                      src="/images/recipes/oatmeal.jpg"
                      alt="Receita"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10">
                      <span className="inline-block rounded-full bg-accent/90 px-3 py-1 text-[10px] font-bold text-accent-foreground uppercase tracking-wider mb-3 backdrop-blur-sm">
                        Receita em Destaque
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2 group-hover:underline underline-offset-4 decoration-accent/50">
                        {mainRecipe.title || "Aveia com Frutas Frescas"}
                      </h3>
                      <p className="text-sm text-white/80 line-clamp-2 max-w-xl">
                        {mainRecipe.text}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Secundárias */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {secondaryRecipes.map((r, i) => (
                    <Link
                      key={r.id}
                      to={`/receitas/${r.id}`}
                      className="group flex-1 relative overflow-hidden rounded-3xl flex items-end min-h-[200px]"
                    >
                      <img
                        src={
                          i === 0
                            ? "/images/recipes/avocado-toast.jpg"
                            : "/images/recipes/smoothie.jpg"
                        }
                        alt="Receita Secundária"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="relative p-6">
                        <h4 className="text-lg font-bold font-display text-white group-hover:underline decoration-accent/50">
                          {r.title || "Receita Caseira"}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <Link
                  to="/receitas"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
                >
                  Ver todas as receitas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 4. TEMA DA SEMANA (Destacado e Editorial) */}
        {hydrated && weeklyTheme && (
          <section className="bg-secondary/20 py-24 sm:py-32 border-y border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="grid gap-12 lg:grid-cols-2 items-center">
                <div className="relative h-[500px] w-full rounded-full overflow-hidden shadow-xl lg:order-2">
                  <img
                    src="/images/themes/fresh-ingredients.jpg"
                    alt={weeklyTheme.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="lg:order-1 space-y-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent mb-2">
                    Tema da Semana
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold font-display text-foreground leading-tight">
                    {weeklyTheme.title}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                    {weeklyTheme.description}
                  </p>

                  {weeklyTheme.questionOfTheWeek && (
                    <div className="mt-8 border-l-4 border-accent pl-5">
                      <p className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                        Pergunta para você:
                      </p>
                      <p className="text-lg font-display text-foreground italic">
                        “{weeklyTheme.questionOfTheWeek}”
                      </p>
                    </div>
                  )}

                  <div className="pt-6">
                    <Link
                      to="/tema-da-semana"
                      className="inline-flex justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90"
                    >
                      Refletir e Participar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. ESPAÇO DE HOJE (Diferenciado) */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
                  A comunidade hoje
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl">
                  Pessoas cozinhando, aprendendo e compartilhando suas jornadas agora mesmo.
                </p>
              </div>
              <Link
                to="/espaco"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline shrink-0"
              >
                Entrar na comunidade <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {todayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* 6. MINHA JORNADA (Nova Seção Conceitual) */}
        <section className="relative overflow-hidden bg-accent-soft/20 py-24 sm:py-32 border-y border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-block p-4 bg-background rounded-full shadow-sm mb-6">
              <Compass className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground mb-4">
              Cada pessoa tem uma jornada diferente.
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Acompanhe seu progresso, salve suas receitas favoritas e colecione pequenas vitórias
              diárias. Sem pressa, sem julgamentos.
            </p>
            <Link
              to="/minha-jornada"
              className="inline-flex justify-center rounded-full border-2 border-accent text-accent bg-transparent px-8 py-3.5 text-sm font-bold hover:bg-accent hover:text-accent-foreground transition"
            >
              Começar meu diário
            </Link>
          </div>
        </section>

        {/* 7. DESAFIOS (Apenas 1 ou 2) */}
        {challenges.length > 0 && (
          <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground mb-3">
                  Pequenos passos, juntos.
                </h2>
                <p className="text-base text-muted-foreground max-w-xl mx-auto">
                  A constância é mais importante que a perfeição.
                </p>
              </div>
              <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-2 justify-center">
                {challenges.slice(0, 2).map((c) => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link
                  to="/desafios"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
                >
                  Ver todos os passos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 8. PROFISSIONAIS (2-3) */}
        {professionals.length > 0 && (
          <section className="bg-card/40 py-24 sm:py-32 border-t border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground mb-3">
                  Aprenda com quem entende.
                </h2>
                <p className="text-base text-muted-foreground max-w-xl">
                  Nutricionistas que vivem a comunidade junto com você.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {professionals.slice(0, 3).map((prof) => (
                  <ProfessionalCard key={prof.id} professional={prof} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. SUPORTE (Menor e Elegante) */}
        <section className="py-20 border-t border-border/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <Bot className="h-10 w-10 text-accent mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold font-display text-foreground mb-3">
              Precisa de ajuda com a plataforma?
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Nosso assistente está sempre disponível para tirar dúvidas sobre o uso do
              NutriConnect.
            </p>
            <Link
              to="/paciente/mensagens"
              className="inline-flex items-center gap-2 text-sm font-bold text-foreground border-b-2 border-accent pb-1 hover:text-accent transition"
            >
              Falar com o suporte
            </Link>
          </div>
        </section>

        {/* 10. CTA FINAL (Forte e Fotográfico) */}
        <section className="relative py-32 sm:py-48 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/communities/friends-dinner.jpg"
              alt="Convivência"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-white mb-6">
              Sua jornada começa com um pequeno passo.
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
              Sinta-se em casa. Desfrute da comida, compartilhe histórias e descubra que o
              equilíbrio é possível e acolhedor.
            </p>
            <Link
              to="/cadastro"
              className="inline-flex justify-center rounded-full bg-accent px-10 py-4 text-base font-bold text-accent-foreground shadow-xl transition hover:bg-accent/90 hover:scale-105"
            >
              Começar minha jornada
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
