// Central de notificações: lê, marca como lidas, apaga as já resolvidas e acompanha em tempo real.
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationRow {
  id: string;
  type: string;
  actor_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  actor: { name: string; username: string | null; avatar_url: string | null } | null;
}

export const NOTIFICATIONS_KEY = ["social", "notifications"] as const;

async function fetchNotifications(): Promise<NotificationRow[]> {
  const res = await supabase
    .from("notifications")
    .select("id, type, actor_id, entity_type, entity_id, data, read_at, created_at, actor:profiles!actor_id(name, username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as unknown as NotificationRow[];
}

export function useNotifications(enabled = true) {
  return useQuery({ queryKey: NOTIFICATIONS_KEY, queryFn: fetchNotifications, enabled, staleTime: 15_000 });
}

/** Quantas notificações ainda não foram vistas (para o ponto na barra de navegação). */
export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "unread", userId],
    enabled: !!userId,
    staleTime: 20_000,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      return count ?? 0;
    },
  });
}

/** Novas notificações chegam sozinhas na tela. */
export function useNotificationsRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-page-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => void qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}

function useNotificationMutation<T>(fn: (vars: T) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}

export function useMarkRead() {
  return useNotificationMutation(async (ids: string[]) => {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids);
    if (error) throw new Error(error.message);
  });
}

export function useMarkAllRead() {
  return useNotificationMutation(async () => {
    const { error } = await supabase.rpc("mark_all_notifications_read");
    if (error) throw new Error(error.message);
  });
}

/** Apaga as notificações já resolvidas (lidas). */
export function useClearResolved() {
  return useNotificationMutation(async (userId: string) => {
    const { error } = await supabase.from("notifications").delete().eq("user_id", userId).not("read_at", "is", null);
    if (error) throw new Error(error.message);
  });
}
