// Página pública (quem não entrou): explica o NutriConnect e leva ao cadastro ou ao login.
// Não dá acesso a nada do site em si — feed, perfis e profissionais ficam para quem tem conta.
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Award,
  BadgeCheck,
  Brain,
  CalendarCheck,
  ChevronDown,
  Dumbbell,
  HeartPulse,
  Lock,
  MapIcon,
  MessageCircle,
  Presentation,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Apple,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Mascot } from "@/components/mascots";
import { SiteFooter } from "@/components/site-footer";
import { useTr } from "@/components/settings-ui";
import { useI18n } from "@/hooks/use-i18n";
import type { Names } from "@/lib/appearance-data";
import { LOCALES, isLocale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

const FEATURES: { icon: LucideIcon; title: Names; text: Names; tone: string }[] = [
  {
    icon: Users,
    tone: "bg-[#f08a4b]/15 text-[#c4581f]",
    title: [
      "Uma rede que acolhe",
      "A welcoming network",
      "Una red que acoge",
      "Un réseau bienveillant",
    ],
    text: [
      "Receitas, experiências e perguntas de gente real, em comunidades temáticas e sem julgamento.",
      "Recipes, experiences and questions from real people, in themed communities, without judgment.",
      "Recetas, experiencias y preguntas de gente real, en comunidades temáticas y sin juicios.",
      "Recettes, expériences et questions de vraies personnes, en communautés thématiques, sans jugement.",
    ],
  },
  {
    icon: MapIcon,
    tone: "bg-[#78b873]/20 text-[#3f7a3b]",
    title: ["Aprender brincando", "Learn by playing", "Aprender jugando", "Apprendre en jouant"],
    text: [
      "Trilhas curtas com a Nina, níveis de Semente a Mestre, ofensivas e perfis para crianças.",
      "Short tracks with Nina, levels from Seed to Master, streaks and kid profiles.",
      "Rutas cortas con Nina, niveles de Semilla a Maestro, rachas y perfiles infantiles.",
      "Des parcours courts avec Nina, des niveaux de Graine à Maître, des séries et des profils enfants.",
    ],
  },
  {
    icon: Award,
    tone: "bg-[#e8b21c]/20 text-[#9a7409]",
    title: [
      "Hábitos em boa companhia",
      "Habits in good company",
      "Hábitos en buena compañía",
      "Des habitudes bien accompagnées",
    ],
    text: [
      "Desafios com check-in diário e um tema por semana que movimenta a conversa.",
      "Challenges with daily check-ins and a weekly theme that gets everyone talking.",
      "Desafíos con registro diario y un tema por semana que anima la conversación.",
      "Des défis avec validation quotidienne et un thème par semaine qui anime les échanges.",
    ],
  },
  {
    icon: BadgeCheck,
    tone: "bg-[#6aa6e6]/20 text-[#2f6aa8]",
    title: [
      "Profissionais verificados",
      "Verified professionals",
      "Profesionales verificados",
      "Professionnels vérifiés",
    ],
    text: [
      "Nutrição, medicina, psicologia, educação física, fisioterapia e enfermagem, com registro conferido.",
      "Nutrition, medicine, psychology, fitness, physiotherapy and nursing, with checked registration.",
      "Nutrición, medicina, psicología, educación física, fisioterapia y enfermería, con registro verificado.",
      "Nutrition, médecine, psychologie, sport, kinésithérapie et soins infirmiers, inscription vérifiée.",
    ],
  },
  {
    icon: Video,
    tone: "bg-[#2fb48c]/15 text-[#16805f]",
    title: [
      "Consulta por vídeo no site",
      "Video visits on the site",
      "Consulta por video en el sitio",
      "Téléconsultation sur le site",
    ],
    text: [
      "Agende, pague com segurança e entre na sala do NutriConnect, sem instalar nada. Nada é gravado.",
      "Book, pay securely and join the NutriConnect room, nothing to install. Nothing is recorded.",
      "Agenda, paga con seguridad y entra a la sala de NutriConnect, sin instalar nada. Nada se graba.",
      "Réservez, payez en sécurité et entrez dans la salle NutriConnect, sans rien installer. Rien n'est enregistré.",
    ],
  },
  {
    icon: HeartPulse,
    tone: "bg-[#b48ad6]/20 text-[#7a4ba3]",
    title: [
      "Acompanhamento de verdade",
      "Real follow-up",
      "Seguimiento de verdad",
      "Un vrai suivi",
    ],
    text: [
      "Plano, diário, metas, evolução e exames num só lugar, junto de quem cuida de você.",
      "Plan, diary, goals, progress and test results in one place, with the people who care for you.",
      "Plan, diario, metas, evolución y exámenes en un solo lugar, junto a quien te cuida.",
      "Plan, journal, objectifs, évolution et examens au même endroit, avec ceux qui vous suivent.",
    ],
  },
];

const PROFESSIONS: { icon: LucideIcon; label: Names }[] = [
  { icon: Apple, label: ["Nutrição", "Nutrition", "Nutrición", "Nutrition"] },
  { icon: Stethoscope, label: ["Medicina", "Medicine", "Medicina", "Médecine"] },
  { icon: Brain, label: ["Psicologia", "Psychology", "Psicología", "Psychologie"] },
  { icon: Dumbbell, label: ["Educação física", "Fitness", "Educación física", "Sport"] },
  { icon: Activity, label: ["Fisioterapia", "Physiotherapy", "Fisioterapia", "Kinésithérapie"] },
  { icon: HeartPulse, label: ["Enfermagem", "Nursing", "Enfermería", "Soins infirmiers"] },
];

const STEPS: { title: Names; text: Names }[] = [
  {
    title: [
      "Crie sua conta grátis",
      "Create a free account",
      "Crea tu cuenta gratis",
      "Créez un compte gratuit",
    ],
    text: [
      "Conte seus objetivos e escolha o visual do seu jeito.",
      "Share your goals and make it look your way.",
      "Cuenta tus objetivos y elige el estilo a tu manera.",
      "Indiquez vos objectifs et choisissez votre style.",
    ],
  },
  {
    title: [
      "Participe e aprenda",
      "Join in and learn",
      "Participa y aprende",
      "Participez et apprenez",
    ],
    text: [
      "Entre em comunidades, siga a trilha com a Nina e topa um desafio.",
      "Join communities, follow the track with Nina and take on a challenge.",
      "Entra en comunidades, sigue la ruta con Nina y acepta un desafío.",
      "Rejoignez des communautés, suivez le parcours avec Nina et relevez un défi.",
    ],
  },
  {
    title: [
      "Conte com um profissional",
      "Count on a professional",
      "Cuenta con un profesional",
      "Comptez sur un professionnel",
    ],
    text: [
      "Quando quiser, agende uma consulta e seja acompanhado(a) entre os encontros.",
      "Whenever you want, book a visit and get follow-up between appointments.",
      "Cuando quieras, agenda una consulta y recibe seguimiento entre encuentros.",
      "Quand vous voulez, prenez rendez-vous et soyez suivi(e) entre les séances.",
    ],
  },
];

const FAQ: { q: Names; a: Names }[] = [
  {
    q: [
      "O NutriConnect é gratuito?",
      "Is NutriConnect free?",
      "¿NutriConnect es gratis?",
      "NutriConnect est-il gratuit ?",
    ],
    a: [
      "Sim. A rede, as trilhas, as comunidades e os desafios são gratuitos. Você só paga se marcar uma consulta, pelo valor que o(a) profissional define.",
      "Yes. The network, tracks, communities and challenges are free. You only pay if you book a visit, at the price the professional sets.",
      "Sí. La red, las rutas, las comunidades y los desafíos son gratis. Solo pagas si agendas una consulta, al precio que define el profesional.",
      "Oui. Le réseau, les parcours, les communautés et les défis sont gratuits. Vous ne payez que si vous réservez une consultation, au tarif fixé par le professionnel.",
    ],
  },
  {
    q: [
      "Como sei que o profissional é de verdade?",
      "How do I know the professional is real?",
      "¿Cómo sé que el profesional es real?",
      "Comment savoir si le professionnel est réel ?",
    ],
    a: [
      "Antes de atender, cada profissional envia o registro no conselho da profissão e a equipe confere. Só quem passa ganha o selo de verificado.",
      "Before seeing patients, each professional submits their council registration and our team checks it. Only those approved get the verified badge.",
      "Antes de atender, cada profesional envía su registro y el equipo lo verifica. Solo quien aprueba recibe el sello.",
      "Avant de consulter, chaque professionnel transmet son inscription et l'équipe la vérifie. Seuls ceux validés obtiennent le badge.",
    ],
  },
  {
    q: [
      "A consulta por vídeo é segura?",
      "Are video visits secure?",
      "¿La videoconsulta es segura?",
      "La téléconsultation est-elle sûre ?",
    ],
    a: [
      "Sim. O áudio e o vídeo vão direto entre você e o(a) profissional, criptografados, e nada é gravado. Só vocês dois entram na sala.",
      "Yes. Audio and video go straight between you and the professional, encrypted, and nothing is recorded. Only the two of you can join.",
      "Sí. El audio y el video van directo entre tú y el profesional, cifrados, y nada se graba. Solo ustedes dos entran a la sala.",
      "Oui. L'audio et la vidéo passent directement entre vous et le professionnel, chiffrés, et rien n'est enregistré. Vous seuls entrez dans la salle.",
    ],
  },
  {
    q: [
      "A Nina substitui um profissional?",
      "Does Nina replace a professional?",
      "¿Nina reemplaza a un profesional?",
      "Nina remplace-t-elle un professionnel ?",
    ],
    a: [
      "Não. A Nina é uma assistente educativa: tira dúvidas do dia a dia e indica o profissional certo quando o caso pede.",
      "No. Nina is an educational assistant: she answers everyday questions and points you to the right professional when needed.",
      "No. Nina es una asistente educativa: resuelve dudas del día a día e indica al profesional adecuado cuando hace falta.",
      "Non. Nina est une assistante éducative : elle répond aux questions du quotidien et oriente vers le bon professionnel si besoin.",
    ],
  },
];

function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20", className)}
    >
      {children}
    </section>
  );
}

