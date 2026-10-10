// Chamada de IA para o app (Nina, resumo clínico e leitor de rótulos). A chave do gateway fica só aqui, nos segredos
// do Supabase, então o servidor do app (Netlify, local, etc.) não precisa dela.
// Exige login e aplica o limite diário do usuário (ai_consume); falhas do gateway voltam em
// { ok: false, status } para o app mostrar uma mensagem amigável.
//
// Segredos: LOVABLE_API_KEY. Opcional: AI_MODEL.
import { createClient } from "npm:@supabase/supabase-js@2";
import { HttpError, env, json, serve } from "../_shared/http.ts";
import { requireUser } from "../_shared/supabase.ts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Mantenha em sincronia com NINA_DAILY_LIMIT, SUMMARY_DAILY_LIMIT e LABEL_DAILY_LIMIT em src/lib.
const DAILY_LIMITS: Record<string, number> = { nina: 20, summary: 30, label: 10 };

interface Message {
  role: "user" | "assistant";
  content: string;
}

function parseBody(raw: unknown) {
  const b = (raw ?? {}) as Record<string, unknown>;
  const kind = String(b.kind ?? "");
  if (!(kind in DAILY_LIMITS)) throw new HttpError(400, "Tipo de uso inválido.");
  const system = typeof b.system === "string" ? b.system.slice(0, 6000) : "";
  const list = Array.isArray(b.messages) ? b.messages.slice(-14) : [];
  const messages: Message[] = list
    .map((m) => m as Record<string, unknown>)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role as Message["role"], content: String(m.content).slice(0, 8000) }));
  if (!system || messages.length === 0) throw new HttpError(400, "Informe system e messages.");
  const t = Number(b.temperature);
  const temperature = Number.isFinite(t) ? Math.min(Math.max(t, 0), 1) : 0.5;
  // Imagem opcional (leitor de rótulos): data URL de imagem, anexada à última mensagem do usuário.
  const image =
    typeof b.image === "string" &&
    /^data:image\/(jpeg|png|webp);base64,/.test(b.image) &&
    b.image.length <= MAX_IMAGE_CHARS
      ? b.image
      : null;
  if (b.image && !image) throw new HttpError(400, "Imagem inválida ou grande demais.");
  return { kind, system, messages, temperature, image };
}

// ~3 MB de imagem em base64.
const MAX_IMAGE_CHARS = 4_000_000;

/** Mensagens no formato do gateway; a imagem vai junto da última mensagem do usuário. */
function withImage(messages: Message[], image: string | null) {
  if (!image) return messages;
  const last = messages.map((m) => m.role).lastIndexOf("user");
  return messages.map((m, i) =>
    i === last
      ? {
          role: m.role,
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: image } },
          ],
        }
      : m,
  );
}

serve(async (req) => {
  if (req.method !== "POST") throw new HttpError(405, "Método não permitido.");
  const user = await requireUser(req);
  const { kind, system, messages, temperature, image } = parseBody(
    await req.json().catch(() => null),
  );

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ ok: false, status: 503 });

  // Consome 1 uso como o próprio usuário (a função usa auth.uid()).
  const asUser = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: allowed, error: quotaError } = await asUser.rpc("ai_consume", {
    p_kind: kind,
    p_limit: DAILY_LIMITS[kind],
  });
  if (quotaError) {
    console.error("ai-chat quota", user.id, quotaError.message);
    return json({ ok: false, status: 500 });
  }
  if (!allowed) return json({ ok: false, status: 429, limit: true });

  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: Deno.env.get("AI_MODEL") ?? "google/gemini-2.5-flash",
        temperature,
        messages: [{ role: "system", content: system }, ...withImage(messages, image)],
      }),
    });
    if (!res.ok) {
      console.error(
        "ai-chat gateway",
        res.status,
        (await res.text().catch(() => "")).slice(0, 300),
      );
      return json({ ok: false, status: res.status });
    }
    const body = await res.json();
    const text = String(body?.choices?.[0]?.message?.content ?? "").trim();
    return text ? json({ ok: true, text }) : json({ ok: false, status: 502 });
  } catch (err) {
    console.error("ai-chat", err);
    return json({ ok: false, status: 502 });
  }
});
