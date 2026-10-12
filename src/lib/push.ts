// Notificações push (app instalável): service worker, inscrição do aparelho, preferências de push
// e lembretes. O envio mora na Edge Function push-send (chamada pelo pg_cron a cada minuto);
// aqui só inscrevemos o aparelho e guardamos o que a pessoa quer receber.

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { Names } from "@/lib/appearance-data";

export type Reminder = Tables<"reminders">;
export type ReminderKind = Reminder["kind"];
export type PushSettings = Tables<"push_settings">;

/**
 * - ok: dá para ativar neste navegador.
 * - instalar: iPhone/iPad fora do app instalado (o Safari só entrega push ao app na Tela de Início).
 * - sem-suporte: navegador sem push.
 */
export type PushSupport = "ok" | "instalar" | "sem-suporte";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

/** Aberto pelo app Android (Capacitor), que se identifica no user agent. */
export function isNativeApp() {
  if (typeof navigator === "undefined") return false;
  return /NutriConnectApp\//.test(navigator.userAgent);
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    isNativeApp() ||
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos() {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return "sem-suporte";
  if (isIos() && !isStandalone()) return "instalar";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window))
    return "sem-suporte";
  if (!VAPID_PUBLIC_KEY) return "sem-suporte";
  return "ok";
}

// Pedido de instalação do navegador (Chrome/Edge/Android): chega uma vez só, então fica guardado.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
let installPrompt: InstallPromptEvent | null = null;
export const INSTALL_EVENT = "nutriconnect-install-change";

export function canInstall() {
  return installPrompt !== null;
}

/** Abre o pedido de instalação do navegador. Devolve true se a pessoa instalou. */
export async function promptInstall() {
  if (!installPrompt) return false;
  const event = installPrompt;
  installPrompt = null;
  window.dispatchEvent(new Event(INSTALL_EVENT));
  await event.prompt();
  return (await event.userChoice).outcome === "accepted";
}

/** Registra o service worker (uma vez, ao abrir o app). */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e as InstallPromptEvent;
    window.dispatchEvent(new Event(INSTALL_EVENT));
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    window.dispatchEvent(new Event(INSTALL_EVENT));
  });
  if (!("serviceWorker" in navigator)) return;
  // No preview do editor (iframe) o registro falha e não serve para nada.
  if (window.self !== window.top) return;
  navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("sw.js", err));
}

async function registration() {
  const reg = await navigator.serviceWorker.getRegistration("/");
  return reg ?? navigator.serviceWorker.register("/sw.js");
}

/** Inscrição deste aparelho, se houver. */
export async function currentSubscription(): Promise<PushSubscription | null> {
  if (pushSupport() !== "ok") return null;
  const reg = await navigator.serviceWorker.getRegistration("/");
  return (await reg?.pushManager.getSubscription()) ?? null;
}

function vapidKey(): Uint8Array {
  const base64 = (VAPID_PUBLIC_KEY ?? "").replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function saveSubscription(sub: PushSubscription) {
  const json = sub.toJSON();
  const { error } = await supabase.rpc("push_subscribe", {
    p_endpoint: sub.endpoint,
    p_p256dh: json.keys?.p256dh ?? "",
    p_auth: json.keys?.auth ?? "",
    p_user_agent: navigator.userAgent,
  });
  if (error) throw new Error(error.message);
}

/**
 * Pede a permissão, inscreve o aparelho e guarda no servidor. Devolve a permissão final
 * ("granted" quando deu tudo certo).
 */
export async function enablePush(): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;
  const reg = await registration();
  await navigator.serviceWorker.ready;
  // A chave do servidor pode ter mudado: refaz a inscrição se for de outra chave.
  let sub = await reg.pushManager.getSubscription();
  const key = vapidKey();
  const current = sub?.options.applicationServerKey;
  if (sub && current && !sameKey(new Uint8Array(current), key)) {
    await sub.unsubscribe();
    sub = null;
  }
  sub ??= await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key as BufferSource,
  });
  await saveSubscription(sub);
  return permission;
}

