import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { playSound } from "@/lib/sounds";

/**
 * Liga os sons do site: clique nos botões e links, avisos de sucesso e erro, novas notificações e
 * novas mensagens (tempo real). Cada som só toca se a pessoa o ativou em Personalização → Sons.
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

    // Os avisos (toasts) de sucesso e de erro também ganham som.
    const { success, error } = toast;
    toast.success = ((...args: Parameters<typeof success>) => {
      playSound("success");
      return success(...args);
    }) as typeof success;
    toast.error = ((...args: Parameters<typeof error>) => {
      playSound("error");
      return error(...args);
    }) as typeof error;

    return () => {
      document.removeEventListener("click", onClick, true);
      toast.success = success;
      toast.error = error;
    };
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
