import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Atom,
  Award,
  BadgeCheck,
  BookOpen,
  Check,
  Compass,
  Stethoscope,
  GitBranch,
  HeartHandshake,
  Home,
  Map as MapIcon,
  MessagesSquare,
  Minus,
  Palette,
  Presentation,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Mascot } from "@/components/mascots";
import type { NinaAction } from "@/components/nina-live";
import { ACCENT_PRESETS } from "@/lib/appearance-data";
import { fireConfetti } from "@/lib/confetti";
import type { Persona, PresentationCopy, TourSlide } from "@/lib/i18n/presentation";
import {
  CountUp,
  FoodField,
  Marquee,
  Polaroid,
  RisingEmojis,
  Scribble,
  useStatic,
} from "./effects";
import {
  AppearanceMock,
  ChallengesMock,
  CommunitiesMock,
  DiscoverMock,
  CareMock,
  FeedMock,
  ProfileMock,
  TrailMock,
} from "./mockups";
import {
  CodeEditor,
  CompetitorOrbit,
  FlipCard,
  PainToasts,
  ProBadge,
  ProblemVisual,
  StickyNote,
  ThoughtBubbles,
  TrailMap,
  Venn,
} from "./scenes";
import {
  Blob,
  Eyebrow,
  FRUITS,
  Frame,
  Heading,
  IconBadge,
  Scene,
  SpeechBubble,
  StageNina,
  Words,
} from "./layout";
import { NinaIntroSlide, PRESENTERS, TeamRoster } from "./parts";
import { EmojiIcon } from "@/components/emoji-icon";

export interface SlideApi {
  next: () => void;
  goTo: (index: number) => void;
  /** Vai ao slide com este id (ignora se estiver escondido). */
  goToId: (id: string) => void;
  /** Índice da divisória de cada parte (atalhos 1–5 e "Quem somos"). */
  partStarts: number[];
}

export interface SlideDef {
  id: string;
  /** Parte da apresentação (0–4), ou seja, qual integrante apresenta. */
  part: number;
  nina: (c: PresentationCopy) => string;
  /** O que a Nina do rodapé faz neste slide (padrão: falar). */
  ninaAction?: NinaAction;
  /** Nome curto do assunto, usado no roteiro da divisória de cada parte. */
  label?: (c: PresentationCopy) => string;
  /** O slide já mostra a Nina grande; o rodapé não repete a personagem. */
  hideNarrator?: boolean;
  render: (c: PresentationCopy, api: SlideApi) => React.ReactNode;
}

// ───────────────────────── 1. Capa ─────────────────────────

function Cover(c: PresentationCopy, api: SlideApi) {
  const ribbon = [
    ...Object.values(c.tour).map((t) => t.eyebrow),
    ...c.differentials.items.map((d) => d.title),
  ];
  return (
    <Scene>
      <Blob className="-right-24 -top-24 h-96 w-96 bg-accent/25" />
      <Blob className="-bottom-24 -left-16 h-80 w-80 bg-primary/25" />
      <FoodField items={FRUITS} />
      <Frame>
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Eyebrow>
              <Sparkles className="h-3.5 w-3.5" /> {c.cover.eyebrow}
            </Eyebrow>
            <p
              className="nc-rise mt-6 font-logo-serif text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ animationDelay: "100ms" }}
            >
              Nutri<span className="text-accent">Connect</span>
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              <Words text={c.cover.title} delay={200} />
              <span className="relative inline-block text-accent">
                <Words text={c.cover.highlight} delay={500} />
                <Scribble className="-bottom-2 h-4 text-accent/60" />
              </span>
            </h1>
            <p
              className="nc-rise mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "700ms" }}
            >
              {c.cover.subtitle}
            </p>
            <button
              type="button"
              onClick={api.next}
              className="nc-rise group relative mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 print:hidden"
              style={{ animationDelay: "900ms" }}
            >
              <span className="nc-ring absolute inset-0 rounded-full bg-accent/40" />
              <span className="relative">{c.cover.start}</span>
              <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <p className="mt-4 hidden text-xs text-muted-foreground sm:block print:hidden">
              ⌨️ {c.ui.keyboardHint}
            </p>
          </div>

          <div className="relative mx-auto hidden h-[440px] w-full max-w-[460px] sm:block">
            <div
              className="nc-parallax absolute left-0 top-6"
              style={{ "--depth": "14px" } as React.CSSProperties}
            >
              <Polaroid
                src="/images/presentation/market.jpg"
                className="nc-drop-in"
                style={{ "--nc-rot": "-9deg", animationDelay: "300ms" } as React.CSSProperties}
                rotate={-9}
                imgClassName="h-40 w-40"
              />
            </div>
            <div
              className="nc-parallax absolute right-0 top-0"
              style={{ "--depth": "22px" } as React.CSSProperties}
            >
              <Polaroid
                src="/images/presentation/breakfast-plate.jpg"
                className="nc-drop-in"
                style={{ "--nc-rot": "7deg", animationDelay: "500ms" } as React.CSSProperties}
                rotate={7}
                imgClassName="h-36 w-36"
              />
            </div>
            <div
              className="nc-parallax absolute bottom-10 right-4"
              style={{ "--depth": "10px" } as React.CSSProperties}
            >
              <Polaroid
                src="/images/presentation/salad-dark.jpg"
                className="nc-drop-in"
                style={{ "--nc-rot": "-4deg", animationDelay: "700ms" } as React.CSSProperties}
                rotate={-4}
                imgClassName="h-32 w-36"
                tape={false}
              />
            </div>
            <div className="absolute bottom-0 left-[18%] flex flex-col items-center">
              <SpeechBubble text={c.cover.nina} delay={1100} />
              <StageNina action="wave" className="h-[300px] w-[220px]" />
            </div>
          </div>
          <div className="flex flex-col items-center sm:hidden">
            <SpeechBubble text={c.cover.nina} />
            <StageNina action="wave" className="h-60 w-44" />
          </div>
        </div>
      </Frame>
      <Marquee
        items={ribbon}
        className="relative z-10 border-y border-border/70 bg-card/70 py-3 font-display text-base font-bold text-foreground/80 backdrop-blur sm:text-lg"
      />
    </Scene>
  );
}

