import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as api from "./notifications";

const KEY = ["social", "notifications"] as const;

export const qkNotifications = {
  all: KEY,
  list: () => [...KEY, "list"] as const,
  unread: () => [...KEY, "unread"] as const,
};

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: qkNotifications.list(),
    queryFn: () => api.fetchNotifications(),
    enabled,
  });
}

/** Quantas notificações ainda não foram lidas (o sino do cabeçalho). */
export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: qkNotifications.unread(),
    queryFn: api.fetchUnreadCount,
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

/** Chegou uma notificação nova: lista e contagem se atualizam na hora. */
export function useNotificationsRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => void qc.invalidateQueries({ queryKey: KEY }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
