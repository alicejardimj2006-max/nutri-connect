// Resumo por IA da ficha de um paciente, para a nutricionista. Só exibe: nada é salvo na ficha.
// Lê diário alimentar, metas/check-ins e medidas com o login da profissional (as políticas de RLS
// garantem o vínculo ativo) e não envia nome, e-mail nem telefone ao gateway de IA.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const SUMMARY_DAILY_LIMIT = 30;

const LANGUAGES = {
  "pt-BR": "português do Brasil",
  en: "English",
  es: "español",
  fr: "français",
} as const;

const schema = z.object({
  patientId: z.string().uuid(),
  days: z.union([z.literal(7), z.literal(30)]),
  locale: z.enum(["pt-BR", "en", "es", "fr"]),
});

const SYSTEM = `Você é uma assistente para nutricionistas. Resuma, para a profissional, o que o
paciente registrou no período. Seja objetiva e descritiva: padrões de refeições, adesão ao plano,
fome/saciedade e humor, progresso das metas e tendência das medidas. Aponte o que merece atenção e
o que faltou registrar. NÃO faça diagnóstico, NÃO prescreva dieta nem conduta: a decisão é da
profissional. Use no máximo 200 palavras, em tópicos curtos iniciados por "- ". Os dados vêm de
registros do próprio paciente e podem estar incompletos; nunca invente números.`;

export type SummaryReply = { summary: string } | { error: string };

const day = (iso: string) => iso.slice(0, 10);

export const summarizePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<SummaryReply> => {
    const { supabase, userId } = context;
    const { aiChat, aiConfigured, aiErrorMessage } = await import("./ai-gateway.server");
    if (!aiConfigured()) return { error: aiErrorMessage(503) };

    // Só a profissional com vínculo ativo com este paciente.
    const { data: link } = await supabase
      .from("care_links")
      .select("id")
      .eq("patient_id", data.patientId)
      .eq("professional_id", userId)
      .eq("status", "ativo")
      .maybeSingle();
    if (!link) return { error: "Paciente não encontrado no seu acompanhamento." };

    const since = new Date(Date.now() - data.days * 86_400_000).toISOString();
    const [diary, goals, checkins, measures] = await Promise.all([
      supabase
        .from("diary_entries")
        .select(
          "eaten_at, meal_type, description, followed_plan, hunger_before, satiety_after, mood",
        )
        .eq("patient_id", data.patientId)
        .gte("eaten_at", since)
        .order("eaten_at", { ascending: true })
        .limit(120),
      supabase
        .from("goals")
        .select("id, title, target_value, unit")
        .eq("patient_id", data.patientId)
        .eq("active", true),
      supabase
        .from("goal_checkins")
        .select("goal_id, day, value")
        .eq("patient_id", data.patientId)
        .gte("day", day(since)),
      supabase
        .from("anthropometrics")
        .select("measured_at, weight_kg, height_cm, body_fat_pct")
        .eq("patient_id", data.patientId)
        .order("measured_at", { ascending: false })
        .limit(6),
    ]);

    const entries = diary.data ?? [];
    const goalList = goals.data ?? [];
    const checks = checkins.data ?? [];
    const meas = (measures.data ?? []).reverse();
    if (!entries.length && !checks.length && !meas.length) {
      return { error: "Não há registros recentes deste paciente para resumir." };
    }

    const lines: string[] = [`Período: últimos ${data.days} dias.`, "", "DIÁRIO ALIMENTAR:"];
    if (!entries.length) lines.push("(sem registros)");
    for (const e of entries) {
      lines.push(
        [
          `${day(e.eaten_at)} ${e.meal_type}: ${e.description.slice(0, 200)}`,
          e.followed_plan === null ? "" : `seguiu o plano: ${e.followed_plan ? "sim" : "não"}`,
          e.hunger_before === null ? "" : `fome antes: ${e.hunger_before}`,
          e.satiety_after === null ? "" : `saciedade depois: ${e.satiety_after}`,
          e.mood ? `humor: ${e.mood}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      );
    }
    lines.push("", "METAS ATIVAS (meta diária; check-ins no período):");
    if (!goalList.length) lines.push("(sem metas)");
    for (const g of goalList) {
      const done = checks.filter((c) => c.goal_id === g.id);
      lines.push(
        `${g.title}: meta ${g.target_value} ${g.unit}; ${done.length} check-in(s)` +
          (done.length
            ? ` (média ${(done.reduce((s, c) => s + c.value, 0) / done.length).toFixed(1)})`
            : ""),
      );
    }
    lines.push("", "MEDIDAS (da mais antiga para a mais recente):");
    if (!meas.length) lines.push("(sem medidas)");
    for (const m of meas) {
      lines.push(
        [
          day(m.measured_at),
          m.weight_kg === null ? "" : `peso ${m.weight_kg} kg`,
          m.height_cm === null ? "" : `altura ${m.height_cm} cm`,
          m.body_fat_pct === null ? "" : `gordura ${m.body_fat_pct}%`,
        ]
          .filter(Boolean)
          .join(" | "),
      );
    }

    const { data: allowed } = await supabase.rpc("ai_consume", {
      p_kind: "summary",
      p_limit: SUMMARY_DAILY_LIMIT,
    });
    if (!allowed) return { error: `Limite de ${SUMMARY_DAILY_LIMIT} resumos por dia atingido.` };

    const result = await aiChat({
      system: `${SYSTEM}\nResponda em ${LANGUAGES[data.locale]}.`,
      messages: [{ role: "user", content: lines.join("\n") }],
      temperature: 0.3,
    });
    if (!result.ok) return { error: aiErrorMessage(result.status) };
    return { summary: result.text };
  });
