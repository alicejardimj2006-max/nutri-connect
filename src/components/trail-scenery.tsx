import type { CSSProperties } from "react";
import type { ProfileKind, SceneId } from "@/lib/trail-types";

/** Cores de cada bioma (a unidade herda o tema do seu cenário). */
export interface SceneTheme {
  main: string;
  dark: string;
  soft: string;
  road: string;
  roadLine: string;
  /** Classes de fundo (claro/escuro) do cenário. */
  sky: string;
  text: string;
}

export const SCENE_THEMES: Record<SceneId, SceneTheme> = {
  meadow: {
    main: "#10b981",
    dark: "#047857",
    soft: "#d1fae5",
    road: "#e9dcc0",
    roadLine: "#fffaf0",
    sky: "bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200 dark:from-sky-950 dark:via-emerald-950 dark:to-emerald-900",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  orchard: {
    main: "#f59e0b",
    dark: "#b45309",
    soft: "#fef3c7",
    road: "#f3dfb0",
    roadLine: "#fffbeb",
    sky: "bg-gradient-to-b from-amber-100 via-orange-100 to-yellow-200 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950",
    text: "text-amber-700 dark:text-amber-300",
  },
  kitchen: {
    main: "#f43f5e",
    dark: "#be123c",
    soft: "#ffe4e6",
    road: "#f1ddd0",
    roadLine: "#fff7f5",
    sky: "bg-gradient-to-b from-rose-100 via-orange-50 to-amber-100 dark:from-rose-950 dark:via-orange-950 dark:to-amber-950",
    text: "text-rose-700 dark:text-rose-300",
  },
  lake: {
    main: "#0ea5e9",
    dark: "#0369a1",
    soft: "#e0f2fe",
    road: "#e5e0d2",
    roadLine: "#fbfaf4",
    sky: "bg-gradient-to-b from-indigo-200 via-sky-100 to-teal-200 dark:from-indigo-950 dark:via-sky-950 dark:to-teal-950",
    text: "text-sky-700 dark:text-sky-300",
  },
};

/** Paleta do perfil adulto: tons mais sóbrios e profundos. */
export const ADULT_THEMES: Record<SceneId, SceneTheme> = {
  meadow: {
    main: "#3f7d6b",
    dark: "#2a5849",
    soft: "#dcebe5",
    road: "#dcd8cc",
    roadLine: "#f3f1ea",
    sky: "bg-gradient-to-b from-slate-100 via-emerald-50 to-emerald-100/70 dark:from-slate-900 dark:via-emerald-950/50 dark:to-slate-900",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  orchard: {
    main: "#a4762f",
    dark: "#75521f",
    soft: "#f1e6cf",
    road: "#ddd6c4",
    roadLine: "#f5f1e6",
    sky: "bg-gradient-to-b from-stone-100 via-amber-50 to-amber-100/70 dark:from-stone-900 dark:via-amber-950/40 dark:to-stone-900",
    text: "text-amber-800 dark:text-amber-300",
  },
  kitchen: {
    main: "#a4523e",
    dark: "#763628",
    soft: "#f3dfd9",
    road: "#ded5cd",
    roadLine: "#f7f2ee",
    sky: "bg-gradient-to-b from-stone-100 via-rose-50 to-orange-100/60 dark:from-stone-900 dark:via-rose-950/40 dark:to-stone-900",
    text: "text-rose-800 dark:text-rose-300",
  },
  lake: {
    main: "#3b6ea0",
    dark: "#264d75",
    soft: "#dbe7f2",
    road: "#d6d9d8",
    roadLine: "#f1f4f4",
    sky: "bg-gradient-to-b from-slate-100 via-sky-50 to-indigo-100/70 dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900",
    text: "text-sky-800 dark:text-sky-300",
  },
};

export const themeFor = (scene: SceneId, variant: ProfileKind): SceneTheme =>
  variant === "adult" ? ADULT_THEMES[scene] : SCENE_THEMES[scene];

interface Floater {
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

/** Itens que caem devagar (folhas, frutas, ingredientes, pétalas...). */
function Falling({ items }: { items: Floater[] }) {
  return (
    <>
      {items.map((it, i) => (
        <span
          key={i}
          className="nc-fall absolute top-0 opacity-0"
          style={{
            left: `${it.left}%`,
            fontSize: it.size,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.duration}s`,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </>
  );
}

interface Spot {
  emoji: string;
  /** Posição em %: horizontal e vertical. */
  x: number;
  y: number;
  size: number;
  className?: string;
  delay?: number;
}

function Spots({ items }: { items: Spot[] }) {
  return (
    <>
      {items.map((s, i) => (
        <span
          key={i}
          className={`absolute ${s.className ?? ""}`}
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontSize: s.size,
              animationDelay: `${s.delay ?? 0}s`,
            } as CSSProperties
          }
        >
          {s.emoji}
        </span>
      ))}
    </>
  );
}

const CLOUDS = [
  { top: 4, size: 54, delay: 0, duration: 90, opacity: 0.9 },
  { top: 14, size: 38, delay: -35, duration: 120, opacity: 0.7 },
  { top: 30, size: 46, delay: -70, duration: 105, opacity: 0.6 },
];

function Clouds({ dim = false }: { dim?: boolean }) {
  return (
    <>
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="nc-drift absolute left-0"
          style={{
            top: `${c.top}%`,
            fontSize: c.size,
            opacity: dim ? c.opacity * 0.35 : c.opacity,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            filter: "drop-shadow(0 4px 6px rgb(0 0 0 / 0.06))",
          }}
        >
          ☁️
        </span>
      ))}
    </>
  );
}

/** Colinas ondulantes na base do cenário. */
function Hills({ a, b }: { a: string; b: string }) {
  return (
    <svg
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-24 w-full"
      aria-hidden="true"
    >
      <path
        d="M0 60 C60 20 120 20 190 55 C260 90 330 30 400 50 L400 100 L0 100Z"
        fill={a}
        opacity={0.55}
      />
      <path
        d="M0 78 C70 50 150 60 210 76 C280 94 340 66 400 74 L400 100 L0 100Z"
        fill={b}
        opacity={0.7}
      />
    </svg>
  );
}

function Waves() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-24 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
        className="nc-water absolute bottom-0 left-0 h-16 w-[120%]"
        style={{ animationDuration: "6s" }}
      >
        <path
          d="M0 30 Q50 6 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 L800 60 L0 60Z"
          fill="#38bdf8"
          opacity={0.45}
        />
      </svg>
      <svg
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
        className="nc-water absolute bottom-0 left-0 h-12 w-[120%]"
        style={{ animationDuration: "8s", animationDirection: "reverse" }}
      >
        <path
          d="M0 34 Q50 12 100 34 T200 34 T300 34 T400 34 T500 34 T600 34 T700 34 T800 34 L800 60 L0 60Z"
          fill="#0ea5e9"
          opacity={0.55}
        />
      </svg>
    </div>
  );
}

const MEADOW_FALL: Floater[] = [
  { emoji: "🍃", left: 8, delay: 0, duration: 11, size: 18 },
  { emoji: "🌸", left: 30, delay: -4, duration: 13, size: 16 },
  { emoji: "🍃", left: 55, delay: -7, duration: 12, size: 15 },
  { emoji: "🌼", left: 78, delay: -2, duration: 14, size: 16 },
  { emoji: "🍃", left: 92, delay: -9, duration: 10, size: 14 },
];
const ORCHARD_FALL: Floater[] = [
  { emoji: "🍎", left: 10, delay: 0, duration: 13, size: 20 },
  { emoji: "🍊", left: 34, delay: -5, duration: 15, size: 18 },
  { emoji: "🍋", left: 60, delay: -8, duration: 12, size: 18 },
  { emoji: "🍐", left: 82, delay: -3, duration: 14, size: 18 },
  { emoji: "🍃", left: 94, delay: -10, duration: 11, size: 14 },
];
const KITCHEN_FALL: Floater[] = [
  { emoji: "🥕", left: 8, delay: 0, duration: 14, size: 20 },
  { emoji: "🍅", left: 28, delay: -6, duration: 13, size: 18 },
  { emoji: "🧄", left: 52, delay: -3, duration: 15, size: 16 },
  { emoji: "🌶️", left: 74, delay: -9, duration: 12, size: 18 },
  { emoji: "🥦", left: 92, delay: -5, duration: 14, size: 20 },
];
const LAKE_FALL: Floater[] = [
  { emoji: "✨", left: 12, delay: 0, duration: 12, size: 16 },
  { emoji: "🌺", left: 38, delay: -5, duration: 16, size: 18 },
  { emoji: "✨", left: 64, delay: -8, duration: 13, size: 14 },
  { emoji: "🍃", left: 86, delay: -3, duration: 14, size: 15 },
];

/** Fundo animado de cada unidade. Fica atrás do caminho e não recebe cliques. */
/** Fundo sóbrio do perfil adulto: degradê suave, malha de pontos e formas discretas. */
function AdultScenery({ scene }: { scene: SceneId }) {
  const theme = ADULT_THEMES[scene];
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${theme.sky}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(${theme.main}33 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl"
        style={{ background: theme.main, opacity: 0.14 }}
      />
      <div
        className="absolute -right-20 bottom-16 h-80 w-80 rounded-full blur-3xl"
        style={{ background: theme.dark, opacity: 0.1 }}
      />
      {[12, 34, 58, 82].map((left, i) => (
        <span
          key={left}
          className="nc-fall absolute top-0 h-1.5 w-1.5 rounded-full opacity-0"
          style={{
            left: `${left}%`,
            background: theme.main,
            animationDelay: `${-i * 4}s`,
            animationDuration: `${22 + i * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Scenery({ scene, variant = "kid" }: { scene: SceneId; variant?: ProfileKind }) {
  if (variant === "adult") return <AdultScenery scene={scene} />;
  const theme = SCENE_THEMES[scene];
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${theme.sky}`}
      aria-hidden="true"
    >
      {scene === "meadow" && (
        <>
          <span
            className="nc-twinkle absolute right-6 top-4 text-5xl"
            style={{ animationDuration: "6s" }}
          >
            ☀️
          </span>
          <Clouds />
          <Hills a="#34d399" b="#10b981" />
          <Falling items={MEADOW_FALL} />
          <Spots
            items={[
              { emoji: "🌳", x: 2, y: 22, size: 54, className: "nc-sway" },
              { emoji: "🌲", x: 88, y: 46, size: 60, className: "nc-sway", delay: -2 },
              { emoji: "🌷", x: 8, y: 62, size: 26, className: "nc-sway", delay: -1 },
              { emoji: "🌼", x: 90, y: 20, size: 24, className: "nc-sway", delay: -3 },
              { emoji: "🌻", x: 4, y: 86, size: 32, className: "nc-sway", delay: -2 },
              { emoji: "🦋", x: 20, y: 40, size: 24, className: "nc-flutter" },
              { emoji: "🦋", x: 62, y: 72, size: 20, className: "nc-flutter", delay: -4 },
              { emoji: "🐞", x: 84, y: 82, size: 18, className: "nc-bob" },
            ]}
          />
        </>
      )}
      {scene === "orchard" && (
        <>
          <span
            className="nc-twinkle absolute left-6 top-4 text-5xl"
            style={{ animationDuration: "7s" }}
          >
            🌞
          </span>
          <Clouds />
          <Hills a="#fbbf24" b="#f59e0b" />
          <Falling items={ORCHARD_FALL} />
          <Spots
            items={[
              { emoji: "🌳", x: 3, y: 30, size: 58, className: "nc-sway" },
              { emoji: "🍎", x: 6, y: 34, size: 14, className: "nc-twinkle" },
              { emoji: "🌳", x: 86, y: 14, size: 52, className: "nc-sway", delay: -2 },
              { emoji: "🍊", x: 89, y: 18, size: 13, className: "nc-twinkle", delay: -1 },
              { emoji: "🧺", x: 88, y: 84, size: 34 },
              { emoji: "🐝", x: 24, y: 28, size: 20, className: "nc-flutter" },
              { emoji: "🐝", x: 58, y: 62, size: 18, className: "nc-flutter", delay: -5 },
              { emoji: "🌻", x: 6, y: 82, size: 30, className: "nc-sway", delay: -1 },
            ]}
          />
        </>
      )}
      {scene === "kitchen" && (
        <>
          <div
            className="absolute inset-0 opacity-40 dark:opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(45deg, rgb(244 63 94 / 0.10) 25%, transparent 25%, transparent 75%, rgb(244 63 94 / 0.10) 75%), linear-gradient(45deg, rgb(244 63 94 / 0.10) 25%, transparent 25%, transparent 75%, rgb(244 63 94 / 0.10) 75%)",
              backgroundSize: "48px 48px",
              backgroundPosition: "0 0, 24px 24px",
            }}
          />
          <Falling items={KITCHEN_FALL} />
          <Spots
            items={[
              { emoji: "🍳", x: 3, y: 24, size: 44, className: "nc-wobble" },
              { emoji: "♨️", x: 5, y: 16, size: 20, className: "nc-bob" },
              { emoji: "🍲", x: 86, y: 40, size: 44, className: "nc-wobble", delay: -1 },
              { emoji: "♨️", x: 89, y: 32, size: 20, className: "nc-bob", delay: -1 },
              { emoji: "🥗", x: 6, y: 72, size: 40, className: "nc-wobble", delay: -2 },
              { emoji: "🍽️", x: 88, y: 82, size: 36 },
              { emoji: "✨", x: 20, y: 50, size: 16, className: "nc-twinkle" },
              { emoji: "✨", x: 74, y: 22, size: 14, className: "nc-twinkle", delay: -1 },
              { emoji: "✨", x: 64, y: 68, size: 16, className: "nc-twinkle", delay: -2 },
            ]}
          />
        </>
      )}
      {scene === "lake" && (
        <>
          <span
            className="nc-twinkle absolute right-8 top-5 text-4xl"
            style={{ animationDuration: "5s" }}
          >
            🌙
          </span>
          <Spots
            items={[
              { emoji: "✨", x: 14, y: 8, size: 14, className: "nc-twinkle" },
              { emoji: "✨", x: 40, y: 14, size: 12, className: "nc-twinkle", delay: -1 },
              { emoji: "✨", x: 70, y: 6, size: 16, className: "nc-twinkle", delay: -2 },
            ]}
          />
          <Clouds dim />
          <Waves />
          <Falling items={LAKE_FALL} />
          <Spots
            items={[
              { emoji: "🌿", x: 3, y: 30, size: 44, className: "nc-sway" },
              { emoji: "🌺", x: 8, y: 82, size: 30, className: "nc-bob" },
              { emoji: "🌺", x: 86, y: 76, size: 26, className: "nc-bob", delay: -1 },
              { emoji: "🕊️", x: 20, y: 22, size: 26, className: "nc-flutter" },
              { emoji: "🐟", x: 70, y: 90, size: 22, className: "nc-bob-fast" },
              { emoji: "🌿", x: 90, y: 34, size: 40, className: "nc-sway", delay: -2 },
            ]}
          />
        </>
      )}
    </div>
  );
}

/** Brilhinhos que piscam ao redor de um elemento (usado nas paradas douradas). */
export function Sparkles({ radius = 58 }: { radius?: number }) {
  const spots = [
    { a: -50, d: 0, s: 16 },
    { a: 20, d: 0.6, s: 12 },
    { a: 110, d: 1.2, s: 14 },
    { a: 200, d: 0.3, s: 12 },
    { a: 260, d: 0.9, s: 16 },
  ];
  return (
    <>
      {spots.map((sp, i) => {
        const rad = (sp.a * Math.PI) / 180;
        return (
          <span
            key={i}
            className="nc-twinkle pointer-events-none absolute left-1/2 top-1/2"
            style={{
              fontSize: sp.s,
              marginLeft: Math.cos(rad) * radius - sp.s / 2,
              marginTop: Math.sin(rad) * radius - sp.s / 2,
              animationDelay: `${sp.d}s`,
            }}
          >
            ✨
          </span>
        );
      })}
    </>
  );
}
