// Assistente de nutrição (Nina): responde dúvidas de alimentação de usuários logados.
// Usa a IA do Lovable (LOVABLE_API_KEY), só no servidor.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";

const SYSTEM = `Você é a Nina, assistente de educação alimentar do NutriConnect. Fale em linguagem
simples, acolhedora e baseada em ciência. Nunca prescreva dietas, não conte calorias, não prometa
emagrecimento nem use terrorismo nutricional. Para doenças, medicamentos, gestação ou transtornos
alimentares, oriente a procurar um(a) nutricionista ou médico(a). Responda em até 180 palavras, no
idioma de quem perguntou.`;

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
});

export const askNutriAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<{ answer: string } | { error: string }> => {
    const messages = data.messages
      .filter((m) => m.content.trim())
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return { error: "Envie uma pergunta." };
    }

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "A IA não está configurada." };

    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM,
        input: messages,
        reasoning: { effort: "low" },
        store: false,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      console.error("nutri-assistant gateway", res.status, text.slice(0, 300));
      if (res.status === 429) return { error: "Muitas perguntas agora. Tente em instantes." };
      if (res.status === 402)
        return { error: "Os créditos de IA acabaram. Avise o administrador." };
      if (res.status === 403) return { error: "A IA não está disponível no momento." };
      return { error: "A assistente não conseguiu responder. Tente novamente." };
    }

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    let answer = "";
    let failed = false;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "response.output_text.delta") answer += evt.delta ?? "";
          if (evt.type === "error" || evt.type === "response.failed") failed = true;
        } catch {
          /* linha incompleta */
        }
      }
    }
    if (failed || !answer.trim()) {
      return { error: "A assistente não conseguiu responder. Tente novamente." };
    }
    return { answer: answer.trim() };
  });
