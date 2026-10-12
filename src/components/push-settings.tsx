// Notificações no celular (app instalável): ativar o push neste aparelho, testar, instalar o app,
// aviso de consulta e lembretes. Usado em Configurações → Notificações e no convite do Espaço.
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, BellOff, BellRing, Download, Plus, Share, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/appearance-editor";
import { useTr } from "@/components/settings-ui";
import { AndroidDownloadButton, useAndroidBrowser } from "@/components/android-app";
import { useAuth } from "@/hooks/use-auth";
import { useAppearance } from "@/hooks/use-appearance";
import { useI18n } from "@/hooks/use-i18n";
import { pushPatch } from "@/hooks/use-push-sync";
import { loadNotificationSettings, saveNotificationSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import {
  INSTALL_EVENT,
  REMINDER_SUGGESTIONS,
  canInstall,
  createReminder,
  currentSubscription,
  deleteReminder,
  disablePush,
  enablePush,
  getPushSettings,
  isStandalone,
  listReminders,
  promptInstall,
  pushSupport,
  savePushSettings,
  sendTestPush,
  updateReminder,
  type PushSupport,
  type Reminder,
} from "@/lib/push";

const qk = {
  device: ["push", "device"] as const,
  settings: ["push", "settings"] as const,
  reminders: ["push", "reminders"] as const,
};

type DeviceState = { support: PushSupport; permission: NotificationPermission; on: boolean };

async function deviceState(): Promise<DeviceState> {
  const support = pushSupport();
  const permission =
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default";
  const on = support === "ok" && permission === "granted" && !!(await currentSubscription());
  return { support, permission, on };
}

/** Estado do push neste aparelho (inscrito ou não). */
function usePushDevice() {
  return useQuery({ queryKey: qk.device, queryFn: deviceState, staleTime: 30_000 });
}

/** Ativa o push neste aparelho e já leva para o servidor o silêncio e a prévia escolhidos. */
function useEnablePush() {
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const qc = useQueryClient();
  const tr = useTr();
  return useMutation({
    mutationFn: async () => {
      const permission = await enablePush();
      if (permission === "granted" && user) {
        await savePushSettings(user.id, pushPatch(appearance));
        saveNotificationSettings(user.id, {
          ...loadNotificationSettings(user.id),
          pushEnabled: true,
        });
      }
      return permission;
    },
    onSuccess: (permission) => {
      if (permission === "denied") {
        toast.error(
          tr([
            "O navegador bloqueou as notificações. Libere nas configurações do site (ícone do cadeado).",
            "The browser blocked notifications. Allow them in the site settings (padlock icon).",
            "El navegador bloqueó las notificaciones. Permítelas en la configuración del sitio (candado).",
            "Le navigateur a bloqué les notifications. Autorisez-les dans les réglages du site (cadenas).",
          ]),
        );
      } else if (permission === "granted") {
        toast.success(
          tr([
            "Pronto! Este aparelho vai receber os avisos.",
            "Done! This device will receive notifications.",
            "¡Listo! Este dispositivo recibirá los avisos.",
            "C'est fait ! Cet appareil recevra les notifications.",
          ]),
        );
      }
    },
    onError: (err) => toast.error((err as Error).message),
    onSettled: () => qc.invalidateQueries({ queryKey: ["push"] }),
  });
}

function useCanInstall() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const sync = () => setCan(canInstall());
    sync();
    window.addEventListener(INSTALL_EVENT, sync);
    return () => window.removeEventListener(INSTALL_EVENT, sync);
  }, []);
  return can;
}

