import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { playSound } from "@/lib/sounds";

/**
 * Liga os sons do site: clique nos botões e links, novas notificações e novas mensagens
 * (tempo real). Cada som só toca se a pessoa o ativou em Personalização → Sons.
 */
export function useAppSounds() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("button, a, [role='button'], [role='switch']")) playSound("click");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`sounds-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => playSound("notification"),
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as { sender_id?: string };
        if (row.sender_id && row.sender_id !== userId) playSound("message");
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
