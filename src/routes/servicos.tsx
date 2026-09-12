import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import {
  CalendarCheck,
  UtensilsCrossed,
  LineChart,
  MessageSquare,
  FileText,
  Users,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Clock,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços & Planos — NutriConnect" },
      {
        name: "description",
        content:
          "Conheça todas as soluções da NutriConnect para pacientes e nutricionistas: consultas online, planos alimentares dinâmicos, acompanhamento por IA e gestão de consultório.",
      },
      { property: "og:title", content: "Serviços & Planos — NutriConnect" },
      {
        property: "og:description",
        content: "Tudo que você precisa para cuidar da sua nutrição ou alavancar seu consultório.",
      },
    ],
  }),
  component: Servicos,
});

const coreServices = [
  {
    icon: CalendarCheck,
    title: "Consultas Telemedicina & Presenciais",
    desc: "Agendamento integrado com confirmações automáticas via WhatsApp, salas virtuais HD com prontuário dinâmico na mesma tela.",
    tag: "Para Todos",
  },
  {
    icon: UtensilsCrossed,
    title: "Planos Alimentares Interativos",
    desc: "Cardápios personalizados criados pelo seu nutricionista com tabela de substituição inteligente e cálculo automático de macronutrientes.",
    tag: "Para Pacientes",
  },
  {
    icon: LineChart,
    title: "Monitoramento de Evolução 360°",
    desc: "Gráficos em tempo real de peso, IMC, percentual de gordura, bioimpedância e galeria privada de fotos antes/depois.",
    tag: "Para Pacientes",
  },
  {
    icon: MessageSquare,
    title: "Chat Direto & Suporte NutriAI",
    desc: "Comunicação contínua com seu profissional entre as consultas e assistente IA 24h para tirar dúvidas de substituição de alimentos.",
    tag: "Destaque",
  },
  {
    icon: FileText,
    title: "Prescrições em PDF & Lista de Compras",
    desc: "Gere PDFs elegantes com sua marca própria em um clique e transforme planos alimentares em listas de compras organizadas por corredor de supermercado.",
    tag: "Para Profissionais",
  },
  {
    icon: Users,
    title: "Gestão Completa de Consultório",
    desc: "Dashboard financeiro, controle de recebimentos via PIX/cartão, gestão de retorno de pacientes e prontuário eletrônico em conformidade com a LGPD.",
    tag: "Para Profissionais",
  },
];

const pricingPlans = [
  {
    name: "Paciente Standard",
    price: "Grátis",
    period: "para sempre",
    description: "Ideal para se conectar ao seu nutricionista e acompanhar seu plano.",
    features: [
      "Acesso ao app do paciente",
      "Visualização de plano alimentar",
      "Chat direto com seu profissional",
      "Histórico de consultas e receitas",
      "Lembretes de água e refeições",
    ],
    cta: "Criar Conta Grátis",
    href: "/cadastro?role=paciente",
    popular: false,
  },
  {
    name: "Paciente Premium",
    price: "R$ 29",
    period: "/mês",
    description: "Para quem quer acelerar resultados com a assistente de IA 24h.",
    features: [
      "Tudo do plano Standard",
      "NutriAI ilimitada (análise de pratos por foto)",
      "Gerador de listas de compras automáticas",
      "Desafios comunitários com premiações",
      "Descontos exclusivos em marcas parceiras",
    ],
    cta: "Assinar Premium",
    href: "/cadastro?role=paciente&plan=premium",
    popular: true,
  },
  {
    name: "Nutricionista Pro",
    price: "R$ 89",
    period: "/mês",
    description: "Tudo que o profissional precisa para gerenciar até 100 pacientes com alta eficiência.",
    features: [
      "Prontuário eletrônico ilimitado",
      "Gerador de plano alimentar rápido com IA",
      "Agenda online integrada + Telemedicina",
      "Envio de lembretes automáticos no WhatsApp",
      "Suporte prioritário 7 dias por semana",
    ],
    cta: "Testar 14 Dias Grátis",
    href: "/cadastro?role=nutricionista",
    popular: false,
  },
];

const faqs = [
  {
    q: "Como funciona o agendamento de consultas na NutriConnect?",
    a: "Você escolhe o profissional pelo filtro de especialidade ou localização, seleciona o melhor dia e horário disponível na agenda em tempo real do nutricionista e confirma o agendamento de forma simples e segura.",
  },
  {
    q: "Os planos alimentares podem ser acessados offline?",
    a: "Sim! Pelo aplicativo mobile da NutriConnect, seu plano alimentar mais recente fica salvo offline, e você também pode exportar em PDF para salvar no celular ou imprimir.",
  },
  {
    q: "Sou nutricionista. Como a NutriConnect me ajuda a economizar tempo?",
    a: "Nossa plataforma automatiza a montagem de cardápios com cálculos de VET e macronutrientes instantâneos, envia confirmações de consulta automáticas no WhatsApp e reduz as faltas em até 45%.",
  },
  {
    q: "É seguro colocar minhas fotos de evolução no aplicativo?",
    a: "Com certeza. Todas as imagens e dados de saúde são criptografados de ponta a ponta em conformidade rigorosa com a LGPD e o Código de Ética dos Nutricionistas.",
  },
];

