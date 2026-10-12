import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/lib/community";
import * as feed from "./feed";
import { ContentRejectedError } from "./content-check";

// Todas as chaves ficam sob ["social"], então mudar amizade, seguir ou bloqueio também
// atualiza o feed (quem aparece nele depende dessas relações).
const FEED_KEY = ["social", "feed"] as const;

export const qkFeed = {
  all: FEED_KEY,
  list: (params: feed.FeedParams) => [...FEED_KEY, "list", params] as const,
  infinite: (params: feed.FeedParams, ranked: boolean) =>
    [...FEED_KEY, "infinite", params, ranked] as const,
  post: (id: string) => [...FEED_KEY, "post", id] as const,
  theme: () => ["social", "theme"] as const,
};

export function useFeed(params: feed.FeedParams, enabled = true) {
  return useQuery({
    queryKey: qkFeed.list(params),
    queryFn: () => feed.fetchFeed(params),
    enabled,
    // Trocar de filtro ou pedir mais posts não deve piscar a lista anterior.
    placeholderData: (previous) => previous,
  });
}

type FeedPages = InfiniteData<feed.FeedPage, feed.FeedCursor | null>;

/** Mantém só a primeira página, para recarregar o feed do início sem baixar todas de novo. */
function firstPageOnly(data: FeedPages | undefined): FeedPages | undefined {
  return data && { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) };
}

/**
 * Feed infinito (Espaço). Com `ranked`, a ordem vem do algoritmo e fica congelada enquanto a pessoa
 * rola: curtidas e comentários atualizam só a publicação afetada, e as novas entram por `restart`
 * (aviso "Novas publicações" ou puxar para atualizar), que volta para a primeira página.
 */
export function useInfiniteFeed(params: feed.FeedParams, ranked: boolean, enabled = true) {
  const qc = useQueryClient();
  const key = qkFeed.infinite(params, ranked);
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => feed.fetchFeedPage(params, ranked, pageParam),
    initialPageParam: null as feed.FeedCursor | null,
    getNextPageParam: (last) => last.next,
    enabled,
    // Recarregar sozinho reembaralharia o feed e baixaria todas as páginas de novo.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const posts = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages ?? [])
      .flatMap((page) => page.posts)
      .filter((post) => (seen.has(post.id) ? false : (seen.add(post.id), true)));
  }, [query.data]);
  const keyRef = useRef(key);
  keyRef.current = key;
  const restart = useCallback(async () => {
    const k = keyRef.current;
    qc.setQueryData<FeedPages>(k, firstPageOnly);
    await qc.refetchQueries({ queryKey: k, exact: true });
  }, [qc]);
  return { query, posts, restart };
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: qkFeed.post(id ?? ""),
    queryFn: () => feed.fetchPost(id!),
    enabled: !!id,
  });
}

export function useActiveTheme(enabled = true) {
  return useQuery({ queryKey: qkFeed.theme(), queryFn: feed.fetchActiveTheme, enabled });
}

// ── Cache ────────────────────────────────────────────────────────────────────

type FeedCache = Post[] | Post | null | FeedPages;

function isPages(data: FeedCache | undefined): data is FeedPages {
  return !!data && typeof data === "object" && "pages" in data;
}

function isInfiniteKey(queryKey: readonly unknown[]) {
  return queryKey[2] === "infinite";
}

/** Aplica uma mudança a todos os posts em cache (listas, feed infinito e página de um post). */
function mapCachedPosts(qc: QueryClient, postId: string, fn: (post: Post) => Post | null) {
  const mapList = (list: Post[]) =>
    list.flatMap((p) => {
      if (p.id !== postId) return [p];
      const next = fn(p);
      return next ? [next] : [];
    });
  qc.setQueriesData<FeedCache>({ queryKey: FEED_KEY }, (old) => {
    if (!old) return old;
    if (Array.isArray(old)) return mapList(old);
    if (isPages(old))
      return { ...old, pages: old.pages.map((page) => ({ ...page, posts: mapList(page.posts) })) };
    return old.id === postId ? fn(old) : old;
  });
}

