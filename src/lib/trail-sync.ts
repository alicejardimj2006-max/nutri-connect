// Sincronização da trilha de aprendizado com o Supabase.
//
// A fonte da verdade é o banco (trail_profiles, trail_progress, trail_xp_daily): o progresso e os
// perfis infantis seguem a conta em qualquer aparelho. O navegador guarda só um CACHE, para a
// interface continuar lendo de forma síncrona (learning-trail.ts e trail-profiles.ts).
//
//  * Ao entrar na conta, `hydrateTrails` baixa perfis e progresso e atualiza o cache.
//  * Cada salvamento local vai ao banco (com pequena espera para juntar vários).
//  * Se o banco ainda estiver vazio e houver progresso salvo neste aparelho, ele sobe (migração).

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  emptyProgress,
  getTrailScope,
  setTrailSaveListener,
  TRAIL_CHANGE_EVENT,
} from "./learning-trail";
import type { TrailProfile, TrailProgress } from "./trail-types";

const PROFILES_CHANGED = "trail-profiles-change";
const progressKey = (userId: string, profileId: string) =>
  `nutriconnect_trail_v3:${userId}:${profileId}`;
const kidsKey = (userId: string) => `nutriconnect_trail_profiles:${userId}`;
const syncedXpKey = (scope: string) => `nutriconnect_trail_synced_xp:${scope}`;
const dirtyKey = (scope: string) => `nutriconnect_trail_dirty:${scope}`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAVE_DELAY_MS = 1500;

/** Id do perfil adulto no banco, por conta (o perfil adulto usa o id local "adult"). */
const adultIds = new Map<string, string>();
const ready = new Map<string, Promise<void>>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pending = new Map<string, TrailProgress>();

function readNumber(key: string): number {
  try {
    return Number(localStorage.getItem(key) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function dbProfileId(userId: string, localProfileId: string): string | null {
  return localProfileId === "adult" ? (adultIds.get(userId) ?? null) : localProfileId;
}

function notify() {
  window.dispatchEvent(new Event(TRAIL_CHANGE_EVENT));
  window.dispatchEvent(new Event(PROFILES_CHANGED));
}

async function pushProgress(scope: string, progress: TrailProgress): Promise<void> {
  const [userId, localProfileId] = scope.split(/:(.+)/);
  if (!userId || !localProfileId || userId === "guest") return;
  await ready.get(userId);
  const profileId = dbProfileId(userId, localProfileId);
  if (!profileId || !UUID.test(profileId)) return;

  const gained = Math.max(0, progress.totalXP - readNumber(syncedXpKey(scope)));
  const { error } = await supabase.rpc("save_trail_progress", {
    p_profile: profileId,
    p_data: progress as unknown as Json,
    p_xp_gained: gained,
  });
  if (error) {
    console.error("[trail-sync] não foi possível salvar o progresso", error.message);
    localStorage.setItem(dirtyKey(scope), "1");
    return;
  }
  localStorage.setItem(syncedXpKey(scope), String(progress.totalXP));
  localStorage.removeItem(dirtyKey(scope));
}

function schedulePush(scope: string, progress: TrailProgress) {
  pending.set(scope, progress);
  localStorage.setItem(dirtyKey(scope), "1");
  clearTimeout(timers.get(scope));
  timers.set(
    scope,
    setTimeout(() => {
      timers.delete(scope);
      const next = pending.get(scope);
      pending.delete(scope);
      if (next) void pushProgress(scope, next);
    }, SAVE_DELAY_MS),
  );
}

/** Envia agora o que estiver esperando (ao fechar ou esconder a aba). */
function flushPending() {
  for (const [scope, timer] of timers) {
    clearTimeout(timer);
    timers.delete(scope);
    const next = pending.get(scope);
    pending.delete(scope);
    if (next) void pushProgress(scope, next);
  }
}

let installed = false;
function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  setTrailSaveListener((scope, progress) => schedulePush(scope, progress));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPending();
  });
  window.addEventListener("pagehide", flushPending);
}

/** Baixa perfis e progresso da conta e atualiza o cache local. */
export function hydrateTrails(userId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  install();
  const run = doHydrate(userId).catch((err) => {
    console.error("[trail-sync] falha ao sincronizar a trilha", err);
  });
  ready.set(userId, run);
  return run;
}

