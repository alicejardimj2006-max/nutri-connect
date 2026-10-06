import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./challenges";

// Sob ["social"]: amizade, bloqueio e perfil privado também atualizam participantes e listas.
const KEY = ["social", "challenges"] as const;

export const qkChallenges = {
  all: KEY,
  list: (communityId?: string) => [...KEY, "list", communityId ?? null] as const,
  one: (id: string) => [...KEY, "one", id] as const,
  participants: (id: string) => [...KEY, "participants", id] as const,
  tips: (id: string) => [...KEY, "tips", id] as const,
  user: (userId: string) => [...KEY, "user", userId] as const,
};

export function useChallenges(enabled = true, communityId?: string) {
  return useQuery({
    queryKey: qkChallenges.list(communityId),
    queryFn: () => api.fetchChallenges(communityId),
    enabled,
  });
}

export function useChallenge(id: string | undefined) {
  return useQuery({
    queryKey: qkChallenges.one(id ?? ""),
    queryFn: () => api.fetchChallenge(id!),
    enabled: !!id,
  });
}

export function useChallengeParticipants(id: string | undefined) {
  return useQuery({
    queryKey: qkChallenges.participants(id ?? ""),
    queryFn: () => api.fetchParticipants(id!),
    enabled: !!id,
  });
}

export function useChallengeTips(id: string | undefined) {
  return useQuery({
    queryKey: qkChallenges.tips(id ?? ""),
    queryFn: () => api.fetchTips(id!),
    enabled: !!id,
  });
}

export function useUserChallenges(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qkChallenges.user(userId ?? ""),
    queryFn: () => api.fetchUserChallenges(userId!),
    enabled: !!userId && enabled,
  });
}

function useChallengeMutation<TResult, TVars>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

export function useJoinChallenge() {
  return useChallengeMutation(api.joinChallenge);
}

export function useLeaveChallenge() {
  return useChallengeMutation(api.leaveChallenge);
}

export function useSetStep() {
  return useChallengeMutation(
    ({
      challengeId,
      currentSteps,
      stepIndex,
      done,
    }: {
      challengeId: string;
      currentSteps: number[];
      stepIndex: number;
      done: boolean;
    }) => api.setStep(challengeId, currentSteps, stepIndex, done),
  );
}

export function useAddTip() {
  return useChallengeMutation(({ challengeId, text }: { challengeId: string; text: string }) =>
    api.addTip(challengeId, text),
  );
}

export function useDeleteTip() {
  return useChallengeMutation(api.deleteTip);
}
