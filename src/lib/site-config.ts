// Configurações do site controladas pela administração (chaves "site_*" em platform_settings).
// Sem configuração salva, cada parte do site usa o padrão do código.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminRpc } from "@/lib/admin-api";

export type SiteConfigKey = "site_rails" | "site_texts" | "site_appearance" | "site_features";

const KEY = ["site-config"] as const;

/** Todas as configurações "site_*" de uma vez (são poucas e pequenas). */
export function useSiteConfigs() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .like("key", "site_%");
      if (error) return {} as Partial<Record<SiteConfigKey, unknown>>;
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Partial<
        Record<SiteConfigKey, unknown>
      >;
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useSiteConfig(key: SiteConfigKey): unknown {
  return useSiteConfigs().data?.[key];
}

export function useSaveSiteConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { key: SiteConfigKey; value: unknown }) =>
      adminRpc("admin_set_site_config", { p_key: v.key, p_value: v.value ?? null }),
    onSuccess: () => {
      toast.success("Alteração publicada no site.");
      void qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });
}
