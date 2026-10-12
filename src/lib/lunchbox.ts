// Lancheira da semana (N8): o que o responsável conta sobre a criança e uma lancheira por semana
// (segunda a sexta) para cada perfil infantil da trilha.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import type { Names } from "@/lib/appearance-data";
import type { AgeRange } from "@/lib/lunchbox-ideas";
import type { LunchSnack, SnackSlot } from "@/lib/lunchbox.functions";

export type LunchboxProfile = Tables<"lunchbox_profiles">;
export type Lunchbox = Tables<"lunchboxes">;
export type LunchSnacks = Partial<Record<string, LunchSnack>>;

export const snackKey = (day: number, slot: SnackSlot) => `${day}-${slot}`;

export const SCHOOL_DAYS = [0, 1, 2, 3, 4];

export function slotName(slot: SnackSlot, perDay: number): Names {
  if (perDay === 1) return ["Recreio", "Recess", "Recreo", "Récré"];
  return slot === "manha"
    ? ["Manhã", "Morning", "Mañana", "Matin"]
    : ["Tarde", "Afternoon", "Tarde", "Après-midi"];
}

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export const lunchKeys = {
  profile: (id: string) => ["lunchbox-profile", id] as const,
  week: (id: string, week: string) => ["lunchbox", id, week] as const,
  recent: (id: string) => ["lunchbox", id, "recent"] as const,
};

/** Valores de quando o responsável ainda não preencheu nada. */
export const DEFAULT_LUNCH_PROFILE = {
  age_range: "4-6" as AgeRange,
  snacks: 1,
  allergies: "",
  dislikes: "",
  school_rules: "",
};

export function useLunchboxProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: lunchKeys.profile(profileId ?? ""),
    enabled: !!profileId,
    queryFn: async (): Promise<LunchboxProfile | null> => {
      const { data, error } = await supabase
        .from("lunchbox_profiles")
        .select("*")
        .eq("profile_id", profileId!)
        .maybeSingle();
      fail(error);
      return data;
    },
  });
}

export function useSaveLunchboxProfile(profileId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: typeof DEFAULT_LUNCH_PROFILE) => {
      const { error } = await supabase
        .from("lunchbox_profiles")
        .upsert({ profile_id: profileId, ...patch }, { onConflict: "profile_id" });
      fail(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: lunchKeys.profile(profileId) }),
  });
}

export function useLunchbox(profileId: string | undefined, week: string) {
  return useQuery({
    queryKey: lunchKeys.week(profileId ?? "", week),
    enabled: !!profileId,
    queryFn: async (): Promise<Lunchbox | null> => {
      const { data, error } = await supabase
        .from("lunchboxes")
        .select("*")
        .eq("profile_id", profileId!)
        .eq("week_start", week)
        .maybeSingle();
      fail(error);
      return data;
    },
  });
}

/** Grava a lancheira da semana inteira (cria na primeira vez). */
export function useSaveLunchbox(profileId: string, week: string) {
  const qc = useQueryClient();
  const key = lunchKeys.week(profileId, week);
  return useMutation({
    mutationFn: async (snacks: LunchSnacks) => {
      const { error } = await supabase
        .from("lunchboxes")
        .upsert(
          { profile_id: profileId, week_start: week, snacks: snacks as unknown as Json },
          { onConflict: "profile_id,week_start" },
        );
      fail(error);
    },
    onMutate: (snacks) => {
      const old = qc.getQueryData<Lunchbox | null>(key);
      const next: Lunchbox = {
        id: old?.id ?? "nova",
        profile_id: profileId,
        owner_id: old?.owner_id ?? "",
        week_start: week,
        created_at: old?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        snacks: snacks as unknown as Json,
      };
      qc.setQueryData(key, next);
      return { old };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(key, ctx?.old ?? null),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: lunchKeys.recent(profileId) });
    },
  });
}

/** O que a criança disse que gostou e que não gostou nas últimas semanas. */
export function useLunchRatings(profileId: string | undefined) {
  return useQuery({
    queryKey: lunchKeys.recent(profileId ?? ""),
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lunchboxes")
        .select("snacks")
        .eq("profile_id", profileId!)
        .order("week_start", { ascending: false })
        .limit(8);
      fail(error);
      const liked = new Set<string>();
      const disliked = new Set<string>();
      for (const row of data ?? []) {
        for (const s of Object.values((row.snacks ?? {}) as LunchSnacks)) {
          if (s?.rating === "gostei") liked.add(s.title);
          if (s?.rating === "nao_gostei") disliked.add(s.title);
        }
      }
      return { liked: [...liked].slice(0, 10), disliked: [...disliked].slice(0, 10) };
    },
  });
}