function Servicos() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [pacientesMes, setPacientesMes] = useState(30);
  const [valorConsulta, setValorConsulta] = useState(200);

  // ROI calculation logic
  const horasEconomizadasSemana = Math.round((pacientesMes / 4) * 2.5);
  const faturamentoEstimado = pacientesMes * valorConsulta;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 via-background to-background py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/50 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> Soluções completas para nutrição inteligente
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Cuidado que conecta <br className="hidden sm:inline" />
              <span className="text-primary">tecnologia e humanização</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-muted-foreground">
              Da primeira consulta ao acompanhamento diário. Oferecemos as melhores ferramentas para pacientes atingirem metas e nutricionistas escalarem seus consultórios.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/profissionais"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl"
              >
                Encontrar Nutricionista <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/cadastro"
                search={{ role: "nutricionista" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
              >
                Sou Nutricionista
              </Link>
            </div>
          </div>
        </section>

        {/* CORE SERVICES GRID */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">O que oferecemos na prática</h2>
            <p className="mt-2 text-muted-foreground">Recursos desenvolvidos especificamente para atender as reais necessidades do dia a dia</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreServices.map((s) => (
              <div
                key={s.title}
                className="group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-soft"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {s.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE CALCULATOR FOR NUTRITIONISTS */}
        <section className="bg-secondary/40 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="rounded-3xl border bg-card p-8 shadow-lg md:p-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                    <Calculator className="h-4 w-4" /> Para Nutricionistas
                  </span>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold">
                    Calcule sua economia de tempo com o NutriConnect
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Veja quantas horas semanais você ganha ao automatizar a montagem de dietas e confirmações.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span>Pacientes atendidos por mês:</span>
                      <span className="text-primary font-bold">{pacientesMes} pacientes</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={pacientesMes}
                      onChange={(e) => setPacientesMes(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span>Valor médio da sua consulta:</span>
                      <span className="text-primary font-bold">R$ {valorConsulta}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="600"
                      step="25"
                      value={valorConsulta}
                      onChange={(e) => setValorConsulta(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-6 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-extrabold text-foreground">{horasEconomizadasSemana}h / semana</div>
                      <div className="text-xs text-muted-foreground">Economizadas em burocracia e prescrições</div>
                    </div>
                  </div>
                  <div className="border-t border-primary/20 pt-4 flex items-center gap-3">
                    <Award className="h-8 w-8 text-accent" />
                    <div>
                      <div className="text-2xl font-extrabold text-foreground">
                        R$ {faturamentoEstimado.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-xs text-muted-foreground">Potencial de faturamento mensal gerenciado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING PLANS */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Planos transparentes para cada perfil</h2>
            <p className="mt-2 text-muted-foreground">Sem fidelidade, cancele ou troque de plano quando quiser</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl border p-8 shadow-card transition-all ${
                  plan.popular ? "border-primary bg-card shadow-soft ring-2 ring-primary" : "bg-card"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                    Mais Escolhido
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-xs text-muted-foreground min-h-[36px]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={plan.href}
                  className={`mt-8 w-full rounded-full py-3 text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover"
                      : "border border-border bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="bg-card border-t py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                <HelpCircle className="h-4 w-4" /> Dúvidas Frequentes
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold">Ainda ficou com alguma pergunta?</h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq, idx) => (
                <div key={faq.q} className="rounded-2xl border bg-background overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-semibold text-foreground transition hover:bg-secondary/40"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-accent-hover p-8 md:p-14 text-primary-foreground shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="font-display text-3xl font-bold">Pronto para transformar sua saúde ou consultório?</h2>
              <p className="max-w-xl text-sm text-primary-foreground/90">
                Junte-se a milhares de pessoas que já usam o NutriConnect para uma vida mais saudável e organizada.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <Link
                to="/cadastro"
                className="rounded-full bg-background px-7 py-3 text-sm font-bold text-foreground shadow-lg transition hover:bg-secondary"
              >
                Cadastre-se Agora
              </Link>
              <Link
                to="/contato"
                className="rounded-full border border-primary-foreground/30 px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-white/10"
              >
                Falar com Consultor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

