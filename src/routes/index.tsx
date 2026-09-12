import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Search,
  Heart,
  Users,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  MessageSquare,
  Star,
  ShieldCheck,
  TrendingUp,
  Apple,
  Award,
  HelpCircle,
  Clock,
  ChevronRight,
  Flame,
  Bot,
  Zap,
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
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Quick Support AI Teaser state
  const [supportQuestion, setSupportQuestion] = useState("");
  const [supportAnswer, setSupportAnswer] = useState<string | null>(null);

  const featuredPosts = (posts || []).slice(0, 3);


  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate({ to: "/buscar", search: { q: heroSearchQuery.trim() } as any });
    } else {
      navigate({ to: "/buscar" });
    }
  };

  const handleQuickSupportAsk = (q: string) => {
    setSupportQuestion(q);
    if (q.toLowerCase().includes("plano") || q.toLowerCase().includes("dieta")) {
      setSupportAnswer(
        "Seu plano alimentar pode ser visualizado e acompanhado diariamente no Portal do Paciente > Plano Alimentar! Lá você também substitui alimentos."
      );
    } else if (q.toLowerCase().includes("senha") || q.toLowerCase().includes("login")) {
      setSupportAnswer(
        "Para redefinir sua senha, acesse a página de Recuperação de Senha. Um código de verificação de 6 dígitos será enviado ao seu e-mail."
      );
    } else if (q.toLowerCase().includes("nutricionista") || q.toLowerCase().includes("consulta")) {
      setSupportAnswer(
        "Você pode buscar e agendar consultas diretamente na aba Profissionais, filtrando por especialidade e horário desejado!"
      );
    } else {
      setSupportAnswer(
        "O Suporte NutriConnect está disponível 24 horas por dia! Acesse o chat de mensagens para tirar qualquer outra dúvida em tempo real."
      );
    }
  };

  const faqs = [
    {
      question: "O NutriConnect é gratuito para começar?",
      answer:
        "Sim! O cadastro e o acesso à comunidade, aos desafios diários, às receitas e ao assistente de suporte inteligente são 100% gratuitos.",
    },
    {
      question: "Como funcionam as consultas com nutricionistas?",
      answer:
        "Você pode buscar profissionais por especialidade (ex: Nutrição Esportiva, Emagrecimento, Vegetariana), visualizar os perfis e agendar teleconsultas diretamente na plataforma.",
    },
    {
      question: "O que é o Suporte Inteligente com salvamento de respostas?",
      answer:
        "É nosso assistente virtual integrado que responde a dúvidas sobre seus hábitos, uso da plataforma, receitas e planos. Suas conversas ficam salvas com segurança no seu navegador.",
    },
    {
      question: "Sou nutricionista. Como posso me cadastrar?",
      answer:
        "Na página de Cadastro, selecione a opção 'Nutricionista', informe seu registro profissional (CRN) e tenha acesso a ferramentas de gestão de pacientes, criação de dietas e agenda.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card via-background to-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Coluna Esquerda: Apresentação & Busca */}
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
                  cumprir desafios diários, consultar nutricionistas e tirar dúvidas no Suporte Inteligente.
                </p>

                {/* Hero Search Bar */}
                <form
                  onSubmit={handleHeroSearch}
                  className="relative flex items-center max-w-xl rounded-full border border-border bg-card shadow-soft p-1.5 focus-within:ring-2 focus-within:ring-accent"
                >
                  <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Busque por receitas, desafios, profissionais..."
                    className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground transition hover:bg-accent/90 shrink-0"
                  >
                    Buscar
                  </button>
                </form>

                {/* CTAs rápidos */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/espaco"
                    className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 hover:scale-[1.02] flex items-center gap-2"
                  >
                    <span>Entrar na comunidade</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/paciente/mensagens"
                    className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary hover:border-primary/40 shadow-xs flex items-center gap-2"
                  >
                    <Bot className="h-4 w-4 text-accent" />
                    <span>Falar com Suporte</span>
                  </Link>

                  <ShareModal />
                </div>

                {/* Pilares da Comunidade */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/70 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-base">🍲</span>
                    <span>Receitas testadas e reais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-base">🌱</span>
                    <span>Hábitos sem julgamentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-base">👩‍⚕️</span>
                    <span>Nutricionistas verificados</span>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Card do Tema da Semana em Destaque */}
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

        {/* ESTATÍSTICAS E IMPACTO DA COMUNIDADE */}
        <section className="border-b border-border/80 bg-card/60 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="flex justify-center text-accent mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
                  12.400+
                </div>
                <div className="text-xs text-muted-foreground font-medium">Membros Ativos</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-center text-accent mb-2">
                  <Apple className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
                  3.800+
                </div>
                <div className="text-xs text-muted-foreground font-medium">Receitas Saudáveis</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-center text-accent mb-2">
                  <Flame className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
                  45.000+
                </div>
                <div className="text-xs text-muted-foreground font-medium">Dias de Hábitos Concluídos</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-center text-accent mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
                  150+
                </div>
                <div className="text-xs text-muted-foreground font-medium">Nutricionistas de Suporte</div>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO DO SUPORTE INTELIGENTE */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-card via-background to-accent-soft/20 p-8 sm:p-12 shadow-card">
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  <Bot className="h-4 w-4" />
                  <span>Suporte NutriConnect 24/7</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                  Tire dúvidas em tempo real e guarde seu histórico de respostas
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nosso assistente responde instantaneamente sobre planos de refeição, agendamento de consultas, recuperação de senha e dicas de hidratação. Todas as respostas ficam gravadas com segurança.
                </p>

                {/* Chips de testes rápidos */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-foreground">Pergunte algo ao suporte:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQuickSupportAsk("Como ver meu plano alimentar?")}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent-soft hover:border-accent transition text-left"
                    >
                      💡 Como ver meu plano alimentar?
                    </button>
                    <button
                      onClick={() => handleQuickSupportAsk("Como redefinir minha senha?")}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent-soft hover:border-accent transition text-left"
                    >
                      🔑 Como redefinir minha senha?
                    </button>
                    <button
                      onClick={() => handleQuickSupportAsk("Como agendar consulta com nutricionista?")}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent-soft hover:border-accent transition text-left"
                    >
                      👩‍⚕️ Como agendar consulta?
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/paciente/mensagens"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground shadow-xs transition hover:bg-accent/90"
                  >
                    <span>Abrir Chat Completo de Suporte</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Caixa de Preview da Resposta do Suporte */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">Suporte NutriConnect</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-accent font-medium">
                          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                          <span>Online e Pronto para Ajudar</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Agora</span>
                  </div>

                  {supportQuestion ? (
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <div className="rounded-2xl rounded-tr-none bg-accent px-4 py-2.5 text-xs font-medium text-accent-foreground max-w-[85%]">
                          {supportQuestion}
                        </div>
                      </div>
                      {supportAnswer && (
                        <div className="flex justify-start">
                          <div className="rounded-2xl rounded-tl-none bg-secondary/80 border border-border px-4 py-2.5 text-xs text-foreground max-w-[85%] leading-relaxed">
                            {supportAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                      <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <p>Clique em uma das sugestões ao lado para experimentar a resposta do suporte!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: ESPAÇO DE HOJE (PULSO DA COMUNIDADE) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/espaco"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition shadow-xs"
            >
              <span>Explorar conversas, receitas e experiências</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* SEÇÃO 3: DESAFIOS DE HÁBITOS */}
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
                Sem contagem obsessiva de calorias e sem metas inalcançáveis. Aqui celebramos cada copo d'água, cada panela que vai ao fogo e cada momento de presença.
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

        {/* SEÇÃO 4: ESPECIALISTAS DA REDE */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Ciência e Acolhimento</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                Nutricionistas em Destaque
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Profissionais verificados que compartilham conhecimento na comunidade e acompanham sua jornada individual.
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

        {/* PERGUNTAS FREQUENTES (FAQ) */}
        <section className="border-t border-border/80 bg-card/40 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-1 text-xs font-semibold text-accent">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Tire Suas Dúvidas</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-border bg-card overflow-hidden transition shadow-xs"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-foreground hover:bg-secondary/50 transition"
                    >
                      <span>{faq.question}</span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? "rotate-90 text-accent" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONVITE FINAL */}
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

