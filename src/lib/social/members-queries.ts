import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./members";

const KEY = ["social", "members"] as const;

export function useMemberPlan(professionalId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...KEY, "plan", professionalId ?? ""],
    queryFn: () => api.fetchMemberPlan(professionalId!),
    enabled: !!professionalId && enabled,
  });
}

export function useMemberContent(professionalId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...KEY, "content", professionalId ?? ""],
    queryFn: () => api.fetchMemberContent(professionalId!),
    enabled: !!professionalId && enabled,
  });
}

export function useMySubscriptions(enabled = true) {
  return useQuery({ queryKey: [...KEY, "mine"], queryFn: api.fetchMySubscriptions, enabled });
}

export function useSubscribers(enabled = true) {
  return useQuery({ queryKey: [...KEY, "subscribers"], queryFn: api.fetchSubscribers, enabled });
}

export function useEarnings(days = 30, enabled = true) {
  return useQuery({
    queryKey: [...KEY, "earnings", days],
    queryFn: () => api.fetchEarnings(days),
    enabled,
  });
}

export function useConnectStatus(enabled = true) {
  return useQuery({ queryKey: [...KEY, "connect"], queryFn: api.connectStatus, enabled });
}

function useMemberMutation<TResult, TVars>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

export const useSaveMemberPlan = () => useMemberMutation(api.saveMemberPlan);
export const usePublishMemberContent = () => useMemberMutation(api.publishMemberContent);
export const useDeleteMemberContent = () => useMemberMutation(api.deleteMemberContent);
export const useCancelSubscription = () => useMemberMutation(api.cancelSubscription);
