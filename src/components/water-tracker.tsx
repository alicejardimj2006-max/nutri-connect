// Água do dia (N2): um toque registra um copo. Meta ajustável, tamanho do copo, lembretes de
// água e os últimos 7 dias, sem culpa: dia abaixo da meta é só um dia, não uma falha.
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GlassWater, Minus, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useTr } from "@/components/settings-ui";
import { useAuth } from "@/hooks/use-auth";
import { useNoNumbers } from "@/lib/no-numbers";
import { playSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  DEFAULT_GLASS_ML,
  DEFAULT_GOAL,
  hasWaterReminders,
  lastWaterDays,
  setWaterReminders,
  useSetWater,
  useSetWaterGoal,
  useWaterDays,
  useWaterSettings,
  waterDay,
} from "@/lib/water";

const GLASS_SIZES = [150, 200, 250, 300, 350, 500];
const LEGACY_KEY = (userId: string) => `nc_fun_water_${userId}`;

/** Copos de hoje que ficaram só neste aparelho (versão antiga do cartão) sobem uma vez. */
function useMigrateLegacy(
  userId: string | undefined,
  ready: boolean,
  today: number,
  set: (n: number) => void,
) {
  useEffect(() => {
    if (!userId || !ready) return;
    try {
      const raw = window.localStorage.getItem(LEGACY_KEY(userId));
      if (!raw) return;
      window.localStorage.removeItem(LEGACY_KEY(userId));
      const legacy = Number((JSON.parse(raw) as Record<string, number>)[waterDay()] ?? 0);
      if (legacy > today) set(legacy);
    } catch {
      /* sem armazenamento: nada a migrar */
    }
  }, [userId, ready]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function WaterTracker({
  onGoalReached,
  showWeek = true,
}: {
  onGoalReached?: () => void;
  showWeek?: boolean;
}) {
  const tr = useTr();
  const { user } = useAuth();
  const settings = useWaterSettings(user?.id);
  const days = useWaterDays(user?.id, 7);
  const goal = settings.data?.goal_glasses ?? DEFAULT_GOAL;
  const glassMl = settings.data?.glass_ml ?? DEFAULT_GLASS_ML;
  const today = waterDay();
  const count = days.data?.find((d) => d.day === today)?.glasses ?? 0;
  const set = useSetWater(user?.id, goal);
  const [editing, setEditing] = useState(false);
  const noNumbers = useNoNumbers();

  useMigrateLegacy(user?.id, days.isSuccess, count, (n) => set.mutate(n));

  if (!user) {
    return (
      <p className="text-xs text-muted-foreground">
        <Link to="/login" className="font-semibold text-accent hover:underline">
          {tr(["Entre", "Sign in", "Inicia sesión", "Connectez-vous"])}
        </Link>{" "}
        {tr([
          "para registrar a sua água.",
          "to log your water.",
          "para registrar tu agua.",
          "pour enregistrer votre eau.",
        ])}
      </p>
    );
  }

  const change = (n: number) => {
    const next = Math.max(0, Math.min(40, n));
    if (next === count) return;
    set.mutate(next, { onError: (err) => toast.error((err as Error).message) });
    if (next >= goal && count < goal) {
      onGoalReached?.();
      playSound("achievement");
    } else {
      playSound("click");
    }
  };

  const extra = Math.max(0, count - goal);
  const pct = Math.min(100, Math.round((count / goal) * 100));

  return (
    <div>
      <div className={cn("grid gap-2", goal > 8 ? "grid-cols-5" : "grid-cols-4")}>
        {Array.from({ length: goal }, (_, i) => {
          const filled = i < count;
          return (
            <button
              key={i}
              type="button"
              onClick={() => change(filled && i === count - 1 ? i : i + 1)}
              aria-label={tr([
                `${i + 1} copos`,
                `${i + 1} glasses`,
                `${i + 1} vasos`,
                `${i + 1} verres`,
              ])}
              aria-pressed={filled}
              className={cn(
                "grid h-11 cursor-pointer place-items-center rounded-2xl border transition active:scale-90",
                filled
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary",
              )}
            >
              <GlassWater
                className={cn("h-5 w-5 transition-transform", filled && "scale-110")}
                fill={filled ? "currentColor" : "none"}
                fillOpacity={0.25}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => change(count - 1)}
          disabled={count <= 0}
          aria-label={tr(["Tirar um copo", "Remove a glass", "Quitar un vaso", "Retirer un verre"])}
          className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-secondary/70 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => change(count + 1)}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {tr(["Bebi um copo", "I drank a glass", "Bebí un vaso", "J'ai bu un verre"])}
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
          aria-label={tr([
            "Ajustar meta e lembretes",
            "Adjust goal and reminders",
            "Ajustar meta y recordatorios",
            "Régler l'objectif et les rappels",
          ])}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full transition",
            editing
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/70",
          )}
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      {!noNumbers && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-bold text-foreground tabular-nums">
            {count}/{goal} {tr(["copos", "glasses", "vasos", "verres"])}
            {extra > 0 && <span className="ml-1 font-semibold text-accent">(+{extra})</span>}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {((count * glassMl) / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} L
          </span>
        </div>
      )}
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
        {count >= goal
          ? tr([
              "Meta do dia batida! 💧",
              "Daily goal reached! 💧",
              "¡Meta del día lograda! 💧",
              "Objectif du jour atteint ! 💧",
            ])
          : count === 0
            ? tr([
                "Comece quando quiser: cada copo conta.",
                "Start whenever you like: every glass counts.",
                "Empieza cuando quieras: cada vaso cuenta.",
                "Commencez quand vous voulez : chaque verre compte.",
              ])
            : noNumbers
              ? tr([
                  "Sem pressa, um gole de cada vez.",
                  "No rush, one sip at a time.",
                  "Sin prisa, un sorbo a la vez.",
                  "Sans se presser, une gorgée à la fois.",
                ])
              : tr([
                  `Faltam ${goal - count}. Sem pressa, um gole de cada vez.`,
                  `${goal - count} to go. No rush, one sip at a time.`,
                  `Faltan ${goal - count}. Sin prisa, un sorbo a la vez.`,
                  `Encore ${goal - count}. Sans se presser, une gorgée à la fois.`,
                ])}
      </p>

      {editing && (
        <WaterSettingsForm goal={goal} glassMl={glassMl} setByPro={!!settings.data?.goal_set_by} />
      )}
      {showWeek && !editing && <WaterWeek userId={user.id} goal={goal} />}
    </div>
  );
}

function WaterSettingsForm({
  goal,
  glassMl,
  setByPro,
}: {
  goal: number;
  glassMl: number;
  setByPro: boolean;
}) {
  const tr = useTr();
  const { user } = useAuth();
  const setGoal = useSetWaterGoal();
  const [reminders, setReminders] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hasWaterReminders().then(setReminders, () => setReminders(false));
  }, []);

  const save = (patch: { goal?: number; glassMl?: number }) =>
    setGoal.mutate(
      { goal: patch.goal ?? goal, glassMl: patch.glassMl ?? glassMl },
      { onError: (err) => toast.error((err as Error).message) },
    );

  const toggleReminders = async (on: boolean) => {
    if (!user) return;
    setBusy(true);
    try {
      await setWaterReminders(user.id, on, tr);
      setReminders(on);
      if (on)
        toast.success(
          tr([
            "Lembretes de água ligados (9h às 19h, a cada 2 horas). Chegam nos aparelhos com notificações ativas.",
            "Water reminders on (9am to 7pm, every 2 hours). They reach devices with notifications on.",
            "Recordatorios de agua activados (9 h a 19 h, cada 2 horas). Llegan a dispositivos con notificaciones activas.",
            "Rappels d'eau activés (9 h à 19 h, toutes les 2 heures). Ils arrivent sur les appareils aux notifications activées.",
          ]),
        );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-secondary/40 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">
          {tr(["Meta diária", "Daily goal", "Meta diaria", "Objectif quotidien"])}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => save({ goal: Math.max(1, goal - 1) })}
            disabled={goal <= 1 || setGoal.isPending}
            className="grid h-7 w-7 place-items-center rounded-full bg-card text-foreground disabled:opacity-40"
            aria-label="-1"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-16 text-center font-bold tabular-nums text-foreground">
            {goal} {tr(["copos", "glasses", "vasos", "verres"])}
          </span>
          <button
            type="button"
            onClick={() => save({ goal: Math.min(20, goal + 1) })}
            disabled={goal >= 20 || setGoal.isPending}
            className="grid h-7 w-7 place-items-center rounded-full bg-card text-foreground disabled:opacity-40"
            aria-label="+1"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {setByPro && (
        <p className="text-[10px] text-muted-foreground">
          {tr([
            "Meta sugerida por quem acompanha você. Se mudar, conte na próxima conversa.",
            "Goal suggested by your care professional. If you change it, mention it next time you talk.",
            "Meta sugerida por quien te acompaña. Si la cambias, coméntalo en la próxima conversación.",
            "Objectif suggéré par votre professionnel. Si vous le changez, parlez-en lors du prochain échange.",
          ])}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">
          {tr(["Tamanho do copo", "Glass size", "Tamaño del vaso", "Taille du verre"])}
        </span>
        <select
          value={glassMl}
          onChange={(e) => save({ glassMl: Number(e.target.value) })}
          aria-label={tr(["Tamanho do copo", "Glass size", "Tamaño del vaso", "Taille du verre"])}
          className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground"
        >
          {GLASS_SIZES.map((ml) => (
            <option key={ml} value={ml}>
              {ml} ml
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">
          {tr(["Lembretes de água", "Water reminders", "Recordatorios de agua", "Rappels d'eau"])}
          <span className="block text-[10px] font-normal text-muted-foreground">
            {tr([
              "9h às 19h, a cada 2 horas. Param quando a meta é batida.",
              "9am to 7pm, every 2 hours. They stop once the goal is reached.",
              "9 h a 19 h, cada 2 horas. Paran al lograr la meta.",
              "9 h à 19 h, toutes les 2 heures. Ils s'arrêtent une fois l'objectif atteint.",
            ])}
          </span>
        </span>
        <Switch
          checked={!!reminders}
          disabled={reminders === null || busy}
          onCheckedChange={(v) => void toggleReminders(v)}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {tr([
          "A necessidade de água varia com o corpo, o clima e a atividade. Na dúvida, combine a meta com sua nutri.",
          "Water needs vary with body, climate and activity. If unsure, agree on a goal with your dietitian.",
          "La necesidad de agua varía según el cuerpo, el clima y la actividad. Ante la duda, acuerda la meta con tu nutri.",
          "Les besoins en eau varient selon le corps, le climat et l'activité. En cas de doute, fixez l'objectif avec votre diététicien(ne).",
        ])}
      </p>
    </div>
  );
}

/** Água do paciente vista pelo profissional: hoje, últimos 7 dias e ajuste da meta. */
export function PatientWaterCard({
  patientId,
  readOnly,
}: {
  patientId: string;
  readOnly?: boolean;
}) {
  const tr = useTr();
  const settings = useWaterSettings(patientId);
  const days = useWaterDays(patientId, 7);
  const setGoal = useSetWaterGoal(patientId);
  const goal = settings.data?.goal_glasses ?? DEFAULT_GOAL;
  const glassMl = settings.data?.glass_ml ?? DEFAULT_GLASS_ML;
  const today = days.data?.find((d) => d.day === waterDay())?.glasses ?? 0;
  const logged = (days.data ?? []).filter((d) => d.glasses > 0).length;

  const save = (g: number) =>
    setGoal.mutate(
      { goal: g },
      {
        onSuccess: () =>
          toast.success(
            tr([
              "Meta de água ajustada. O paciente recebe um aviso.",
              "Water goal updated. The patient gets a notice.",
              "Meta de agua ajustada. El paciente recibe un aviso.",
              "Objectif d'eau mis à jour. Le patient reçoit un avis.",
            ]),
          ),
        onError: (err) => toast.error((err as Error).message),
      },
    );

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <GlassWater className="h-4 w-4 text-accent" />
            {tr(["Água do dia", "Daily water", "Agua del día", "L'eau du jour"])}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {tr(["Hoje", "Today", "Hoy", "Aujourd'hui"])}: {today}/{goal} ·{" "}
            {tr([
              `registrou em ${logged} de 7 dias`,
              `logged on ${logged} of 7 days`,
              `registró en ${logged} de 7 días`,
              `enregistré ${logged} jours sur 7`,
            ])}{" "}
            · {glassMl} ml/{tr(["copo", "glass", "vaso", "verre"])}
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">
              {tr(["Meta", "Goal", "Meta", "Objectif"])}
            </span>
            <button
              type="button"
              onClick={() => save(Math.max(1, goal - 1))}
              disabled={goal <= 1 || setGoal.isPending}
              className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground disabled:opacity-40"
              aria-label="-1"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-14 text-center font-bold tabular-nums text-foreground">
              {goal} {tr(["copos", "glasses", "vasos", "verres"])}
            </span>
            <button
              type="button"
              onClick={() => save(Math.min(20, goal + 1))}
              disabled={goal >= 20 || setGoal.isPending}
              className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground disabled:opacity-40"
              aria-label="+1"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <WaterWeek userId={patientId} goal={goal} />
    </section>
  );
}

const WEEKDAY: [string, string, string, string][] = [
  ["D", "S", "D", "D"],
  ["S", "M", "L", "L"],
  ["T", "T", "M", "M"],
  ["Q", "W", "X", "M"],
  ["Q", "T", "J", "J"],
  ["S", "F", "V", "V"],
  ["S", "S", "S", "S"],
];

/** Últimos 7 dias em barrinhas (também usado pelo profissional, com `userId` do paciente). */
export function WaterWeek({ userId, goal }: { userId: string; goal?: number }) {
  const tr = useTr();
  const days = useWaterDays(userId, 7);
  const keys = lastWaterDays(7);
  return (
    <div
      className="mt-3 flex items-end justify-between gap-1"
      aria-label={tr(["Últimos 7 dias", "Last 7 days", "Últimos 7 días", "7 derniers jours"])}
    >
      {keys.map((k) => {
        const row = days.data?.find((d) => d.day === k);
        const g = row?.goal ?? goal ?? DEFAULT_GOAL;
        const v = row?.glasses ?? 0;
        const h = Math.max(6, Math.min(100, Math.round((v / g) * 100)));
        const date = new Date(`${k}T12:00:00`);
        return (
          <div key={k} className="flex flex-1 flex-col items-center gap-1" title={`${v}/${g}`}>
            <div className="flex h-10 w-full items-end overflow-hidden rounded-md bg-secondary/60">
              <div
                className={cn(
                  "w-full rounded-md transition-all",
                  v >= g ? "bg-accent" : "bg-accent/45",
                )}
                style={{ height: `${v ? h : 0}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">{tr(WEEKDAY[date.getDay()])}</span>
          </div>
        );
      })}
    </div>
  );
}
