// Preferências que valem só neste aparelho/navegador (permissão de notificação do
// navegador). Privacidade, bloqueios e categorias de notificação ficam no Supabase
// (ver src/lib/social). Mesmo padrão de src/lib/appearance.ts, guardado por pessoa.

import { inHourWindow, loadAppearance } from "./appearance";

export interface NotificationSettings {
  /** Notificação do navegador ligada neste aparelho (depende da permissão do navegador). */
  pushEnabled: boolean;
  /** Espelho local da categoria "conquistas" do servidor, para a notificação do navegador. */
  achievements: boolean;
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  pushEnabled: false,
  achievements: true,
};

const NOTIFICATIONS_PREFIX = "nutriconnect_notifications";
export const SETTINGS_EVENT = "settings-change";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return { ...fallback, ...parsed };
    return fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function loadNotificationSettings(userId: string): NotificationSettings {
  return read(`${NOTIFICATIONS_PREFIX}:${userId}`, DEFAULT_NOTIFICATIONS);
}

export function saveNotificationSettings(userId: string, settings: NotificationSettings) {
  write(`${NOTIFICATIONS_PREFIX}:${userId}`, settings);
}

/** Notificação real via API do navegador, respeitando permissão e preferência da pessoa. */
export function sendBrowserNotification(
  userId: string,
  category: "achievements",
  title: string,
  body: string,
) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const settings = loadNotificationSettings(userId);
  if (!settings.pushEnabled || !settings[category]) return;
  const prefs = loadAppearance();
  if (prefs.quietOn && inHourWindow(prefs.quietFrom, prefs.quietTo)) return;
  try {
    new Notification(prefs.notifPreview ? title : "NutriConnect", {
      body: prefs.notifPreview ? body : "",
      icon: "/favicon.ico",
    });
  } catch {
    // ambiente sem suporte real (ex.: alguns navegadores mobile) — ignora
  }
}
