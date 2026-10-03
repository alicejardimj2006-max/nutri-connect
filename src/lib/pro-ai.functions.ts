// Ferramentas de IA para o(a) profissional: rascunho de nota de evolução (SOAP) e sugestão de
// resposta ao paciente. Sempre rascunhos: nada é salvo nem enviado sem a revisão do profissional.
// Só profissionais com vínculo ativo com o paciente; nenhum dado de identificação é enviado à IA.
// O uso conta no limite diário "summary" (ferramentas do profissional) da função ai-chat.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANGUAGES = {
  "pt-BR": "português do Brasil",
  en: "English",
  es: "español",
  fr: "français",
} as const;
const locale = z.enum(["pt-BR", "en", "es", "fr"]);

const SOAP_SYSTEM = `Você ajuda um(a) nutricionista a organizar anotações soltas de uma consulta em uma
nota de evolução no formato SOAP. Responda SOMENTE com JSON, sem texto extra, no formato:
{"subjective": string, "objective": string, "assessment": string, "plan": string}.
- subjective: o que o paciente relatou (queixas, rotina, adesão, sintomas).
- objective: dados mensuráveis e observações (peso, medidas, exames, achados).
- assessment: síntese do quadro descrita a partir das anotações, sem diagnóstico novo.
- plan: condutas e orientações que o(a) profissional anotou, e retornos.
Use apenas o que está nas anotações: nunca invente números, condutas ou diagnósticos. Se uma parte
não tiver informação, use "". Seja objetivo, em tópicos curtos iniciados por "- ".`;

const REPLY_SYSTEM = `Você ajuda um(a) nutricionista a redigir a próxima mensagem para o paciente no chat
de acompanhamento. Escreva SOMENTE o texto da mensagem, em tom acolhedor e profissional, em até 120
palavras. Responda ao que o paciente perguntou ou relatou. NÃO prescreva dieta, suplemento, dose nem
medicamento, não faça diagnóstico e não prometa resultados. Se a dúvida exigir avaliação clínica,
sugira conversarem na consulta. O(a) profissional vai revisar antes de enviar.`;

type Supabase = SupabaseClient<Database>;

async function hasActiveLink(supabase: Supabase, professionalId: string, patientId: string) {
  const { data } = await supabase
    .from("care_links")
    .select("id")
    .eq("patient_id", patientId)
    .eq("professional_id", professionalId)
    .eq("status", "ativo")
    .maybeSingle();
  return !!data;
}

function parseJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("A IA não devolveu JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type SoapDraft = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};
export type SoapReply = { note: SoapDraft } | { error: string };

export const draftSoapNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ patientId: z.string().uuid(), text: z.string().trim().min(10).max(4000), locale })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<SoapReply> => {
    const { supabase, userId } = context;
    const { aiChat, aiErrorMessage } = await import("./ai-gateway.server");
    if (!(await hasActiveLink(supabase, userId, data.patientId))) {
      return { error: "Paciente não encontrado no seu acompanhamento." };
    }
    const result = await aiChat({
      kind: "summary",
      system: `${SOAP_SYSTEM}\nEscreva em ${LANGUAGES[data.locale]}.`,
      messages: [{ role: "user", content: data.text }],
      temperature: 0.2,
    });
    if (!result.ok && result.limit) return { error: "Limite diário de ferramentas de IA atingido." };
    if (!result.ok) return { error: aiErrorMessage(result.status) };
    try {
      const j = parseJsonObject(result.text);
      return {
        note: {
          subjective: str(j.subjective),
          objective: str(j.objective),
          assessment: str(j.assessment),
          plan: str(j.plan),
        },
      };
    } catch {
      return { error: "A IA não conseguiu organizar as anotações. Tente de novo." };
    }
  });

export type ReplySuggestion = { reply: string } | { error: string };

export const suggestReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ patientId: z.string().uuid(), locale }).parse(data),
  )
  .handler(async ({ data, context }): Promise<ReplySuggestion> => {
    const { supabase, userId } = context;
    const { aiChat, aiErrorMessage } = await import("./ai-gateway.server");
    if (!(await hasActiveLink(supabase, userId, data.patientId))) {
      return { error: "Paciente não encontrado no seu acompanhamento." };
    }
    const { data: rows } = await supabase
      .from("messages")
      .select("sender_id, body, created_at")
      .eq("patient_id", data.patientId)
      .eq("professional_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    const thread = (rows ?? [])
      .filter((m) => m.body?.trim())
      .reverse()
      .map((m) => `${m.sender_id === userId ? "Profissional" : "Paciente"}: ${m.body.slice(0, 1200)}`)
      .join("\n");
    if (!thread) return { error: "Ainda não há mensagens para responder." };

    const result = await aiChat({
      kind: "summary",
      system: `${REPLY_SYSTEM}\nEscreva em ${LANGUAGES[data.locale]}.`,
      messages: [
        {
          role: "user",
          content: `Conversa recente:\n${thread}\n\nEscreva a próxima mensagem da Profissional.`,
        },
      ],
      temperature: 0.5,
    });
    if (!result.ok && result.limit) return { error: "Limite diário de ferramentas de IA atingido." };
    if (!result.ok) return { error: aiErrorMessage(result.status) };
    return { reply: result.text.replace(/^Profissional:\s*/i, "").trim() };
  });
