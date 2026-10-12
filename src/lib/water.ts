// Água do dia: copos registrados no servidor (valem em todos os aparelhos e aparecem para o
// profissional vinculado), meta ajustável e lembretes de água (que se calam com a meta batida).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { createReminder, deleteReminder, listReminders } from "@/lib/push";
import type { Names } from "@/lib/appearance-data";

export type WaterDay = Tables<"water_days">;
export type WaterSettings = Tables<"water_settings">;

export const DEFAULT_GOAL = 8;
export const DEFAULT_GLASS_ML = 250;

const pad = (n: number) => String(n).padStart(2, "0");
/** Data local no formato AAAA-MM-DD. */
export const waterDay = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function lastWaterDays(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return waterDay(d);
  });
}

export const waterKeys = {
  all: ["water"] as const,
  settings: (userId: string) => ["water", "settings", userId] as const,
  days: (userId: string, from: string) => ["water", "days", userId, from] as const,
};

async function getSettings(userId: string): Promise<WaterSettings | null> {
  const { data, error } = await supabase
    .from("water_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function getDays(userId: string, from: string): Promise<WaterDay[]> {
  const { data, error } = await supabase
    .from("water_days")
    .select("*")
    .eq("user_id", userId)
    .gte("day", from)
    .order("day", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useWaterSettings(userId: string | undefined) {
  return useQuery({
    queryKey: waterKeys.settings(userId ?? ""),
    queryFn: () => getSettings(userId!),
    enabled: !!userId,
  });
}

export function useWaterDays(userId: string | undefined, days = 7) {
  const from = lastWaterDays(days)[0];
  return useQuery({
    queryKey: waterKeys.days(userId ?? "", from),
    queryFn: () => getDays(userId!, from),
    enabled: !!userId,
  });
}

/** Muda o total de hoje: mostra na hora e confirma com o servidor. */
export function useSetWater(userId: string | undefined, goal: number) {
  const qc = useQueryClient();
  const today = waterDay();
  return useMutation({
    mutationFn: async (glasses: number) => {
      const { data, error } = await supabase.rpc("water_set", { p_day: today, p_glasses: glasses });
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: (glasses) => {
      qc.setQueriesData<WaterDay[]>({ queryKey: ["water", "days", userId ?? ""] }, (old) => {
        if (!old) return old;
        const rest = old.filter((d) => d.day !== today);
        return [
          ...rest,
          {
            user_id: userId ?? "",
            day: today,
            glasses,
            goal,
            updated_at: new Date().toISOString(),
          },
        ].sort((a, b) => a.day.localeCompare(b.day));
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["water", "days", userId ?? ""] }),
  });
}

/** Meta diária. Com `forUser`, é o profissional ajustando a meta do paciente. */
export function useSetWaterGoal(forUser?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goal, glassMl }: { goal: number; glassMl?: number }) => {
      const { error } = await supabase.rpc("water_set_goal", {
        p_goal: goal,
        p_glass_ml: glassMl,
        p_user: forUser,
      });
      if (error) throw new Error(error.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: waterKeys.all }),
  });
}

// ---------------------------------------------------------------------------
// Lembretes de água: a cada 2 horas, das 9h às 19h
// ---------------------------------------------------------------------------

export const WATER_REMINDER_TIMES = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

const WATER_TITLE: Names = [
  "Hora da água 💧",
  "Water time 💧",
  "Hora del agua 💧",
  "L'heure de l'eau 💧",
];
const WATER_BODY: Names = [
  "Um copo agora? Toque para registrar.",
  "A glass now? Tap to log it.",
  "¿Un vaso ahora? Toca para registrarlo.",
  "Un verre maintenant ? Touchez pour l'enregistrer.",
];

export async function hasWaterReminders() {
  return (await listReminders()).some((r) => r.kind === "agua");
}

export async function setWaterReminders(userId: string, on: boolean, tr: (n: Names) => string) {
  const current = (await listReminders()).filter((r) => r.kind === "agua");
  if (!on) {
    await Promise.all(current.map((r) => deleteReminder(r.id)));
    return;
  }
  if (current.length) return;
  for (const time of WATER_REMINDER_TIMES) {
    await createReminder(userId, {
      kind: "agua",
      title: tr(WATER_TITLE),
      body: tr(WATER_BODY),
      time_of_day: time,
    });
  }
}
