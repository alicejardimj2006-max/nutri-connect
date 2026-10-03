import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

const CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const AI_MODEL = "google/gemini-2.5-flash";

/** Falso quando a chave do gateway não está no ambiente do servidor. */
export function aiConfigured(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"]);
}

export type AiChatResult = { ok: true; text: string } | { ok: false; status: number };

/** Uma chamada de chat ao gateway (sem streaming). A chave fica só no servidor. */
export async function aiChat(opts: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  temperature?: number;
}): Promise<AiChatResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { ok: false, status: 503 };
  try {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: opts.temperature ?? 0.5,
        messages: [{ role: "system", content: opts.system }, ...opts.messages],
      }),
    });
    if (!res.ok) {
      console.error("ai-gateway", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return { ok: false, status: res.status };
    }
    const body = await res.json();
    const text = String(body?.choices?.[0]?.message?.content ?? "").trim();
    return text ? { ok: true, text } : { ok: false, status: 502 };
  } catch (err) {
    console.error("ai-gateway", err);
    return { ok: false, status: 502 };
  }
}

/** Mensagem amigável para um erro do gateway. */
export function aiErrorMessage(status: number): string {
  if (status === 503) return "A IA não está configurada.";
  if (status === 429) return "Muitas perguntas agora. Tente em instantes.";
  if (status === 402) return "Os créditos de IA acabaram. Avise o administrador.";
  if (status === 403) return "A IA não está disponível no momento.";
  return "A IA não conseguiu responder. Tente novamente.";
}
