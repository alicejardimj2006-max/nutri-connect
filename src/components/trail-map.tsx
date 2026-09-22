import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  Apple,
  Beef,
  Brain,
  Check,
  ClipboardList,
  Crown,
  Droplets,
  Factory,
  Heart,
  HeartHandshake,
  Lock,
  Play,
  RotateCcw,
  Search,
  ShoppingBasket,
  Smile,
  Sprout,
  Star,
  Trophy,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Mascot, type MascotMood } from "@/components/mascots";
import { Scenery, Sparkles, themeFor, type SceneTheme } from "@/components/trail-scenery";
import {
  LEVEL_META,
  getStopProgress,
  isLevelUnlocked,
  isStopGold,
  isStopUnlocked,
  isUnitGold,
  isUnitUnlocked,
  type CharacterId,
  type LevelNumber,
  type ProfileKind,
  type Stop,
  type Trail,
  type TrailProgress,
  type Unit,
} from "@/lib/learning-trail";

/** Ícones (lucide) das paradas do perfil adulto. */
const STOP_ICONS: Record<string, LucideIcon> = {
  Beef,
  Apple,
  Droplets,
  Factory,
  Search,
  ClipboardList,
  UtensilsCrossed,
  Sprout,
  ShoppingBasket,
  HeartHandshake,
  Brain,
  Smile,
};

const ROW_H = 178;
const TOP_PAD = 78;
const BOTTOM_PAD = 120;
/** Posição horizontal (em %) de cada parada: desenha uma trilha sinuosa. */
const X_POS = [50, 74, 32, 68, 28, 72];

