import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/perfil/configuracoes/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — NutriConnect" }] }),
  component: NotificacoesPage,
});

type PermissionState = "default" | "granted" | "denied" | "unsupported";

function NotificacoesPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [permission, setPermission] = useState<PermissionState>("unsupported");

  useEffect(() => {
    if (!user) return;
    setSettings(loadNotificationSettings(user.id));
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission as PermissionState);
    }
  }, [user]);

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

      <h1 className="text-3xl font-extrabold font-display text-foreground mb-8">
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
          <div className="mt-2 flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("settings.notifications.categories.achievements")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("settings.notifications.categories.achievementsHint")}
              </p>
            </div>
            <Switch
              checked={settings.achievements}
              onCheckedChange={(v) => update({ achievements: v })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
