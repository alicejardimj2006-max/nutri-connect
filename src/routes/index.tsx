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
import {
  PostCard,
  WeeklyThemeCard,
  ChallengeCard,
  ProfessionalCard,
} from "@/components/community-cards";
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
      navigate({ to: "/buscar", search: { q: heroSearchQuery.trim() } });
    } else {
      navigate({ to: "/buscar" });
    }
  };

  const handleQuickSupportAsk = (q: string) => {
    setSupportQuestion(q);
    if (q.toLowerCase().includes("plano") || q.toLowerCase().includes("dieta")) {
      setSupportAnswer(
        "Seu plano alimentar pode ser visualizado e acompanhado diariamente no Portal do Paciente > Plano Alimentar! Lá você também substitui alimentos.",
      );
    } else if (q.toLowerCase().includes("senha") || q.toLowerCase().includes("login")) {
      setSupportAnswer(
        "Para redefinir sua senha, acesse a página de Recuperação de Senha. Um código de verificação de 6 dígitos será enviado ao seu e-mail.",
      );
    } else if (q.toLowerCase().includes("nutricionista") || q.toLowerCase().includes("consulta")) {
      setSupportAnswer(
        "Você pode buscar e agendar consultas diretamente na aba Profissionais, filtrando por especialidade e horário desejado!",
      );
    } else {
      setSupportAnswer(
        "O Suporte NutriConnect está disponível 24 horas por dia! Acesse o chat de mensagens para tirar qualquer outra dúvida em tempo real.",
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
        <section className="relative overflow-hidden border-b border-border/80 bg-background pt-16 sm:pt-24 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Coluna Esquerda: Apresentação & Busca */}
              <div className="lg:col-span-6 space-y-7 relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent shadow-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>Comunidade Viva de Alimentação & Hábitos</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-display leading-[1.05]">
                  Sua alimentação.
                  <br className="hidden sm:inline" />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 text-accent">Sua jornada.</span>
                    <svg
                      className="absolute w-full h-3 -bottom-1 left-0 text-accent/20"
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

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Um espaço acolhedor para descobrir receitas simples, compartilhar experiências
                  reais e consultar profissionais. Comida de verdade, sem terrorismo.
                </p>

                {/* Hero Search Bar */}
                <form
                  onSubmit={handleHeroSearch}
                  className="relative flex items-center max-w-lg rounded-full border border-border bg-card shadow-soft p-1.5 focus-within:ring-2 focus-within:ring-accent/50 transition-all"
                >
                  <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Busque receitas, desafios..."
                    className="w-full bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition hover:bg-accent/90 shrink-0 shadow-sm"
                  >
                    Buscar
                  </button>
                </form>

                {/* CTAs rápidos */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/espaco"
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>Entrar na comunidade</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <ShareModal />
                </div>
              </div>

              {/* Coluna Direita: Fotografia Editorial */}
              <div className="lg:col-span-6 relative lg:-mr-12">
                <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] w-full max-w-lg mx-auto">
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary-soft rounded-full opacity-60 blur-2xl" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent-soft rounded-full opacity-60 blur-2xl" />

                  {/* Main Image Mask */}
                  <div className="relative w-full h-full overflow-hidden rounded-[2rem] rounded-tr-[6rem] rounded-bl-[6rem] border-[8px] border-card shadow-card transform rotate-2 transition-transform duration-700 hover:rotate-0">
                    <img
                      src="/images/hero/hero-table.jpg"
                      alt="Pessoas compartilhando uma refeição acolhedora"
                      className="w-full h-full object-cover scale-105"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute -bottom-4 right-4 sm:-bottom-8 sm:right-12 rounded-2xl bg-card p-4 shadow-card border border-border/60 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Comunidade Viva</p>
                        <p className="text-[10px] text-muted-foreground">+12.400 membros</p>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="text-xs text-muted-foreground font-medium">
                  Dias de Hábitos Concluídos
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-center text-accent mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
                  150+
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Nutricionistas de Suporte
                </div>
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
                  Nosso assistente responde instantaneamente sobre planos de refeição, agendamento
                  de consultas, recuperação de senha e dicas de hidratação. Todas as respostas ficam
                  gravadas com segurança.
                </p>

                {/* Chips de testes rápidos */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-foreground">
                    Pergunte algo ao suporte:
                  </span>
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
                      onClick={() =>
                        handleQuickSupportAsk("Como agendar consulta com nutricionista?")
                      }
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
                        <div className="text-sm font-bold text-foreground">
                          Suporte NutriConnect
                        </div>
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
                      <p>
                        Clique em uma das sugestões ao lado para experimentar a resposta do suporte!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TEMA DA SEMANA */}
        {hydrated && weeklyTheme && (
          <section className="border-b border-border/80 bg-secondary/20 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="grid gap-10 lg:grid-cols-2 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Em destaque nesta semana</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground leading-tight">
                    O Pulso da Comunidade
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Toda semana escolhemos um foco de reflexão e prática coletiva. O tema não é
                    obrigatório, mas serve para concentrar conversas, receitas e experiências.
                  </p>
                  <Link
                    to="/tema-da-semana"
                    className="inline-flex justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
                  >
                    Ver detalhes do tema
                  </Link>
                </div>
                <div>
                  <WeeklyThemeCard theme={weeklyTheme} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEÇÃO 2: ESPAÇO DE HOJE (PULSO DA COMUNIDADE) */}
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
                Trocas autênticas entre pessoas que estão cozinhando, aprendendo e caminhando
                juntas.
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
                Sem contagem obsessiva de calorias e sem metas inalcançáveis. Aqui celebramos cada
                copo d'água, cada panela que vai ao fogo e cada momento de presença.
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
                Profissionais verificados que compartilham conhecimento na comunidade e acompanham
                sua jornada individual.
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
              Junte-se a pessoas que acreditam em comida de verdade, sem terrorismo nutricional e
              com apoio para cada etapa da sua caminhada.
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
