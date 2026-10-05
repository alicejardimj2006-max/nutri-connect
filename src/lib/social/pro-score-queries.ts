import { useQuery } from "@tanstack/react-query";
import * as api from "./pro-score";

const KEY = ["social", "pro-score"] as const;

/** Nível (público) e, para o dono, pontuação e próximo nível. */
export function useProStatus(professionalId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...KEY, "status", professionalId ?? ""],
    queryFn: () => api.fetchProStatus(professionalId!),
    enabled: !!professionalId && enabled,
    staleTime: 60_000,
  });
}

export function useMyProEvents(limit = 30, enabled = true) {
  return useQuery({
    queryKey: [...KEY, "events", limit],
    queryFn: () => api.fetchMyProEvents(limit),
    enabled,
  });
}

export function useProRules(enabled = true) {
  return useQuery({
    queryKey: [...KEY, "rules"],
    queryFn: api.fetchProRules,
    enabled,
    staleTime: 10 * 60_000,
  });
}
