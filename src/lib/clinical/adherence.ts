// Painel do profissional (M3): adesão dos pacientes (semáforo da semana, relatório de 30 dias) e
// modelos de plano alimentar.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";

type Fn = Database["public"]["Functions"];
export type AdherenceRow = Fn["adherence_overview"]["Returns"][number];
export type AdherenceDay = Fn["adherence_daily"]["Returns"][number];
export type PlanTemplate = Tables<"meal_plan_templates">;
export type Light = "verde" | "amarelo" | "vermelho";

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

/** Dias sem nenhum registro (diário, metas, água ou plano de cuidado); null = nunca registrou. */
export function daysSince(last: string | null, today = new Date()): number | null {
  if (!last) return null;
  const [y, m, d] = last.split("-").map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.round((now.getTime() - then.getTime()) / 86_400_000));
}

/** Precisa de atenção: 7 dias ou mais sem registrar (ou nunca registrou). */
export function needsAttention(row: AdherenceRow) {
  const d = daysSince(row.last_activity);
  return d === null || d >= 7;
}

/**
 * Semáforo da semana: média do diário (dias com registro) e, quando houver, das metas cumpridas e
 * do plano de cuidado. Água entra como informação, sem pesar. Sem registrar há 7 dias = vermelho.
 */
export function lightOf(row: AdherenceRow, days = 7): { light: Light; score: number } {
  const parts = [row.diary_days / days];
  if (row.goals_active > 0) parts.push(row.goal_days / days);
  if (row.care_active > 0) parts.push(row.care_days / days);
  const score = Math.min(1, parts.reduce((a, b) => a + b, 0) / parts.length);
  if (needsAttention(row)) return { light: "vermelho", score };
  return { light: score >= 0.6 ? "verde" : score >= 0.3 ? "amarelo" : "vermelho", score };
}

export const adherenceKeys = {
  overview: (days: number) => ["adherence", days] as const,
  daily: (patientId: string, days: number) => ["adherence", patientId, days] as const,
  templates: ["meal-plan-templates"] as const,
};

export function useAdherence(days = 7) {
  return useQuery({
    queryKey: adherenceKeys.overview(days),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("adherence_overview", { p_days: days });
      fail(error);
      return data ?? [];
    },
  });
}

export function useAdherenceDaily(patientId: string, days = 30) {
  return useQuery({
    queryKey: adherenceKeys.daily(patientId, days),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("adherence_daily", {
        p_patient: patientId,
        p_days: days,
      });
      fail(error);
      return data ?? [];
    },
  });
}

// ---------------------------------------------------------------------------
// Modelos de plano
// ---------------------------------------------------------------------------

export function usePlanTemplates(enabled = true) {
  return useQuery({
    queryKey: adherenceKeys.templates,
    enabled,
    queryFn: async (): Promise<PlanTemplate[]> => {
      const { data, error } = await supabase
        .from("meal_plan_templates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      fail(error);
      return data ?? [];
    },
  });
}

export function useSavePlanTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, title }: { planId: string; title: string }) => {
      const { error } = await supabase.rpc("save_meal_plan_template", {
        p_plan: planId,
        p_title: title,
      });
      fail(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: adherenceKeys.templates }),
  });
}

export async function createPlanFromTemplate(templateId: string, patientId: string, title: string) {
  const { data, error } = await supabase.rpc("create_plan_from_template", {
    p_template: templateId,
    p_patient: patientId,
    p_title: title,
  });
  fail(error);
  return data!;
}

export function useDeletePlanTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meal_plan_templates").delete().eq("id", id);
      fail(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: adherenceKeys.templates }),
  });
}

/** Mensagem acolhedora para quem está sem registrar (o profissional revisa antes de enviar). */
export function nudgeText(firstName: string, locale: string) {
  const name = firstName || "";
  if (locale === "en")
    return `Hi ${name}! I noticed you haven't logged anything in a few days. Everything okay? No pressure: if the routine got tough, tell me how it's going and we'll adjust together.`;
  if (locale === "es")
    return `¡Hola ${name}! Vi que hace unos días no registras nada. ¿Todo bien? Sin presión: si la rutina se complicó, cuéntame cómo va y ajustamos juntos.`;
  if (locale === "fr")
    return `Bonjour ${name} ! J'ai vu que vous n'avez rien noté depuis quelques jours. Tout va bien ? Sans pression : si la routine est devenue difficile, racontez-moi et on ajuste ensemble.`;
  return `Oi, ${name}! Vi que faz alguns dias que você não registra nada por aqui. Está tudo bem? Sem cobrança: se a rotina apertou, me conta como está e a gente ajusta junto.`;
}
