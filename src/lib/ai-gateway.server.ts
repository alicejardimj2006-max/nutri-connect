import { getRequest } from "@tanstack/react-start/server";
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

export type AiKind = "nina" | "summary";
export type AiChatResult = { ok: true; text: string } | { ok: false; status: number; limit?: boolean };

/**
 * Uma chamada de chat à IA (sem streaming), feita pela Edge Function ai-chat do Supabase com o
 * login de quem está usando. A chave do gateway e o limite diário ficam lá, não neste servidor.
 */
export async function aiChat(opts: {
  kind: AiKind;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  temperature?: number;
}): Promise<AiChatResult> {
  const url = process.env["SUPABASE_URL"];
  const apikey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const auth = getRequest()?.headers.get("authorization");
  if (!url || !apikey || !auth) return { ok: false, status: 503 };
  try {
    const res = await fetch(`${url}/functions/v1/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth, apikey },
      body: JSON.stringify({
        kind: opts.kind,
        system: opts.system,
        messages: opts.messages,
        temperature: opts.temperature,
      }),
    });
    if (!res.ok) {
      console.error("ai-chat", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return { ok: false, status: res.status === 401 ? 403 : 502 };
    }
    return (await res.json()) as AiChatResult;
  } catch (err) {
    console.error("ai-chat", err);
    return { ok: false, status: 502 };
  }
}

/** Mensagem amigável para um erro da IA. */
export function aiErrorMessage(status: number): string {
  if (status === 503) return "A IA não está configurada.";
  if (status === 429) return "Muitas perguntas agora. Tente em instantes.";
  if (status === 402) return "Os créditos de IA acabaram. Avise o administrador.";
  if (status === 403) return "A IA não está disponível no momento.";
  return "A IA não conseguiu responder. Tente novamente.";
}
