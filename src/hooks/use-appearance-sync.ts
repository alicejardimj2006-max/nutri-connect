import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  APPEARANCE_EVENT,
  DEFAULT_APPEARANCE,
  loadAppearance,
  sanitizeAppearance,
  saveAppearance,
} from "@/lib/appearance";
import type { Json } from "@/integrations/supabase/types";

const SAVE_DELAY_MS = 1200;

/**
 * Guarda a personalização na conta (tabela user_preferences) para valer em qualquer aparelho.
 * Ao entrar: se a conta já tem preferências, elas passam a valer neste aparelho; se não tem, as
 * deste aparelho sobem para a conta. Depois, cada mudança é enviada com um pequeno atraso.
 */
export function useAppearanceSync() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;

    const upload = async () => {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, data: loadAppearance() as unknown as Json });
      if (error) console.error("preferências não sincronizadas", error.message);
    };

    const onChange = (e: Event) => {
      const source = (e as CustomEvent<{ source?: string }>).detail?.source;
      if (!ready || source === "remote") return; // o que veio da conta não precisa voltar
      clearTimeout(timer);
      timer = setTimeout(() => void upload(), SAVE_DELAY_MS);
    };

    void (async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) return; // sem a tabela ou sem rede: segue só com as preferências do aparelho
      if (data?.data && Object.keys(data.data as object).length > 0) {
        saveAppearance(sanitizeAppearance(data.data), "remote");
      } else if (JSON.stringify(loadAppearance()) !== JSON.stringify(DEFAULT_APPEARANCE)) {
        await upload();
      }
      ready = true;
    })();

    window.addEventListener(APPEARANCE_EVENT, onChange);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener(APPEARANCE_EVENT, onChange);
    };
  }, [userId]);
}
