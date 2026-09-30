import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { NinaLive, type NinaAction, type NinaFraming } from "@/components/nina-live";
import { useStatic } from "./effects";

// Peças de layout compartilhadas pelos slides (títulos, palco, balões) e a Nina 3D da apresentação.

/** Nina 3D nos slides; na versão impressa (PDF) vira a Nina desenhada. */
export function StageNina({
  action,
  framing = "full",
  className = "",
  actionKey,
}: {
  action: NinaAction;
  framing?: NinaFraming;
  className?: string;
  actionKey?: number;
}) {
  const isStatic = useStatic();
  return (
    <NinaLive
      action={action}
      framing={framing}
      live={!isStatic}
      actionKey={actionKey}
      className={className}
    />
  );
}

// ───────────────────────── Peças comuns ─────────────────────────

/** Cada palavra entra com um pequeno atraso: dá ritmo aos títulos. */
export function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          <span className="nc-rise inline-block" style={{ animationDelay: `${delay + i * 70}ms` }}>
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

export function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <span
      className={`nc-pop inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
        light ? "bg-white/15 text-white" : "bg-accent-soft text-accent"
      }`}
    >
      {children}
    </span>
  );
}

export function Heading({
  eyebrow,
  title,
  lead,
  light = false,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem] ${
          light ? "text-primary-foreground" : ""
        }`}
      >
        <Words text={title} delay={120} />
      </h2>
      {lead && (
        <p
          className={`nc-rise mt-3 text-base leading-relaxed sm:text-lg ${
            light ? "text-primary-foreground/85" : "text-muted-foreground"
          }`}
          style={{ animationDelay: "350ms" }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

export function Frame({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={`relative z-10 mx-auto flex w-full flex-1 flex-col justify-center px-4 py-8 sm:px-8 ${
        wide ? "max-w-7xl" : "max-w-6xl"
      }`}
    >
      {children}
    </div>
  );
}

/** Palco de cada slide: ocupa a altura toda e recorta os enfeites que passam da borda. */
export function Scene({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative flex flex-1 flex-col overflow-hidden ${className}`}>{children}</div>
  );
}

export function Blob({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      className={`nc-parallax pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ "--depth": "-24px", ...style } as React.CSSProperties}
    />
  );
}

export function IconBadge({
  icon: Icon,
  tone = "primary",
}: {
  icon: LucideIcon;
  tone?: "primary" | "accent";
}) {
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
        tone === "primary" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
      }`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

export function SpeechBubble({ text, delay = 300 }: { text: string; delay?: number }) {
  return (
    <div
      className="nc-pop relative z-20 mb-3 max-w-xs rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-medium shadow-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      {text}
      <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" />
    </div>
  );
}

export const FRUITS = ["🥑", "🍓", "🥕", "🥦", "🍋", "🍅", "🌽", "🍇", "🥗", "🍎"];