/** Instruções para o iPhone/iPad: o push só funciona com o app na Tela de Início. */
function IosInstallHint() {
  const tr = useTr();
  return (
    <div className="rounded-xl bg-secondary/40 px-3.5 py-3 text-xs leading-relaxed text-foreground">
      <p className="font-semibold">
        {tr([
          "No iPhone, os avisos chegam pelo app instalado:",
          "On iPhone, notifications arrive through the installed app:",
          "En iPhone, los avisos llegan por la app instalada:",
          "Sur iPhone, les notifications arrivent via l'app installée :",
        ])}
      </p>
      <ol className="mt-1.5 list-decimal space-y-0.5 pl-4 text-muted-foreground">
        <li>
          {tr(["Toque em", "Tap", "Toca", "Touchez"])}{" "}
          <Share className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
          {tr([
            "(Compartilhar) no Safari;",
            "(Share) in Safari;",
            "(Compartir) en Safari;",
            "(Partager) dans Safari ;",
          ])}
        </li>
        <li>
          {tr([
            "Escolha “Adicionar à Tela de Início”;",
            "Choose “Add to Home Screen”;",
            "Elige “Agregar a pantalla de inicio”;",
            "Choisissez « Sur l'écran d'accueil » ;",
          ])}
        </li>
        <li>
          {tr([
            "Abra o NutriConnect pelo ícone e volte aqui para ativar.",
            "Open NutriConnect from the icon and come back here to turn them on.",
            "Abre NutriConnect desde el ícono y vuelve aquí para activarlos.",
            "Ouvrez NutriConnect depuis l'icône et revenez ici pour les activer.",
          ])}
        </li>
      </ol>
    </div>
  );
}

const LEAD_OPTIONS: [number, [string, string, string, string]][] = [
  [0, ["Sem aviso", "No reminder", "Sin aviso", "Pas de rappel"]],
  [15, ["15 min antes", "15 min before", "15 min antes", "15 min avant"]],
  [30, ["30 min antes", "30 min before", "30 min antes", "30 min avant"]],
  [60, ["1 hora antes", "1 hour before", "1 hora antes", "1 heure avant"]],
  [120, ["2 horas antes", "2 hours before", "2 horas antes", "2 heures avant"]],
  [1440, ["1 dia antes", "1 day before", "1 día antes", "1 jour avant"]],
];