// ───────────────────────── 2. Problema ─────────────────────────

function Problem(c: PresentationCopy) {
  return (
    <Scene>
      <Blob className="-right-32 top-10 h-96 w-96 bg-destructive/10" />
      <Frame wide>
        <Heading eyebrow={c.problem.eyebrow} title={c.problem.title} lead={c.problem.intro} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.problem.items.map((item, i) => (
            <div
              key={item.title}
              className="nc-rise"
              style={{ animationDelay: `${300 + i * 120}ms` }}
            >
              <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                <div className="grid h-28 place-items-center">
                  <ProblemVisual index={i} c={c} />
                </div>
                <p className="mt-3 font-display text-4xl font-bold leading-none text-accent">
                  <CountUp value={item.stat} delay={400 + i * 150} />
                </p>
                <h3 className="mt-3 text-lg font-bold leading-snug">{item.title}</h3>
                <p className="mt-1 text-sm font-medium">{item.statLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                <p className="mt-auto pt-3 text-[11px] italic text-muted-foreground">
                  {c.ui.source}: {item.source}
                </p>
              </article>
            </div>
          ))}
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 3. Solução ─────────────────────────

const PILLAR_ICONS: LucideIcon[] = [Users, BookOpen, ShieldCheck];

function Solution(c: PresentationCopy) {
  return (
    <Scene>
      <FoodField items={["🥗", "📚", "🤝", "✅", "💬"]} count={5} opacity={0.5} />
      <Frame>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Heading eyebrow={c.solution.eyebrow} title={c.solution.title} lead={c.solution.text} />
            <div className="mt-8 space-y-4">
              {c.solution.pillars.map((p, i) => (
                <div
                  key={p.title}
                  className="nc-rise flex items-start gap-4"
                  style={{ animationDelay: `${500 + i * 150}ms` }}
                >
                  <IconBadge icon={PILLAR_ICONS[i]} tone={i === 1 ? "accent" : "primary"} />
                  <div>
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Venn pillars={c.solution.pillars} icons={PILLAR_ICONS} />
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 4. Diferenciais ─────────────────────────

const DIFF_ICONS: LucideIcon[] = [MessagesSquare, BadgeCheck, Trophy, HeartHandshake];
const DIFF_EMOJIS = ["🤝", "✅", "🏆", "💛"];

function Differentials(c: PresentationCopy) {
  return (
    <Scene>
      <Blob className="-left-24 bottom-0 h-80 w-80 bg-accent/15" />
      <Frame wide>
        <Heading eyebrow={c.differentials.eyebrow} title={c.differentials.title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.differentials.items.map((d, i) => (
            <FlipCard
              key={d.title}
              index={i}
              emoji={DIFF_EMOJIS[i]}
              icon={DIFF_ICONS[i]}
              title={d.title}
              text={d.text}
              hint={c.ui.flipHint}
            />
          ))}
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 5–6. Personas ─────────────────────────

function QuoteBlock({ quote }: { quote: string }) {
  return (
    <blockquote
      className="nc-rise relative mt-5 pl-8 font-display text-xl font-bold leading-snug sm:text-2xl"
      style={{ animationDelay: "300ms" }}
    >
      <span className="absolute -left-1 -top-4 font-display text-6xl leading-none text-accent/40">
        “
      </span>
      {quote}
    </blockquote>
  );
}

function ListCard({
  label,
  items,
  bullets,
  delay,
}: {
  label: string;
  items: string[];
  bullets: string[];
  delay: number;
}) {
  return (
    <div
      className="nc-rise rounded-2xl border border-border bg-card p-4 shadow-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">{label}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={it} className="flex gap-2 text-sm leading-snug">
            <span
              className="nc-pop shrink-0"
              style={{ animationDelay: `${delay + 200 + i * 120}ms` }}
            >
              <EmojiIcon emoji={bullets[i % bullets.length]} className="h-5 w-5 text-accent" />
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HelpsBand({ label, text }: { label: string; text: string }) {
  return (
    <div
      className="nc-rise mt-4 flex items-center gap-3 overflow-hidden rounded-2xl bg-primary py-2 pl-2 pr-5 text-primary-foreground shadow-card"
      style={{ animationDelay: "900ms" }}
    >
      <Mascot id="nina" mood="talk" size={56} />
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{label}</h4>
        <p className="text-sm font-medium leading-snug sm:text-base">{text}</p>
      </div>
    </div>
  );
}

function PersonaUser(c: PresentationCopy) {
  const p = c.personas;
  const u: Persona = p.user;
  return (
    <Scene>
      <Blob className="-left-20 top-10 h-96 w-96 bg-accent/20" />
      <FoodField items={["📱", "🍕", "🥗", "💭"]} count={4} opacity={0.45} />
      <Frame wide>
        <div className="grid items-center gap-10 lg:grid-cols-[380px_1fr]">
          <div className="relative mx-auto w-fit pt-4">
            <Polaroid
              src="/images/professionals/prof-1.jpg"
              className="nc-drop-in"
              style={{ "--nc-rot": "-4deg" } as React.CSSProperties}
              rotate={-4}
              imgClassName="h-72 w-56 object-top"
              caption={`${u.name}, ${u.age}`}
            />
            <ThoughtBubbles items={u.pains} />
          </div>
          <div>
            <Heading eyebrow={p.eyebrow} title={p.userTitle} />
            <p
              className="nc-rise mt-2 text-sm text-muted-foreground"
              style={{ animationDelay: "200ms" }}
            >
              {u.role} · {u.city}
            </p>
            <QuoteBlock quote={u.quote} />
            <p
              className="nc-rise mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground"
              style={{ animationDelay: "400ms" }}
            >
              {u.bio}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <ListCard
                label={p.goalsLabel}
                items={u.goals}
                bullets={["🎯", "🍳", "👯"]}
                delay={500}
              />
              <ListCard
                label={p.digitalLabel}
                items={u.digital}
                bullets={["📱", "📸", "🦉"]}
                delay={650}
              />
            </div>
            <HelpsBand label={p.helpsLabel} text={u.helps} />
          </div>
        </div>
      </Frame>
    </Scene>
  );
}

function PersonaPro(c: PresentationCopy) {
  const p = c.personas;
  const u: Persona = p.pro;
  return (
    <Scene>
      <Blob className="-right-20 top-0 h-96 w-96 bg-primary/20" />
      <FoodField items={["🩺", "📊", "🥦", "💬"]} count={4} opacity={0.45} />
      <Frame wide>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <Heading eyebrow={p.eyebrow} title={p.proTitle} />
            <p
              className="nc-rise mt-2 text-sm text-muted-foreground"
              style={{ animationDelay: "200ms" }}
            >
              {u.role} · {u.city}
            </p>
            <QuoteBlock quote={u.quote} />
            <p
              className="nc-rise mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground"
              style={{ animationDelay: "400ms" }}
            >
              {u.bio}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                  {p.painsLabel}
                </h4>
                <PainToasts items={u.pains} />
              </div>
              <ListCard
                label={p.goalsLabel}
                items={u.goals}
                bullets={["📣", "🏅", "🤝"]}
                delay={600}
              />
            </div>
            <HelpsBand label={p.helpsLabel} text={u.helps} />
          </div>
          <ProBadge persona={u} stamp={p.verifiedStamp} ageSuffix={p.ageSuffix} />
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 7. Concorrentes ─────────────────────────

function Competitors(c: PresentationCopy) {
  return (
    <Scene>
      <Blob className="left-1/4 top-1/3 h-96 w-96 bg-accent/10" />
      <Frame wide>
        <Heading eyebrow={c.competitors.eyebrow} title={c.competitors.title} />
        <div className="mt-6">
          <CompetitorOrbit c={c} />
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 8. Comparativo ─────────────────────────

type Mark = "y" | "p" | "n";

const COMPARISON_COLUMNS = [
  "NutriConnect",
  "Tecnonutri",
  "MyFitnessPal",
  "Lifesum",
  "Yazio",
  "FatSecret",
  "Instagram / TikTok",
  "TudoGostoso",
  "Duolingo",
];

// Uma linha por recurso (mesma ordem de copy.comparison.features), uma coluna por produto.
const COMPARISON: Mark[][] = [
  ["y", "y", "p", "n", "n", "p", "y", "p", "p"],
  ["y", "n", "n", "n", "n", "n", "n", "n", "p"],
  ["y", "p", "n", "n", "n", "n", "n", "n", "n"],
  ["y", "n", "n", "p", "n", "n", "n", "n", "n"],
  ["y", "p", "p", "p", "p", "p", "y", "y", "n"],
  ["y", "n", "n", "n", "n", "n", "n", "n", "n"],
];

const SCORES = COMPARISON_COLUMNS.map((_, col) =>
  COMPARISON.reduce((sum, row) => sum + (row[col] === "y" ? 1 : row[col] === "p" ? 0.5 : 0), 0),
);

function MarkIcon({ mark, c, delay }: { mark: Mark; c: PresentationCopy; delay?: number }) {
  const label =
    mark === "y" ? c.comparison.yes : mark === "p" ? c.comparison.partial : c.comparison.no;
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`mx-auto grid h-7 w-7 place-items-center rounded-full ${delay !== undefined ? "nc-pop" : ""} ${
        mark === "y"
          ? "bg-primary text-primary-foreground"
          : mark === "p"
            ? "bg-warning/20 text-warning"
            : "bg-secondary text-muted-foreground"
      }`}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
    >
      {mark === "y" ? (
        <Check className="h-4 w-4" />
      ) : mark === "p" ? (
        <span className="h-3 w-3 rounded-full border-2 border-current [background:linear-gradient(90deg,currentColor_50%,transparent_50%)]" />
      ) : (
        <Minus className="h-4 w-4" />
      )}
    </span>
  );
}

function Comparison(c: PresentationCopy) {
  const max = COMPARISON.length;
  return (
    <Scene>
      <Frame wide>
        <Heading eyebrow={c.comparison.eyebrow} title={c.comparison.title} />
        <div className="nc-rise mt-6 overflow-x-auto rounded-3xl border border-border bg-card shadow-card">
          <table className="w-full min-w-[780px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-[24%] p-3" />
                {COMPARISON_COLUMNS.map((name, i) => (
                  <th
                    key={name}
                    scope="col"
                    className={`p-3 text-center text-xs font-semibold ${
                      i === 0
                        ? "rounded-t-2xl bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {i === 0 ? (
                      <>
                        <EmojiIcon emoji={"🏆"} className="mr-1 inline h-4 w-4 align-[-2px]" />
                        {name}
                      </>
                    ) : (
                      name
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.comparison.features.map((feature, r) => (
                <tr
                  key={feature}
                  className="nc-rise border-t border-border transition-colors hover:bg-secondary/60"
                  style={{ animationDelay: `${200 + r * 110}ms` }}
                >
                  <th scope="row" className="p-3 text-left font-medium">
                    {feature}
                  </th>
                  {COMPARISON[r].map((mark, col) => (
                    <td
                      key={col}
                      className={`p-2 text-center ${col === 0 ? "bg-accent-soft" : ""}`}
                    >
                      <MarkIcon mark={mark} c={c} delay={300 + r * 110 + col * 45} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <th
                  scope="row"
                  className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-accent"
                >
                  {c.comparison.score}
                </th>
                {SCORES.map((score, col) => (
                  <td
                    key={col}
                    className={`p-2 ${col === 0 ? "rounded-b-2xl bg-accent-soft" : ""}`}
                  >
                    <div className="mx-auto flex h-16 w-7 items-end overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`nc-grow-y w-full rounded-full ${col === 0 ? "bg-accent" : "bg-primary/60"}`}
                        style={{
                          height: `${Math.max(6, (score / max) * 100)}%`,
                          animationDelay: `${1100 + col * 90}ms`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-center text-xs font-bold tabular-nums">
                      {score.toLocaleString(undefined, { maximumFractionDigits: 1 })}/{max}
                    </p>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {(["y", "p", "n"] as Mark[]).map((m) => (
            <span key={m} className="flex items-center gap-1.5">
              <MarkIcon mark={m} c={c} />
              {m === "y" ? c.comparison.yes : m === "p" ? c.comparison.partial : c.comparison.no}
            </span>
          ))}
          <span className="basis-full italic sm:basis-auto">{c.comparison.note}</span>
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 9. Canvas ─────────────────────────

// Posição de cada bloco no quadro clássico do Business Model Canvas (mesma ordem de copy.canvas.blocks).
const CANVAS_PLACEMENT = [
  "lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-3",
  "lg:col-start-3 lg:col-end-5 lg:row-start-1 lg:row-end-2",
  "lg:col-start-3 lg:col-end-5 lg:row-start-2 lg:row-end-3",
  "lg:col-start-5 lg:col-end-7 lg:row-start-1 lg:row-end-3",
  "lg:col-start-7 lg:col-end-9 lg:row-start-1 lg:row-end-2",
  "lg:col-start-7 lg:col-end-9 lg:row-start-2 lg:row-end-3",
  "lg:col-start-9 lg:col-end-11 lg:row-start-1 lg:row-end-3",
  "lg:col-start-1 lg:col-end-6 lg:row-start-3 lg:row-end-4",
  "lg:col-start-6 lg:col-end-11 lg:row-start-3 lg:row-end-4",
];
const VALUE_BLOCK = 3;

function Canvas(c: PresentationCopy) {
  return (
    <Scene>
      <Frame wide>
        <Heading eyebrow={c.canvas.eyebrow} title={c.canvas.title} />
        <div className="nc-board mt-6 rounded-3xl border border-border p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-10">
            {c.canvas.blocks.map((b, i) => (
              <StickyNote
                key={b.title}
                index={i}
                title={b.title}
                items={b.items}
                highlight={i === VALUE_BLOCK}
                value={i === VALUE_BLOCK ? c.canvas.value : undefined}
                className={`${CANVAS_PLACEMENT[i]} ${i === VALUE_BLOCK ? "sm:col-span-2" : ""}`}
              />
            ))}
          </div>
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── Planejamento financeiro ─────────────────────────

const FIN_COSTS = [99, 100, 89, 8000];
const FIN_TOTAL = FIN_COSTS.reduce((a, b) => a + b, 0); // 8.288
/** Taxa da plataforma sobre consultas pagas pelo site (platform_fee_percent). */
const FIN_CONSULT_FEE = 10;
/** Taxa sobre as mensalidades de membros em cada nível do profissional (pro_levels). */
const FIN_MEMBER_FEES = [20, 18, 15, 12, 10];
const FIN_AD_RATE = 0.5;

function Finance(c: PresentationCopy) {
  const f = c.finance;
  const money = (n: number) =>
    new Intl.NumberFormat(f.numberLocale, {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(n);
  const int = (n: number) => new Intl.NumberFormat(f.numberLocale).format(n);
  const fill = (text: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce((t, [k, v]) => t.replace(`{${k}}`, v), text);
  // Quanto precisa passar pela plataforma para a taxa cobrir os custos.
  const needed = (fee: number) => Math.ceil((FIN_TOTAL * 100) / fee);
  const consultNeed = needed(FIN_CONSULT_FEE);
  const maxNeed = needed(Math.min(...FIN_MEMBER_FEES, FIN_CONSULT_FEE));
  const ads = Math.ceil(FIN_TOTAL / FIN_AD_RATE); // 16.576
  const adsDay = Math.round(ads / 30);

  const Bar = ({ value, delay, tone }: { value: number; delay: number; tone: string }) => (
    <div className="mt-1 h-2 overflow-hidden rounded-full bg-card">
      <div
        className={`nc-grow-x h-full rounded-full ${tone}`}
        style={{ width: `${Math.max(4, (value / maxNeed) * 100)}%`, animationDelay: `${delay}ms` }}
      />
    </div>
  );

  return (
    <Scene>
      <Blob className="-right-24 top-10 h-80 w-80 bg-accent/15" />
      <Frame wide>
        <Heading eyebrow={f.eyebrow} title={f.title} lead={f.lead} />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Custos */}
          <section
            className="nc-rise rounded-3xl border border-border bg-card p-5 shadow-card"
            style={{ animationDelay: "200ms" }}
          >
            <h3 className="font-display text-lg font-bold">{f.costsTitle}</h3>
            <ul className="mt-3 space-y-2.5">
              {FIN_COSTS.map((v, i) => (
                <li key={f.costs[i]}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-foreground">{f.costs[i]}</span>
                    <span className="font-semibold tabular-nums">{money(v)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="nc-grow-x h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.max(3, (v / FIN_TOTAL) * 100)}%`,
                        animationDelay: `${400 + i * 120}ms`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-muted-foreground">{f.totalLabel}</span>
              <span className="font-display text-2xl font-extrabold text-foreground">
                {money(FIN_TOTAL)}
                <span className="text-xs font-medium text-muted-foreground">{f.perMonth}</span>
              </span>
            </div>
          </section>

          {/* Como a plataforma ganha */}
          <section
            className="nc-rise rounded-3xl border border-accent/30 bg-accent-soft/40 p-5 shadow-card"
            style={{ animationDelay: "320ms" }}
          >
            <h3 className="font-display text-lg font-bold">{f.revTitle}</h3>
            <p className="mt-1 rounded-2xl bg-card/80 p-2.5 text-sm font-medium leading-snug">
              {f.noSub}
            </p>
            <h4 className="mt-3 text-sm font-bold">{f.consultTitle}</h4>
            <p className="text-sm text-muted-foreground">
              {fill(f.consultText, { fee: `${FIN_CONSULT_FEE}%` })}
            </p>
            <h4 className="mt-2 text-sm font-bold">{f.membersTitle}</h4>
            <p className="text-sm text-muted-foreground">
              {fill(f.membersText, { fee: `${FIN_MEMBER_FEES[0]}%` })}
            </p>
          </section>

          {/* Quanto precisa passar pela plataforma + anúncios */}
          <section
            className="nc-rise rounded-3xl border border-border bg-card p-5 shadow-card"
            style={{ animationDelay: "440ms" }}
          >
            <h3 className="font-display text-sm font-bold leading-snug">
              {fill(f.needTitle, { total: money(FIN_TOTAL) })}
            </h3>
            <div className="mt-2">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>{fill(f.needConsult, { fee: `${FIN_CONSULT_FEE}%` })}</span>
                <span className="font-semibold tabular-nums">{money(consultNeed)}</span>
              </div>
              <Bar value={consultNeed} delay={600} tone="bg-primary" />
            </div>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">{f.needMembers}</p>
            <ul className="mt-1 space-y-1.5">
              {FIN_MEMBER_FEES.map((fee, i) => (
                <li key={fee}>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span>{fill(f.levelLabel, { n: String(i + 1), fee: `${fee}%` })}</span>
                    <span className="font-semibold tabular-nums">{money(needed(fee))}</span>
                  </div>
                  <Bar value={needed(fee)} delay={750 + i * 100} tone="bg-accent" />
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
                {f.adsTitle}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">{f.adsRate}</p>
              <p className="text-sm">{fill(f.adsAlone, { n: int(ads), d: int(adsDay) })}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <b className="text-foreground">{f.otherTitle}:</b> {f.otherText}
              </p>
            </div>
          </section>
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 10. Curso ─────────────────────────

const COURSE_ICONS: LucideIcon[] = [Smartphone, Atom, GitBranch, Presentation];
const STACK = [
  "HTML",
  "CSS",
  "Tailwind CSS",
  "JavaScript",
  "React",
  "TanStack Router",
  "Git",
  "GitHub",
  "Lovable",
  "Supabase",
];

function Course(c: PresentationCopy) {
  const k = c.course;
  return (
    <Scene>
      <Blob className="-right-20 bottom-0 h-96 w-96 bg-primary/15" />
      <Frame wide>
        <div className="flex items-start justify-between gap-8">
          <Heading eyebrow={k.eyebrow} title={k.title} lead={k.intro} />
          <Polaroid
            src="/images/presentation/meeting.jpg"
            className="nc-drop-in hidden shrink-0 lg:block"
            style={{ "--nc-rot": "4deg", animationDelay: "300ms" } as React.CSSProperties}
            rotate={4}
            imgClassName="h-32 w-44"
          />
        </div>
        <div className="mt-7">
          <CodeEditor
            items={k.items}
            icons={COURSE_ICONS}
            learnedLabel={k.learnedLabel}
            appliedLabel={k.appliedLabel}
          />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {k.stackLabel}
        </p>
        <Marquee
          items={STACK}
          className="mt-2 rounded-full border border-border bg-card py-2 text-sm font-semibold text-foreground/80"
        />
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 11. Tour: abertura ─────────────────────────

type TourKey = keyof PresentationCopy["tour"];

const TOUR_ORDER: { key: TourKey; icon: LucideIcon }[] = [
  { key: "feed", icon: Home },
  { key: "profile", icon: UserRound },
  { key: "appearance", icon: Palette },
  { key: "trails", icon: MapIcon },
  { key: "communities", icon: Users },
  { key: "challenges", icon: Award },
  { key: "discover", icon: Compass },
  { key: "care", icon: Stethoscope },
];

function TourIntro(c: PresentationCopy, goToStop: (i: number) => void) {
  const stops = TOUR_ORDER.map(({ key, icon }) => ({ label: c.tour[key].eyebrow, icon }));
  return (
    <Scene className="bg-primary text-primary-foreground">
      <Blob className="-right-20 -top-20 h-96 w-96 bg-accent/35" />
      <Blob className="-bottom-24 left-10 h-80 w-80 bg-chart-4/30" />
      <FoodField items={FRUITS} opacity={0.35} />
      <Frame wide>
        <Heading
          eyebrow={c.tourIntro.eyebrow}
          title={c.tourIntro.title}
          lead={c.tourIntro.text}
          light
        />
        <div className="mt-10 hidden md:block">
          <TrailMap stops={stops} onPick={(i) => goToStop(i)} />
        </div>
        <ol className="mt-8 grid gap-2 sm:grid-cols-2 md:hidden">
          {stops.map(({ label, icon: Icon }, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => goToStop(i)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 text-left text-sm font-medium backdrop-blur transition hover:bg-white/20"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </button>
            </li>
          ))}
        </ol>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── 12–18. Tour: telas ─────────────────────────

/** Gotas caindo (desafio da água). */
function DropRain() {
  const lanes = [6, 18, 31, 44, 57, 70, 83, 94];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {lanes.map((left, i) => (
        <span
          key={left}
          className="nc-rain absolute top-0 text-xl"
          style={
            {
              left: `${left}%`,
              animationDelay: `${(i * 0.47) % 3.8}s`,
              "--nc-fall": "900px",
            } as React.CSSProperties
          }
        >
          <EmojiIcon emoji={"💧"} className="h-[1em] w-[1em]" tinted />
        </span>
      ))}
    </div>
  );
}

function TourLayout({
  slide,
  flip,
  ambient,
  glow = "bg-accent/20",
  glowStyle,
  children,
}: {
  slide: TourSlide;
  flip: boolean;
  ambient?: React.ReactNode;
  glow?: string;
  glowStyle?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Scene>
      <div
        className={`absolute inset-y-0 w-full lg:w-1/2 ${flip ? "left-0" : "right-0"}`}
        aria-hidden
      >
        <div
          className={`nc-parallax absolute left-[15%] top-[20%] h-[26rem] w-[26rem] max-w-[90%] rounded-full blur-3xl transition-colors duration-500 ${glow}`}
          style={{ "--depth": "-18px", ...glowStyle } as React.CSSProperties}
        />
        {ambient}
      </div>
      <Frame wide>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className={flip ? "lg:order-2" : ""}>
            <Heading eyebrow={slide.eyebrow} title={slide.title} lead={slide.text} />
            <ul className="mt-6 space-y-2.5">
              {slide.bullets.map((b, i) => (
                <li
                  key={b}
                  className="nc-rise flex items-start gap-3 text-sm sm:text-base"
                  style={{ animationDelay: `${450 + i * 110}ms` }}
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`nc-rise ${flip ? "lg:order-1" : ""}`}
            style={{ animationDelay: "200ms" }}
          >
            <div className="nc-tilt">{children}</div>
          </div>
        </div>
      </Frame>
    </Scene>
  );
}

/** Personalização: a cor escolhida no mockup tinge o brilho do slide inteiro. */
function AppearanceSlide({ c, flip }: { c: PresentationCopy; flip: boolean }) {
  const [accent, setAccent] = useState<string>(ACCENT_PRESETS[0].value);
  return (
    <TourLayout
      slide={c.tour.appearance}
      flip={flip}
      glow=""
      glowStyle={{ background: `color-mix(in oklab, ${accent} 35%, transparent)` }}
      ambient={<FoodField items={["🎨", "🖌️", "✨", "🌈", "🔤"]} count={5} opacity={0.7} />}
    >
      <AppearanceMock mock={c.mock} accent={accent} onAccent={setAccent} />
    </TourLayout>
  );
}

function tourSlide(key: TourKey, c: PresentationCopy, flip: boolean) {
  const slide = c.tour[key];
  switch (key) {
    case "feed":
      return (
        <TourLayout
          slide={slide}
          flip={flip}
          ambient={<RisingEmojis items={["❤️", "😋", "👏", "🥑", "💬", "✨"]} />}
        >
          <FeedMock mock={c.mock} />
        </TourLayout>
      );
    case "profile":
      return (
        <TourLayout
          slide={slide}
          flip={flip}
          glow="bg-primary/20"
          ambient={<FoodField items={["🌱", "🍃", "🌸", "🍎", "🌳", "👑", "✨"]} count={7} />}
        >
          <ProfileMock mock={c.mock} />
        </TourLayout>
      );
    case "appearance":
      return <AppearanceSlide c={c} flip={flip} />;
    case "trails":
      return (
        <TourLayout
          slide={slide}
          flip={flip}
          glow="bg-warning/25"
          ambient={<FoodField items={["⭐", "👑", "💎", "🔥", "❤️", "🏅"]} count={6} />}
        >
          <TrailMock mock={c.mock} />
        </TourLayout>
      );
    case "communities":
      return (
        <TourLayout
          slide={slide}
          flip={flip}
          glow="bg-primary/20"
          ambient={<FoodField items={["🍲", "🥗", "🍝", "🥘", "💬", "🤝"]} count={6} />}
        >
          <CommunitiesMock mock={c.mock} />
        </TourLayout>
      );
    case "challenges":
      return (
        <TourLayout slide={slide} flip={flip} glow="bg-[#38bdf8]/20" ambient={<DropRain />}>
          <ChallengesMock mock={c.mock} />
        </TourLayout>
      );
    case "discover":
      return (
        <TourLayout
          slide={slide}
          flip={flip}
          ambient={<FoodField items={["🔍", "🥕", "🍋", "🍅", "🥦", "🍓", "📖"]} count={7} />}
        >
          <DiscoverMock mock={c.mock} />
        </TourLayout>
      );
    case "care":
      return (
        <TourLayout
          slide={slide}
          flip={flip}
          glow="bg-emerald-500/20"
          ambient={<FoodField items={["🩺", "💬", "📋", "💚", "📅"]} count={5} opacity={0.6} />}
        >
          <CareMock mock={c.mock} />
        </TourLayout>
      );
  }
}

// ───────────────────────── 20. Convite ─────────────────────────

function Celebrate() {
  const isStatic = useStatic();
  useEffect(() => {
    if (isStatic) return;
    const id = window.setTimeout(() => {
      fireConfetti({ x: 0.3, y: 0.55, angle: 300, emojis: ["🥑", "🍓", "🥕", "🍋"] });
      fireConfetti({ x: 0.75, y: 0.6, angle: 240, emojis: ["🥗", "💛", "✨"] });
    }, 500);
    return () => window.clearTimeout(id);
  }, [isStatic]);
  return null;
}

function Join(c: PresentationCopy, api: SlideApi) {
  const j = c.join;
  return (
    <Scene>
      <Celebrate />
      <Blob className="-left-24 -top-24 h-96 w-96 bg-accent/25" />
      <Blob className="-bottom-24 -right-16 h-96 w-96 bg-primary/25" />
      <FoodField items={FRUITS} />
      <Frame>
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow>{j.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              <Words text={j.title} delay={150} />
            </h2>
            <p
              className="nc-rise mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "450ms" }}
            >
              {j.text}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {j.perks.map((perk, i) => (
                <li
                  key={perk}
                  className="nc-pop flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary"
                  style={{ animationDelay: `${600 + i * 120}ms` }}
                >
                  <Check className="h-4 w-4" /> {perk}
                </li>
              ))}
            </ul>
            <div
              className="nc-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "900ms" }}
            >
              <Link
                to="/cadastro"
                className="group relative inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
              >
                <span className="nc-ring absolute inset-0 rounded-full bg-accent/40" />
                <span className="relative">{j.primary}</span>
                <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition hover:bg-secondary"
              >
                {j.secondary}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => api.goTo(0)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground print:hidden"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {j.replay}
            </button>
          </div>
          <div className="relative mx-auto flex h-[420px] w-full max-w-[420px] flex-col items-center justify-end">
            <div className="absolute left-0 top-4 hidden sm:block">
              <Polaroid
                src="/images/presentation/friends.jpg"
                className="nc-drop-in"
                style={{ "--nc-rot": "-8deg", animationDelay: "400ms" } as React.CSSProperties}
                rotate={-8}
                imgClassName="h-32 w-36"
              />
            </div>
            <div className="absolute right-0 top-16 hidden sm:block">
              <Polaroid
                src="/images/presentation/cooking-together.jpg"
                className="nc-drop-in"
                style={{ "--nc-rot": "6deg", animationDelay: "600ms" } as React.CSSProperties}
                rotate={6}
                imgClassName="h-32 w-36"
              />
            </div>
            <SpeechBubble text={j.nina} delay={900} />
            <StageNina action="cheer" className="h-[300px] w-[240px]" />
          </div>
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── Sequência: 5 partes, uma por integrante ─────────────────────────

type Draft = Omit<SlideDef, "part">;

const tour = (key: TourKey, flip: boolean, ninaAction?: NinaAction): Draft => ({
  id: `tour-${key}`,
  nina: (c) => c.tour[key].nina,
  ninaAction,
  label: (c) => c.tour[key].eyebrow,
  render: (c) => tourSlide(key, c, flip),
});

const PART_SLIDES: Draft[][] = [
  // 1 · Maria Stella (líder): abertura, equipe e o problema.
  [
    { id: "capa", nina: (c) => c.cover.nina, hideNarrator: true, render: Cover },
    {
      id: "equipe",
      nina: (c) => c.team.nina,
      ninaAction: "wave",
      label: (c) => c.team.eyebrow,
      render: (c, api) => <TeamRoster c={c} api={api} partStarts={api.partStarts} />,
    },
    {
      id: "problema",
      nina: (c) => c.problem.nina,
      ninaAction: "sad",
      label: (c) => c.problem.eyebrow,
      render: Problem,
    },
  ],
  // 2 · Cainã: a solução, diferenciais, a Nina e o modelo de negócio.
  [
    {
      id: "solucao",
      nina: (c) => c.solution.nina,
      ninaAction: "happy",
      label: (c) => c.solution.eyebrow,
      render: Solution,
    },
    {
      id: "diferenciais",
      nina: (c) => c.differentials.nina,
      ninaAction: "present",
      label: (c) => c.differentials.eyebrow,
      render: Differentials,
    },
    {
      id: "nina",
      nina: (c) => c.ninaIntro.nina,
      hideNarrator: true,
      label: (c) => c.ninaIntro.eyebrow,
      render: (c) => <NinaIntroSlide c={c} />,
    },
    {
      id: "canvas",
      nina: (c) => c.canvas.nina,
      ninaAction: "think",
      label: (c) => c.canvas.eyebrow,
      render: Canvas,
    },
  ],
  // 3 · Alice: mercado (personas e concorrentes).
  [
    {
      id: "persona-usuario",
      nina: (c) => c.personas.ninaUser,
      label: (c) => c.personas.eyebrow,
      render: PersonaUser,
    },
    {
      id: "persona-profissional",
      nina: (c) => c.personas.ninaPro,
      label: (c) => c.personas.eyebrow,
      render: PersonaPro,
    },
    {
      id: "concorrentes",
      nina: (c) => c.competitors.nina,
      ninaAction: "point",
      label: (c) => c.competitors.eyebrow,
      render: Competitors,
    },
    {
      id: "comparativo",
      nina: (c) => c.comparison.nina,
      ninaAction: "happy",
      label: (c) => c.comparison.eyebrow,
      render: Comparison,
    },
  ],
  // 4 · Maria Clara: a plataforma, parte 1.
  [
    {
      id: "tour",
      nina: (c) => c.tourIntro.nina,
      hideNarrator: true,
      label: (c) => c.tourIntro.eyebrow,
      render: (c, api) => TourIntro(c, (i) => api.goToId(`tour-${TOUR_ORDER[i].key}`)),
    },
    tour("feed", false),
    tour("profile", true, "happy"),
    tour("appearance", false, "present"),
    tour("trails", true, "happy"),
  ],
  // 5 · Emilly: a plataforma, parte 2, aprendizados e o convite final.
  [
    tour("communities", false, "wave"),
    tour("challenges", true),
    tour("discover", false, "think"),
    tour("care", true, "present"),
    {
      id: "curso",
      nina: (c) => c.course.nina,
      ninaAction: "present",
      label: (c) => c.course.eyebrow,
      render: Course,
    },
    {
      id: "financeiro",
      nina: (c) => c.finance.nina,
      ninaAction: "think",
      label: (c) => c.finance.eyebrow,
      render: Finance,
    },
    {
      id: "convite",
      nina: (c) => c.join.nina,
      hideNarrator: true,
      label: (c) => c.join.eyebrow,
      render: Join,
    },
  ],
];

export const SLIDES: SlideDef[] = PART_SLIDES.flatMap((slides, part) =>
  slides.map((slide) => ({ ...slide, part })),
);
