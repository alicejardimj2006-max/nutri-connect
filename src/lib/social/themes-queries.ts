import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./themes";

const KEY = ["social", "themes"] as const;

export const qkThemes = {
  all: KEY,
  theme: (status: string) => [...KEY, "theme", status] as const,
  history: (limit: number) => [...KEY, "history", limit] as const,
};

export function useWeeklyTheme(status: "ativo" | "previa" = "ativo", enabled = true) {
  return useQuery({
    queryKey: qkThemes.theme(status),
    queryFn: () => api.fetchTheme(status),
    enabled,
  });
}

export function useThemeHistory(limit = 6, enabled = true) {
  return useQuery({
    queryKey: qkThemes.history(limit),
    queryFn: () => api.fetchThemeHistory(limit),
    enabled,
  });
}

function useThemeMutation<TResult, TVars>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

export function useVoteInPoll() {
  return useThemeMutation(({ themeId, optionId }: { themeId: string; optionId: string }) =>
    api.voteInPoll(themeId, optionId),
  );
}

export function useUpdateTheme() {
  return useThemeMutation(({ themeId, edit }: { themeId: string; edit: api.ThemeEdit }) =>
    api.updateTheme(themeId, edit),
  );
}

export function useRegeneratePreview() {
  return useThemeMutation(api.regeneratePreview);
}
