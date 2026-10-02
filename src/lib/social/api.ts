// Acesso ao Supabase da rede social: perfis, pesquisa de pessoas, amizades, seguidores,
// bloqueios e configurações. Tudo respeita o RLS e as RPCs do banco: a regra de quem pode
// ver o quê mora no Postgres, não aqui.

import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables, TablesUpdate } from "@/integrations/supabase/types";

type Fns = Database["public"]["Functions"];

export type AppRole = Database["public"]["Enums"]["app_role"];
export type FriendshipStatus = Database["public"]["Enums"]["friendship_status"];
export type Friendship = Tables<"friendships">;
export type UserSettings = Tables<"user_settings">;
export type UserSettingsPatch = TablesUpdate<"user_settings">;

/** Relação entre a pessoa logada e outra (null = nenhuma). */
export type Relationship =
  "eu" | "bloqueado" | "seguindo" | "amigo" | "pedido_enviado" | "pedido_recebido" | null;

export type PublicProfile = Omit<Fns["get_public_profile"]["Returns"][number], "relationship"> & {
  relationship: Relationship;
};
export type UserSearchResult = Omit<Fns["search_users"]["Returns"][number], "relationship"> & {
  relationship: Relationship;
};

/** Cartão mínimo de uma pessoa (listas de amigos, pedidos e bloqueios). */
export interface PersonCard {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: AppRole;
  isPrivate: boolean;
}

export interface SearchParams {
  query?: string;
  role?: AppRole;
  profession?: string;
  specialty?: string;
  uf?: string;
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface FriendRequest {
  id: string;
  createdAt: string;
  from: PersonCard;
}

/** Erros do banco → mensagem legível (as RPCs já levantam textos em português). */
function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("É preciso estar logado.");
  return id;
}

interface CardRow {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  role: AppRole;
  is_private: boolean;
}

function toCard(row: CardRow): PersonCard {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    avatarUrl: row.avatar_url,
    role: row.role,
    isPrivate: row.is_private,
  };
}

/**
 * Nome, @, foto e papel por id, inclusive de perfis privados (o banco só recusa quem tem
 * bloqueio com a pessoa logada). Não lê a tabela profiles: bio e objetivos seguem protegidos.
 */
async function cardsByIds(ids: string[]): Promise<Map<string, PersonCard>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.rpc("person_cards", { p_ids: ids });
  fail(error);
  return new Map((data ?? []).map((row) => [row.id, toCard(row)]));
}

// ── Pesquisa e perfil público ───────────────────────────────────────────────

export async function searchUsers(params: SearchParams = {}): Promise<UserSearchResult[]> {
  const { data, error } = await supabase.rpc("search_users", {
    p_query: params.query ?? "",
    p_role: params.role,
    p_profession: params.profession,
    p_specialty: params.specialty,
    p_uf: params.uf,
    p_verified_only: params.verifiedOnly ?? false,
    p_limit: params.limit ?? 20,
    p_offset: params.offset ?? 0,
  });
  fail(error);
  return (data ?? []) as UserSearchResult[];
}

/** Perfil por id ou @username. null = não existe ou há bloqueio entre as pessoas. */
export async function getPublicProfile(key: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase.rpc("get_public_profile", { p_key: key });
  fail(error);
  return ((data ?? [])[0] as PublicProfile | undefined) ?? null;
}

// ── Amizades (usuário comum ↔ usuário comum) ────────────────────────────────

export async function requestFriendship(userId: string): Promise<Friendship> {
  const { data, error } = await supabase.rpc("request_friendship", { p_user: userId });
  fail(error);
  return data as Friendship;
}

export async function respondFriendship(
  friendshipId: string,
  accept: boolean,
): Promise<Friendship> {
  const { data, error } = await supabase.rpc("respond_friendship", {
    p_friendship: friendshipId,
    p_accept: accept,
  });
  fail(error);
  return data as Friendship;
}

/** Desfaz amizade, cancela pedido enviado ou ignora pedido recebido. */
export async function removeFriendship(userId: string): Promise<void> {
  const { error } = await supabase.rpc("remove_friendship", { p_user: userId });
  fail(error);
}

