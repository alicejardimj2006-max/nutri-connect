// Comunidades no Supabase: listar, criar, entrar/sair, convites a profissionais e administração.
// As regras (quem cria, quem pode ser convidado, quando a comunidade fica ativa ou suspensa,
// quem pode publicar) moram no banco; aqui só chamamos as funções e convertemos os resultados.

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Fns = Database["public"]["Functions"];
type CommunityRow = Fns["get_communities"]["Returns"][number];

/** pendente: aguardando um profissional aceitar; ativa: tem os dois admins; suspensa: perdeu um. */
export type CommunityStatus = Database["public"]["Enums"]["community_status"];

export interface RemoteCommunity {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  objective?: string;
  coverImage?: string;
  status: CommunityStatus;
  createdAt: string;
  createdById?: string;
  adminUserId?: string;
  adminName?: string;
  adminUsername?: string;
  professionalId?: string;
  professionalName?: string;
  professionalUsername?: string;
  formerProfessionalIds: string[];
  memberCount: number;
  postCount: number;
  /** A pessoa logada participa. */
  isMember: boolean;
}

export interface CommunityMemberCard {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: Database["public"]["Enums"]["app_role"];
  joinedAt: string;
}

export interface NewCommunityInput {
  name: string;
  description: string;
  category: string;
  objective?: string;
  /** Capa como data URL (do editor de imagem); é enviada ao Storage ao criar. */
  coverImage?: string;
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

export function toCommunity(row: CommunityRow): RemoteCommunity {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    objective: row.objective ?? undefined,
    coverImage: row.cover_image_url ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    createdById: row.created_by ?? undefined,
    adminUserId: row.admin_user_id ?? undefined,
    adminName: row.admin_name ?? undefined,
    adminUsername: row.admin_username ?? undefined,
    professionalId: row.professional_id ?? undefined,
    professionalName: row.professional_name ?? undefined,
    professionalUsername: row.professional_username ?? undefined,
    formerProfessionalIds: row.former_professional_ids ?? [],
    memberCount: row.member_count,
    postCount: row.post_count,
    isMember: row.is_member,
  };
}

// ── Leitura ──────────────────────────────────────────────────────────────────

export async function fetchCommunities(onlyMine = false): Promise<RemoteCommunity[]> {
  const { data, error } = await supabase.rpc("get_communities", { p_only_mine: onlyMine });
  fail(error);
  return (data ?? []).map(toCommunity);
}

/** Uma comunidade pelo slug (null = não existe ou a pessoa não pode vê-la). */
export async function fetchCommunity(slug: string): Promise<RemoteCommunity | null> {
  const { data, error } = await supabase.rpc("get_communities", { p_slug: slug });
  fail(error);
  const row = (data ?? [])[0];
  return row ? toCommunity(row) : null;
}

export async function fetchCommunityMembers(communityId: string): Promise<CommunityMemberCard[]> {
  const { data, error } = await supabase.rpc("get_community_members", { p_community: communityId });
  fail(error);
  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    username: m.username,
    avatarUrl: m.avatar_url,
    role: m.role,
    joinedAt: m.joined_at,
  }));
}

/** Comunidades que estão convidando a pessoa logada (profissional) para ser admin profissional. */
export async function fetchInvites(): Promise<RemoteCommunity[]> {
  const { data, error } = await supabase.rpc("my_community_invites");
  fail(error);
  const ids = new Set((data ?? []).map((c) => c.id));
  if (ids.size === 0) return [];
  const all = await fetchCommunities();
  return all.filter((c) => ids.has(c.id));
}

/** Profissionais convidados de uma comunidade (visível a quem criou/administra e à plataforma). */
export async function fetchCandidates(communityId: string): Promise<CommunityMemberCard[]> {
  const { data, error } = await supabase.rpc("community_candidates", { p_community: communityId });
  fail(error);
  const ids = (data ?? []).map((c) => c.user_id);
  if (ids.length === 0) return [];
  const { data: cards, error: cardsError } = await supabase.rpc("person_cards", { p_ids: ids });
  fail(cardsError);
  return (cards ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    username: m.username,
    avatarUrl: m.avatar_url,
    role: m.role,
    joinedAt: "",
  }));
}

// ── Criar e participar ───────────────────────────────────────────────────────

const COVER_BUCKET = "community-covers";

async function uploadCover(userId: string, dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false });
  fail(error);
  return { url: supabase.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl, path };
}

export async function createCommunity(input: NewCommunityInput): Promise<RemoteCommunity> {
  const me = await currentUserId();
  const cover = input.coverImage?.startsWith("data:")
    ? await uploadCover(me, input.coverImage)
    : input.coverImage
      ? { url: input.coverImage, path: null }
      : null;

  const { data, error } = await supabase.rpc("create_community", {
    p_name: input.name,
    p_description: input.description,
    p_category: input.category,
    p_objective: input.objective,
    p_cover_image_url: cover?.url,
  });
  if (error) {
    // Não deixa capa órfã no Storage se a criação falhou (ex.: já administra outra comunidade).
    if (cover?.path) await supabase.storage.from(COVER_BUCKET).remove([cover.path]);
    throw new Error(error.message);
  }
  const created = await fetchCommunity(data.slug);
  if (!created) throw new Error("Comunidade criada, mas não foi possível carregá-la.");
  return created;
}

export async function joinCommunity(communityId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("community_members")
    .insert({ community_id: communityId, user_id: me });
  fail(error);
}

/** Sai da comunidade (admins precisam deixar a administração antes). */
export async function leaveCommunity(communityId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", me);
  fail(error);
}

// ── Administração ────────────────────────────────────────────────────────────

/** Profissional convidado aceita ser o admin profissional. */
export async function acceptInvite(communityId: string): Promise<void> {
  const { error } = await supabase.rpc("accept_community_professional", {
    p_community: communityId,
  });
  fail(error);
}

/**
 * Deixa a administração. Devolve se a comunidade foi cancelada (admin usuário de uma comunidade
 * ainda pendente) ou ficou suspensa à espera de quem a substitua.
 */
export async function leaveAdmin(communityId: string): Promise<{ cancelled: boolean }> {
  const { data, error } = await supabase.rpc("leave_community_admin", { p_community: communityId });
  fail(error);
  return { cancelled: data?.status === "pendente" };
}

/** Admin da plataforma indica um membro como admin usuário. */
export async function designateAdminUser(communityId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc("designate_community_admin_user", {
    p_community: communityId,
    p_user: userId,
  });
  fail(error);
}

export async function updateCommunity(
  communityId: string,
  patch: { name?: string; description?: string; objective?: string; category?: string },
): Promise<void> {
  const { error } = await supabase
    .from("communities")
    .update({
      name: patch.name,
      description: patch.description,
      objective: patch.objective,
      category: patch.category,
    })
    .eq("id", communityId);
  fail(error);
}

// ── Fixar post ───────────────────────────────────────────────────────────────

/** Fixa ou solta uma publicação no topo da comunidade (admins). Devolve se ficou fixada. */
export async function togglePostPin(postId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("toggle_post_pin", { p_post: postId });
  fail(error);
  return data === true;
}