function sameKey(a: Uint8Array, b: Uint8Array) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Tira este aparelho da lista de envio. */
export async function disablePush() {
  const sub = await currentSubscription();
  if (!sub) return;
  await supabase.rpc("push_unsubscribe", { p_endpoint: sub.endpoint });
  await sub.unsubscribe();
}

/** Garante que a inscrição deste aparelho está no servidor (ex.: depois de trocar de conta). */
export async function refreshSubscription() {
  if (pushSupport() !== "ok" || Notification.permission !== "granted") return;
  const sub = await currentSubscription();
  if (sub) await saveSubscription(sub);
}

/** Manda um aviso de teste a todos os aparelhos da pessoa. Devolve quantos receberam. */
export async function sendTestPush(locale: string): Promise<number> {
  const { data, error } = await supabase.functions.invoke<{ sent?: number; error?: string }>(
    "push-send",
    { body: { test: true, locale } },
  );
  if (error || data?.error) throw new Error(data?.error ?? error?.message ?? "Falha no envio.");
  return data?.sent ?? 0;
}

// ---------------------------------------------------------------------------
// Preferências de push (servidor)
// ---------------------------------------------------------------------------

export function deviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  } catch {
    return "America/Sao_Paulo";
  }
}

export async function getPushSettings(): Promise<PushSettings | null> {
  const { data, error } = await supabase.from("push_settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function savePushSettings(
  userId: string,
  patch: Omit<TablesUpdate<"push_settings">, "user_id" | "updated_at">,
) {
  const { error } = await supabase
    .from("push_settings")
    .upsert({ ...patch, user_id: userId }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Lembretes
// ---------------------------------------------------------------------------

export async function listReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .order("time_of_day", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReminder(
  userId: string,
  input: Omit<TablesInsert<"reminders">, "user_id" | "id" | "created_at" | "last_sent_on">,
) {
  const { error } = await supabase.from("reminders").insert({ ...input, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function updateReminder(
  id: string,
  patch: Pick<TablesUpdate<"reminders">, "active" | "time_of_day" | "days" | "title" | "body">,
) {
  const { error } = await supabase.from("reminders").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteReminder(id: string) {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Sugestões que aparecem desligadas: a pessoa liga com um toque. */
export const REMINDER_SUGGESTIONS: {
  key: string;
  kind: ReminderKind;
  time: string;
  title: Names;
  body: Names;
}[] = [
  {
    key: "cafe",
    kind: "refeicao",
    time: "08:00",
    title: ["Café da manhã ☕", "Breakfast ☕", "Desayuno ☕", "Petit-déjeuner ☕"],
    body: [
      "Bom dia! Que tal começar o dia com calma?",
      "Good morning! How about starting the day calmly?",
      "¡Buenos días! ¿Qué tal empezar el día con calma?",
      "Bonjour ! Et si vous commenciez la journée en douceur ?",
    ],
  },
  {
    key: "almoco",
    kind: "refeicao",
    time: "12:30",
    title: [
      "Hora do almoço 🍽️",
      "Lunch time 🍽️",
      "Hora del almuerzo 🍽️",
      "C'est l'heure du déjeuner 🍽️",
    ],
    body: [
      "Uma pausa para comer com atenção.",
      "A break to eat mindfully.",
      "Una pausa para comer con atención.",
      "Une pause pour manger en pleine conscience.",
    ],
  },
  {
    key: "jantar",
    kind: "refeicao",
    time: "19:30",
    title: ["Jantar 🌙", "Dinner 🌙", "Cena 🌙", "Dîner 🌙"],
    body: [
      "Como foi o seu dia? Hora de jantar.",
      "How was your day? Time for dinner.",
      "¿Cómo fue tu día? Hora de cenar.",
      "Comment s'est passée votre journée ? C'est l'heure du dîner.",
    ],
  },
  {
    key: "desafio",
    kind: "desafio",
    time: "10:00",
    title: ["Desafio do dia 🌱", "Today's challenge 🌱", "Desafío del día 🌱", "Défi du jour 🌱"],
    body: [
      "Um passinho de cada vez. Bora ver o desafio de hoje?",
      "One small step at a time. Shall we see today's challenge?",
      "Un pasito a la vez. ¿Vemos el desafío de hoy?",
      "Un petit pas à la fois. On regarde le défi du jour ?",
    ],
  },
];
