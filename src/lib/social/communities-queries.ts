import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./communities";

// Todas as chaves ficam sob ["social"], então amizades, bloqueios etc. também as atualizam.
const KEY = ["social", "communities"] as const;
const FEED_KEY = ["social", "feed"] as const;

export const qkCommunities = {
  all: KEY,
  list: (onlyMine: boolean) => [...KEY, "list", onlyMine] as const,
  one: (slug: string) => [...KEY, "one", slug] as const,
  members: (id: string) => [...KEY, "members", id] as const,
  invites: () => [...KEY, "invites"] as const,
  candidates: (id: string) => [...KEY, "candidates", id] as const,
};

export function useCommunities(onlyMine = false, enabled = true) {
  return useQuery({
    queryKey: qkCommunities.list(onlyMine),
    queryFn: () => api.fetchCommunities(onlyMine),
    enabled,
  });
}

export function useCommunityBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: qkCommunities.one(slug ?? ""),
    queryFn: () => api.fetchCommunity(slug!),
    enabled: !!slug,
  });
}

export function useCommunityMembers(communityId: string | undefined) {
  return useQuery({
    queryKey: qkCommunities.members(communityId ?? ""),
    queryFn: () => api.fetchCommunityMembers(communityId!),
    enabled: !!communityId,
  });
}

export function useCommunityInvites(enabled = true) {
  return useQuery({ queryKey: qkCommunities.invites(), queryFn: api.fetchInvites, enabled });
}

export function useCommunityCandidates(communityId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qkCommunities.candidates(communityId ?? ""),
    queryFn: () => api.fetchCandidates(communityId!),
    enabled: !!communityId && enabled,
  });
}

// ── Mutações ─────────────────────────────────────────────────────────────────

function useCommunityMutation<TResult, TVars>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      // Entrar, sair ou mudar a administração muda quem vê o quê no feed.
      await Promise.all([
        qc.invalidateQueries({ queryKey: KEY }),
        qc.invalidateQueries({ queryKey: FEED_KEY }),
      ]);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

export function useCreateCommunity() {
  return useCommunityMutation(api.createCommunity);
}

export function useJoinCommunity() {
  return useCommunityMutation(api.joinCommunity);
}

export function useLeaveCommunity() {
  return useCommunityMutation(api.leaveCommunity);
}

export function useAcceptInvite() {
  return useCommunityMutation(api.acceptInvite);
}

export function useLeaveAdmin() {
  return useCommunityMutation(api.leaveAdmin);
}

export function useDesignateAdminUser() {
  return useCommunityMutation(({ communityId, userId }: { communityId: string; userId: string }) =>
    api.designateAdminUser(communityId, userId),
  );
}

export function useUpdateCommunity() {
  return useCommunityMutation(
    ({
      communityId,
      patch,
    }: {
      communityId: string;
      patch: Parameters<typeof api.updateCommunity>[1];
    }) => api.updateCommunity(communityId, patch),
  );
}

export function useTogglePostPin() {
  return useCommunityMutation(api.togglePostPin);
}
