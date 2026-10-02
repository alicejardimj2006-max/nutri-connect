import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/lib/community";
import * as feed from "./feed";

// Todas as chaves ficam sob ["social"], então mudar amizade, seguir ou bloqueio também
// atualiza o feed (quem aparece nele depende dessas relações).
const FEED_KEY = ["social", "feed"] as const;

export const qkFeed = {
  all: FEED_KEY,
  list: (params: feed.FeedParams) => [...FEED_KEY, "list", params] as const,
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

// ── Mutações ─────────────────────────────────────────────────────────────────

function useFeedMutation<TResult, TVars>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: FEED_KEY }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

export function useCreatePost() {
  return useFeedMutation(feed.createPost);
}

export function useDeletePost() {
  return useFeedMutation(feed.deletePost);
}

export function useAddComment() {
  return useFeedMutation(({ postId, text }: { postId: string; text: string }) =>
    feed.addComment(postId, text),
  );
}

export function useDeleteComment() {
  return useFeedMutation(feed.deleteComment);
}

/** Aplica uma mudança a todos os posts em cache (listas e página de um post). */
function patchCachedPosts(
  qc: ReturnType<typeof useQueryClient>,
  postId: string,
  patch: (post: Post) => Post,
) {
  qc.setQueriesData<Post[] | Post | null>({ queryKey: FEED_KEY }, (old) => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map((p) => (p.id === postId ? patch(p) : p));
    return old.id === postId ? patch(old) : old;
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
      patchCachedPosts(qc, postId, (p) => ({
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
    onSettled: () => qc.invalidateQueries({ queryKey: FEED_KEY }),
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
      patchCachedPosts(qc, postId, (p) => ({ ...p, saved }));
      return { snapshot };
    },
    onError: (err, _vars, context) => {
      for (const [key, data] of context?.snapshot ?? []) qc.setQueryData(key, data);
      toast.error(err instanceof Error ? err.message : String(err));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: FEED_KEY }),
  });
}

// ── Tempo real ───────────────────────────────────────────────────────────────

const REALTIME_TABLES = ["posts", "comments", "post_reactions"] as const;

/** Quando alguém publica, comenta ou reage, o feed de quem está olhando se atualiza. */
export function useFeedRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Várias mudanças seguidas viram uma só atualização.
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void qc.invalidateQueries({ queryKey: FEED_KEY }), 400);
    };
    const channel = supabase.channel(`feed-${userId}`);
    for (const table of REALTIME_TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    channel.subscribe();
    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