const nodeX = (i: number) => X_POS[i % X_POS.length];
const nodeY = (i: number) => TOP_PAD + i * ROW_H;

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/* ------------------------------ Estrelas e pips ------------------------------ */

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={
            n <= count
              ? "fill-amber-400 text-amber-500 drop-shadow-sm"
              : "fill-transparent text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}

/* --------------------------------- Parada --------------------------------- */

type NodeStatus = "locked" | "current" | "started" | "gold";

function StopNode({
  stop,
  status,
  progress,
  theme,
  variant,
  onOpen,
}: {
  stop: Stop;
  status: NodeStatus;
  progress: TrailProgress;
  theme: SceneTheme;
  variant: ProfileKind;
  onOpen: () => void;
}) {
  const adult = variant === "adult";
  const Icon = (stop.iconKey && STOP_ICONS[stop.iconKey]) || Sparkles;
  const p = getStopProgress(progress, stop.id);
  const locked = status === "locked";
  const gold = status === "gold";
  const [shake, setShake] = useState(false);

  const face = gold
    ? "linear-gradient(160deg, #fef08a 0%, #facc15 45%, #f59e0b 100%)"
    : locked
      ? "linear-gradient(160deg, #e5e7eb, #cbd5e1)"
      : `linear-gradient(160deg, ${theme.main}, ${theme.dark})`;
  const dark = gold ? "#b45309" : locked ? "#94a3b8" : theme.dark;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {status === "current" && (
          <>
            <span
              className="nc-ring absolute inset-0 rounded-full"
              style={{ background: theme.main, opacity: 0.5 }}
            />
            <div className="nc-bob-fast absolute -top-11 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-2xl border-2 border-border bg-card px-3.5 py-1.5 text-xs font-black text-foreground shadow-md">
              Começar!
              <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-border bg-card" />
            </div>
          </>
        )}
        {gold && <Sparkles radius={62} />}

        <button
          type="button"
          onClick={() => (locked ? setShake(true) : onOpen())}
          onAnimationEnd={() => setShake(false)}
          aria-label={locked ? `${stop.title} (bloqueada)` : `Abrir ${stop.title}`}
          title={locked ? "Conclua a parada anterior para desbloquear" : stop.title}
          style={{ background: face, "--dark": dark } as CSSProperties}
          className={`relative grid h-[88px] w-[88px] place-items-center overflow-hidden rounded-full border-4 border-white/70 shadow-[0_8px_0_0_var(--dark)] outline-none transition-all duration-150 focus-visible:ring-4 focus-visible:ring-primary/50 sm:h-24 sm:w-24 ${
            locked
              ? "cursor-not-allowed"
              : "cursor-pointer hover:-translate-y-1 hover:brightness-105 active:translate-y-[6px] active:shadow-[0_2px_0_0_var(--dark)]"
          } ${gold ? "nc-glow" : ""} ${shake ? "nc-shake" : ""}`}
        >
          <span
            className={`select-none text-[2.6rem] leading-none drop-shadow-md sm:text-5xl ${
              locked ? "opacity-40 grayscale" : status === "current" && !adult ? "nc-bob-fast" : ""
            }`}
          >
            {adult ? (
              locked ? (
                <Lock className="h-8 w-8 text-slate-500" />
              ) : (
                <Icon className="h-9 w-9 text-white drop-shadow" strokeWidth={2} />
              )
            ) : locked ? (
              "🔒"
            ) : (
              stop.icon
            )}
          </span>
          {!locked && (
            <span className="absolute left-1/2 top-1.5 h-2.5 w-10 -translate-x-1/2 rounded-full bg-white/40" />
          )}
          {gold && <span className="nc-gold-shine absolute inset-0 rounded-full" />}
        </button>

        {gold && (
          <span className="nc-pop absolute -right-1.5 -top-3 z-20 grid h-9 w-9 rotate-12 place-items-center rounded-full border-2 border-white bg-gradient-to-b from-yellow-300 to-amber-500 shadow-md">
            <Crown className="h-5 w-5 fill-white text-white" />
          </span>
        )}
        {!gold && p.done > 0 && (
          <span className="absolute -right-1 -top-1 z-20 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
            <Check className="h-4 w-4 text-white" strokeWidth={3.5} />
          </span>
        )}
      </div>

      {/* Título e níveis */}
      <div
        className={`mt-3.5 w-36 rounded-2xl bg-card/85 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm sm:w-40 ${
          locked ? "opacity-60" : ""
        }`}
      >
        <span className="block text-[11px] font-black leading-tight text-foreground sm:text-xs">
          {stop.title}
        </span>
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          {([1, 2, 3] as LevelNumber[]).map((n) => {
            const done = p.done >= n;
            return (
              <span
                key={n}
                title={`Nível ${n}: ${LEVEL_META[n].label}`}
                className={`grid h-[18px] w-[18px] place-items-center rounded-full border-2 text-[9px] font-black ${
                  done
                    ? gold
                      ? "border-amber-500 bg-amber-400 text-white"
                      : "border-transparent text-white"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
                style={done && !gold ? { background: theme.main } : undefined}
              >
                {done ? <Check className="h-2.5 w-2.5" strokeWidth={4} /> : n}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Mascote que caminha --------------------------- */

function TrailWalker({
  guide,
  x,
  y,
  width,
  moving,
}: {
  guide: CharacterId;
  x: number;
  y: number;
  width: number;
  moving: boolean;
}) {
  // Fica ao lado da parada, do lado com mais espaço.
  const left = x > 50;
  const size = 68;
  const px = (x / 100) * width + (left ? -size - 58 : 58);
  const mood: MascotMood = moving ? "cheer" : "idle";
  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: px,
        top: y - size * 0.6,
        transition:
          "left 1.1s cubic-bezier(0.45, 0, 0.2, 1), top 1.1s cubic-bezier(0.45, 0, 0.2, 1)",
      }}
    >
      <Mascot id={guide} mood={mood} size={size} flip={!left} />
      {!moving && (
        <span className="nc-pop absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-2 py-0.5 text-[10px] font-black text-foreground shadow-md">
          Vamos!
        </span>
      )}
    </div>
  );
}

/* --------------------------- Cabeçalho da unidade --------------------------- */

function UnitBanner({
  unit,
  index,
  theme,
  progress,
  locked,
  requiredTitle,
  variant,
  guide,
}: {
  unit: Unit;
  index: number;
  theme: SceneTheme;
  progress: TrailProgress;
  locked: boolean;
  requiredTitle?: string;
  variant: ProfileKind;
  guide: CharacterId;
}) {
  const adult = variant === "adult";
  const gold = isUnitGold(progress, unit);
  const started = unit.stops.filter((s) => getStopProgress(progress, s.id).done >= 1).length;
  const stars = unit.stops.reduce(
    (sum, s) => sum + getStopProgress(progress, s.id).stars.reduce((a, b) => a + b, 0),
    0,
  );
  const goldStops = unit.stops.filter((s) => isStopGold(progress, s.id)).length;
  const pct = Math.round((goldStops / unit.stops.length) * 100);

  if (locked) {
    return (
      <div className="relative z-10 mx-auto flex w-full max-w-lg items-center gap-4 rounded-[2rem] border-2 border-dashed border-border bg-card/80 p-5 backdrop-blur-sm">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-border bg-secondary">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            Unidade {index + 1}
          </span>
          <h2 className="text-lg font-black leading-tight text-muted-foreground sm:text-xl">
            {unit.title}
          </h2>
          {requiredTitle && (
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Conclua o nível 1 de todas as paradas de “{requiredTitle}” para abrir.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative z-10 mx-auto w-full max-w-lg overflow-hidden shadow-lg ${
        adult ? "rounded-2xl border-b-4 p-5" : "rounded-[2rem] border-b-8 p-5 sm:p-6"
      } ${gold ? "text-amber-950" : "text-white"}`}
      style={{
        background: gold
          ? "linear-gradient(135deg, #fde047, #f59e0b)"
          : `linear-gradient(135deg, ${theme.main}, ${theme.dark})`,
        borderColor: gold ? "#b45309" : theme.dark,
      }}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      {gold && <span className="nc-gold-shine absolute inset-0" />}
      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-85 sm:text-xs">
            <span>Unidade {index + 1}</span>
            {gold && (
              <span className="nc-pop inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5">
                <Crown className="h-3 w-3 fill-white" /> Dourada
              </span>
            )}
          </div>
          <h2 className="mt-0.5 font-display text-2xl font-black leading-tight text-inherit drop-shadow-sm sm:text-3xl">
            {!adult && `${unit.icon} `}
            {unit.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug opacity-90 sm:text-sm">
            {unit.description}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-3 flex-1 overflow-hidden rounded-full border border-white/20 bg-black/20">
              <div
                className="nc-stripes absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-700"
                style={{ width: `${Math.max(pct, started > 0 ? 8 : 0)}%` }}
              />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-black tabular-nums">
              <Star className="h-3.5 w-3.5 fill-white" /> {stars}/{unit.stops.length * 9}
            </span>
          </div>
        </div>
        <Mascot
          id={guide}
          mood={gold ? "cheer" : "idle"}
          size={adult ? 76 : 82}
          className="hidden sm:inline-block"
        />
      </div>
    </div>
  );
}

/* ---------------------------------- Mapa ---------------------------------- */

interface LearningTrailMapProps {
  trail: Trail;
  progress: TrailProgress;
  currentStopId: string | null;
  /** Enquanto uma lição está aberta, o mascote espera para caminhar só quando ela fechar. */
  frozen: boolean;
  onOpenStop: (stop: Stop, unit: Unit) => void;
}

export function LearningTrailMap({
  trail,
  progress,
  currentStopId,
  frozen,
  onOpenStop,
}: LearningTrailMapProps) {
  const units = trail.units;
  const [shownStopId, setShownStopId] = useState(currentStopId);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (frozen || currentStopId === shownStopId) return;
    const t = window.setTimeout(() => {
      setShownStopId(currentStopId);
      setMoving(true);
      window.setTimeout(() => setMoving(false), 1300);
    }, 450);
    return () => window.clearTimeout(t);
  }, [frozen, currentStopId, shownStopId]);

  return (
    <div className="flex w-full flex-col gap-10">
      {units.map((unit, unitIndex) => (
        <UnitSection
          key={unit.id}
          trail={trail}
          unit={unit}
          unitIndex={unitIndex}
          units={units}
          progress={progress}
          walkerStopId={shownStopId}
          moving={moving}
          currentStopId={currentStopId}
          onOpenStop={onOpenStop}
        />
      ))}

      <TrailFinale units={units} progress={progress} variant={trail.kind} />
    </div>
  );
}

function UnitSection({
  trail,
  unit,
  unitIndex,
  units,
  progress,
  walkerStopId,
  moving,
  currentStopId,
  onOpenStop,
}: {
  trail: Trail;
  unit: Unit;
  unitIndex: number;
  units: Unit[];
  progress: TrailProgress;
  walkerStopId: string | null;
  moving: boolean;
  currentStopId: string | null;
  onOpenStop: (stop: Stop, unit: Unit) => void;
}) {
  const variant = trail.kind;
  const theme = themeFor(unit.scene, variant);
  const locked = !isUnitUnlocked(unit, progress, units);
  const required = units.find((u) => u.id === unit.requiredUnitId);
  const [areaRef, width] = useElementWidth<HTMLDivElement>();

  const height = TOP_PAD + (unit.stops.length - 1) * ROW_H + BOTTOM_PAD;

  // Curva suave passando pelo centro de cada parada.
  const pts = unit.stops.map((_, i) => ({ x: (nodeX(i) / 100) * width, y: nodeY(i) }));
  const d = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const dy = (p.y - prev.y) * 0.55;
      return `C ${prev.x} ${prev.y + dy}, ${p.x} ${p.y - dy}, ${p.x} ${p.y}`;
    })
    .join(" ");

  // Trecho já percorrido: até a última parada em que o nível 1 foi concluído.
  const reached = unit.stops.filter((s) => getStopProgress(progress, s.id).done >= 1).length;
  const walked = unit.stops.length > 1 ? Math.min(1, reached / (unit.stops.length - 1)) : 0;

  const walkerIndex = unit.stops.findIndex((s) => s.id === walkerStopId);
  const guide = trail.guide;

  return (
    <section
      className={`relative overflow-hidden border-2 border-border/70 shadow-sm ${
        variant === "adult" ? "rounded-3xl" : "rounded-[2.5rem]"
      }`}
    >
      <Scenery scene={unit.scene} variant={variant} />
      <div className="relative px-3 pb-2 pt-5 sm:px-6 sm:pt-7">
        <UnitBanner
          unit={unit}
          index={unitIndex}
          theme={theme}
          progress={progress}
          locked={locked}
          requiredTitle={required?.title}
          variant={variant}
          guide={guide}
        />

        {!locked && (
          <div ref={areaRef} className="relative mx-auto mt-2 w-full max-w-lg" style={{ height }}>
            {width > 0 && (
              <svg
                className="absolute inset-0"
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                aria-hidden="true"
              >
                {/* Estrada */}
                <path
                  d={d}
                  fill="none"
                  stroke="rgb(0 0 0 / 0.08)"
                  strokeWidth={52}
                  strokeLinecap="round"
                  transform="translate(0 5)"
                />
                <path
                  d={d}
                  fill="none"
                  stroke={theme.road}
                  strokeWidth={46}
                  strokeLinecap="round"
                />
                <path
                  d={d}
                  fill="none"
                  stroke={theme.roadLine}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeDasharray="2 14"
                />
                {/* Trecho percorrido */}
                <path
                  d={d}
                  fill="none"
                  stroke={theme.main}
                  strokeWidth={14}
                  strokeLinecap="round"
                  opacity={0.85}
                  pathLength={1}
                  strokeDasharray={`${walked} 1`}
                  style={{ transition: "stroke-dasharray 1.2s ease" }}
                />
              </svg>
            )}

            {unit.stops.map((stop, i) => {
              const gold = isStopGold(progress, stop.id);
              const unlocked = isStopUnlocked(unit, i, progress, units);
              const p = getStopProgress(progress, stop.id);
              const status: NodeStatus = gold
                ? "gold"
                : !unlocked
                  ? "locked"
                  : stop.id === currentStopId && p.done === 0
                    ? "current"
                    : "started";
              return (
                <div
                  key={stop.id}
                  className="absolute z-10 -translate-x-1/2 -translate-y-[44px]"
                  style={{ left: `${nodeX(i)}%`, top: nodeY(i) }}
                >
                  <StopNode
                    stop={stop}
                    status={status}
                    progress={progress}
                    theme={theme}
                    variant={variant}
                    onOpen={() => onOpenStop(stop, unit)}
                  />
                </div>
              );
            })}

            {walkerIndex >= 0 && width > 0 && (
              <TrailWalker
                guide={guide}
                x={nodeX(walkerIndex)}
                y={nodeY(walkerIndex)}
                width={width}
                moving={moving}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TrailFinale({
  units,
  progress,
  variant,
}: {
  units: Unit[];
  progress: TrailProgress;
  variant: ProfileKind;
}) {
  const allGold = units.every((u) => isUnitGold(progress, u));
  const adult = variant === "adult";
  return (
    <div className="relative flex flex-col items-center py-10 text-center">
      <div
        className={`absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
          allGold ? "bg-amber-400/40" : "bg-amber-400/15"
        }`}
      />
      <div
        className={`relative z-10 ${adult ? "" : "text-7xl"} ${
          allGold ? (adult ? "" : "nc-hop-loop") : adult ? "opacity-40" : "nc-bob grayscale"
        }`}
      >
        {adult ? <Trophy className="h-16 w-16 text-amber-500" strokeWidth={1.6} /> : "🏆"}
      </div>
      {allGold && <Sparkles radius={70} />}
      <h3 className="relative z-10 mt-3 font-display text-3xl font-black text-amber-500 drop-shadow-sm">
        {adult ? "Trilha concluída" : "Mestre da Nutrição"}
      </h3>
      <p className="relative z-10 mt-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {allGold
          ? adult
            ? "Todas as paradas douradas. Excelente trabalho."
            : "Você deixou toda a trilha dourada!"
          : "Deixe todas as paradas douradas"}
      </p>
    </div>
  );
}

/* ------------------------------ Folha da parada ------------------------------ */

const LEVEL_STYLE: Record<LevelNumber, { from: string; to: string }> = {
  1: { from: "#4ade80", to: "#16a34a" },
  2: { from: "#38bdf8", to: "#0284c7" },
  3: { from: "#a78bfa", to: "#7c3aed" },
};

export function StopSheet({
  stop,
  unit,
  trail,
  progress,
  onClose,
  onStart,
}: {
  stop: Stop | null;
  unit: Unit | null;
  trail: Trail;
  progress: TrailProgress;
  onClose: () => void;
  onStart: (stop: Stop, level: LevelNumber) => void;
}) {
  const guide = trail.guide;
  const adult = trail.kind === "adult";
  const theme = themeFor(unit?.scene ?? "meadow", trail.kind);
  const StopIcon = (stop?.iconKey && STOP_ICONS[stop.iconKey]) || Sparkles;
  const p = stop
    ? getStopProgress(progress, stop.id)
    : { done: 0, stars: [0, 0, 0] as [number, number, number] };
  const gold = p.done === 3;
  const nextLevel = Math.min(p.done + 1, 3) as LevelNumber;

  return (
    <Dialog open={!!stop} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-md gap-0 overflow-y-auto rounded-[2rem] border-0 p-0">
        {stop && (
          <>
            <div
              className="relative overflow-hidden px-6 pb-6 pt-7 text-white"
              style={{
                background: gold
                  ? "linear-gradient(135deg, #fde047, #f59e0b)"
                  : `linear-gradient(135deg, ${theme.main}, ${theme.dark})`,
              }}
            >
              {gold && <span className="nc-gold-shine absolute inset-0" />}
              <div className="relative flex items-center gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-2 border-white/40 bg-white/25 text-5xl shadow-inner">
                  {adult ? (
                    <StopIcon className="h-9 w-9 text-white" strokeWidth={1.8} />
                  ) : (
                    <span className="nc-bob">{stop.icon}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <DialogDescription className="text-[11px] font-black uppercase tracking-widest text-white/85">
                    {unit?.title}
                    {gold && (adult ? " · Parada dourada" : " · Parada dourada 👑")}
                  </DialogDescription>
                  <DialogTitle className="mt-0.5 font-display text-2xl font-black leading-tight text-white">
                    {stop.title}
                  </DialogTitle>
                </div>
              </div>
              <div className="relative mt-4 flex items-end gap-3">
                <Mascot id={guide} mood="talk" size={64} />
                <p className="relative mb-2 flex-1 rounded-2xl rounded-bl-none bg-white/95 px-3.5 py-2.5 text-sm font-semibold leading-snug text-slate-800 shadow-md">
                  {stop.summary}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-card p-5">
              {([1, 2, 3] as LevelNumber[]).map((n) => {
                const meta = LEVEL_META[n];
                const done = p.done >= n;
                const unlocked = isLevelUnlocked(progress, stop.id, n);
                const isNext = unlocked && !done;
                const style = LEVEL_STYLE[n];
                return (
                  <div
                    key={n}
                    className={`nc-rise flex items-center gap-3.5 rounded-2xl border-2 p-3.5 transition ${
                      isNext
                        ? "border-primary/50 bg-primary-soft/40 shadow-sm"
                        : done
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border bg-secondary/40 opacity-70"
                    }`}
                    style={{ animationDelay: `${n * 70}ms` }}
                  >
                    <span
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl shadow-inner"
                      style={{
                        background: unlocked
                          ? `linear-gradient(160deg, ${style.from}, ${style.to})`
                          : "linear-gradient(160deg,#e5e7eb,#cbd5e1)",
                      }}
                    >
                      {unlocked ? (
                        adult ? (
                          <span className="text-xl font-black text-white">{n}</span>
                        ) : (
                          meta.emoji
                        )
                      ) : (
                        <Lock className="h-6 w-6 text-slate-500" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-foreground">
                          Nível {n} · {meta.label}
                        </span>
                        {done && <Stars count={p.stars[n - 1]} size={13} />}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">{meta.blurb}</p>
                      <p className="mt-1 flex items-center gap-2.5 text-[11px] font-bold text-muted-foreground">
                        <span className="text-amber-600 dark:text-amber-400">+{meta.xp} XP</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> {meta.hearts}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => onStart(stop, n)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-black transition active:translate-y-0.5 ${
                        !unlocked
                          ? "cursor-not-allowed bg-secondary text-muted-foreground"
                          : isNext
                            ? "cursor-pointer bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--primary-hover)] hover:brightness-110 active:shadow-none"
                            : "cursor-pointer border-2 border-border bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {done ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" /> Repetir
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />{" "}
                          {unlocked ? "Jogar" : "Bloqueado"}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}

              <p className="px-1 pt-1 text-center text-[11px] font-semibold text-muted-foreground">
                {gold
                  ? "Parada dourada! Repita os níveis para treinar e ganhar XP extra."
                  : `Complete o nível ${nextLevel} para avançar. Ao concluir os 3 níveis, a parada fica dourada!`}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
