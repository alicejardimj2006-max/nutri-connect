// Permissão para a Nina usar o acompanhamento (M2): consentimento "nina_acompanhamento",
// revogável a qualquer momento (cada decisão fica registrada, LGPD).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const VERSION = "nina-v1";
const key = (userId: string) => ["nina-care", userId] as const;

/** Se a pessoa (ou o paciente, na visão da nutri vinculada) autorizou a Nina. */
export function useNinaCareAllowed(userId: string | undefined, forPatient?: string) {
  return useQuery({
    queryKey: key(forPatient ?? userId ?? ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "nina_care_allowed",
        forPatient ? { p_user: forPatient } : {},
      );
      if (error) throw new Error(error.message);
      return !!data;
    },
  });
}

export function useSetNinaCare(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (granted: boolean) => {
      const { error } = await supabase.rpc("record_consent", {
        p_kind: "nina_acompanhamento",
        p_version: VERSION,
        p_granted: granted,
      });
      if (error) throw new Error(error.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(userId ?? "") }),
  });
}

const DISMISS_KEY = (userId: string) => `nc_nina_care_prompt_${userId}`;

/** "Agora não" no convite: guardado só neste aparelho. */
export function isPromptDismissed(userId: string) {
  try {
    return window.localStorage.getItem(DISMISS_KEY(userId)) === "1";
  } catch {
    return false;
  }
}

export function dismissPrompt(userId: string) {
  try {
    window.localStorage.setItem(DISMISS_KEY(userId), "1");
  } catch {
    // sem armazenamento: o convite volta na próxima visita
  }
}