/** Cartão "No celular": ativar, testar, instalar e aviso de consulta. */
export function PushDeviceSection() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const tr = useTr();
  const qc = useQueryClient();
  const device = usePushDevice();
  const enable = useEnablePush();
  const can = useCanInstall();
  const android = useAndroidBrowser();
  const settings = useQuery({ queryKey: qk.settings, queryFn: getPushSettings, enabled: !!user });

  const disable = useMutation({
    mutationFn: async () => {
      await disablePush();
      if (user) {
        saveNotificationSettings(user.id, {
          ...loadNotificationSettings(user.id),
          pushEnabled: false,
        });
      }
    },
    onError: (err) => toast.error((err as Error).message),
    onSettled: () => qc.invalidateQueries({ queryKey: ["push"] }),
  });

  const test = useMutation({
    mutationFn: () => sendTestPush(locale),
    onSuccess: (sent) =>
      sent > 0
        ? toast.success(
            tr([
              "Aviso de teste enviado. Deve chegar em alguns segundos.",
              "Test notice sent. It should arrive in a few seconds.",
              "Aviso de prueba enviado. Debería llegar en unos segundos.",
              "Avis de test envoyé. Il devrait arriver dans quelques secondes.",
            ]),
          )
        : toast.error(
            tr([
              "Nenhum aparelho recebeu. Desative e ative de novo.",
              "No device received it. Turn it off and on again.",
              "Ningún dispositivo lo recibió. Desactiva y vuelve a activar.",
              "Aucun appareil ne l'a reçu. Désactivez puis réactivez.",
            ]),
          ),
    onError: (err) => toast.error((err as Error).message),
  });

  const lead = useMutation({
    mutationFn: (min: number) => savePushSettings(user!.id, { appointment_lead_min: min }),
    onError: (err) => toast.error((err as Error).message),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.settings }),
  });

  const state = device.data;
  const StatusIcon = state?.on ? BellRing : state?.permission === "denied" ? BellOff : Bell;
  const status = !state
    ? null
    : state.support === "instalar"
      ? null
      : state.support === "sem-suporte"
        ? tr([
            "Este navegador não recebe notificações push. Tente o Chrome, o Edge ou o Firefox.",
            "This browser can't receive push notifications. Try Chrome, Edge or Firefox.",
            "Este navegador no recibe notificaciones push. Prueba Chrome, Edge o Firefox.",
            "Ce navigateur ne reçoit pas les notifications push. Essayez Chrome, Edge ou Firefox.",
          ])
        : state.permission === "denied"
          ? tr([
              "As notificações estão bloqueadas para este site. Libere nas configurações do navegador (ícone do cadeado) e recarregue a página.",
              "Notifications are blocked for this site. Allow them in the browser settings (padlock icon) and reload.",
              "Las notificaciones están bloqueadas para este sitio. Permítelas en el navegador (candado) y recarga.",
              "Les notifications sont bloquées pour ce site. Autorisez-les dans le navigateur (cadenas) et rechargez.",
            ])
          : state.on
            ? tr([
                "Ativadas neste aparelho. Os avisos chegam mesmo com o site fechado.",
                "On for this device. Notices arrive even with the site closed.",
                "Activadas en este dispositivo. Los avisos llegan incluso con el sitio cerrado.",
                "Activées sur cet appareil. Les avis arrivent même site fermé.",
              ])
            : tr([
                "Desativadas neste aparelho.",
                "Off on this device.",
                "Desactivadas en este dispositivo.",
                "Désactivées sur cet appareil.",
              ]);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
      <h2 className="text-sm font-bold font-display text-foreground">
        {tr([
          "No celular e no computador",
          "On your phone and computer",
          "En el móvil y la computadora",
          "Sur mobile et ordinateur",
        ])}
      </h2>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {tr([
          "Receba lembretes, avisos de consulta e novidades mesmo com o NutriConnect fechado. Vale para cada aparelho separadamente.",
          "Get reminders, appointment alerts and news even with NutriConnect closed. Set it on each device.",
          "Recibe recordatorios, avisos de consulta y novedades incluso con NutriConnect cerrado. Se activa en cada dispositivo.",
          "Recevez rappels, alertes de consultation et nouveautés même NutriConnect fermé. À activer sur chaque appareil.",
        ])}
      </p>

      {state?.support === "instalar" ? (
        <div className="mt-4">
          <IosInstallHint />
        </div>
      ) : (
        status && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-secondary/40 px-3.5 py-2.5 text-xs text-foreground">
            <StatusIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{status}</span>
          </div>
        )
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {state?.support === "ok" && state.permission !== "denied" && (
          <>
            <Switch
              checked={state.on}
              disabled={enable.isPending || disable.isPending}
              onCheckedChange={(v) => (v ? enable.mutate() : disable.mutate())}
              aria-label={tr([
                "Notificações neste aparelho",
                "Notifications on this device",
                "Notificaciones en este dispositivo",
                "Notifications sur cet appareil",
              ])}
            />
            <span className="text-sm text-foreground">
              {state.on
                ? tr(["Ligadas", "On", "Activadas", "Activées"])
                : tr(["Desligadas", "Off", "Desactivadas", "Désactivées"])}
            </span>
          </>
        )}
        {state?.on && (
          <button
            type="button"
            onClick={() => test.mutate()}
            disabled={test.isPending}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-60"
          >
            {tr(["Enviar um teste", "Send a test", "Enviar una prueba", "Envoyer un test"])}
          </button>
        )}
        <AndroidDownloadButton showHint={false} />
        {can && !isStandalone() && !android && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Download className="h-4 w-4" />
            {tr(["Instalar o app", "Install the app", "Instalar la app", "Installer l'app"])}
          </button>
        )}
      </div>

      {state?.on && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {tr([
                "Aviso de consulta",
                "Appointment alert",
                "Aviso de consulta",
                "Alerte de consultation",
              ])}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {tr([
                "Chega mesmo no horário de silêncio: é um compromisso marcado.",
                "Arrives even during quiet hours: it's a scheduled commitment.",
                "Llega incluso en horario de silencio: es un compromiso agendado.",
                "Arrive même pendant les heures de silence : c'est un rendez-vous.",
              ])}
            </p>
          </div>
          <Select
            label="lead"
            value={settings.data?.appointment_lead_min ?? 60}
            options={LEAD_OPTIONS.map(([id, names]) => ({ id, label: tr(names) }))}
            onChange={(min) => lead.mutate(min)}
          />
        </div>
      )}
    </section>
  );
}

