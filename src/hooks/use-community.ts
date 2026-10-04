import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { COMMUNITY_EVENT, loadState, type CommunityState, type WeeklyTheme } from "@/lib/community";
import {
  COMMUNITY_REMOTE_EVENT,
  fetchCommunityData,
  fetchThemeData,
  myCommunityInvites,
  type PastTheme,
} from "@/lib/community-remote";

const COMMUNITY_KEY = ["community"] as const;

/** Perfis e pedidos de verificação ainda vêm do espelho local (sincronizado com o banco em profile-sync). */
type LocalPart = Pick<CommunityState, "posts" | "profiles" | "verifications">;
const EMPTY_LOCAL: LocalPart = { posts: [], profiles: [], verifications: [] };

/**
 * Comunidades, desafios e Tema da Semana — agora vindos do banco, no mesmo formato que as telas
 * sempre usaram. `hydrated` fica verdadeiro quando os dados chegaram.
 */
export function useCommunity(): Omit<CommunityState, "weeklyTheme"> & {
  weeklyTheme: WeeklyTheme | null;
  hydrated: boolean;
  themeHydrated: boolean;
} {
  const { user } = useAuth();
  const { locale } = useI18n();
  const qc = useQueryClient();
  const [local, setLocal] = useState<LocalPart>(EMPTY_LOCAL);

  useEffect(() => {
    const sync = () => {
      const s = loadState();
      setLocal({ posts: s.posts, profiles: s.profiles, verifications: s.verifications });
    };
    sync();
    const refresh = () => void qc.invalidateQueries({ queryKey: COMMUNITY_KEY });
    window.addEventListener(COMMUNITY_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener(COMMUNITY_REMOTE_EVENT, refresh);
    return () => {
      window.removeEventListener(COMMUNITY_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(COMMUNITY_REMOTE_EVENT, refresh);
    };
  }, [qc]);

  const data = useQuery({
    queryKey: [...COMMUNITY_KEY, "data"],
    queryFn: fetchCommunityData,
    enabled: !!user,
    staleTime: 30_000,
  });
  const theme = useQuery({
    queryKey: [...COMMUNITY_KEY, "theme", locale, user?.id ?? ""],
    queryFn: () => fetchThemeData(locale, user?.id),
    enabled: !!user,
    staleTime: 60_000,
  });

  return {
    ...local,
    communities: data.data?.communities ?? [],
    challenges: data.data?.challenges ?? [],
    weeklyTheme: theme.data?.current ?? null,
    hydrated: data.isFetched || data.isError,
    themeHydrated: theme.isFetched || theme.isError,
  };
}

/** Temas das semanas anteriores (só a página do Tema da Semana usa). */
export function usePastThemes(): PastTheme[] {
  const { user } = useAuth();
  const { locale } = useI18n();
  const q = useQuery({
    queryKey: [...COMMUNITY_KEY, "past-themes", locale],
    queryFn: () => fetchThemeData(locale, user?.id, true),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
  return q.data?.past ?? [];
}

/** Comunidades que convidam este(a) profissional para ser admin (calculado no banco). */
export function useMyCommunityInvites(enabled: boolean) {
  return useQuery({
    queryKey: [...COMMUNITY_KEY, "invites"],
    queryFn: myCommunityInvites,
    enabled,
    staleTime: 30_000,
  });
}
