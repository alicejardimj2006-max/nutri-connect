import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import type { NinaAction } from "@/components/nina-live";
import type { PresentationCopy } from "@/lib/i18n/presentation";
import { FoodField, useStatic } from "./effects";
import { Blob, Frame, Heading, Scene, StageNina, Words } from "./layout";
import type { SlideApi } from "./slides";

// As 5 partes da apresentação: uma por integrante. A ordem aqui é a ordem de apresentação e
// corresponde a copy.parts (títulos traduzidos).

export interface Presenter {
  name: string;
  leader?: boolean;
  emoji: string;
  /** Cor de destaque da parte (barra de progresso, divisória, crachá). */
  color: string;
  /** Degradê do avatar (classes Tailwind). */
  gradient: string;
  /** Foto de fundo da divisória da parte. */
  photo: string;
  /** O que a Nina faz na divisória. */
  nina: NinaAction;
}

export const PRESENTERS: Presenter[] = [
  {
    name: "Maria Stella",
    leader: true,
    emoji: "🍓",
    color: "#b4532a",
    gradient: "from-[#faece5] to-[#f0b69b]",
    photo: "/images/presentation/friends.jpg",
    nina: "wave",
  },
  {
    name: "Cainã",
    emoji: "🥑",
    color: "#555f36",
    gradient: "from-[#e3e5ce] to-[#b9c28f]",
    photo: "/images/presentation/cutting-board.jpg",
    nina: "present",
  },
  {
    name: "Alice",
    emoji: "🥕",
    color: "#c4821a",
    gradient: "from-[#fbe6c8] to-[#e8a57e]",
    photo: "/images/presentation/market.jpg",
    nina: "point",
  },
  {
    name: "Maria Clara",
    emoji: "🍋",
    color: "#8a8848",
    gradient: "from-[#fbf3c8] to-[#e5cf6b]",
    photo: "/images/presentation/cooking-together.jpg",
    nina: "dance",
  },
  {
    name: "Emilly",
    emoji: "🍇",
    color: "#7a3f8f",
    gradient: "from-[#efe3f3] to-[#c9a3d6]",
    photo: "/images/presentation/study-group.jpg",
    nina: "cheer",
  },
];

export function initials(name: string) {
  const words = name.split(" ");
  return words.length > 1
    ? words
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
    : name[0];
}

export function PresenterAvatar({
  presenter,
  size = "md",
}: {
  presenter: Presenter;
  size?: "sm" | "md" | "lg";
}) {
  const box = { sm: "h-7 w-7 text-[11px]", md: "h-12 w-12 text-lg", lg: "h-16 w-16 text-2xl" }[
    size
  ];
  const badge = {
    sm: "hidden",
    md: "-bottom-1 -right-1 text-base",
    lg: "-bottom-1 -right-1 text-xl",
  }[size];
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display font-bold text-[#342d24] ${presenter.gradient} ${box}`}
    >
      {initials(presenter.name)}
      <span className={`absolute ${badge}`}>{presenter.emoji}</span>
    </span>
  );
}

// ───────────────────────── Divisória de cada parte ─────────────────────────

