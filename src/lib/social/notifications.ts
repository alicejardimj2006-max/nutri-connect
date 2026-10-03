// Notificações no Supabase: lista, contagem de não lidas e marcar como lidas.
// Os próprios gatilhos do banco criam as notificações (reações, comentários, amizades, tema,
// consultas, mensagens...); aqui só lemos e marcamos.

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface AppNotification {
  id: string;
  type: string;
  actorId?: string;
  actorName?: string;
  actorUsername?: string;
  actorAvatar?: string;
  entityType?: string;
  entityId?: string;
  data: Record<string, Json | undefined>;
  read: boolean;
  createdAt: string;
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function fetchNotifications(limit = 40): Promise<AppNotification[]> {
  const { data, error } = await supabase.rpc("get_notifications", { p_limit: limit });
  fail(error);
  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    actorId: n.actor_id ?? undefined,
    actorName: n.actor_name ?? undefined,
    actorUsername: n.actor_username ?? undefined,
    actorAvatar: n.actor_avatar ?? undefined,
    entityType: n.entity_type ?? undefined,
    entityId: n.entity_id ?? undefined,
    data: (n.data ?? {}) as AppNotification["data"],
    read: !!n.read_at,
    createdAt: n.created_at,
  }));
}

export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  fail(error);
  return count ?? 0;
}

export async function markRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  fail(error);
}

export async function markAllRead(): Promise<void> {
  const { error } = await supabase.rpc("mark_all_notifications_read");
  fail(error);
}
