import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppearance } from "@/hooks/use-appearance";
import { HOURS, Select } from "@/components/appearance-editor";
import { useTr } from "@/components/settings-ui";
import type { NotificationCategory } from "@/lib/social/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Bell, BellOff, BellRing } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_NOTIFICATIONS,
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from "@/lib/settings";
import { isCategoryOn } from "@/lib/social/api";
import { useMySettings, useSetNotificationCategory } from "@/lib/social/queries";

export const Route = createFileRoute("/perfil/configuracoes/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — NutriConnect" }] }),
  component: NotificacoesPage,
});

type PermissionState = "default" | "granted" | "denied" | "unsupported";

function NotificacoesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const tr = useTr();
  const { appearance: ap, update: updateAppearance } = useAppearance();

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [permission, setPermission] = useState<PermissionState>("unsupported");
  const serverSettings = useMySettings();
  const setCategory = useSetNotificationCategory();
  // Categoria "conquistas": a verdade fica no servidor; o espelho local só serve ao navegador.
  const achievements = isCategoryOn(serverSettings.data?.notification_prefs, "achievements");

  useEffect(() => {
    if (!user) return;
    setSettings(loadNotificationSettings(user.id));
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission as PermissionState);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !serverSettings.data) return;
    const local = loadNotificationSettings(user.id);
    if (local.achievements !== achievements) {
      const next = { ...local, achievements };
      saveNotificationSettings(user.id, next);
      setSettings(next);
    }
  }, [user, serverSettings.data, achievements]);

  if (!user) return null;

  const update = (patch: Partial<NotificationSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveNotificationSettings(user.id, next);
  };

  const handleEnable = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
    if (result === "granted") {
      update({ pushEnabled: true });
    } else {
      update({ pushEnabled: false });
      if (result === "denied") toast.error(t("settings.notifications.push.status.denied"));
    }
  };

  const handleDisable = () => update({ pushEnabled: false });

  const handleTest = () => {
    if (permission !== "granted") return;
    try {
      new Notification(t("settings.notifications.push.testTitle"), {
        body: t("settings.notifications.push.testBody"),
        icon: "/favicon.ico",
      });
    } catch {
      toast.error(t("settings.notifications.push.status.unsupported"));
    }
  };

  const statusKey =
    permission === "granted"
      ? "settings.notifications.push.status.granted"
      : permission === "denied"
        ? "settings.notifications.push.status.denied"
        : permission === "unsupported"
          ? "settings.notifications.push.status.unsupported"
          : "settings.notifications.push.status.default";

  const StatusIcon = permission === "granted" ? BellRing : permission === "denied" ? BellOff : Bell;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <Link
        to="/perfil/configuracoes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("settings.account.back")}</span>
      </Link>

      <h1 className="sr-only">
        {t("settings.notifications.title")}
      </h1>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {t("settings.notifications.push.title")}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("settings.notifications.push.hint")}
          </p>

          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-secondary/40 px-3.5 py-2.5 text-xs text-foreground">
            <StatusIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{t(statusKey)}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {permission === "granted" ? (
              <>
                <Switch
                  checked={settings.pushEnabled}
                  onCheckedChange={(v) => (v ? update({ pushEnabled: true }) : handleDisable())}
                />
                <span className="text-sm text-foreground">
                  {settings.pushEnabled ? t("common.on") : t("common.off")}
                </span>
              </>
            ) : permission !== "denied" && permission !== "unsupported" ? (
              <button
                type="button"
                onClick={handleEnable}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                {t("settings.notifications.push.enable")}
              </button>
            ) : null}

            {permission === "granted" && settings.pushEnabled && (
              <button
                type="button"
                onClick={handleTest}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                {t("settings.notifications.push.test")}
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {t("settings.notifications.categories.title")}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {tr([
              "Escolha de que tipo de aviso você quer ser notificado(a). Avisos de moderação sobre o seu conteúdo sempre chegam.",
              "Choose which kinds of notices you want. Moderation notices about your content always arrive.",
              "Elige qué tipos de aviso quieres recibir. Los avisos de moderación sobre tu contenido siempre llegan.",
              "Choisissez les types d'avis que vous souhaitez. Les avis de modération sur votre contenu arrivent toujours.",
            ])}
          </p>
          <div className="mt-2 divide-y divide-border/60">
            {(
              [
                ["social", ["Social", "Social", "Social", "Social"], ["Reações, comentários, amizades e novos seguidores.", "Reactions, comments, friendships and new followers.", "Reacciones, comentarios, amistades y nuevos seguidores.", "Réactions, commentaires, amitiés et nouveaux abonnés."]],
                ["clinical", ["Acompanhamento", "Follow-up", "Seguimiento", "Suivi"], ["Consultas, pagamentos, mensagens e pedidos de vínculo.", "Appointments, payments, messages and link requests.", "Consultas, pagos, mensajes y solicitudes de vínculo.", "Consultations, paiements, messages et demandes de lien."]],
                ["theme", ["Tema da semana", "Weekly theme", "Tema de la semana", "Thème de la semaine"], ["Quando um novo tema da semana é divulgado.", "When a new weekly theme is announced.", "Cuando se anuncia un nuevo tema de la semana.", "Quand un nouveau thème de la semaine est annoncé."]],
              ] as [NotificationCategory, [string, string, string, string], [string, string, string, string]][]
            ).map(([cat, title, hint]) => (
              <div key={cat} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{tr(title)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{tr(hint)}</p>
                </div>
                <Switch
                  checked={isCategoryOn(serverSettings.data?.notification_prefs, cat)}
                  disabled={serverSettings.isLoading || setCategory.isPending}
                  onCheckedChange={(v) => setCategory.mutate({ category: cat, on: v })}
                />
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("settings.notifications.categories.achievements")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("settings.notifications.categories.achievementsHint")}
                </p>
              </div>
              <Switch
                checked={achievements}
                disabled={serverSettings.isLoading || setCategory.isPending}
                onCheckedChange={(v) => {
                  update({ achievements: v });
                  setCategory.mutate({ category: "achievements", on: v });
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {tr(["Silêncio e privacidade", "Quiet hours and privacy", "Silencio y privacidad", "Silence et confidentialité"])}
          </h2>
          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tr(["Horário de silêncio", "Quiet hours", "Horario de silencio", "Heures de silence"])}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {tr([
                    "Sem sons nem avisos do navegador nesse intervalo (vale também para os Sons da Personalização).",
                    "No sounds or browser alerts in this window (also applies to the Sounds in Personalization).",
                    "Sin sonidos ni avisos del navegador en este intervalo (también vale para los Sonidos de Personalización).",
                    "Ni sons ni alertes du navigateur pendant cet intervalle (vaut aussi pour les Sons de Personnalisation).",
                  ])}
                </p>
              </div>
              <Switch checked={ap.quietOn} onCheckedChange={(quietOn) => updateAppearance({ quietOn })} />
            </div>
            {ap.quietOn && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {tr(["Das", "From", "Desde", "De"])}
                <Select label="from" value={ap.quietFrom} options={HOURS} onChange={(quietFrom) => updateAppearance({ quietFrom })} />
                {tr(["às", "to", "hasta", "à"])}
                <Select label="to" value={ap.quietTo} options={HOURS} onChange={(quietTo) => updateAppearance({ quietTo })} />
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tr(["Mostrar o texto nos avisos", "Show text in alerts", "Mostrar el texto en los avisos", "Afficher le texte dans les alertes"])}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {tr([
                    "Desligado, o aviso do navegador não revela o conteúdo (bom em tela compartilhada).",
                    "When off, the browser alert doesn't reveal the content (good on a shared screen).",
                    "Desactivado, el aviso del navegador no revela el contenido (útil en pantalla compartida).",
                    "Désactivé, l'alerte du navigateur ne révèle pas le contenu (utile sur écran partagé).",
                  ])}
                </p>
              </div>
              <Switch checked={ap.notifPreview} onCheckedChange={(notifPreview) => updateAppearance({ notifPreview })} />
            </div>
            <Link
              to="/perfil/personalizacao"
              search={{ cartao: "sons" }}
              className="inline-block text-xs font-semibold text-accent underline-offset-2 hover:underline"
            >
              {tr(["Configurar os sons do site →", "Set up site sounds →", "Configurar los sonidos del sitio →", "Régler les sons du site →"])}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
