// Feed da rede social no Supabase: publicações, reações, comentários e posts salvos.
// A visibilidade (público, só amigos, perfil privado, bloqueios) é decidida pelo banco:
// get_feed e o RLS devolvem apenas o que a pessoa logada pode ver.
//
// `Post` (src/lib/community.ts) é o modelo que os cartões da interface já usam; aqui o
// resultado do banco é convertido para ele, então os componentes quase não mudam.

import { checkContent } from "@/lib/social/content-check";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import type { Comment, Post, PostBlock, PostType, RecipeData } from "@/lib/community";

type Fns = Database["public"]["Functions"];
type FeedRow = Fns["get_feed"]["Returns"][number];

export type FeedScope =
  | "todos"
  | "amigos"
  | "seguindo"
  | "profissionais"
  | "comunidades"
  | "comunidade"
  | "autor"
  | "salvos"
  | "agendados"
  | "tema"
  | "post"
  | "preparados";

export type PostAudience = "publico" | "amigos";
export type ReactionKind = Database["public"]["Enums"]["reaction_kind"];

export interface FeedParams {
  scope?: FeedScope;
  community?: string;
  author?: string;
  type?: PostType;
  query?: string;
  theme?: string;
  before?: string;
  limit?: number;
  post?: string;
}

export interface NewPostInput {
  type: PostType;
  title?: string;
  text: string;
  tags?: string[];
  /** Imagem como data URL (vem do editor de imagem); é enviada ao Storage ao publicar. */
  image?: string;
  recipeData?: RecipeData;
  blockOrder?: PostBlock[];
  audience?: PostAudience;
  /** Tema da semana ao qual a publicação pertence (uuid de weekly_themes). */
  themeId?: string;
  /** Comunidade (uuid de communities). Só vale depois da migração das comunidades. */
  communityId?: string;
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

// ── Conversão banco → modelo da interface ────────────────────────────────────

interface CommentJson {
  id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

function toComments(postId: string, raw: Json): Comment[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown as CommentJson[]).map((c) => ({
    id: c.id,
    postId,
    authorId: c.author_id,
    authorName: c.author_name,
    text: c.body,
    createdAt: c.created_at,
  }));
}

export function toPost(row: FeedRow): Post {
  return {
    id: row.id,
    communityId: row.community_id ?? undefined,
    type: row.type,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar ?? undefined,
    authorUsername: row.author_username,
    authorRole: row.author_role,
    title: row.title ?? undefined,
    text: row.body,
    image: row.image_url ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.publish_at,
    publishAt: row.publish_at,
    pinned: row.pinned,
    likes: row.likes ?? [],
    supports: row.supports ?? [],
    preparedBy: row.prepared ?? [],
    comments: toComments(row.id, row.comments),
    themeId: row.theme_id ?? undefined,
    recipeData: (row.recipe as unknown as RecipeData | null) ?? undefined,
    blockOrder: (row.block_order as PostBlock[] | null) ?? undefined,
    audience: row.audience,
    saved: row.saved,
    hidden: row.hidden,
  };
}

// ── Leitura ──────────────────────────────────────────────────────────────────

export async function fetchFeed(params: FeedParams = {}): Promise<Post[]> {
  const { data, error } = await supabase.rpc("get_feed", {
    p_scope: params.scope ?? "todos",
    p_community: params.community,
    p_author: params.author,
    p_type: params.type,
    p_query: params.query,
    p_theme: params.theme,
    p_before: params.before,
    p_limit: params.limit ?? 20,
    p_post: params.post,
  });
  fail(error);
  return (data ?? []).map(toPost);
}

/** Uma publicação por id (null = não existe ou a pessoa não pode vê-la). */
export async function fetchPost(id: string): Promise<Post | null> {
  const posts = await fetchFeed({ scope: "post", post: id, limit: 1 });
  return posts[0] ?? null;
}

export interface ActiveTheme {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  question: string | null;
  badge: string | null;
  translations: Json;
}

/** Tema da semana ativo (null se ainda não há nenhum). */
export async function fetchActiveTheme(): Promise<ActiveTheme | null> {
  const { data, error } = await supabase
    .from("current_theme")
    .select("id, title, subtitle, description, question, badge, translations")
    .limit(1)
    .maybeSingle();
  fail(error);
  if (!data?.id || !data.title) return null;
  return { ...data, id: data.id, title: data.title, translations: data.translations ?? {} };
}

/** Textos do tema no idioma da pessoa (o português é o texto base; as outras línguas vêm de translations). */
export function themeText(theme: ActiveTheme, locale: string) {
  const all = theme.translations as Record<string, Record<string, string> | undefined> | null;
  const tr = locale === "pt-BR" ? undefined : all?.[locale];
  return {
    title: tr?.title || theme.title,
    subtitle: tr?.subtitle || theme.subtitle,
    description: tr?.description || theme.description,
    question: tr?.question || theme.question,
    badge: tr?.badge || theme.badge,
  };
}

// ── Publicar ─────────────────────────────────────────────────────────────────

const IMAGE_BUCKET = "post-images";

export async function createPost(input: NewPostInput): Promise<string> {
  const me = await currentUserId();
  const text = input.text.trim();
  const title = input.title?.trim() || null;
  if (!text && !title && !input.image) throw new Error("Escreva algo para publicar.");

  // A IA analisa texto e foto ANTES de qualquer coisa ser salva. Se reprovar, lança ContentRejectedError
  // e nada é gravado (nem a foto). Se aprovar, a foto já foi para o Storage e o banco aceita estes valores.
  const approved = await checkContent({
    kind: "post",
    title,
    body: text,
    tags: input.tags ?? [],
    recipe: input.recipeData,
    image: input.image ?? null,
    context: {
      type: input.type,
      audience: input.audience ?? "publico",
      communityId: input.communityId ?? null,
      themeId: input.themeId ?? null,
      blockOrder: input.blockOrder ?? null,
    },
  });

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: me,
      type: input.type,
      title: approved.title,
      body: approved.body,
      image_url: approved.imageUrl,
      tags: approved.tags,
      audience: input.audience ?? "publico",
      recipe: (input.recipeData as unknown as Json | undefined) ?? null,
      block_order: input.blockOrder ?? null,
      theme_id: input.themeId ?? null,
      community_id: input.communityId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // Não deixa imagem órfã no Storage se a publicação falhou.
    const path = approved.imageUrl?.split(`/${IMAGE_BUCKET}/`)[1];
    if (path) await supabase.storage.from(IMAGE_BUCKET).remove([decodeURIComponent(path)]);
    throw new Error(error.message);
  }
  return data.id;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  fail(error);
}

