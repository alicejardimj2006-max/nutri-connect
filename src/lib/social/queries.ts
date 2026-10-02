import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";

export const qk = {
  all: ["social"] as const,
  search: (params: api.SearchParams) => ["social", "search", params] as const,
  profile: (key: string) => ["social", "profile", key] as const,
  friends: () => ["social", "friends"] as const,
  requests: () => ["social", "requests"] as const,
  blocked: () => ["social", "blocked"] as const,
  settings: () => ["social", "settings"] as const,
};

export function useSearchUsers(params: api.SearchParams, enabled = true) {
  return useQuery({
    queryKey: qk.search(params),
    queryFn: () => api.searchUsers(params),
    enabled,
    // A pesquisa digitada não deve piscar a lista anterior.
    placeholderData: (previous) => previous,
  });
}

export function usePublicProfile(key: string | undefined) {
  return useQuery({
    queryKey: qk.profile(key ?? ""),
    queryFn: () => api.getPublicProfile(key!),
    enabled: !!key,
  });
}

export function useFriends() {
  return useQuery({ queryKey: qk.friends(), queryFn: api.listFriends });
}

export function useIncomingRequests() {
  return useQuery({ queryKey: qk.requests(), queryFn: api.listIncomingRequests });
}

export function useBlocked() {
  return useQuery({ queryKey: qk.blocked(), queryFn: api.listBlocked });
}

export function useMySettings() {
  return useQuery({ queryKey: qk.settings(), queryFn: api.getMySettings });
}

interface MutationOptions<TResult, TVars> {
  /** Chaves a invalidar depois do sucesso (padrão: tudo de "social"). */
  invalidate?: QueryKey[];
  success?: string | ((result: TResult, vars: TVars) => string | undefined);
  onSuccess?: (result: TResult, vars: TVars) => void;
}

function useSocialMutation<TResult, TVars>(
  fn: (vars: TVars) => Promise<TResult>,
  opts: MutationOptions<TResult, TVars> = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result, vars) => {
      const keys = opts.invalidate ?? [qk.all];
      await Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })));
      const msg = typeof opts.success === "function" ? opts.success(result, vars) : opts.success;
      if (msg) toast.success(msg);
      opts.onSuccess?.(result, vars);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

export function useRequestFriendship(opts?: MutationOptions<api.Friendship, string>) {
  return useSocialMutation(api.requestFriendship, opts);
}

export function useRespondFriendship(
  opts?: MutationOptions<api.Friendship, { friendshipId: string; accept: boolean }>,
) {
  return useSocialMutation(
    ({ friendshipId, accept }: { friendshipId: string; accept: boolean }) =>
      api.respondFriendship(friendshipId, accept),
    opts,
  );
}

export function useRemoveFriendship(opts?: MutationOptions<void, string>) {
  return useSocialMutation(api.removeFriendship, opts);
}

export function useFollowProfessional(opts?: MutationOptions<void, string>) {
  return useSocialMutation(api.followProfessional, opts);
}

export function useUnfollowProfessional(opts?: MutationOptions<void, string>) {
  return useSocialMutation(api.unfollowProfessional, opts);
}

export function useBlockUser(opts?: MutationOptions<void, string>) {
  return useSocialMutation(api.blockUser, opts);
}

export function useUnblockUser(opts?: MutationOptions<void, string>) {
  return useSocialMutation(api.unblockUser, opts);
}

export function useUpdateSettings(opts?: MutationOptions<void, api.UserSettingsPatch>) {
  return useSocialMutation(api.updateMySettings, opts);
}

export function useSetPrivateProfile(opts?: MutationOptions<void, boolean>) {
  return useSocialMutation(api.setPrivateProfile, opts);
}