async function doHydrate(userId: string): Promise<void> {
  const { data: adult, error: adultError } = await supabase.rpc("ensure_adult_trail_profile");
  if (adultError || !adult) throw new Error(adultError?.message ?? "perfil adulto indisponível");
  adultIds.set(userId, adult.id);

  const [kidsRes, progressRes] = await Promise.all([
    supabase
      .from("trail_profiles")
      .select("id, name, avatar")
      .eq("owner_id", userId)
      .eq("kind", "kid")
      .order("created_at"),
    supabase.from("trail_progress").select("profile_id, data, total_xp"),
  ]);
  if (kidsRes.error) throw new Error(kidsRes.error.message);
  if (progressRes.error) throw new Error(progressRes.error.message);

  // Perfis infantis criados só neste aparelho (ids antigos, fora do formato do banco) sobem agora.
  const kids: TrailProfile[] = (kidsRes.data ?? []).map((k) => ({
    id: k.id,
    name: k.name,
    kind: "kid",
    avatar: (k.avatar ?? "nina") as TrailProfile["avatar"],
  }));
  let localKids: TrailProfile[] = [];
  try {
    localKids = (
      JSON.parse(localStorage.getItem(kidsKey(userId)) ?? "[]") as TrailProfile[]
    ).filter((p) => p.kind === "kid" && !UUID.test(p.id));
  } catch {
    localKids = [];
  }
  for (const old of localKids) {
    if (kids.length >= 4) break;
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from("trail_profiles")
      .insert({ id, owner_id: userId, kind: "kid", name: old.name, avatar: old.avatar });
    if (error) continue;
    const oldProgress = localStorage.getItem(progressKey(userId, old.id));
    if (oldProgress) {
      localStorage.setItem(progressKey(userId, id), oldProgress);
      localStorage.removeItem(progressKey(userId, old.id));
      schedulePush(`${userId}:${id}`, JSON.parse(oldProgress) as TrailProgress);
    }
    kids.push({ id, name: old.name, kind: "kid", avatar: old.avatar });
  }
  localStorage.setItem(kidsKey(userId), JSON.stringify(kids));

  // Progresso: o banco manda; se ele estiver vazio e houver progresso local, o local sobe.
  const byProfile = new Map((progressRes.data ?? []).map((r) => [r.profile_id, r]));
  for (const localId of ["adult", ...kids.map((k) => k.id)]) {
    const dbId = localId === "adult" ? adult.id : localId;
    const scope = `${userId}:${localId}`;
    const key = progressKey(userId, localId);
    const row = byProfile.get(dbId);
    const serverHas =
      !!row && (row.total_xp > 0 || Object.keys((row.data as object | null) ?? {}).length > 0);
    const dirty = localStorage.getItem(dirtyKey(scope)) === "1";

    if (serverHas && !dirty && row) {
      const merged = { ...emptyProgress(), ...(row.data as unknown as TrailProgress) };
      localStorage.setItem(key, JSON.stringify(merged));
      localStorage.setItem(syncedXpKey(scope), String(row.total_xp));
    } else if (!serverHas) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const local = JSON.parse(raw) as TrailProgress;
          if (local.totalXP > 0) schedulePush(scope, { ...emptyProgress(), ...local });
        } catch {
          /* progresso local ilegível: ignora */
        }
      }
    }
  }
  notify();
}

// ── Perfis infantis ──────────────────────────────────────────────────────────

export function pushKidCreated(userId: string, profile: TrailProfile) {
  void (async () => {
    await ready.get(userId);
    const { error } = await supabase.from("trail_profiles").insert({
      id: profile.id,
      owner_id: userId,
      kind: "kid",
      name: profile.name,
      avatar: profile.avatar,
    });
    if (error)
      console.error("[trail-sync] não foi possível criar o perfil infantil", error.message);
  })();
}

export function pushKidRemoved(userId: string, profileId: string) {
  void (async () => {
    await ready.get(userId);
    const { error } = await supabase.from("trail_profiles").delete().eq("id", profileId);
    if (error)
      console.error("[trail-sync] não foi possível remover o perfil infantil", error.message);
  })();
}

/** Apaga o cache local da conta (ao sair), para o próximo login não herdar dados. */
export function clearTrailCache(userId: string) {
  flushPending();
  try {
    const prefix = [
      `nutriconnect_trail_v3:${userId}:`,
      `nutriconnect_trail_synced_xp:${userId}:`,
      `nutriconnect_trail_dirty:${userId}:`,
    ];
    for (const key of Object.keys(localStorage)) {
      if (prefix.some((p) => key.startsWith(p))) localStorage.removeItem(key);
    }
    localStorage.removeItem(kidsKey(userId));
  } catch {
    /* sem armazenamento */
  }
  adultIds.delete(userId);
  ready.delete(userId);
}

export { getTrailScope };
