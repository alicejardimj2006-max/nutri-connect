// Calendário da feira (N5): o estado escolhido fica na conta (user_settings.season_uf).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getMySettings, updateMySettings } from "@/lib/social/api";
import { qk } from "@/lib/social/queries";
import { regionOf, seasonNamesPt } from "@/lib/season-data";

export function useSeasonUf() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: qk.settings(), queryFn: getMySettings, enabled: !!user });
  const set = useMutation({
    mutationFn: (uf: string) => updateMySettings({ season_uf: uf }),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.settings() }),
  });
  const uf = settings.data?.season_uf ?? null;
  return { uf, region: regionOf(uf), loading: settings.isLoading, set };
}

/** O que está na estação agora na região da pessoa (para a Nina), ou lista vazia. */
export function useSeasonNow(): string[] {
  const { region } = useSeasonUf();
  return region ? seasonNamesPt(region) : [];
}