export async function listFriends(): Promise<PersonCard[]> {
  const { data, error } = await supabase.rpc("friend_ids");
  fail(error);
  const cards = await cardsByIds((data ?? []) as string[]);
  return [...cards.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Pedidos de amizade que a pessoa logada recebeu e ainda não respondeu. */
export async function listIncomingRequests(): Promise<FriendRequest[]> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, created_at")
    .eq("addressee_id", me)
    .eq("status", "pendente")
    .order("created_at", { ascending: false });
  fail(error);
  const rows = data ?? [];
  const cards = await cardsByIds(rows.map((r) => r.requester_id));
  return rows.flatMap((r) => {
    const from = cards.get(r.requester_id);
    return from ? [{ id: r.id, createdAt: r.created_at, from }] : [];
  });
}

// ── Seguir profissionais ────────────────────────────────────────────────────

export async function followProfessional(professionalId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: me, followee_id: professionalId });
  fail(error);
}

export async function unfollowProfessional(professionalId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", me)
    .eq("followee_id", professionalId);
  fail(error);
}

// ── Bloqueios ───────────────────────────────────────────────────────────────

export async function blockUser(userId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase.from("blocks").insert({ blocker_id: me, blocked_id: userId });
  fail(error);
}

export async function unblockUser(userId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", me)
    .eq("blocked_id", userId);
  fail(error);
}

/** Quem a pessoa logada bloqueou (a linha do bloqueado fica oculta pelo RLS, por isso a RPC). */
export async function listBlocked(): Promise<(PersonCard & { blockedAt: string })[]> {
  const { data, error } = await supabase.rpc("list_my_blocks");
  fail(error);
  return (data ?? []).map((row) => ({ ...toCard(row), blockedAt: row.blocked_at }));
}

// ── Configurações pessoais ──────────────────────────────────────────────────

export async function getMySettings(): Promise<UserSettings | null> {
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", me)
    .maybeSingle();
  fail(error);
  return data;
}

export async function updateMySettings(patch: UserSettingsPatch): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase.from("user_settings").update(patch).eq("id", me);
  fail(error);
}

/** Perfil privado: só amigos veem publicações e jornada; os demais veem nome, @ e foto. */
export async function setPrivateProfile(isPrivate: boolean): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase.from("profiles").update({ is_private: isPrivate }).eq("id", me);
  fail(error);
}

// ── Privacidade (perfil privado + contato público) ──────────────────────────

export interface PrivacySettings {
  isPrivate: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  isPrivate: false,
  showEmail: false,
  showPhone: false,
};

export async function getMyPrivacy(): Promise<PrivacySettings> {
  const me = await currentUserId();
  const [profile, settings] = await Promise.all([
    supabase.from("profiles").select("is_private").eq("id", me).maybeSingle(),
    getMySettings(),
  ]);
  fail(profile.error);
  return {
    isPrivate: profile.data?.is_private ?? DEFAULT_PRIVACY.isPrivate,
    showEmail: settings?.show_email ?? DEFAULT_PRIVACY.showEmail,
    showPhone: settings?.show_phone ?? DEFAULT_PRIVACY.showPhone,
  };
}

export async function updateMyPrivacy(patch: Partial<PrivacySettings>): Promise<void> {
  const settingsPatch: UserSettingsPatch = {};
  if (patch.showEmail !== undefined) settingsPatch.show_email = patch.showEmail;
  if (patch.showPhone !== undefined) settingsPatch.show_phone = patch.showPhone;
  await Promise.all([
    patch.isPrivate !== undefined ? setPrivateProfile(patch.isPrivate) : undefined,
    Object.keys(settingsPatch).length > 0 ? updateMySettings(settingsPatch) : undefined,
  ]);
}

// ── Preferências de notificação (as que valem em qualquer aparelho) ─────────

export type NotificationCategory = "social" | "clinical" | "achievements" | "theme";

export type NotificationPrefs = Partial<Record<NotificationCategory, boolean>>;

/** Categoria ligada por padrão: só desliga se a pessoa desligou de propósito. */
export function isCategoryOn(prefs: unknown, category: NotificationCategory): boolean {
  if (prefs && typeof prefs === "object" && !Array.isArray(prefs)) {
    return (prefs as NotificationPrefs)[category] !== false;
  }
  return true;
}

export async function setNotificationCategory(
  category: NotificationCategory,
  on: boolean,
): Promise<void> {
  const current = await getMySettings();
  const prefs =
    current?.notification_prefs &&
    typeof current.notification_prefs === "object" &&
    !Array.isArray(current.notification_prefs)
      ? (current.notification_prefs as NotificationPrefs)
      : {};
  await updateMySettings({ notification_prefs: { ...prefs, [category]: on } });
}
