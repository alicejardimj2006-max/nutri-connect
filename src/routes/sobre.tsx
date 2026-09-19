import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-chrome";
import {
  Heart,
  ShieldCheck,
  Zap,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Globe2,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre Nós — NutriConnect" },
      {
        name: "description",
        content:
          "Conheça a história da NutriConnect, nossa missão de humanizar e conectar pessoas em torno da alimentação através de uma rede social acolhedora.",
      },
      { property: "og:title", content: "Sobre Nós — NutriConnect" },
      { property: "og:description", content: "Uma rede social sobre alimentação, humanizada e conectada." },
    ],
  }),
  component: Sobre,
});

const stats = [
  { label: "Membros Ativos", value: "+45.000", hint: "em todo o Brasil" },
  { label: "Comunidades Temáticas", value: "+1.200", hint: "criadas pela rede" },
  { label: "Receitas Compartilhadas", value: "+180.000", hint: "publicadas e preparadas" },
  { label: "Índice de Satisfação", value: "98.4%", hint: "avaliação positiva" },
];

const timeline = [
  {
    year: "2023",
    title: "O Início da Jornada",
    desc: "Fundada com o propósito de criar um espaço onde falar sobre comida não fosse sinônimo de culpa ou comparação.",
  },
  {
    year: "2024",
    title: "Comunidades Temáticas",
    desc: "Lançamento das primeiras comunidades temáticas, unindo pessoas em torno de objetivos e rotinas alimentares parecidas.",
  },
  {
    year: "2025",
    title: "Desafios & Tema da Semana",
    desc: "Chegada dos desafios de hábitos e do Tema da Semana, trazendo mais constância e leveza para a jornada de cada pessoa.",
  },
  {
    year: "2026",
    title: "Expansão da Rede",
    desc: "Alcançamos a marca de mais de 45 mil membros compartilhando receitas, experiências e conquistas todos os dias.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Humanização em Primeiro Lugar",
    desc: "Acreditamos que a alimentação é afeto, cultura e hábito. Não impomos dietas restritivas punitivas.",
  },
  {
    icon: ShieldCheck,
    title: "Ciência & Evidência",
    desc: "Todas as nossas recomendações e algoritmos são embasados nas diretrizes atualizadas de nutrição humana.",
  },
  {
    icon: Zap,
    title: "Tecnologia Descomplicada",
    desc: "Criamos interfaces intuitivas e acessíveis para que qualquer pessoa consiga usar com facilidade.",
  },
  {
    icon: Users,
    title: "Comunidade Acolhedora",
    desc: "Promovemos um ambiente livre de julgamentos, onde a evolução individual é celebrada por todos.",
  },
];

const team = [
  {
    name: "Dra. Camila Jardim",
    role: "Co-fundadora & Diretora de Nutrição",
    bio: "Nutricionista clínica com mais de 12 anos de experiência em reeducação alimentar e nutrição esportiva.",
    crn: "CRN-3 48921",
  },
  {
    name: "Eng. Lucas Silveira",
    role: "Co-fundador & CTO",
    bio: "Especialista em inteligência artificial aplicada à saúde e arquitetura de software seguro.",
    crn: "Ex-Google Health",
  },
  {
    name: "Dra. Beatriz Santos",
    role: "Head de Pesquisa & IA",
    bio: "Doutora em Ciências dos Alimentos pela USP com foco em algoritmos de recomendação nutricional.",
    crn: "CRN-3 32109",
  },
];

function Sobre() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/50 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> Conheça nossa história
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Reinventando a conexão entre <br />
              <span className="text-primary">você e sua alimentação</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">
              A NutriConnect nasceu da convicção de que mudar hábitos alimentares não precisa ser
              solitário nem complicado. Combinamos empatia humana com inteligência tecnológica para
              criar o melhor ecossistema de nutrição da América Latina.
            </p>
          </div>
        </section>

        {/* IMPACT STATS */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-3xl border bg-card p-6 shadow-card text-center">
                <div className="font-display text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="mt-2 text-sm font-semibold text-foreground">{s.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MISSION & VISION CARDS */}
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border bg-card p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Globe2 className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold">Nossa Missão</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Democratizar o acesso a uma comunidade acolhedora sobre alimentação, oferecendo um
                espaço para trocar experiências, receitas e conquistas em uma jornada contínua,
                prazerosa e sem julgamentos.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold">Nossa Visão</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Ser a principal referência em comunidade digital sobre alimentação, transformando a
                relação das pessoas com a comida através de conexão real e apoio mútuo.
              </p>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="bg-secondary/30 py-16 border-y">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Calendar className="h-4 w-4" /> Nossa Trajetória
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold">Como chegamos até aqui</h2>
            </div>

            <div className="mt-12 space-y-8 relative before:absolute before:left-4 md:before:left-1/2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {timeline.map((item, idx) => (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row items-start ${
                    idx % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-md z-10">
                    {item.year.slice(2)}
                  </div>
                  <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
                    <div className="rounded-2xl border bg-card p-6 shadow-card">
                      <span className="text-xs font-bold text-primary">{item.year}</span>
                      <h3 className="mt-1 font-display text-lg font-bold">{item.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Nossos Valores Fundamentais</h2>
            <p className="mt-2 text-muted-foreground">
              O que nos guia em cada linha de código e decisão
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-3xl border bg-card p-6 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold">{v.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TEAM */}
        <section className="bg-card border-t py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                <Award className="h-4 w-4" /> Liderança
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold">Quem faz acontecer</h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="rounded-3xl border bg-background p-6 shadow-card text-center"
                >
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-accent-soft p-1">
                    <div className="h-full w-full rounded-full bg-secondary flex items-center justify-center font-display font-extrabold text-2xl text-primary">
                      {member.name.split(" ")[1]?.[0] ?? "N"}
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{member.name}</h3>
                  <div className="text-xs font-semibold text-primary">{member.role}</div>
                  <span className="mt-1 inline-block rounded-full bg-secondary px-3 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {member.crn}
                  </span>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* JOIN US CTA */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="rounded-3xl border bg-gradient-to-b from-secondary/60 to-background p-10 md:p-14 shadow-lg">
            <h2 className="font-display text-3xl font-bold">Faça parte desta transformação</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Seja para alcançar sua melhor versão física ou para encontrar pessoas que entendem a
              sua jornada, o NutriConnect é o seu lugar.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/cadastro"
                className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover"
              >
                Criar Conta Gratuita
              </Link>
              <Link
                to="/contato"
                className="rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Entre em Contato
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
