// Chamada de IA para as funções de moderação: manda texto/imagem ao gateway e devolve o veredito.
// Chave só nos segredos do Supabase (LOVABLE_API_KEY). Opcional: MODERATION_AI_MODEL.
import { env } from "./http.ts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface Verdict {
  approved: boolean;
  code: string;
  message: string;
}

/** Interpreta {"approved","code","message"}. Só aprova se approved === true E code === "ok". */
export function parseVerdict(text: string, codes: readonly string[]): Verdict {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Resposta da IA sem JSON.");
  const v = JSON.parse(text.slice(start, end + 1));
  const code = codes.includes(v.code) ? (v.code as string) : "inadequado";
  const approved = v.approved === true && code === "ok";
  const message = typeof v.message === "string" ? v.message.trim().slice(0, 240) : "";
  return { approved, code: approved ? "ok" : code === "ok" ? "inadequado" : code, message };
}

export async function classify(opts: {
  system: string;
  text?: string;
  imageDataUrl?: string | null;
  codes: readonly string[];
}): Promise<Verdict> {
  const key = env("LOVABLE_API_KEY");
  const content: unknown[] = [];
  if (opts.text) content.push({ type: "text", text: opts.text });
  if (opts.imageDataUrl) {
    content.push({ type: "text", text: "Imagem a analisar:" });
    content.push({ type: "image_url", image_url: { url: opts.imageDataUrl } });
  }
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: Deno.env.get("MODERATION_AI_MODEL") ?? "google/gemini-2.5-flash",
      temperature: 0,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gateway de IA respondeu ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = await res.json();
  return parseVerdict(body?.choices?.[0]?.message?.content ?? "", opts.codes);
}

/** Decodifica "data:image/...;base64,..." e confere tipo e tamanho. */
export function decodeImage(
  dataUrl: string,
  allowed: Record<string, string>,
  maxBytes: number,
): { bytes: Uint8Array; type: string; ext: string } | null {
  const m = /^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl);
  if (!m) return null;
  const type = m[1].toLowerCase();
  if (!(type in allowed)) return null;
  const binary = atob(m[2]);
  if (binary.length === 0 || binary.length > maxBytes) return null;
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, type, ext: allowed[type] };
}