const DAY_LETTERS: [string, string, string, string][] = [
  ["D", "S", "D", "D"],
  ["S", "M", "L", "L"],
  ["T", "T", "M", "M"],
  ["Q", "W", "X", "M"],
  ["Q", "T", "J", "J"],
  ["S", "F", "V", "V"],
  ["S", "S", "S", "S"],
];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const hhmm = (time: string) => time.slice(0, 5);

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const tr = useTr();
  const qc = useQueryClient();
  const [time, setTime] = useState(hhmm(reminder.time_of_day));
  useEffect(() => setTime(hhmm(reminder.time_of_day)), [reminder.time_of_day]);

  const update = useMutation({
    mutationFn: (patch: Parameters<typeof updateReminder>[1]) => updateReminder(reminder.id, patch),
    onError: (err) => toast.error((err as Error).message),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.reminders }),
  });
  const remove = useMutation({
    mutationFn: () => deleteReminder(reminder.id),
    onError: (err) => toast.error((err as Error).message),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.reminders }),
  });

  const toggleDay = (d: number) => {
    const days = reminder.days.includes(d)
      ? reminder.days.filter((x) => x !== d)
      : [...reminder.days, d].sort();
    if (days.length === 0) return; // pelo menos um dia
    update.mutate({ days });
  };

  return (
    <div className={cn("py-3", !reminder.active && "opacity-60")}>
      <div className="flex items-center gap-3">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onBlur={() =>
            time && time !== hhmm(reminder.time_of_day) && update.mutate({ time_of_day: time })
          }
          aria-label={tr(["Horário", "Time", "Hora", "Heure"])}
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm tabular-nums text-foreground"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{reminder.title}</p>
          {reminder.body && (
            <p className="truncate text-[11px] text-muted-foreground">{reminder.body}</p>
          )}
        </div>
        <Switch
          checked={reminder.active}
          onCheckedChange={(active) => update.mutate({ active })}
          aria-label={reminder.title}
        />
        <button
          type="button"
          onClick={() => remove.mutate()}
          disabled={remove.isPending}
          aria-label={tr([
            "Apagar lembrete",
            "Delete reminder",
            "Borrar recordatorio",
            "Supprimer le rappel",
          ])}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex gap-1 pl-0.5">
        {ALL_DAYS.map((d) => {
          const on = reminder.days.includes(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              onClick={() => toggleDay(d)}
              className={cn(
                "h-7 w-7 rounded-full text-[11px] font-semibold transition",
                on
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {tr(DAY_LETTERS[d])}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Cartão "Lembretes": sugestões prontas (desligadas), lista e lembrete personalizado. */
export function RemindersSection() {
  const { user } = useAuth();
  const tr = useTr();
  const qc = useQueryClient();
  const device = usePushDevice();
  const reminders = useQuery({ queryKey: qk.reminders, queryFn: listReminders, enabled: !!user });
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("15:00");

  const create = useMutation({
    mutationFn: (input: Parameters<typeof createReminder>[1]) => createReminder(user!.id, input),
    onError: (err) => toast.error((err as Error).message),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.reminders }),
  });

  const list = reminders.data ?? [];
  // Sugestão some quando já existe um lembrete com o mesmo título (em qualquer idioma).
  const suggestions = REMINDER_SUGGESTIONS.filter(
    (s) => !list.some((r) => r.kind === s.kind && s.title.includes(r.title)),
  );

  const addCustom = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t || !time) return;
    create.mutate(
      { kind: "personalizado", title: t.slice(0, 80), time_of_day: time },
      { onSuccess: () => setTitle("") },
    );
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
      <h2 className="text-sm font-bold font-display text-foreground">
        {tr(["Lembretes", "Reminders", "Recordatorios", "Rappels"])}
      </h2>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {tr([
          "Um empurrãozinho gentil na hora certa. Chegam nos aparelhos com notificações ligadas, respeitando o horário de silêncio.",
          "A gentle nudge at the right time. They reach devices with notifications on, respecting quiet hours.",
          "Un empujoncito amable a la hora justa. Llegan a los dispositivos con notificaciones activadas, respetando el horario de silencio.",
          "Un petit coup de pouce au bon moment. Ils arrivent sur les appareils aux notifications activées, en respectant les heures de silence.",
        ])}
      </p>
      {device.data && !device.data.on && (
        <p className="mt-3 rounded-xl bg-accent-soft/50 px-3.5 py-2.5 text-xs text-foreground">
          {tr([
            "Ligue as notificações neste aparelho (acima) para receber os lembretes aqui.",
            "Turn on notifications on this device (above) to get reminders here.",
            "Activa las notificaciones en este dispositivo (arriba) para recibir los recordatorios aquí.",
            "Activez les notifications sur cet appareil (ci-dessus) pour recevoir les rappels ici.",
          ])}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tr(["Sugestões", "Suggestions", "Sugerencias", "Suggestions"])}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.key}
                type="button"
                disabled={create.isPending}
                onClick={() =>
                  create.mutate({
                    kind: s.kind,
                    title: tr(s.title),
                    body: tr(s.body),
                    time_of_day: s.time,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                {tr(s.title)} · {s.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {list.length > 0 && (
        <div className="mt-4 divide-y divide-border/60">
          {list.map((r) => (
            <ReminderRow key={r.id} reminder={r} />
          ))}
        </div>
      )}

      <form
        onSubmit={addCustom}
        className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder={tr([
            "Novo lembrete (ex.: tomar a vitamina)",
            "New reminder (e.g. take vitamins)",
            "Nuevo recordatorio (ej.: tomar la vitamina)",
            "Nouveau rappel (ex. : prendre la vitamine)",
          ])}
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label={tr(["Horário", "Time", "Hora", "Heure"])}
          className="rounded-full border border-border bg-background px-3 py-2 text-sm tabular-nums text-foreground"
        />
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {tr(["Adicionar", "Add", "Agregar", "Ajouter"])}
        </button>
      </form>
    </section>
  );
}

const INVITE_KEY = "nutriconnect_push_invite_dismissed";

/** Convite discreto no Espaço: só aparece se o push está desligado e a pessoa não dispensou. */
export function PushInviteCard() {
  const tr = useTr();
  const device = usePushDevice();
  const enable = useEnablePush();
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(INVITE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const state = device.data;
  if (
    dismissed ||
    !state ||
    state.on ||
    state.permission === "denied" ||
    state.support === "sem-suporte"
  )
    return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(INVITE_KEY, "1");
    } catch {
      // sem armazenamento: some só nesta visita
    }
  };

  return (
    <div className="relative mb-6 rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-soft/60 to-card p-5 shadow-xs">
      <button
        type="button"
        onClick={dismiss}
        aria-label={tr(["Agora não", "Not now", "Ahora no", "Pas maintenant"])}
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="flex items-center gap-1.5 pr-8 text-sm font-bold text-foreground">
        <BellRing className="h-4 w-4 text-accent" />
        {tr([
          "Quer lembretes no celular?",
          "Want reminders on your phone?",
          "¿Quieres recordatorios en el móvil?",
          "Envie de rappels sur votre téléphone ?",
        ])}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-foreground/80">
        {tr([
          "Hora das refeições, desafio do dia e aviso antes da consulta, do seu jeito e sem exagero.",
          "Meal times, today's challenge and a heads-up before appointments, your way and never too much.",
          "Hora de las comidas, desafío del día y aviso antes de la consulta, a tu manera y sin exagerar.",
          "Heures des repas, défi du jour et alerte avant la consultation, à votre façon et sans excès.",
        ])}
      </p>
      {state.support === "instalar" ? (
        <div className="mt-3">
          <IosInstallHint />
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              enable.mutate(undefined, { onSuccess: (p) => p === "granted" && dismiss() })
            }
            disabled={enable.isPending}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {tr([
              "Ativar notificações",
              "Turn on notifications",
              "Activar notificaciones",
              "Activer les notifications",
            ])}
          </button>
          <Link
            to="/perfil/configuracoes/notificacoes"
            className="rounded-full px-3 py-2 text-xs font-semibold text-accent hover:underline"
          >
            {tr([
              "Escolher lembretes",
              "Choose reminders",
              "Elegir recordatorios",
              "Choisir les rappels",
            ])}
          </Link>
        </div>
      )}
    </div>
  );
}