function cachedInfinitePosts(qc: QueryClient): Post[] {
  return qc
    .getQueriesData<FeedPages>({ queryKey: [...FEED_KEY, "infinite"] })
    .flatMap(([, data]) => data?.pages.flatMap((page) => page.posts) ?? []);
}

/** O post está aberto em algum feed infinito? */
function inInfiniteFeed(qc: QueryClient, postId: string) {
  return cachedInfinitePosts(qc).some((p) => p.id === postId);
}

/** Post (já carregado) de um comentário — o aviso de comentário apagado só traz o id dele. */
function postOfComment(qc: QueryClient, commentId: string): string | undefined {
  return cachedInfinitePosts(qc).find((p) => p.comments.some((c) => c.id === commentId))?.id;
}

/** Listas comuns (comunidade, perfil, tema...) recarregam; o feed infinito não se reembaralha. */
function invalidateLists(qc: QueryClient) {
  return qc.invalidateQueries({ queryKey: FEED_KEY, predicate: (q) => !isInfiniteKey(q.queryKey) });
}

/** Busca de novo só estas publicações e troca no cache (some se a pessoa não puder mais vê-la). */
async function refreshPosts(qc: QueryClient, ids: string[]) {
  await Promise.all(
    ids.map(async (id) => {
      const fresh = await feed.fetchPost(id).catch(() => undefined);
      if (fresh === undefined) return;
      mapCachedPosts(qc, id, () => fresh);
    }),
  );
}

/** Volta os feeds infinitos para a primeira página (ex.: depois de publicar). */
function restartInfiniteFeeds(qc: QueryClient) {
  qc.setQueriesData<FeedPages>({ queryKey: [...FEED_KEY, "infinite"] }, firstPageOnly);
  return qc.invalidateQueries({ queryKey: [...FEED_KEY, "infinite"] });
}

// ── Mutações ─────────────────────────────────────────────────────────────────

/** Reprovado pela IA: mostra o motivo com calma, para a pessoa saber o que ajustar. */
function showError(err: unknown) {
  if (err instanceof ContentRejectedError) {
    toast.error("Não foi possível publicar", { description: err.message, duration: 10000 });
    return;
  }
  toast.error(err instanceof Error ? err.message : String(err));
}

/** Publicar: a IA analisa antes de salvar; aprovado, o post já aparece no topo do feed. */
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feed.createPost,
    onSuccess: () => {
      void invalidateLists(qc);
      void restartInfiniteFeeds(qc);
    },
    onError: showError,
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feed.deletePost,
    onSuccess: (_result, postId) => {
      mapCachedPosts(qc, postId, () => null);
      void invalidateLists(qc);
    },
    onError: showError,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      feed.addComment(postId, text),
    onSuccess: (_result, { postId }) => {
      void invalidateLists(qc);
      void refreshPosts(qc, [postId]);
    },
    onError: showError,
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feed.deleteComment,
    onMutate: (commentId) => ({ postId: postOfComment(qc, commentId) }),
    onSuccess: (_result, _commentId, context) => {
      void invalidateLists(qc);
      if (context?.postId) void refreshPosts(qc, [context.postId]);
    },
    onError: showError,
  });
}

function withMember(list: string[], userId: string, on: boolean): string[] {
  const without = list.filter((id) => id !== userId);
  return on ? [...without, userId] : without;
}