export function PartDivider({
  c,
  index,
  topics,
}: {
  c: PresentationCopy;
  index: number;
  topics: string[];
}) {
  const p = PRESENTERS[index];
  const part = c.parts[index];
  return (
    <Scene className="bg-[#1f1b15] text-white">
      <img
        src={p.photo}
        alt=""
        className="nc-kenburns absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1f1b15] via-[#1f1b15]/85 to-[#1f1b15]/25" />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 78% 72%, ${p.color}66, transparent 55%)` }}
      />
      <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2" aria-hidden>
        <span className="nc-number block font-display text-[13rem] font-bold leading-none text-transparent [-webkit-text-stroke:2px_rgb(255_255_255/0.22)] sm:text-[20rem]">
          0{index + 1}
        </span>
      </div>
      <FoodField items={[p.emoji, "✨", p.emoji, "🌿"]} count={6} opacity={0.55} />
      <Frame wide>
        <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <span className="nc-pop inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              {c.ui.partOf
                .replace("{n}", String(index + 1))
                .replace("{total}", String(PRESENTERS.length))}
            </span>
            <h2 className="mt-4 text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              <Words text={part.title} delay={150} />
            </h2>
            <p
              className="nc-rise mt-4 max-w-xl text-lg leading-relaxed text-white/80"
              style={{ animationDelay: "450ms" }}
            >
              {part.subtitle}
            </p>

            <div
              className="nc-toast-in mt-7 inline-flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-3 pr-6 backdrop-blur-md"
              style={{ animationDelay: "650ms" }}
            >
              <PresenterAvatar presenter={p} size="lg" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                  {c.ui.presentedBy}
                </p>
                <p className="font-display text-2xl font-bold leading-tight">{p.name}</p>
                {p.leader && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#f5c542] px-2 py-0.5 text-[11px] font-bold text-[#342d24]">
                    <Crown className="h-3 w-3" /> {c.ui.leader}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-white/60">
              {c.ui.inThisPart}
            </p>
            <ol className="mt-2 flex flex-wrap gap-2">
              {topics.map((topic, i) => (
                <li
                  key={topic}
                  className="nc-pop flex items-center gap-2 rounded-full bg-white/12 py-1 pl-1 pr-3 text-sm font-medium backdrop-blur"
                  style={{ animationDelay: `${850 + i * 110}ms` }}
                >
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: p.color }}
                  >
                    {i + 1}
                  </span>
                  {topic}
                </li>
              ))}
            </ol>

            <div className="mt-8 flex items-center gap-2" aria-hidden>
              {PRESENTERS.map((other, i) => (
                <span
                  key={other.name}
                  className={`grid place-items-center rounded-full transition-all ${
                    i === index ? "h-9 w-9 bg-white text-lg" : "h-6 w-6 bg-white/15 text-xs"
                  } ${i < index ? "opacity-60" : ""}`}
                >
                  {other.emoji}
                </span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto h-72 w-full max-w-[380px] sm:h-[460px]">
            <div
              className="absolute inset-x-8 bottom-2 h-16 rounded-[50%] blur-2xl"
              style={{ background: `${p.color}88` }}
            />
            <StageNina action={p.nina} className="h-full w-full" />
          </div>
        </div>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── Quem somos + roteiro ─────────────────────────

export function TeamRoster({
  c,
  api,
  partStarts,
}: {
  c: PresentationCopy;
  api: SlideApi;
  partStarts: number[];
}) {
  return (
    <Scene>
      <Blob className="-left-24 top-10 h-96 w-96 bg-accent/15" />
      <Blob className="-right-24 bottom-0 h-96 w-96 bg-primary/15" />
      <FoodField items={["💻", "☕", "🎨", "🚀", "📚"]} count={5} opacity={0.45} />
      <Frame wide>
        <Heading eyebrow={c.team.eyebrow} title={c.team.title} lead={c.team.text} />
        <div className="relative mt-8">
          <svg
            viewBox="0 0 1000 60"
            preserveAspectRatio="none"
            className="absolute inset-x-0 top-0 hidden h-12 w-full text-foreground/40 lg:block"
            aria-hidden
          >
            <path
              d="M0 8 Q 500 70 1000 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="nc-draw"
              style={{ "--nc-len": 1100 } as React.CSSProperties}
            />
          </svg>
          <div className="relative grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 lg:grid-cols-5 lg:pt-5">
            {PRESENTERS.map((p, i) => (
              <div
                key={p.name}
                className="nc-drop-in flex justify-center"
                style={
                  {
                    animationDelay: `${300 + i * 180}ms`,
                    "--nc-rot": "0deg",
                    marginTop: [0, 22, 30, 22, 0][i],
                  } as React.CSSProperties
                }
              >
                <button
                  type="button"
                  onClick={() => api.goTo(partStarts[i])}
                  className="nc-swing group relative text-left"
                  style={{ animationDuration: `${3.6 + i * 0.45}s`, animationDelay: `${i * 0.3}s` }}
                >
                  <span
                    className="absolute -top-3 left-1/2 z-10 h-6 w-3 -translate-x-1/2 rounded-sm shadow"
                    style={{ background: p.color }}
                  />
                  {p.leader && (
                    <span className="absolute -right-2 -top-2 z-10 inline-flex items-center gap-1 rounded-full bg-[#f5c542] px-2 py-0.5 text-[11px] font-bold text-[#342d24] shadow">
                      <Crown className="h-3 w-3" /> {c.ui.leader}
                    </span>
                  )}
                  <figure className="w-full max-w-[200px] bg-[#fffdf8] p-2.5 pb-3 shadow-[0_18px_40px_-18px_rgb(52_45_36/0.55)] transition group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_-18px_rgb(52_45_36/0.6)]">
                    <div
                      className={`relative grid aspect-square place-items-center bg-gradient-to-br ${p.gradient}`}
                    >
                      <span className="font-display text-5xl font-bold text-[#342d24]/80">
                        {initials(p.name)}
                      </span>
                      <span className="nc-floaty absolute bottom-2 right-3 text-3xl">
                        {p.emoji}
                      </span>
                    </div>
                    <figcaption className="mt-2.5 text-center">
                      <span className="block font-display text-base font-bold leading-snug text-[#342d24]">
                        {p.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-[#6d6355]">
                        {p.leader ? c.team.leaderRole : c.team.role}
                      </span>
                      <span
                        className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: p.color }}
                      >
                        {i + 1} · {c.parts[i].title}
                      </span>
                    </figcaption>
                  </figure>
                </button>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground print:hidden">
          👆 {c.team.pickHint} · ⌨️ {c.ui.partsHint}
        </p>
      </Frame>
    </Scene>
  );
}

// ───────────────────────── Conheça a Nina ─────────────────────────

const NINA_BUTTONS: { key: keyof PresentationCopy["ninaIntro"]["actions"]; emoji: string }[] = [
  { key: "wave", emoji: "👋" },
  { key: "talk", emoji: "💬" },
  { key: "think", emoji: "🤔" },
  { key: "present", emoji: "📱" },
  { key: "dance", emoji: "💃" },
  { key: "cheer", emoji: "🎉" },
  { key: "spin", emoji: "🌀" },
  { key: "jump", emoji: "🦘" },
];
const TRAIT_EMOJIS = ["🗺️", "💬", "🎉", "🤗"];

export function NinaIntroSlide({ c }: { c: PresentationCopy }) {
  const n = c.ninaIntro;
  const isStatic = useStatic();
  const [current, setCurrent] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [tick, setTick] = useState(0);

  // Demonstração automática: troca de ação sozinha até alguém escolher uma.
  useEffect(() => {
    if (pinned || isStatic) return;
    const id = window.setInterval(() => setCurrent((i) => (i + 1) % NINA_BUTTONS.length), 3600);
    return () => window.clearInterval(id);
  }, [pinned, isStatic]);

  const action = NINA_BUTTONS[current].key;

  return (
    <Scene>
      <Blob className="-right-24 top-0 h-[28rem] w-[28rem] bg-accent/20" />
      <Blob className="-left-20 bottom-0 h-80 w-80 bg-primary/15" />
      <FoodField items={["🍎", "🥦", "✨", "🥕", "💚"]} count={6} opacity={0.5} />
      <Frame wide>
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Heading eyebrow={n.eyebrow} title={n.title} lead={n.text} />
            <span
              className="nc-pop mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
              style={{ animationDelay: "500ms" }}
            >
              🥼 {n.role}
            </span>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {n.traits.map((trait, i) => (
                <article
                  key={trait.title}
                  className="nc-rise flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5"
                  style={{ animationDelay: `${600 + i * 120}ms` }}
                >
                  <span className="text-2xl">{TRAIT_EMOJIS[i]}</span>
                  <div>
                    <h3 className="font-display text-base font-bold leading-snug">{trait.title}</h3>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">{trait.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center max-lg:order-first">
            <div className="relative h-80 w-full max-w-[420px] sm:h-[440px]">
              <div className="absolute inset-x-6 top-4 bottom-10 rounded-full bg-[radial-gradient(circle_at_50%_40%,var(--accent-soft),transparent_65%)]" />
              <div className="absolute inset-x-16 bottom-3 h-10 rounded-[50%] bg-primary/15 blur-md" />
              <StageNina action={action} actionKey={tick} className="h-full w-full" />
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground print:hidden">
              {n.actionsLabel}
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2 print:hidden">
              {NINA_BUTTONS.map((b, i) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => {
                    setPinned(true);
                    setCurrent(i);
                    setTick((t) => t + 1);
                  }}
                  aria-pressed={current === i}
                  className={`flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-2 text-[11px] font-semibold transition hover:-translate-y-0.5 ${
                    current === i
                      ? "border-accent bg-accent text-accent-foreground shadow-soft"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  <span className="text-lg">{b.emoji}</span>
                  {n.actions[b.key]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    </Scene>
  );
}
