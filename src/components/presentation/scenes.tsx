import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, User, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PresentationCopy } from "@/lib/i18n/presentation";
import { Tape, useDelayedFlag, useStatic } from "./effects";
import { StageNina } from "./layout";
import { EmojiIcon } from "@/components/emoji-icon";

// Peças visuais únicas de cada slide (gráficos vivos, Venn, órbita, editor de código, mapa...).

// ───────────────────────── Problema: um gráfico por dado ─────────────────────────

function RingGauge({ percent, emoji }: { percent: number; emoji: string }) {
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--secondary)" strokeWidth="12" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="12"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${percent} 100`}
          className="nc-dash"
          style={{ "--nc-from": percent, animationDelay: "0.3s" } as React.CSSProperties}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-primary">
        <EmojiIcon emoji={emoji} className="h-8 w-8" />
      </span>
    </div>
  );
}

function PeopleGrid({ filled }: { filled: number }) {
  return (
    <div className="grid grid-cols-5 gap-1.5" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`nc-pop grid h-9 w-9 place-items-center rounded-full ${
            i < filled ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
          }`}
          style={{ animationDelay: `${300 + i * 90}ms` }}
        >
          <User className="h-4 w-4" />
        </span>
      ))}
    </div>
  );
}

function PlatesRow() {
  return (
    <div className="flex items-end gap-1.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`nc-pop grid place-items-center rounded-full border-4 ${
            i === 2
              ? "h-14 w-14 border-primary bg-primary-soft text-2xl shadow-soft"
              : "h-10 w-10 border-border bg-card text-lg opacity-40 grayscale"
          }`}
          style={{ animationDelay: `${300 + i * 110}ms` }}
        >
          <EmojiIcon emoji={"🥗"} className="h-[1em] w-[1em]" tinted />
        </span>
      ))}
    </div>
  );
}

function BarsCompare({ pro, web }: { pro: string; web: string }) {
  const rows = [
    { emoji: "🩺", label: pro, value: 18, tone: "bg-accent" },
    { emoji: "📱", label: web, value: 40, tone: "bg-primary" },
  ];
  return (
    <div className="w-full space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <EmojiIcon emoji={r.emoji} className="h-3.5 w-3.5" />
              {r.label}
            </span>
            <span className="font-semibold text-foreground">{r.value}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className={`nc-grow-x h-full rounded-full ${r.tone}`}
              style={{ width: `${(r.value / 40) * 100}%`, animationDelay: `${400 + i * 250}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProblemVisual({ index, c }: { index: number; c: PresentationCopy }) {
  switch (index) {
    case 0:
      return <RingGauge percent={68} emoji="📱" />;
    case 1:
      return <PeopleGrid filled={6} />;
    case 2:
      return <PlatesRow />;
    default:
      return <BarsCompare pro={c.problem.barPro} web={c.problem.barWeb} />;
  }
}

// ───────────────────────── Solução: três círculos que se encontram ─────────────────────────

export function Venn({
  pillars,
  icons,
}: {
  pillars: PresentationCopy["solution"]["pillars"];
  icons: LucideIcon[];
}) {
  const circles = [
    {
      x: "0%",
      y: "0%",
      from: "-80px, -60px",
      color: "var(--primary)",
      label: "items-start justify-center pt-10",
    },
    {
      x: "34%",
      y: "0%",
      from: "80px, -60px",
      color: "var(--accent)",
      label: "items-start justify-center pt-10",
    },
    {
      x: "17%",
      y: "30%",
      from: "0px, 90px",
      color: "var(--chart-3)",
      label: "items-end justify-center pb-10",
    },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      {circles.map((ci, i) => {
        const Icon = icons[i];
        return (
          <div
            key={i}
            className="nc-orbit-in absolute flex h-[66%] w-[66%] rounded-full"
            style={
              {
                left: ci.x,
                top: ci.y,
                background: `color-mix(in oklab, ${ci.color} 22%, transparent)`,
                border: `2px solid color-mix(in oklab, ${ci.color} 55%, transparent)`,
                "--nc-from-x": ci.from.split(",")[0],
                "--nc-from-y": ci.from.split(",")[1],
                animationDelay: `${i * 180}ms`,
              } as React.CSSProperties
            }
          >
            <span className={`flex w-full px-6 ${ci.label}`}>
              <span
                className={`flex flex-col items-center gap-1 text-center text-sm font-bold ${
                  i === 0 ? "-translate-x-6" : i === 1 ? "translate-x-6" : ""
                }`}
              >
                <Icon className="h-5 w-5" style={{ color: ci.color }} />
                {pillars[i].title}
              </span>
            </span>
          </div>
        );
      })}
      <div
        className="nc-pop absolute left-1/2 top-[48%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        style={{ animationDelay: "700ms" }}
      >
        <StageNina action="happy" framing="bust" className="h-20 w-20" />
        <span className="-mt-1 rounded-full bg-card px-3 py-1 font-logo-serif text-xs font-bold shadow-card">
          Nutri<span className="text-accent">Connect</span>
        </span>
      </div>
    </div>
  );
}

// ───────────────────────── Diferenciais: cartas que viram ─────────────────────────

export function FlipCard({
  index,
  emoji,
  icon: Icon,
  title,
  text,
  hint,
}: {
  index: number;
  emoji: string;
  icon: LucideIcon;
  title: string;
  text: string;
  hint: string;
}) {
  const isStatic = useStatic();
  const auto = useDelayedFlag(1100 + index * 650);
  const [manual, setManual] = useState<boolean | null>(null);
  const flipped = manual ?? auto;
  const tone = index % 2 ? "accent" : "primary";

  if (isStatic) {
    return (
      <article className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <span className="text-primary">
          <EmojiIcon emoji={emoji} className="h-10 w-10" />
        </span>
        <h3 className="mt-3 text-lg font-bold leading-snug">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </article>
    );
  }

  return (
    <button
      type="button"
      data-flipped={flipped}
      onClick={() => setManual(!flipped)}
      aria-pressed={flipped}
      className="nc-flip nc-rise h-64 w-full text-left"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <span className="nc-flip-inner block">
        <span
          className={`nc-flip-face flex flex-col items-center justify-center rounded-3xl p-5 text-center shadow-card ${
            tone === "primary"
              ? "bg-gradient-to-br from-primary to-chart-5 text-primary-foreground"
              : "bg-gradient-to-br from-accent to-chart-4 text-accent-foreground"
          }`}
        >
          <span
            className="nc-floaty text-primary drop-shadow"
            style={{ animationDelay: `${index * 0.4}s` }}
          >
            <EmojiIcon emoji={emoji} className="h-16 w-16" strokeWidth={1.5} />
          </span>
          <span className="mt-4 font-display text-xl font-bold leading-snug">{title}</span>
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium opacity-80">
            <RotateCcw className="h-3 w-3" /> {hint}
          </span>
        </span>
        <span className="nc-flip-face nc-flip-back flex flex-col rounded-3xl border border-border bg-card p-5 shadow-card">
          <span
            className={`grid h-11 w-11 place-items-center rounded-2xl ${
              tone === "primary" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <span className="mt-3 font-display text-lg font-bold leading-snug text-foreground">
            {title}
          </span>
          <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</span>
        </span>
      </span>
    </button>
  );
}

// ───────────────────────── Personas ─────────────────────────

/** Balões de pensamento flutuando ao redor da foto. */
export function ThoughtBubbles({ items }: { items: string[] }) {
  const spots = ["sm:-left-10 sm:top-2", "sm:-right-14 sm:top-1/3", "sm:-left-6 sm:bottom-6"];
  return (
    <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:contents">
      {items.map((it, i) => (
        <span
          key={it}
          className={`nc-pop sm:absolute ${spots[i]} z-20 sm:max-w-[190px]`}
          style={{ animationDelay: `${600 + i * 300}ms` }}
        >
          <span
            className="nc-floaty relative block rounded-2xl border border-border bg-card px-3 py-2 text-xs font-medium leading-snug shadow-card"
            style={{ animationDelay: `${i * 0.8}s`, animationDuration: "7s" }}
          >
            <EmojiIcon emoji={"💭"} className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
            {it}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Crachá do profissional, com carimbo de verificação. */
export function ProBadge({
  persona,
  stamp,
  ageSuffix,
}: {
  persona: PresentationCopy["personas"]["pro"];
  stamp: string;
  ageSuffix: string;
}) {
  return (
    <div className="nc-swing relative mx-auto w-64" style={{ animationDuration: "6s" }}>
      <div className="mx-auto h-16 w-6 bg-gradient-to-b from-accent to-accent/70" />
      <div className="mx-auto -mt-1 h-4 w-12 rounded-md border-2 border-foreground/30 bg-secondary" />
      <div className="relative mt-1 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between bg-primary px-4 py-2.5 text-primary-foreground">
          <span className="font-logo-serif text-sm font-bold">
            Nutri<span className="text-accent-soft">Connect</span>
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
            PRO
          </span>
        </div>
        <div className="flex flex-col items-center px-5 pb-6 pt-5 text-center">
          <img
            src="/images/professionals/prof-2.jpg"
            alt=""
            className="h-28 w-28 rounded-full border-4 border-primary-soft object-cover"
          />
          <p className="mt-3 font-display text-xl font-bold">{persona.name}</p>
          <p className="text-xs text-muted-foreground">
            {persona.age} {ageSuffix} · {persona.city}
          </p>
          <p className="mt-1 text-sm font-medium">{persona.role}</p>
          <div className="mt-3 h-6 w-40 rounded bg-[repeating-linear-gradient(90deg,var(--foreground)_0_2px,transparent_2px_5px)] opacity-60" />
        </div>
        <span
          className="nc-stamp absolute bottom-5 right-3 rounded-lg border-[3px] border-accent bg-card/95 px-2 py-1 shadow-sm text-xs font-extrabold uppercase tracking-wider text-accent"
          style={{ animationDelay: "900ms" }}
        >
          ✓ {stamp}
        </span>
      </div>
    </div>
  );
}

/** Notificações de frustração (as dores do profissional). */
export function PainToasts({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div
          key={it}
          className="nc-toast-in flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-card"
          style={{ animationDelay: `${700 + i * 350}ms` }}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
            <X className="h-4 w-4" />
          </span>
          <span className="text-sm leading-snug">{it}</span>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────── Concorrentes: órbita ─────────────────────────

interface OrbitItem {
  name: string;
  what: string;
  gap: string;
  kind: "direct" | "indirect";
}

export function CompetitorOrbit({ c }: { c: PresentationCopy }) {
  const k = c.competitors;
  const isStatic = useStatic();
  const items: OrbitItem[] = useMemo(
    () => [
      ...k.direct.map((d) => ({ ...d, kind: "direct" as const })),
      ...k.indirect.map((d) => ({ ...d, kind: "indirect" as const })),
    ],
    [k],
  );
  const [selected, setSelected] = useState(0);
  const current = items[selected] ?? items[0];

  const ring = (kind: OrbitItem["kind"], radius: number, duration: number, reverse: boolean) => {
    const list = items.map((it, idx) => ({ it, idx })).filter((x) => x.it.kind === kind);
    return (
      <div
        className={`absolute inset-0 ${reverse ? "nc-spin-rev" : "nc-spin"}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {list.map(({ it, idx }, i) => {
          const angle =
            (i / list.length) * Math.PI * 2 - Math.PI / 2 + (kind === "indirect" ? 0.4 : 0);
          return (
            <div
              key={it.name}
              className="absolute"
              style={{
                left: `${50 + radius * Math.cos(angle)}%`,
                top: `${50 + radius * Math.sin(angle)}%`,
              }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <div
                  className={reverse ? "nc-spin" : "nc-spin-rev"}
                  style={{ animationDuration: `${duration}s` }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(idx)}
                    aria-pressed={selected === idx}
                    className={`nc-pop whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold shadow-card transition ${
                      selected === idx
                        ? "border-accent bg-accent text-accent-foreground"
                        : kind === "direct"
                          ? "border-border bg-card"
                          : "border-primary/30 bg-primary-soft text-primary"
                    }`}
                    style={{ animationDelay: `${300 + idx * 80}ms` }}
                  >
                    {it.name}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div className="nc-pause-hover relative mx-auto aspect-square w-[calc(100%-5.5rem)] max-w-[460px] sm:w-full">
        <div className="absolute inset-[4%] rounded-full border-2 border-dashed border-primary/25" />
        <div className="absolute inset-[22%] rounded-full border-2 border-dashed border-accent/30" />
        {ring("indirect", 46, 90, true)}
        {ring("direct", 28, 70, false)}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="nc-ring absolute inset-0 rounded-full bg-accent/30" />
          <span className="relative grid h-24 w-24 place-items-center rounded-full bg-accent text-center shadow-soft">
            <span className="font-logo-serif text-[13px] font-bold leading-tight text-accent-foreground">
              Nutri
              <br />
              Connect
            </span>
          </span>
        </div>
      </div>

      {isStatic ? (
        <div className="grid gap-2 text-xs">
          {items.map((it) => (
            <p key={it.name}>
              <strong>{it.name}</strong> ({it.kind === "direct" ? k.directLabel : k.indirectLabel})
              — {it.what}. <span className="text-muted-foreground">✕ {it.gap}</span>
            </p>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border border-border bg-card" /> {k.directLabel}{" "}
              · {k.directHint}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-primary-soft" /> {k.indirectLabel} ·{" "}
              {k.indirectHint}
            </span>
          </div>
          <article
            key={current.name}
            className="nc-rise rounded-3xl border border-border bg-card p-6 shadow-card"
            aria-live="polite"
          >
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                current.kind === "direct"
                  ? "bg-accent-soft text-accent"
                  : "bg-primary-soft text-primary"
              }`}
            >
              {current.kind === "direct" ? k.directLabel : k.indirectLabel}
            </span>
            <h3 className="mt-3 text-3xl font-bold">{current.name}</h3>
            <p className="mt-2 text-base">{current.what}</p>
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-sm">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <span>
                <span className="font-semibold">{k.gapLabel}: </span>
                {current.gap}
              </span>
            </p>
          </article>
          <p className="mt-3 text-xs text-muted-foreground">{k.pickHint}</p>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Curso: editor de código ─────────────────────────

type Token = [string, string];

const T = {
  tag: "text-[#e5885e]",
  attr: "text-[#c2b87a]",
  str: "text-[#9ba86a]",
  kw: "text-[#d8a0e0]",
  fn: "text-[#8cc4e8]",
  txt: "text-[#f4eee2]",
  dim: "text-[#8a8070]",
  ok: "text-[#9ba86a]",
};

const SNIPPETS: { file: string; lines: Token[][] }[] = [
  {
    file: "index.html",
    lines: [
      [
        ["<main ", T.tag],
        ["class", T.attr],
        ["=", T.txt],
        ['"grid md:grid-cols-2"', T.str],
        [">", T.tag],
      ],
      [
        ["  <section ", T.tag],
        ["class", T.attr],
        ["=", T.txt],
        ['"card"', T.str],
        [">", T.tag],
      ],
      [
        ["    <h1>", T.tag],
        ["NutriConnect", T.txt],
        ["</h1>", T.tag],
      ],
      [
        ["    <p>", T.tag],
        ["🥗 + 🤝 + 📚", T.txt],
        ["</p>", T.tag],
      ],
      [["  </section>", T.tag]],
      [["</main>", T.tag]],
    ],
  },
  {
    file: "Nina.jsx",
    lines: [
      [
        ["import ", T.kw],
        ["{ useState } ", T.txt],
        ["from ", T.kw],
        ['"react"', T.str],
        [";", T.txt],
      ],
      [["", T.txt]],
      [
        ["export function ", T.kw],
        ["Nina", T.fn],
        ["({ mood }) {", T.txt],
      ],
      [
        ["  const ", T.kw],
        ["[xp, setXp] = ", T.txt],
        ["useState", T.fn],
        ["(", T.txt],
        ["0", T.attr],
        [");", T.txt],
      ],
      [
        ["  return ", T.kw],
        ["<Mascot ", T.tag],
        ["id", T.attr],
        ["=", T.txt],
        ['"nina"', T.str],
        [" mood", T.attr],
        ["={mood} />", T.txt],
      ],
      [["}", T.txt]],
    ],
  },
  {
    file: "terminal",
    lines: [
      [
        ["$ ", T.dim],
        ["git checkout -b ", T.txt],
        ["feat/trails", T.str],
      ],
      [
        ["$ ", T.dim],
        ["git add .", T.txt],
      ],
      [
        ["$ ", T.dim],
        ["git commit -m ", T.txt],
        ['"feat: nina learning trails"', T.str],
      ],
      [
        ["$ ", T.dim],
        ["git push origin main", T.txt],
      ],
      [
        ["✔ ", T.ok],
        ["4 devs · 1 repo · Lovable sync", T.ok],
      ],
    ],
  },
  {
    file: "pitch.md",
    lines: [
      [
        ["## ", T.dim],
        ["NutriConnect", T.fn],
      ],
      [
        ["🎯 problem   ", T.attr],
        ["→ ", T.dim],
        ["misinformation", T.txt],
      ],
      [
        ["💡 solution  ", T.attr],
        ["→ ", T.dim],
        ["community + trails", T.txt],
      ],
      [
        ["👥 personas  ", T.attr],
        ["→ ", T.dim],
        ["Juliana, Rafael", T.txt],
      ],
      [
        ["💰 revenue   ", T.attr],
        ["→ ", T.dim],
        ["freemium", T.txt],
      ],
    ],
  },
];

function TypedCode({ lines, typed }: { lines: Token[][]; typed: number }) {
  // Quantos caracteres de cada linha já apareceram e em qual linha está o cursor.
  const shown: number[] = [];
  let rest = typed;
  let caretLine = -1;
  lines.forEach((line, i) => {
    const len = line.reduce((n, [t]) => n + t.length, 0);
    shown.push(Math.max(0, Math.min(len, rest)));
    if (caretLine === -1 && rest <= len) caretLine = i;
    rest -= len + 1;
  });
  if (caretLine === -1) caretLine = lines.length - 1;

  return (
    <pre className="min-h-[190px] overflow-x-auto p-4 font-mono text-[12px] leading-6 sm:text-[13px]">
      {lines.slice(0, caretLine + 1).map((line, li) => {
        let budget = shown[li];
        return (
          <div key={li} className="flex">
            <span className="mr-4 w-4 select-none text-right text-[#5d5446]">{li + 1}</span>
            <span>
              {line.map(([text, cls], ti) => {
                const part = text.slice(0, Math.max(0, budget));
                budget -= text.length;
                return part ? (
                  <span key={ti} className={cls}>
                    {part}
                  </span>
                ) : null;
              })}
              {li === caretLine && (
                <span className="nc-caret ml-px inline-block h-4 w-2 translate-y-0.5 bg-[#e5885e]" />
              )}
            </span>
          </div>
        );
      })}
    </pre>
  );
}

export function CodeEditor({
  items,
  icons,
  learnedLabel,
  appliedLabel,
}: {
  items: PresentationCopy["course"]["items"];
  icons: LucideIcon[];
  learnedLabel: string;
  appliedLabel: string;
}) {
  const isStatic = useStatic();
  const [tab, setTab] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [typed, setTyped] = useState(isStatic ? 10_000 : 0);
  const snippet = SNIPPETS[tab];
  const total = snippet.lines.reduce((n, l) => n + l.reduce((m, [t]) => m + t.length, 0) + 1, 0);

  // Digita o trecho atual; ao terminar, passa sozinho para a próxima aba (até alguém clicar).
  useEffect(() => {
    if (isStatic) return;
    setTyped(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 2;
      setTyped(n);
      if (n >= total) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [tab, total, isStatic]);

  useEffect(() => {
    if (isStatic || pinned || typed < total) return;
    const id = window.setTimeout(() => setTab((t) => (t + 1) % SNIPPETS.length), 2600);
    return () => window.clearTimeout(id);
  }, [typed, total, pinned, isStatic]);

  const item = items[tab];
  const Icon = icons[tab];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.25fr_1fr]">
      <div className="nc-tilt overflow-hidden rounded-2xl border border-[#423b31] bg-[#1f1b15] shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-[#423b31] px-3 pt-2.5">
          <span className="mr-2 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e0685a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e5b64a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7fb35a]" />
          </span>
          <div className="flex min-w-0 gap-1 overflow-x-auto">
            {SNIPPETS.map((s, i) => (
              <button
                key={s.file}
                type="button"
                onClick={() => {
                  setPinned(true);
                  setTab(i);
                }}
                aria-pressed={tab === i}
                className={`whitespace-nowrap rounded-t-lg px-3 py-1.5 font-mono text-[11px] transition ${
                  tab === i ? "bg-[#27221b] text-[#f4eee2]" : "text-[#8a8070] hover:text-[#f4eee2]"
                }`}
              >
                {s.file}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#27221b]">
          <TypedCode lines={snippet.lines} typed={isStatic ? 10_000 : typed} />
        </div>
      </div>

      {isStatic ? (
        <div className="grid gap-2">
          {items.map((it) => (
            <p key={it.title} className="text-xs">
              <strong>{it.title}</strong> — {learnedLabel}: {it.learned} {appliedLabel}:{" "}
              {it.applied}
            </p>
          ))}
        </div>
      ) : (
        <article
          key={tab}
          className="nc-rise rounded-3xl border border-border bg-card p-6 shadow-card"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-2xl font-bold leading-snug">{item.title}</h3>
          <p className="mt-3 text-sm leading-relaxed">
            <span className="font-semibold text-primary">{learnedLabel}: </span>
            <span className="text-muted-foreground">{item.learned}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            <span className="font-semibold text-accent">{appliedLabel}: </span>
            <span className="text-muted-foreground">{item.applied}</span>
          </p>
          <div className="mt-5 flex gap-1.5">
            {items.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i === tab ? "bg-accent" : "bg-secondary"}`}
              />
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

// ───────────────────────── Tour: mapa-trilha ─────────────────────────

/** Pontos do caminho em zigue-zague, espaçados conforme o número de paradas do tour. */
function mapPoints(count: number): [number, number][] {
  const n = Math.max(count, 2);
  return Array.from({ length: n }, (_, i) => [
    Math.round(70 + (860 * i) / (n - 1)),
    i % 2 === 0 ? 180 : 92,
  ]);
}

/** Curva suave passando exatamente pelos pontos (Catmull-Rom convertida em Bézier). */
function smoothPath(points: [number, number][]) {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function TrailMap({
  stops,
  onPick,
}: {
  stops: { label: string; icon: LucideIcon }[];
  onPick: (i: number) => void;
}) {
  const points = mapPoints(stops.length);
  const d = smoothPath(points);
  return (
    <div className="relative w-full" style={{ aspectRatio: "1000 / 260" }}>
      <svg viewBox="0 0 1000 260" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d={d}
          fill="none"
          stroke="rgb(255 255 255 / 0.22)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={d}
          fill="none"
          stroke="var(--accent-soft)"
          strokeWidth="4"
          strokeLinecap="round"
          className="nc-draw"
          style={{ "--nc-len": 1400, animationDuration: "2.4s" } as React.CSSProperties}
        />
      </svg>
      {stops.map(({ label, icon: Icon }, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(i)}
          className="nc-pop group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{
            left: `${points[i][0] / 10}%`,
            top: `${(points[i][1] / 260) * 100}%`,
            animationDelay: `${400 + i * 280}ms`,
          }}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full border-b-4 border-[#984420] bg-accent text-accent-foreground shadow-lg transition group-hover:-translate-y-1 group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </span>
          <span className="mt-1.5 max-w-[130px] rounded-full bg-black/25 px-2.5 py-0.5 text-center text-[11px] font-semibold leading-tight text-white backdrop-blur">
            {label}
          </span>
        </button>
      ))}
      <div className="absolute -left-2 top-[48%] -translate-y-full">
        <StageNina action="dance" className="h-28 w-20" />
      </div>
    </div>
  );
}

// ───────────────────────── Canvas: post-its ─────────────────────────

const NOTE_COLORS = ["bg-[#fff4c7]", "bg-[#e6eed3]", "bg-[#fde2d6]", "bg-[#e1ecef]"];
const NOTE_ROT = [-1.6, 1.2, -0.8, 0, 1.4, -1.1, 0.9, -0.5, 0.7];

export function StickyNote({
  index,
  title,
  items,
  highlight,
  value,
  className = "",
}: {
  index: number;
  title: string;
  items: string[];
  highlight?: boolean;
  value?: string;
  className?: string;
}) {
  return (
    <section
      className={`nc-drop-in relative p-4 pt-5 shadow-[0_12px_24px_-14px_rgb(52_45_36/0.6)] transition-transform hover:z-10 hover:scale-[1.03] ${
        highlight
          ? "bg-accent text-accent-foreground"
          : `${NOTE_COLORS[index % NOTE_COLORS.length]} text-[#342d24]`
      } ${className}`}
      style={
        {
          "--nc-rot": `${NOTE_ROT[index % NOTE_ROT.length]}deg`,
          animationDelay: `${index * 90}ms`,
        } as React.CSSProperties
      }
    >
      <Tape className="-top-2.5 left-1/2 -translate-x-1/2 rotate-[3deg]" />
      <h3
        className={`text-[11px] font-extrabold uppercase tracking-wider ${
          highlight ? "text-accent-foreground/80" : "text-[#984420]"
        }`}
        style={{ fontFamily: "inherit" }}
      >
        {title}
      </h3>
      {value && <p className="mt-2 font-display text-lg font-bold leading-snug">{value}</p>}
      <ul className="mt-2 space-y-1">
        {items.map((it) => (
          <li key={it} className="flex gap-1.5 text-[13px] leading-snug">
            <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${highlight ? "" : "text-[#555f36]"}`} />
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}
