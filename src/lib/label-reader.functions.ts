// Leitor de rótulos: a Nina analisa a foto de um rótulo ou tabela nutricional e explica, em linguagem
// simples, o que observar. Usa a IA pela Edge Function ai-chat, com limite diário próprio ("label").
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const LABEL_DAILY_LIMIT = 10;

const LANGUAGE: Record<string, string> = {
  "pt-BR": "português do Brasil",
  en: "English",
  es: "español",
  fr: "français",
};

const system = (lang: string) => `Você é a Nina, assistente de educação alimentar do NutriConnect.
A pessoa enviou a foto de um rótulo de alimento (lista de ingredientes e/ou tabela nutricional).
Explique de forma simples, acolhedora e baseada em ciência, sem terrorismo nutricional, sem contar
calorias como algo "proibido" e sem prescrever dieta. Responda em ${lang}, em até 150 palavras, neste
formato (títulos curtos em negrito com **):
**Resumo** — uma ou duas frases sobre o produto.
**Pontos de atenção** — até 3 itens com "•" (por exemplo: açúcar adicionado entre os primeiros
ingredientes, muito sódio, gordura trans, lista longa de aditivos).
**Pontos positivos** — até 2 itens com "•", se houver.
**Dica** — uma sugestão prática (com que frequência consumir ou uma troca simples).
Se a imagem não for um rótulo ou estiver ilegível, diga isso em uma frase e peça uma foto mais nítida.
Para doenças, alergias ou dietas específicas, lembre de conversar com um(a) nutricionista.`;

const schema = z.object({
  image: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/)
    .max(4_000_000),
  locale: z.enum(["pt-BR", "en", "es", "fr"]).default("pt-BR"),
});

export type LabelError = "limit" | "unavailable" | "image" | "failed";
export type LabelReply = { answer: string; used: number } | { error: LabelError; used?: number };

export const readFoodLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<LabelReply> => {
    const { aiChat } = await import("./ai-gateway.server");
    const result = await aiChat({
      kind: "label",
      system: system(LANGUAGE[data.locale]),
      messages: [{ role: "user", content: "Analise este rótulo, por favor." }],
      image: data.image,
      temperature: 0.3,
    });
    const { data: used } = await context.supabase.rpc("ai_usage_today", { p_kind: "label" });
    if (result.ok) return { answer: result.text, used: used ?? 0 };
    const error: LabelError = result.limit
      ? "limit"
      : result.status === 400
        ? "image"
        : result.status === 503 || result.status === 403 || result.status === 402
          ? "unavailable"
          : "failed";
    return { error, used: used ?? undefined };
  });
