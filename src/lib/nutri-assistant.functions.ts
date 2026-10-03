// Assistente de nutrição (Nina): responde dúvidas de alimentação de usuários logados.
// Usa a IA do Lovable (LOVABLE_API_KEY), só no servidor. O histórico fica em nina_messages
// (apagado após 90 dias) e o uso é limitado por dia em ai_usage.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const NINA_DAILY_LIMIT = 20;
const CONTEXT_MESSAGES = 12;

const SYSTEM = `Você é a Nina, assistente de educação alimentar do NutriConnect. Fale em linguagem
simples, acolhedora e baseada em ciência. Nunca prescreva dietas, não conte calorias, não prometa
emagrecimento nem use terrorismo nutricional. Para doenças, medicamentos, gestação ou transtornos
alimentares, oriente a procurar um(a) nutricionista ou médico(a). Responda em até 180 palavras, no
idioma de quem perguntou.`;

const schema = z.object({ message: z.string().trim().min(1).max(2000) });

export type NinaReply = { answer: string; used: number } | { error: string; used?: number };

export const askNutriAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<NinaReply> => {
    const { supabase, userId } = context;
    const { aiChat, aiErrorMessage } = await import("./ai-gateway.server");

    // Reserva um uso do dia antes de chamar a IA.
    const { data: allowed, error: quotaError } = await supabase.rpc("ai_consume", {
      p_kind: "nina",
      p_limit: NINA_DAILY_LIMIT,
    });
    if (quotaError) {
      console.error("nina quota", quotaError.message);
      return { error: "A assistente não conseguiu responder. Tente novamente." };
    }
    if (!allowed) {
      return {
        error: `Você chegou ao limite de ${NINA_DAILY_LIMIT} perguntas por hoje. Volte amanhã!`,
        used: NINA_DAILY_LIMIT,
      };
    }

    const { data: past } = await supabase
      .from("nina_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(CONTEXT_MESSAGES);
    const history = (past ?? [])
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 4000) }));

    const result = await aiChat({
      system: SYSTEM,
      messages: [...history, { role: "user", content: data.message }],
    });
    const { data: used } = await supabase.rpc("ai_usage_today", { p_kind: "nina" });
    if (!result.ok) return { error: aiErrorMessage(result.status), used: used ?? undefined };

    // Só grava a troca quando a IA respondeu.
    // (dois inserts, para a pergunta ficar antes da resposta na ordenação por created_at)
    await supabase
      .from("nina_messages")
      .insert({ user_id: userId, role: "user", content: data.message });
    await supabase
      .from("nina_messages")
      .insert({ user_id: userId, role: "assistant", content: result.text });
    return { answer: result.text, used: used ?? 0 };
  });
