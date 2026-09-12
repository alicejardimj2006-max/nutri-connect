import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ChefHat,
  Heart,
  Users,
  CalendarCheck,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  MessageSquare,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { PostCard, WeeklyThemeCard, ChallengeCard, ProfessionalCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriConnect — Sua alimentação. Sua jornada." },
      {
        name: "description",
        content:
          "Uma rede social viva para descobrir receitas, compartilhar experiências, aprender com nutricionistas e construir hábitos reais sem cobrança.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { posts, weeklyTheme, challenges, professionals, hydrated } = useCommunity();

  // Destaques do Espaço de Hoje
  const featuredPosts = posts.slice(0, 3);
  const featuredChallenge = challenges[0];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card via-background to-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Texto Principal */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-1 text-xs font-semibold text-accent shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Comunidade Viva de Alimentação & Hábitos</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-display leading-[1.1]">
                  Sua alimentação. <br className="hidden sm:inline" />
                  <span className="text-accent underline decoration-accent/30 underline-offset-8">
                    Sua jornada.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Um espaço acolhedor para descobrir receitas simples, compartilhar experiências reais,
                  aprender com nutricionistas e construir hábitos melhores no seu próprio ritmo.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/espaco"
                    className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 hover:scale-[1.02] flex items-center gap-2"
                  >
                    <span>Entrar na comunidade</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/cadastro"
                    className="rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition hover:bg-secondary hover:border-primary/40 shadow-xs"
                  >
                    Começar minha jornada
                  </Link>

                  <ShareModal />
                </div>

                {/* Pilares da Comunidade */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/70 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-base">🍲</span>
                    <span>Receitas testadas por pessoas reais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-base">🌱</span>
                    <span>Hábitos sem julgamento estético</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-base">👩‍⚕️</span>
                    <span>Orientação de especialistas verificados</span>
                  </div>
                </div>
              </div>

              {/* Card Destaque Hero: Tema da Semana */}
              <div className="lg:col-span-5">
                {hydrated && weeklyTheme && (
                  <div className="transform transition hover:-translate-y-1 duration-300">
                    <WeeklyThemeCard theme={weeklyTheme} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Seção 2: O Pulso da Comunidade (Espaço de Hoje) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-1">
                <Compass className="h-3.5 w-3.5" />
                <span>O que está acontecendo agora</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                Espaço de Hoje
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Trocas autênticas entre pessoas que estão cozinhando, aprendendo e caminhando juntas.
              </p>
            </div>

            <Link
              to="/espaco"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Ver todas as publicações</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Grid do Espaço de Hoje */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/espaco"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition"
            >
              <span>Explorar conversas, receitas e experiências</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Seção 3: Desafios de Hábitos */}
        <section className="border-y border-border/80 bg-secondary/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Pequenos passos constantes</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                Desafios de Hábitos
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sem contagem obsessiva de calorias e sem metas inalcançáveis. Aqui celebramos cada copo d'água, cada panela que vai ao fogo e cada momento de presença à mesa.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/desafios"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
              >
                <span>Conhecer todos os desafios comunitários</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Seção 4: Especialistas que Fazem Parte da Comunidade */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Ciência e Acolhimento</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                Especialistas da Rede
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nutricionistas que compartilham conhecimento na comunidade e estão disponíveis para acompanhar sua jornada individualmente.
              </p>
            </div>

            <Link
              to="/profissionais"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Ver todos os profissionais</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((prof) => (
              <ProfessionalCard key={prof.id} professional={prof} />
            ))}
          </div>
        </section>

        {/* Seção 5: Convite para Começar */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 pt-8">
          <div className="rounded-3xl border border-accent/20 bg-gradient-to-r from-accent/10 via-primary-soft/30 to-accent-soft/40 p-8 sm:p-12 text-center shadow-card">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
              Pronto para viver uma relação mais leve com a sua alimentação?
            </h2>
            <p className="mt-3 text-sm text-foreground/80 max-w-xl mx-auto leading-relaxed">
              Junte-se a pessoas que acreditam em comida de verdade, sem terrorismo nutricional e com apoio para cada etapa da sua caminhada.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/cadastro"
                className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
              >
                Criar minha conta gratuita
              </Link>
              <Link
                to="/espaco"
                className="rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition"
              >
                Ver a comunidade primeiro
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