export function Landing() {
  const tr = useTr();
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground [&_p]:text-left">
      {/* Topo */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <span className="font-logo-serif text-xl font-bold tracking-tight">
            Nutri<span className="text-accent">Connect</span>
          </span>
          <nav className="ml-6 hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <a href="#recursos" className="hover:text-foreground">
              {tr(["Recursos", "Features", "Recursos", "Fonctionnalités"])}
            </a>
            <a href="#profissionais" className="hover:text-foreground">
              {tr([
                "Para profissionais",
                "For professionals",
                "Para profesionales",
                "Pour les pros",
              ])}
            </a>
            <a href="#duvidas" className="hover:text-foreground">
              {tr(["Dúvidas", "FAQ", "Preguntas", "FAQ"])}
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={locale}
              onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
              aria-label={tr(["Idioma", "Language", "Idioma", "Langue"])}
              className="h-9 cursor-pointer rounded-full border border-border bg-card px-2 text-xs font-semibold"
            >
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id === "pt-BR" ? "PT" : l.id.toUpperCase()}
                </option>
              ))}
            </select>
            <Link
              to="/login"
              className="inline-flex rounded-full px-2.5 py-2 text-sm font-semibold hover:bg-secondary sm:px-4"
            >
              {tr(["Entrar", "Log in", "Entrar", "Se connecter"])}
            </Link>
            <Link
              to="/cadastro"
              className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
            >
              {tr(["Criar conta", "Sign up", "Crear cuenta", "Créer un compte"])}
            </Link>
          </div>
        </div>
      </header>

      {/* Abertura */}
      <Section className="pt-10 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              {tr([
                "Rede social de alimentação e saúde",
                "A food and health social network",
                "Red social de alimentación y salud",
                "Le réseau social de l'alimentation et de la santé",
              ])}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
              {tr([
                "Comer melhor é mais fácil",
                "Eating better is easier",
                "Comer mejor es más fácil",
                "Mieux manger, c'est plus facile",
              ])}{" "}
              <span className="text-accent">{tr(["junto", "together", "juntos", "ensemble"])}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {tr([
                "Uma comunidade acolhedora para trocar receitas e experiências, aprender com trilhas divertidas e contar com profissionais de saúde verificados — com consulta por vídeo no próprio site.",
                "A welcoming community to share recipes and experiences, learn with fun tracks and count on verified health professionals — with video visits right on the site.",
                "Una comunidad acogedora para compartir recetas y experiencias, aprender con rutas divertidas y contar con profesionales de la salud verificados, con consulta por video en el propio sitio.",
                "Une communauté bienveillante pour partager recettes et expériences, apprendre avec des parcours ludiques et compter sur des professionnels de santé vérifiés — avec téléconsultation sur le site.",
              ])}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/cadastro"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
              >
                {tr([
                  "Começar grátis",
                  "Start for free",
                  "Empezar gratis",
                  "Commencer gratuitement",
                ])}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/apresentacao"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-base font-semibold transition hover:bg-secondary"
              >
                <Presentation className="h-4 w-4" />
                {tr([
                  "Ver a apresentação",
                  "See the presentation",
                  "Ver la presentación",
                  "Voir la présentation",
                ])}
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {tr([
                "Gratuito para participar. Você só paga se marcar uma consulta.",
                "Free to join. You only pay if you book a visit.",
                "Gratis para participar. Solo pagas si agendas una consulta.",
                "Gratuit pour participer. Vous ne payez que pour une consultation.",
              ])}
            </p>
          </div>

          <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]">
            <img
              src="/images/presentation/market.jpg"
              alt=""
              className="absolute left-0 top-4 h-52 w-44 -rotate-6 rounded-3xl object-cover shadow-xl ring-4 ring-card sm:h-60 sm:w-52"
            />
            <img
              src="/images/presentation/cooking-together.jpg"
              alt=""
              className="absolute right-0 top-0 h-44 w-40 rotate-6 rounded-3xl object-cover shadow-xl ring-4 ring-card sm:h-52 sm:w-48"
            />
            <img
              src="/images/presentation/meeting.jpg"
              alt=""
              className="absolute bottom-0 right-6 h-40 w-52 rotate-2 rounded-3xl object-cover shadow-xl ring-4 ring-card sm:h-44 sm:w-60"
            />
            <div className="absolute bottom-2 left-6">
              <div className="relative mb-2 max-w-[12rem] rounded-2xl bg-card px-3 py-2 text-xs font-semibold shadow-lg">
                {tr([
                  "Oi! Eu sou a Nina. Vamos juntos?",
                  "Hi! I'm Nina. Shall we go together?",
                  "¡Hola! Soy Nina. ¿Vamos juntos?",
                  "Salut ! Je suis Nina. On y va ensemble ?",
                ])}
              </div>
              <Mascot id="nina" mood="happy" size={130} />
            </div>
          </div>
        </div>
      </Section>

      {/* Recursos */}
      <Section id="recursos" className="pt-4">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {tr([
            "Tudo o que ajuda a mudar um hábito",
            "Everything that helps change a habit",
            "Todo lo que ayuda a cambiar un hábito",
            "Tout ce qui aide à changer une habitude",
          ])}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title[0]}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs"
            >
              <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", f.tone)}>
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{tr(f.title)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tr(f.text)}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Como funciona */}
      <div className="bg-primary text-primary-foreground">
        <Section>
          <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
            {tr(["Como funciona", "How it works", "Cómo funciona", "Comment ça marche"])}
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title[0]} className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-primary-foreground">
                  {tr(s.title)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/80">
                  {tr(s.text)}
                </p>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* Profissionais */}
      <Section id="profissionais">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {tr([
                "Para profissionais de saúde",
                "For health professionals",
                "Para profesionales de la salud",
                "Pour les professionnels de santé",
              ])}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {tr([
                "Seu consultório on-line, junto de quem quer cuidar da saúde",
                "Your online practice, close to people who want to take care of themselves",
                "Tu consultorio en línea, cerca de quien quiere cuidarse",
                "Votre cabinet en ligne, au plus près de ceux qui veulent prendre soin d'eux",
              ])}
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              {(
                [
                  [
                    CalendarCheck,
                    [
                      "Agenda com pagamento seguro e repasse",
                      "Scheduling with secure payment and payouts",
                      "Agenda con pago seguro y transferencia",
                      "Agenda avec paiement sécurisé et reversement",
                    ],
                  ],
                  [
                    Video,
                    [
                      "Videoconsulta no site, com ferramentas para cada profissão",
                      "Video visits on the site, with tools for each profession",
                      "Videoconsulta en el sitio, con herramientas para cada profesión",
                      "Téléconsultation sur le site, avec des outils pour chaque métier",
                    ],
                  ],
                  [
                    HeartPulse,
                    [
                      "Prontuário, avaliações, planos e acompanhamento entre consultas",
                      "Records, assessments, plans and follow-up between visits",
                      "Historia clínica, evaluaciones, planes y seguimiento",
                      "Dossier, évaluations, plans et suivi entre les séances",
                    ],
                  ],
                  [
                    MessageCircle,
                    [
                      "Selo de verificado e comunidades para compartilhar conhecimento",
                      "Verified badge and communities to share knowledge",
                      "Sello verificado y comunidades para compartir conocimiento",
                      "Badge vérifié et communautés pour partager vos connaissances",
                    ],
                  ],
                ] as [LucideIcon, Names][]
              ).map(([Icon, text]) => (
                <li key={text[0]} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="pt-1.5">{tr(text)}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/cadastro"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {tr([
                "Criar conta e enviar meu registro",
                "Sign up and submit my registration",
                "Crear cuenta y enviar mi registro",
                "Créer un compte et envoyer mon inscription",
              ])}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROFESSIONS.map(({ icon: Icon, label }) => (
              <div
                key={label[0]}
                className="flex flex-col items-center gap-2 rounded-3xl border border-border/70 bg-card p-5 text-center shadow-xs"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold">{tr(label)}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Segurança */}
      <Section className="pt-0">
        <div className="grid gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-xs sm:grid-cols-3 sm:p-8">
          {(
            [
              [
                ShieldCheck,
                ["Conteúdo conferido", "Content checked", "Contenido revisado", "Contenu vérifié"],
                [
                  "Cada post passa por análise antes de ir ao ar.",
                  "Every post is reviewed before going live.",
                  "Cada publicación se revisa antes de salir.",
                  "Chaque publication est vérifiée avant sa mise en ligne.",
                ],
              ],
              [
                Lock,
                [
                  "Chamadas criptografadas",
                  "Encrypted calls",
                  "Llamadas cifradas",
                  "Appels chiffrés",
                ],
                [
                  "Sem gravação e só com quem participa da consulta.",
                  "Never recorded, only with the people in the visit.",
                  "Sin grabación y solo con quienes participan.",
                  "Jamais enregistrés, seulement entre participants.",
                ],
              ],
              [
                HeartPulse,
                [
                  "Seus dados de saúde são seus",
                  "Your health data is yours",
                  "Tus datos de salud son tuyos",
                  "Vos données de santé vous appartiennent",
                ],
                [
                  "Usados só com seu consentimento, conforme a LGPD.",
                  "Used only with your consent, under Brazil's LGPD.",
                  "Usados solo con tu consentimiento, según la LGPD.",
                  "Utilisées uniquement avec votre accord, selon la LGPD.",
                ],
              ],
            ] as [LucideIcon, Names, Names][]
          ).map(([Icon, title, text]) => (
            <div key={title[0]} className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{tr(title)}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{tr(text)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Dúvidas */}
      <Section id="duvidas" className="pt-0">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {tr([
            "Perguntas frequentes",
            "Frequently asked questions",
            "Preguntas frecuentes",
            "Questions fréquentes",
          ])}
        </h2>
        <div className="mt-6 divide-y divide-border rounded-3xl border border-border/70 bg-card">
          {FAQ.map((f, i) => (
            <div key={f.q[0]}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left font-semibold"
              >
                <span className="flex-1">{tr(f.q)}</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition", open === i && "rotate-180")}
                />
              </button>
              {open === i && (
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{tr(f.a)}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Chamada final */}
      <Section className="pt-0">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-accent-soft px-6 py-12 text-center">
          <Mascot id="nina" mood="cheer" size={110} />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {tr([
              "Sua jornada começa agora",
              "Your journey starts now",
              "Tu camino empieza ahora",
              "Votre parcours commence maintenant",
            ])}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
            >
              {tr([
                "Criar minha conta",
                "Create my account",
                "Crear mi cuenta",
                "Créer mon compte",
              ])}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 font-semibold transition hover:bg-secondary"
            >
              {tr([
                "Já tenho conta",
                "I already have an account",
                "Ya tengo cuenta",
                "J'ai déjà un compte",
              ])}
            </Link>
          </div>
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}