// ── Reações, comentários e salvos ────────────────────────────────────────────

export async function setReaction(postId: string, kind: ReactionKind, on: boolean): Promise<void> {
  const me = await currentUserId();
  if (on) {
    const { error } = await supabase
      .from("post_reactions")
      // Já reagiu? Não faz nada (não há regra de atualização para reações).
      .upsert(
        { post_id: postId, user_id: me, kind },
        { onConflict: "post_id,user_id,kind", ignoreDuplicates: true },
      );
    fail(error);
  } else {
    const { error } = await supabase
      .from("post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", me)
      .eq("kind", kind);
    fail(error);
  }
}

export async function addComment(postId: string, text: string): Promise<void> {
  const me = await currentUserId();
  const body = text.trim();
  if (!body) throw new Error("Escreva um comentário.");
  // A IA confere o comentário antes de ele ser salvo.
  const approved = await checkContent({ kind: "comment", postId, body });
  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: me, body: approved.body });
  fail(error);
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  fail(error);
}

export async function setSaved(postId: string, saved: boolean): Promise<void> {
  const me = await currentUserId();
  if (saved) {
    const { error } = await supabase
      .from("saved_posts")
      .upsert({ post_id: postId, user_id: me }, { onConflict: "user_id,post_id" });
    fail(error);
  } else {
    const { error } = await supabase
      .from("saved_posts")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", me);
    fail(error);
  }
}