/** Apoiar / "Eu preparei" / curtir: o contador muda na hora e o banco confirma em seguida. */
export function useToggleReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      kind,
      on,
    }: {
      postId: string;
      kind: feed.ReactionKind;
      on: boolean;
      userId: string;
    }) => feed.setReaction(postId, kind, on),
    onMutate: async ({ postId, kind, on, userId }) => {
      await qc.cancelQueries({ queryKey: FEED_KEY });
      const snapshot = qc.getQueriesData({ queryKey: FEED_KEY });
      mapCachedPosts(qc, postId, (p) => ({
        ...p,
        likes: kind === "curtir" ? withMember(p.likes, userId, on) : p.likes,
        supports: kind === "apoiar" ? withMember(p.supports, userId, on) : p.supports,
        preparedBy: kind === "preparei" ? withMember(p.preparedBy, userId, on) : p.preparedBy,
      }));
      return { snapshot };
    },
    onError: (err, _vars, context) => {
      for (const [key, data] of context?.snapshot ?? []) qc.setQueryData(key, data);
      toast.error(err instanceof Error ? err.message : String(err));
    },
    onSettled: (_result, _err, { postId }) => {
      void invalidateLists(qc);
      void refreshPosts(qc, [postId]);
    },
  });
}

export function useToggleSaved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, saved }: { postId: string; saved: boolean }) =>
      feed.setSaved(postId, saved),
    onMutate: async ({ postId, saved }) => {
      await qc.cancelQueries({ queryKey: FEED_KEY });
      const snapshot = qc.getQueriesData({ queryKey: FEED_KEY });
      mapCachedPosts(qc, postId, (p) => ({ ...p, saved }));
      return { snapshot };
    },
    onError: (err, _vars, context) => {
      for (const [key, data] of context?.snapshot ?? []) qc.setQueryData(key, data);
      toast.error(err instanceof Error ? err.message : String(err));
    },
    onSettled: () => invalidateLists(qc),
  });
}

// ── Tempo real ───────────────────────────────────────────────────────────────

const REALTIME_TABLES = ["posts", "comments", "post_reactions"] as const;
type RealtimeTable = (typeof REALTIME_TABLES)[number];
type Row = Record<string, unknown>;

/** Publicação de outra pessoa que acabou de ficar visível (nova ou recém-aprovada pela IA). */
function isFreshFromOthers(row: Row, eventType: string, userId: string) {
  if (row.author_id === userId || row.hidden) return false;
  const publishAt = Date.parse(String(row.publish_at ?? ""));
  if (!(publishAt <= Date.now())) return false;
  if (eventType === "INSERT") return true;
  return Date.now() - Date.parse(String(row.created_at ?? "")) < 15 * 60 * 1000;
}

/**
 * Quando alguém publica, comenta ou reage: as listas comuns recarregam; no feed infinito só a
 * publicação afetada é atualizada (se estiver carregada), e publicações novas chamam `onNewPost`
 * em vez de entrar sozinhas na tela.
 */
export function useFeedRealtime(userId: string | undefined, onNewPost?: () => void) {
  const qc = useQueryClient();
  const onNewPostRef = useRef(onNewPost);
  useEffect(() => {
    onNewPostRef.current = onNewPost;
  }, [onNewPost]);
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const pending = new Set<string>();
    // Várias mudanças seguidas viram uma só atualização.
    const flush = () => {
      void invalidateLists(qc);
      const ids = [...pending];
      pending.clear();
      if (ids.length) void refreshPosts(qc, ids);
    };
    const handle = (table: RealtimeTable, payload: RealtimePostgresChangesPayload<Row>) => {
      const row = (payload.eventType === "DELETE" ? payload.old : payload.new) as Row;
      const postId =
        table === "posts"
          ? (row.id as string | undefined)
          : ((row.post_id as string | undefined) ??
            (table === "comments" ? postOfComment(qc, String(row.id)) : undefined));
      if (table === "posts" && payload.eventType === "DELETE" && postId) {
        mapCachedPosts(qc, postId, () => null);
      } else if (postId && inInfiniteFeed(qc, postId)) {
        pending.add(postId);
      } else if (table === "posts" && isFreshFromOthers(row, payload.eventType, userId)) {
        onNewPostRef.current?.();
      }
      clearTimeout(timer);
      timer = setTimeout(flush, 400);
    };
    const channel = supabase.channel(`feed-${userId}`);
    for (const table of REALTIME_TABLES) {
      channel.on<Row>("postgres_changes", { event: "*", schema: "public", table }, (payload) =>
        handle(table, payload),
      );
    }
    channel.subscribe();
    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
