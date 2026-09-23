// Preferências de privacidade e notificações. Mesmo padrão de src/lib/appearance.ts,
// mas guardadas por pessoa (várias contas podem existir no mesmo navegador nesta demo).

export interface PrivacySettings {
  /** Perfil privado: só o dono vê jornada e publicações; demais veem só nome e bio. */
  privateProfile: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  achievements: boolean;
}

export interface BlockedUser {
  userId: string;
  name: string;
  blockedAt: string;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  privateProfile: false,
  showEmail: false,
  showPhone: false,
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  pushEnabled: false,
  achievements: true,
};

const PRIVACY_PREFIX = "nutriconnect_privacy";
const NOTIFICATIONS_PREFIX = "nutriconnect_notifications";
const BLOCKED_PREFIX = "nutriconnect_blocked";
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

export function loadPrivacySettings(userId: string): PrivacySettings {
  return read(`${PRIVACY_PREFIX}:${userId}`, DEFAULT_PRIVACY);
}

export function savePrivacySettings(userId: string, settings: PrivacySettings) {
  write(`${PRIVACY_PREFIX}:${userId}`, settings);
}

export function loadNotificationSettings(userId: string): NotificationSettings {
  return read(`${NOTIFICATIONS_PREFIX}:${userId}`, DEFAULT_NOTIFICATIONS);
}

export function saveNotificationSettings(userId: string, settings: NotificationSettings) {
  write(`${NOTIFICATIONS_PREFIX}:${userId}`, settings);
}

export function loadBlockedUsers(userId: string): BlockedUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${BLOCKED_PREFIX}:${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isUserBlocked(userId: string, targetId: string): boolean {
  return loadBlockedUsers(userId).some((b) => b.userId === targetId);
}

export function blockUser(userId: string, target: { userId: string; name: string }) {
  const current = loadBlockedUsers(userId);
  if (current.some((b) => b.userId === target.userId)) return;
  const next = [...current, { ...target, blockedAt: new Date().toISOString() }];
  write(`${BLOCKED_PREFIX}:${userId}`, next);
}

export function unblockUser(userId: string, targetId: string) {
  const next = loadBlockedUsers(userId).filter((b) => b.userId !== targetId);
  write(`${BLOCKED_PREFIX}:${userId}`, next);
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
  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    // ambiente sem suporte real (ex.: alguns navegadores mobile) — ignora
  }
}
